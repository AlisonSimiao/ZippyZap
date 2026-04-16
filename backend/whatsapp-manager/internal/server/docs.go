package server

import "net/http"

// DocsHandler serves a self-contained HTML page documenting the API.
func DocsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(docsHTML)) //nolint:errcheck
}

const docsHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Manager — API Docs</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           max-width: 860px; margin: 40px auto; padding: 0 20px; color: #1a1a1a;
           line-height: 1.6; background: #fafafa; }
    h1 { margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    .endpoint { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
                padding: 20px; margin-bottom: 20px; }
    .method { display: inline-block; padding: 3px 10px; border-radius: 4px;
              font-weight: 700; font-size: 13px; color: #fff; margin-right: 8px; }
    .get  { background: #2e7d32; }
    .post { background: #1565c0; }
    .delete { background: #c62828; }
    .path { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 15px; font-weight: 600; }
    .desc { margin: 10px 0; color: #444; }
    pre { background: #263238; color: #eeffff; padding: 14px 18px; border-radius: 6px;
          overflow-x: auto; font-size: 13px; margin-top: 10px; }
    code { font-family: 'SF Mono', 'Fira Code', monospace; }
    .label { font-weight: 600; font-size: 13px; color: #888; margin-top: 12px; display: block; }
  </style>
</head>
<body>

<h1>WhatsApp Manager API</h1>
<p class="subtitle">Multi-session WhatsApp service powered by Go + Whatsmeow</p>

<!-- POST /sessions -->
<div class="endpoint">
  <span class="method post">POST</span>
  <span class="path">/sessions</span>
  <p class="desc">Create or reconnect a WhatsApp session. Returns a QR code if the session is not yet authenticated.</p>
  <span class="label">Request body</span>
  <pre><code>{
  "session_id": "my-session-01"
}</code></pre>
  <span class="label">Response (QR needed)</span>
  <pre><code>{
  "session_id": "my-session-01",
  "status": "connecting",
  "qr_code": "&lt;base64-png&gt;",
  "qr_raw": "&lt;raw-qr-string&gt;"
}</code></pre>
  <span class="label">Response (already connected)</span>
  <pre><code>{
  "session_id": "my-session-01",
  "status": "connected"
}</code></pre>
</div>

<!-- DELETE /sessions/{id} -->
<div class="endpoint">
  <span class="method delete">DELETE</span>
  <span class="path">/sessions/{id}</span>
  <p class="desc">Delete a session and remove all stored credentials. The session will be disconnected and must be recreated.</p>
  <span class="label">Response</span>
  <pre><code>{
  "success": true,
  "session_id": "my-session-01"
}</code></pre>
</div>

<!-- GET /sessions/{id}/status -->
<div class="endpoint">
  <span class="method get">GET</span>
  <span class="path">/sessions/{id}/status</span>
  <p class="desc">Returns the current connection status of a session.</p>
  <span class="label">Response</span>
  <pre><code>{
  "session_id": "my-session-01",
  "status": "connected"
}</code></pre>
  <span class="label">Possible status values</span>
  <pre><code>connected | connecting | disconnected | failed</code></pre>
</div>

<!-- GET /sessions/{id}/qr -->
<div class="endpoint">
  <span class="method get">GET</span>
  <span class="path">/sessions/{id}/qr</span>
  <p class="desc">Returns the latest QR code for a session that is awaiting authentication.</p>
  <span class="label">Response</span>
  <pre><code>{
  "session_id": "my-session-01",
  "qr_code": "&lt;base64-png&gt;",
  "qr_raw": "&lt;raw-qr-string&gt;"
}</code></pre>
</div>

<!-- POST /sessions/{id}/send -->
<div class="endpoint">
  <span class="method post">POST</span>
  <span class="path">/sessions/{id}/send</span>
  <p class="desc">Send a text message through a connected session. The number must be in E.164 format without the <code>+</code> prefix.</p>
  <span class="label">Request body (format 1)</span>
  <pre><code>{
  "number": "5511999999999",
  "message": "Hello from WhatsApp Manager!"
}</code></pre>
  <span class="label">Request body (format 2)</span>
  <pre><code>{
  "to": "5511999999999",
  "text": "Hello from WhatsApp Manager!"
}</code></pre>
  <span class="label">Response</span>
  <pre><code>{
  "success": true,
  "message_id": "3EB0...",
  "timestamp": 1713123456
}</code></pre>
</div>

<!-- POST /sessions/{id}/logout -->
<div class="endpoint">
  <span class="method post">POST</span>
  <span class="path">/sessions/{id}/logout</span>
  <p class="desc">Log out a session. The session will be disconnected and will not auto-reconnect. Must scan QR again to reconnect.</p>
  <span class="label">Response</span>
  <pre><code>{
  "success": true,
  "session_id": "my-session-01"
}</code></pre>
</div>

<!-- GET /health -->
<div class="endpoint">
  <span class="method get">GET</span>
  <span class="path">/health</span>
  <p class="desc">Health check endpoint.</p>
  <span class="label">Response</span>
  <pre><code>{
  "status": "ok",
  "service": "whatsapp-manager"
}</code></pre>
</div>

<!-- Webhooks -->
<div class="endpoint">
  <h3 style="margin-bottom:8px;">Webhook Events</h3>
  <p class="desc">All events are sent as <code>POST</code> requests to the URL configured in the <code>WEBHOOK_URL</code> environment variable.</p>
  <span class="label">Payload format</span>
  <pre><code>{
  "session_id": "my-session-01",
  "event": "connected",
  "data": {}
}</code></pre>
  <span class="label">Event types</span>
  <pre><code>connected          — session connected to WhatsApp
disconnected       — session disconnected (see data.reason)
qr                 — new QR code generated (data.qr)
message.received   — incoming message (data.from, data.text, ...)
message.sent       — outgoing message confirmed (data.to, data.message_id)
message.receipt    — delivery/read receipt (data.type, data.message_ids)</code></pre>
</div>

</body>
</html>`
