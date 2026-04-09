import { NextRequest, NextResponse } from "next/server";

import { getLineById, getLineText, storyArchetypeById, storyCharacterById } from "@/lib/alex-story";
import type { ArchetypeId, CharacterId } from "@/lib/types";

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as TtsPayload | null;
  const sceneId = typeof payload?.sceneId === "string" ? payload.sceneId : null;
  const lineId = typeof payload?.lineId === "string" ? payload.lineId : null;
  const archetypeId = isArchetypeId(payload?.archetypeId) ? payload.archetypeId : null;
  const directText = typeof payload?.text === "string" ? payload.text.trim() : null;
  const directSpeakerId = isCharacterId(payload?.speakerId) ? payload.speakerId : null;

  if ((!sceneId || !lineId) && (!directText || !directSpeakerId)) {
    return NextResponse.json(
      { error: "Provide either sceneId + lineId or text + speakerId for TTS playback." },
      { status: 400 },
    );
  }

  let resolvedText = directText;
  let resolvedSpeakerId = directSpeakerId;

  if (sceneId && lineId) {
    const lineResult = getLineById(sceneId, lineId);

    if (!lineResult) {
      return NextResponse.json(
        { error: "That story line could not be found for audio playback." },
        { status: 404 },
      );
    }

    resolvedText = getLineText(lineResult.line, archetypeId);
    resolvedSpeakerId = lineResult.line.speakerId;
  }

  if (!resolvedText || !resolvedSpeakerId) {
    return NextResponse.json(
      { error: "TTS could not resolve the line text or speaker." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";
  const speaker = storyCharacterById[resolvedSpeakerId];
  const voiceId =
    (speaker?.voiceEnvKey ? process.env[speaker.voiceEnvKey] : undefined) ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "ElevenLabs is not configured yet for this simulation." },
      { status: 503 },
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_22050_32`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: resolvedText,
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
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { error: "ElevenLabs is temporarily unavailable." },
      { status: 502 },
    );
  }

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "");

    return NextResponse.json(
      {
        error: message || "ElevenLabs could not generate audio for this line.",
      },
      { status: response.status || 502 },
    );
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
