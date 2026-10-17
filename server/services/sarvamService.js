import axios from "axios";

const BASE = "https://api.sarvam.ai";

function headers() {
  return {
    "api-subscription-key": process.env.SARVAM_API_KEY,
    "Content-Type": "application/json"
  };
}

// TTS: server-side streaming endpoint. For phone audio, convert/encode to the codec
// required by your SIP/RTP gateway before sending it to the call.
export async function textToSpeech(text) {
  if (!process.env.SARVAM_API_KEY) throw new Error("SARVAM_API_KEY missing");

  const response = await axios.post(
    `${BASE}/text-to-speech/stream`,
    {
      text,
      target_language_code: process.env.SARVAM_LANGUAGE || "te-IN",
      language_code: process.env.SARVAM_LANGUAGE || "te-IN",
      speaker: process.env.SARVAM_TTS_SPEAKER || undefined,
      model: process.env.SARVAM_TTS_MODEL || "bulbul:v4-flash",
      output_audio_codec: "wav"
    },
    { headers: headers(), responseType: "arraybuffer" }
  );

  return Buffer.from(response.data);
}

export async function transcribeAudio(buffer, filename = "audio.wav") {
  if (!process.env.SARVAM_API_KEY) throw new Error("SARVAM_API_KEY missing");

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  form.append("model", "saaras:v4");
  form.append("language_code", "te-IN");
  form.append("mode", "transcribe");

  const response = await fetch(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": process.env.SARVAM_API_KEY },
    body: form
  });

  if (!response.ok) throw new Error(`Sarvam STT failed: ${response.status}`);
  return response.json();
}
