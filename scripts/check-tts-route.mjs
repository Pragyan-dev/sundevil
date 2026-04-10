const baseUrl = process.env.TTS_TEST_BASE_URL || "http://127.0.0.1:3000";
const endpoint = new URL("/api/tts", baseUrl).toString();

const narratorChecks = [
  {
    label: "default-narrator",
    body: {
      text: "Quick speech test for the resource map narrator.",
      voiceMode: "default",
    },
  },
];

const speakers = [
  "you",
  "prof-chen",
  "advisor-rivera",
  "marcus",
  "jordan",
  "counselor-park",
];

async function main() {
  let failures = 0;

  console.log(`Checking dialog TTS route at ${endpoint}`);

  const checks = [
    ...narratorChecks,
    ...speakers.map((speakerId) => ({
      label: speakerId,
      body: {
        text: `Quick speech test for ${speakerId}.`,
        speakerId,
      },
    })),
  ];

  for (const check of checks) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(check.body),
      });

      const fallback = response.headers.get("x-tts-voice-fallback") || "n/a";
      const voiceUsed = response.headers.get("x-tts-voice-used") || "n/a";

      if (!response.ok) {
        failures += 1;
        const message = await response.text().catch(() => "");
        console.error(
          `[FAIL] ${check.label}: ${response.status} fallback=${fallback} voice=${voiceUsed} ${message}`,
        );
        continue;
      }

      const blob = await response.blob();
      console.log(
        `[OK]   ${check.label}: ${response.status} ${blob.type || "audio/mpeg"} bytes=${blob.size} fallback=${fallback} voice=${voiceUsed}`,
      );
    } catch (error) {
      failures += 1;
      console.error(`[ERR]  ${check.label}:`, error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("All configured narrator and speaker routes returned audio.");
}

main().catch((error) => {
  console.error("TTS route check failed.", error);
  process.exitCode = 1;
});
