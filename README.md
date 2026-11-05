# Spec Sheet + Blockbuster Daily

Two daily-game sites in one repo, deployed as one Vercel project.

| Path | Site | Games |
|---|---|---|
| `/` | **Spec Sheet**, the daily car game | Spec Sheet (main), Sold |
| `/blockbuster/` | **Blockbuster Daily** | Blurred, Blockbuster, Jackpot (live multiplayer) |

- `index.html`, `specsheet3d.js`: Spec Sheet site and its 3D drifting-car intro (Three.js in `vendor/`).
- `blockbuster/`: Blockbuster Daily site, plus `party.js` / `party-data.js` for Jackpot.
- `api/judge.js`: AI referee for Jackpot. Set `ANTHROPIC_API_KEY` in Vercel (optional `JUDGE_MODEL`).
- Jackpot players connect through a public MQTT relay over secure WebSockets (`vendor/mqtt.min.js`).
- `vercel.json`: if a `blockbusterdaily.*` domain is added to the project, it serves the `/blockbuster/` site.

No build step. New daily puzzles rotate in at local midnight.
