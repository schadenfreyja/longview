# Long View — GitHub Data Store Setup

## What you got

| File | Role |
|---|---|
| `index.html` | Editor — localStorage + Publish button |
| `viewer.html` | Read-only Gantt — fetches from GitHub |

---

## 1. Create `data/projects.json` in your repo

In your Vercel/GitHub repo, create an empty placeholder so the file exists:

```bash
mkdir -p data
echo "[]" > data/projects.json
git add data/projects.json
git commit -m "chore: add projects data file"
git push
```

---

## 2. Configure viewer.html

Open `viewer.html` and replace the three placeholders near the top of the `<script>`:

```js
const GITHUB_OWNER  = 'your-github-username-or-org';
const GITHUB_REPO   = 'your-repo-name';
const GITHUB_BRANCH = 'main';
```

That's it — the viewer reads the raw file directly. No API key needed for a **public repo**.

> **Private repo?** See the note at the bottom.

---

## 3. Create a GitHub Personal Access Token (for publishing)

1. Go to https://github.com/settings/tokens?type=beta
2. Click **Generate new token**
3. Name it `longview-publish` (or anything)
4. Under **Repository access** → select your repo
5. Under **Permissions → Contents** → set to **Read and write**
6. Copy the token — you'll paste it in the Publish modal each session

> The token is **never stored** by the editor. You paste it fresh each time you publish. This is intentional — it means the token doesn't live in localStorage where a browser extension could read it.

---

## 4. First publish

1. Open your Vercel-hosted `index.html`
2. Click **↑ Publish** in the top-right
3. Fill in Owner, Repo, Branch, and your PAT
4. Click **Publish Now**

The editor will write `data/projects.json` to your repo with a commit message like:
`chore: publish roadmap data 2026-04-27 14:32`

---

## 5. Share the viewer

Send colleagues to your Vercel URL + `/viewer.html`, e.g.:
`https://your-app.vercel.app/viewer.html`

They get a read-only Gantt with no sidebar editor, no way to make changes.

---

## Private repo (optional)

If your repo is private, the raw GitHub URL won't work unauthenticated.
The simplest fix is a one-file Vercel serverless function:

**`api/data.js`** (add to your repo):
```js
export default async function handler(req, res) {
  const url = `https://raw.githubusercontent.com/${process.env.GH_OWNER}/${process.env.GH_REPO}/${process.env.GH_BRANCH}/data/projects.json`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GH_READ_TOKEN}` }
  });
  if (!r.ok) return res.status(r.status).json({ error: 'upstream error' });
  const data = await r.json();
  res.setHeader('Cache-Control', 'public, s-maxage=30');
  res.json(data);
}
```

Then in Vercel dashboard → Settings → Environment Variables, add:
- `GH_OWNER` — your GitHub username/org
- `GH_REPO` — repo name
- `GH_BRANCH` — branch name
- `GH_READ_TOKEN` — a **read-only** PAT (Contents: read)

And in `viewer.html`, change the fetch URL to:
```js
const url = '/api/data';
```
