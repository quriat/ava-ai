#!/usr/bin/env python3
"""Auto-generate a daily blog post using Ollama and push to GitHub."""
import json, os, subprocess, sys
from datetime import date

OLLAMA_URL = "http://168.231.74.172:32779/api/chat"
MODEL = "kimi-k2.5:cloud"
REPO_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_FILE = os.path.join(REPO_DIR, "blog_posts.json")

CATEGORIES = ["Airport Travel", "Travel Tips", "Weddings", "Corporate", "Events", "Fleet"]
EMOJIS = {"Airport Travel": "&#9992;", "Travel Tips": "&#127542;", "Weddings": "&#128141;", "Corporate": "&#127963;", "Events": "&#127796;", "Fleet": "&#128664;"}

def generate_post():
    cat = CATEGORIES[date.today().toordinal() % len(CATEGORIES)]
    prompt = f'''Write a short Houston limo blog post (~200 words) in the "{cat}" category.
Return ONLY valid JSON with these exact keys: title, summary, content (HTML paragraphs), date (today's date), read (e.g. "3 min read").
No markdown, no explanation, no backticks — just raw JSON.'''
    import urllib.request
    body = json.dumps({"model": MODEL, "messages": [{"role": "user", "content": prompt}], "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=body, headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=120).read())
    post = json.loads(resp["message"]["content"])
    post["emoji"] = EMOJIS[cat]
    post["cat"] = cat
    return post

def main():
    posts = json.load(open(BLOG_FILE))
    new = generate_post()
    posts.insert(0, new)
    json.dump(posts, open(BLOG_FILE, "w"), indent=2, ensure_ascii=False)
    subprocess.run(["git", "-C", REPO_DIR, "add", "blog_posts.json"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "commit", "-m", f"auto blog: {new['title']}"], check=True)
    subprocess.run(["git", "-C", REPO_DIR, "push"], check=True)
    print(f"Posted: {new['title']}")

if __name__ == "__main__":
    main()
