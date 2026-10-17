# Production phone connection

## Goal

One Indian number with:

- incoming calls
- outgoing calls
- automatic answer
- Telugu AI speech
- worker identification by caller number
- MongoDB save
- scheduled calls

## Required telecom layer

Obtain a compliant Indian SIP/DID/PSTN connection from a provider that permits your intended use.

One current option to evaluate is RingTrunk. Its documentation describes attaching an Indian number to a SIP trunk and sending inbound calls to your SIP server's origination URI.

## Recommended deployment

Do NOT place Asterisk/SIP/RTP on a normal Render web service.

Use:

- VPS: Ubuntu
- Asterisk or FreeSWITCH: SIP/RTP gateway
- Node.js: AI/business API
- MongoDB Atlas
- Sarvam realtime STT + TTS

### Call path

PSTN
 -> Indian number
 -> SIP provider
 -> Asterisk/FreeSWITCH
 -> Node/WebSocket voice bridge
 -> Sarvam realtime STT
 -> conversation engine
 -> Sarvam TTS
 -> Asterisk
 -> PSTN

## Security

- Allow SIP only from your carrier's published IP ranges.
- Never expose SIP credentials in React.
- Use HTTPS/WSS.
- Authenticate webhooks.
- Rate-limit public endpoints.
- Keep worker phone numbers private.
- Log consent/compliance status for automated calls.
- Do not record audio unless you have the required notice/consent and storage policy.

## Current code boundary

This repository implements the worker/database/conversation/business layer. The exact RTP/SIP bridge is provider-specific and must be configured after the carrier gives you SIP credentials, codec requirements, source IPs and inbound/outbound routing details.
