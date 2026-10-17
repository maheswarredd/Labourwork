The HTTP call endpoints are intentionally provider-neutral.

POST /api/calls/inbound
- Called by your SIP/telephony gateway when a worker's call arrives.
- Body should include phone/from/caller and optional callId.

POST /api/calls/turn
- Sends one recognized worker utterance to the conversation engine.
- Body: { callId, text }

For production, your voice gateway must stream RTP/codec audio to a realtime STT service and return TTS audio to the call. Do not fake call completion in the application.
