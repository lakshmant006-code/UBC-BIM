// Website chat assistant. The visitor's conversation (plain text turns) is
// answered by Claude from the site's own content (knowledge.js), streamed
// back as plain text. One tool, request_follow_up, turns a visitor who asks
// for a person into a Zoho CRM lead (the same path as the project form).
//
// Configure in Vercel: ANTHROPIC_API_KEY (required); CHAT_MODEL optional
// (defaults to Claude Opus 5.5). Without a key this answers 503 and the chat
// panel falls back to its built-in quick answers.
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './knowledge.js';
import { zohoConfigured, createZohoLead } from '../project/zoho.js';

export const runtime = 'nodejs';

const MODEL = process.env.CHAT_MODEL || 'claude-opus-5-5';
const MAX_TURNS = 24;          // messages kept from the visitor's history
const MAX_CHARS = 4000;        // per message
const PER_MINUTE = 20;         // requests per IP per minute, per server instance

const TOOLS = [{
  name: 'request_follow_up',
  description: 'Send the visitor\'s name, work email and a short summary of what they need to the UBC BIM team as a CRM lead, so a person replies by email. Call only after the visitor has given an email address and agreed to be contacted.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'email', 'summary'],
    properties: {
      name: { type: 'string', description: 'The visitor\'s name as they gave it.' },
      email: { type: 'string', description: 'The visitor\'s work email address.' },
      summary: { type: 'string', description: 'One to three sentences: what they need, building type, framing system, machine or software, timing - whatever they said.' }
    }
  }
}];

// Small in-memory throttle: enough to stop a runaway client hammering the
// API from one address, not a substitute for a real rate limiter.
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_MINUTE;
}

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();   // the API starts with a user turn
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}

async function followUp(input) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, text: 'A name and a valid email address are needed before the team can follow up.' };
  }
  if (!zohoConfigured()) {
    return { ok: false, text: 'The follow-up system is not connected yet. Ask the visitor to use the "Start Your Next Project" form.' };
  }
  try {
    await createZohoLead({
      name, email, machine: '', files: [], source: 'chat', role: '',
      message: String(input.summary || '').slice(0, 2000),
      submittedAt: new Date().toISOString()
    });
    return { ok: true, text: 'Sent. The team has the visitor\'s details and will reply by email.' };
  } catch (e) {
    console.error(e && e.message);
    return { ok: false, text: 'Sending failed. Ask the visitor to use the "Start Your Next Project" form instead.' };
  }
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: false, reason: 'not-configured' }, { status: 503 });
  }
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (throttled(ip)) return Response.json({ ok: false, reason: 'rate-limited' }, { status: 429 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 }); }
  const history = cleanHistory(body && body.messages);
  if (!history) return Response.json({ ok: false, reason: 'bad-request' }, { status: 400 });

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (t) => controller.enqueue(encoder.encode(t));
      let wrote = false;
      try {
        const convo = [...history];
        // At most one follow-up tool round; the model replies after it.
        for (let round = 0; round < 3; round++) {
          const s = client.beta.messages.stream({
            model: MODEL,
            max_tokens: 4000,
            // A declined request is re-run on Anthropic's recommended
            // fallback model inside the same call.
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            // Website chat: short factual answers, so low effort.
            output_config: { effort: 'low' },
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            tools: TOOLS,
            messages: convo
          });
          for await (const ev of s) {
            if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
              if (round > 0 && !wrote) { send('\n\n'); }
              send(ev.delta.text); wrote = true;
            }
          }
          const msg = await s.finalMessage();
          if (msg.stop_reason === 'refusal') {
            send((wrote ? '\n\n' : '') + 'I can’t help with that here. For anything about your project, use the “Start Your Next Project” form and the team will reply.');
            break;
          }
          if (msg.stop_reason !== 'tool_use') break;
          convo.push({ role: 'assistant', content: msg.content });
          const results = [];
          for (const b of msg.content) {
            if (b.type !== 'tool_use') continue;
            const r = b.name === 'request_follow_up' ? await followUp(b.input || {}) : { ok: false, text: 'Unknown tool.' };
            results.push({ type: 'tool_result', tool_use_id: b.id, content: r.text, is_error: !r.ok });
          }
          convo.push({ role: 'user', content: results });
          wrote = false;
        }
      } catch (e) {
        console.error('chat:', e && e.message);
        send((wrote ? '\n\n' : '') + 'Sorry, the assistant is having trouble right now. Please use the “Start Your Next Project” form and the team will reply within one working day.');
      }
      controller.close();
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
