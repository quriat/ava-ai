#!/usr/bin/env python3
"""Auto-generate a daily blog post using b.ai (Qwen) and push to GitHub."""
import json, os, subprocess, sys, re
from datetime import date

BAI_URL = "https://api.b.ai/v1/chat/completions"
MODEL = "qwen3.8-flash"
REPO_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_FILE = os.path.join(REPO_DIR, "blog_posts.json")

CATEGORIES = ["Airport Travel", "Travel Tips", "Weddings", "Corporate", "Events", "Fleet"]
EMOJIS = {"Airport Travel": "&#9992;", "Travel Tips": "&#127542;", "Weddings": "&#128141;", "Corporate": "&#127963;", "Events": "&#127796;", "Fleet": "&#128664;"}


def _load_env():
    env_path = os.path.join(REPO_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip())


def _make_slug(title):
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:80]


def _extract_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)


def generate_post(post_date=None):
    _load_env()
    api_key = os.environ.get("BAI_API_KEY", "")
    if not api_key:
        raise SystemExit("BAI_API_KEY not set — add it to .env")

    post_date = post_date or date.today().isoformat()
    cat = CATEGORIES[date.fromisoformat(post_date).toordinal() % len(CATEGORIES)]
    prompt = f'''Write a short Houston limo blog post (~200 words) in the "{cat}" category.
Return ONLY valid JSON with these exact keys: title, summary, content (HTML paragraphs), date (use exactly "{post_date}"), read (e.g. "3 min read").
No markdown, no explanation, no backticks --- just raw JSON.'''

    import urllib.request
    body = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "temperature": 0.8,
    }).encode()
    req = urllib.request.Request(BAI_URL, data=body, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    })
    resp = json.loads(urllib.request.urlopen(req, timeout=120).read())
    post = _extract_json(resp["choices"][0]["message"]["content"])
    post["emoji"] = EMOJIS[cat]
    post["cat"] = cat
    post["date"] = post_date
    if "slug" not in post or not post["slug"]:
        post["slug"] = _make_slug(post.get("title", ""))
    return post


def main():
    post_date = None
    if "--date" in sys.argv:
        post_date = sys.argv[sys.argv.index("--date") + 1]

    posts = json.load(open(BLOG_FILE))
    new = generate_post(post_date)
    if any(p.get("slug") == new["slug"] for p in posts):
        print(f"Skipped: {new['title']} (already posted)")
        return
    posts.insert(0, new)
    json.dump(posts, open(BLOG_FILE, "w"), indent=2, ensure_ascii=False)
    subprocess.run(["git", "-C", REPO_DIR, "add", "blog_posts.json"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "commit", "-m", f"auto blog: {new['title']}"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "push"], check=True)
    print(f"Posted: {new['title']}")


if __name__ == "__main__":
    main()
