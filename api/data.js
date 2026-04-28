export default async function handler(req, res) {
  const url = `https://raw.githubusercontent.com/schadenfreyja/longview/main/data/projects.json`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GH_READ_TOKEN}` }
  });
  if (!r.ok) return res.status(r.status).json({ error: 'upstream error' });
  const data = await r.json();
  res.setHeader('Cache-Control', 'public, s-maxage=30');
  res.json(data);
}
