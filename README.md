# Kulipani AI – Telugu Worker Earnings Voice System

This is a MERN starter for a Telugu AI voice-based daily-wage worker system.

## What is included

- Worker management
- Daily work/earning records
- Morning/evening earnings
- WORKED / HOLIDAY / OWN_WORK / ABSENT statuses
- Daily/weekly/monthly/yearly totals
- Worker profile and history
- Incoming-call webhook placeholder
- Outgoing-call scheduler placeholder
- Telugu AI conversation engine
- Sarvam STT/TTS adapter
- MongoDB persistence
- React admin dashboard
- Browser voice test page
- Call logs
- Confirmation-before-save flow

## Important: real phone calls

The application code is yours, but a real Indian +91 PSTN number still needs a compliant telecom/SIP provider. This project keeps that layer separate.

Recommended architecture:

Worker phone
  -> Indian SIP/PSTN provider
  -> SIP/RTP/voice gateway
  -> this AI server
  -> Sarvam realtime STT
  -> LLM conversation logic
  -> Sarvam TTS
  -> phone

For production real-time phone audio, deploy the voice gateway on a VPS. Do not run SIP/RTP directly on Render's normal web service.

## Current AI stack

- STT: Sarvam Saaras realtime/streaming
- TTS: Sarvam Bulbul streaming
- Conversation: pluggable LLM adapter
- Database: MongoDB
- API: Node.js + Express
- UI: React + Vite

Sarvam currently documents a realtime STT WebSocket specifically for voice agents and a WebSocket TTS API for conversational agents.

## Setup

### Server

cd server
cp .env.example .env
npm install
npm run dev

### Client

cd client
npm install
npm run dev

Open http://localhost:5173

## Environment

See server/.env.example.

At minimum:

MONGODB_URI
JWT_SECRET
SARVAM_API_KEY
CLIENT_URL

The LLM adapter can be connected to your chosen model provider. For a first local test, the built-in deterministic conversation engine works without an LLM key.

## Real calling

After the web/database/AI flow is tested, connect your SIP carrier/number to a VPS voice gateway. The carrier is responsible for the PSTN connection; the AI logic remains in this project.

Do not publish API keys in the frontend.
