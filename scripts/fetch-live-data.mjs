import { writeFile, mkdir } from 'node:fs/promises';

const token = process.env.FOOTBALL_DATA_TOKEN;
const outPath = 'data/live.json';

if (!token) {
  console.log('FOOTBALL_DATA_TOKEN is not configured; skipping live-data update.');
  process.exit(0);
}

const url = 'https://api.football-data.org/v4/competitions/WC/matches?season=2026';
const response = await fetch(url, {
  headers: {
    'X-Auth-Token': token,
    'Accept': 'application/json',
    'User-Agent': 'Contacto-WC2026/1.0'
  }
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`football-data.org ${response.status}: ${body.slice(0, 500)}`);
}

const payload = await response.json();
const matches = (payload.matches || []).map((m) => ({
  id: m.id,
  utcDate: m.utcDate,
  status: m.status,
  matchday: m.matchday,
  stage: m.stage,
  group: m.group,
  homeTeam: m.homeTeam,
  awayTeam: m.awayTeam,
  score: m.score
}));

await mkdir('data', { recursive: true });
await writeFile(outPath, JSON.stringify({
  updatedAt: new Date().toISOString(),
  source: 'football-data.org',
  count: matches.length,
  matches
}, null, 2));

console.log(`Wrote ${matches.length} matches to ${outPath}`);
