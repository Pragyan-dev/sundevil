import { NextRequest, NextResponse } from "next/server";

import { getLineById, getLineText, storyArchetypeById, storyCharacterById } from "@/lib/alex-story";
import type { ArchetypeId, CharacterId } from "@/lib/types";

export const runtime = "nodejs";

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

type TtsPayload = {
  sceneId?: unknown;
  lineId?: unknown;
  archetypeId?: unknown;
  text?: unknown;
  speakerId?: unknown;
};

function isArchetypeId(value: unknown): value is ArchetypeId {
  return typeof value === "string" && value in storyArchetypeById;
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && value in storyCharacterById;
}

type SpeechAttempt =
  | {
      ok: true;
      body: ReadableStream<Uint8Array>;
      contentType: string;
      voiceId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
      voiceId: string;
      retryableVoiceError: boolean;
    }
  | {
      ok: false;
      status: 502;
      message: string;
      voiceId: string;
      retryableVoiceError: false;
    };

function isRetryableVoiceError(status: number, message: string) {
  return status === 404 || /voice_not_found|voice_id/i.test(message);
}

async function synthesizeSpeech({
  apiKey,
  modelId,
  text,
  voiceId,
}: {
  apiKey: string;
  modelId: string;
  text: string;
  voiceId: string;
}): Promise<SpeechAttempt> {
  let response: Response | null = null;

  try {
    response = await fetch(
      `${ELEVENLABS_URL}/${voiceId}/stream?output_format=mp3_22050_32`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.42,
            similarity_boost: 0.85,
            style: 0.18,
            speed: 1,
            use_speaker_boost: true,
          },
        }),
        cache: "no-store",
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "ElevenLabs is temporarily unavailable.";

    return {
      ok: false,
      status: 502,
      message,
      voiceId,
      retryableVoiceError: false,
    };
  }

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "ElevenLabs could not generate audio for this line.");

    return {
      ok: false,
      status: response.status || 502,
      message,
      voiceId,
      retryableVoiceError: isRetryableVoiceError(response.status || 502, message),
    };
  }

  return {
    ok: true,
    body: response.body,
    contentType: response.headers.get("content-type") || "audio/mpeg",
    voiceId,
  };
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as TtsPayload | null;
  const sceneId = typeof payload?.sceneId === "string" ? payload.sceneId : null;
  const lineId = typeof payload?.lineId === "string" ? payload.lineId : null;
  const archetypeId = isArchetypeId(payload?.archetypeId) ? payload.archetypeId : null;
  const directText = typeof payload?.text === "string" ? payload.text.trim() : null;
  const directSpeakerId = isCharacterId(payload?.speakerId) ? payload.speakerId : null;

  let text: string | null = null;
  let speakerId: CharacterId | null = null;

  if (sceneId && lineId) {
    const lineResult = getLineById(sceneId, lineId);

    if (!lineResult) {
      return NextResponse.json(
        { error: "That story line could not be found for audio playback." },
        { status: 404 },
      );
    }

    text = getLineText(lineResult.line, archetypeId);
    speakerId = lineResult.line.speakerId;
  } else if (directText && directSpeakerId) {
    text = directText;
    speakerId = directSpeakerId;
  } else {
    return NextResponse.json(
      {
        error:
          "TTS playback requires either scene/line identifiers or direct text and speaker information.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";
  const speaker = speakerId ? storyCharacterById[speakerId] : null;
  const preferredVoiceId = speaker?.voiceEnvKey ? process.env[speaker.voiceEnvKey] : undefined;
  const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID;
  const voiceId = preferredVoiceId || defaultVoiceId;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "ElevenLabs is not configured yet for this simulation." },
      { status: 503 },
    );
  }

  const preferredAttempt = await synthesizeSpeech({
    apiKey,
    modelId,
    text,
    voiceId,
  });

  let successfulAttempt = preferredAttempt;
  const usedFallback =
    !preferredAttempt.ok &&
    preferredAttempt.retryableVoiceError &&
    Boolean(defaultVoiceId) &&
    defaultVoiceId !== voiceId;

  if (usedFallback && defaultVoiceId) {
    console.warn("Falling back to ElevenLabs default voice for dialog TTS.", {
      speakerId,
      requestedVoiceId: voiceId,
      defaultVoiceId,
    });

    successfulAttempt = await synthesizeSpeech({
      apiKey,
      modelId,
      text,
      voiceId: defaultVoiceId,
    });
  }

  if (!successfulAttempt.ok) {
    return NextResponse.json(
      {
        error: successfulAttempt.message || "ElevenLabs could not generate audio for this line.",
      },
      { status: successfulAttempt.status || 502 },
    );
  }

  return new Response(successfulAttempt.body, {
    status: 200,
    headers: {
      "Content-Type": successfulAttempt.contentType,
      "Cache-Control": "no-store",
      "X-TTS-Voice-Used": successfulAttempt.voiceId,
      "X-TTS-Voice-Fallback": usedFallback ? "default" : "none",
    },
  });
}
