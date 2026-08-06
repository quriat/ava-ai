#!/usr/bin/env python3
"""Auto-generate a daily blog post using Ollama and push to GitHub."""
import json, os, subprocess, re, urllib.request
from datetime import datetime, date
from zoneinfo import ZoneInfo

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://168.231.74.172:32792/api/chat")
MODEL = os.environ.get("OLLAMA_MODEL", "minimax-m3:cloud")
REPO_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_FILE = os.path.join(REPO_DIR, "blog_posts.json")
TZ = ZoneInfo("America/Chicago")

CATEGORIES = ["Airport Travel", "Travel Tips", "Weddings", "Corporate", "Events", "Fleet"]
EMOJIS = {"Airport Travel": "&#9992;", "Travel Tips": "&#127542;", "Weddings": "&#128141;", "Corporate": "&#127963;", "Events": "&#127796;", "Fleet": "&#128664;"}

def _today():
    return datetime.now(TZ).date()

def _parse_date(value):
    if not value:
        return date.min
    if isinstance(value, str):
        for fmt in ("%Y-%m-%d", "%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(value.strip(), fmt).date()
            except ValueError:
                continue
    return date.min

def _load_posts():
    with open(BLOG_FILE) as f:
        return json.load(f)

def _save_posts(posts):
    posts.sort(key=lambda p: _parse_date(p.get("date", "")), reverse=True)
    with open(BLOG_FILE, "w") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

def _make_slug(title):
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:80]

def _extract_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)

def generate_post():
    today = _today()
    cat = CATEGORIES[today.toordinal() % len(CATEGORIES)]
    prompt = f'''Write a short Houston limo blog post (~200 words) in the "{cat}" category.
Today's date is {today.isoformat()}.
Return ONLY valid JSON with these exact keys: title, summary, content (HTML paragraphs), read (e.g. "3 min read").
Do not include a date or slug key. No markdown, no explanation, no backticks --- just raw JSON.'''
    body = json.dumps({"model": MODEL, "messages": [{"role": "user", "content": prompt}], "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=body, headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=180).read())
    post = _extract_json(resp["message"]["content"])
    post["emoji"] = EMOJIS[cat]
    post["cat"] = cat
    post["date"] = today.isoformat()
    post["slug"] = _make_slug(post.get("title", ""))
    post["read"] = post.get("read", "3 min read")
    return post

def main():
    posts = _load_posts()
    today = _today()
    if any(_parse_date(p.get("date")) == today for p in posts):
        print(f"Already posted today ({today}). Nothing to do.")
        return 0
    new = generate_post()
    posts.insert(0, new)
    _save_posts(posts)
    subprocess.run(["git", "-C", REPO_DIR, "add", "blog_posts.json"], check=True)
    commit = subprocess.run(["git", "-C", REPO_DIR, "commit", "-m", f"auto blog: {new['title']}"])
    if commit.returncode != 0:
        print("Nothing new to commit.")
        return 0
    subprocess.run(["git", "-C", REPO_DIR, "push"], check=True)
    print(f"Posted: {new['title']}")
    return 0

if __name__ == "__main__":
    sys_exit = main()
    raise SystemExit(sys_exit)
