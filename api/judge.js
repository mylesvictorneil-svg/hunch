// Jackpot AI referee (Vercel serverless function).
// The game host POSTs an answer and the current clues; Claude decides whether it fits.
// Needs the ANTHROPIC_API_KEY environment variable set in Vercel.
// Optional: JUDGE_MODEL to use a different Claude model.

const hits = new Map(); // simple per-IP rate limit (per server instance)
function limited(ip) {
  const now = Date.now(), win = 60_000, max = 40;
  const list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

const clip = (s, n) => String(s == null ? "" : s).slice(0, n).trim();

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  // Only accept calls from pages on this same site.
  const origin = req.headers.origin || "";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  try { if (origin && new URL(origin).host !== host) return res.status(403).json({ ok: false, error: "origin" }); } catch (e) { return res.status(403).json({ ok: false, error: "origin" }); }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ ok: false, error: "rate_limited" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "no_key" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const answer = clip(b.answer, 60);
  const criteria = (Array.isArray(b.criteria) ? b.criteria : []).slice(0, 8).map(c => clip(c, 140)).filter(Boolean);
  const jackpot = clip(b.jackpot, 80);
  const aliases = (Array.isArray(b.jackpotAliases) ? b.jackpotAliases : []).slice(0, 8).map(a => clip(a, 60));
  const used = (Array.isArray(b.used) ? b.used : []).slice(-60).map(u => clip(u, 60)).filter(Boolean);
  if (!answer || !criteria.length || !jackpot) return res.status(400).json({ ok: false, error: "bad_request" });

  const today = new Date().toISOString().slice(0, 10);
  const system = `You are the referee for a multiplayer party trivia game. Players must name one specific, real person, place or thing that satisfies EVERY clue.
Today's date is ${today}. Judge by widely accepted public knowledge. Be lenient with spelling mistakes, nicknames, capitalization and missing accents.
The answer must identify one real person, place or thing. A general kind of thing (like "dog" or "pizza") counts as a thing. Made-up, joke or nonsense answers are not recognized.
For clues about a name's letters, judge the answer's common full English name. Reply with JSON only, no other text.`;
  const prompt = `Clues (the answer must satisfy all of them):
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Secret answer (the "Jackpot"): ${jackpot}${aliases.length ? ` (also known as: ${aliases.join(", ")})` : ""}
Answers already used this game: ${used.length ? used.join("; ") : "none"}

Answer to judge: "${answer.replace(/"/g, "'")}"

Return exactly this JSON:
{"recognized": true if it's a real, specific person, place or thing you can identify,
 "canonical": its standard name (short),
 "fits": true only if it satisfies every clue,
 "failed_clue": the number of the first clue it breaks, or 0,
 "is_jackpot": true if it refers to the same thing as the secret answer,
 "duplicate": true if it's the same thing as an already used answer,
 "reason": a short explanation under 12 words}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.JUDGE_MODEL || "claude-haiku-5-5",
        max_tokens: 250,
        system,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("Anthropic API error", r.status, detail.slice(0, 300));
      return res.status(502).json({ ok: false, error: "upstream", status: r.status });
    }
    const data = await r.json();
    const text = (data.content || []).map(c => c.text || "").join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return res.status(502).json({ ok: false, error: "parse" });
    const j = JSON.parse(m[0]);
    const failed = Math.max(0, Math.min(criteria.length, parseInt(j.failed_clue, 10) || 0));
    return res.status(200).json({
      ok: true,
      recognized: !!j.recognized,
      canonical: clip(j.canonical || answer, 60),
      fits: !!j.fits && failed === 0,
      failed_clue: j.fits ? 0 : failed,
      is_jackpot: !!j.is_jackpot,
      duplicate: !!j.duplicate,
      reason: clip(j.reason, 100)
    });
  } catch (e) {
    console.error("judge failed", e);
    return res.status(500).json({ ok: false, error: "server" });
  }
};
