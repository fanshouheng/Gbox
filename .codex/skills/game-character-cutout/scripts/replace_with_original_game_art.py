import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


REPLACEMENTS = [
    ("狂扁小朋友", "dad-n-me", "Dad n Me game protagonist screenshot sprite"),
    ("造梦西游3", "dream-journey-3", "造梦西游3 悟空 角色 游戏截图"),
    ("冰火小人闯关", "fireboy-watergirl", "Fireboy Watergirl game characters official png"),
    ("割绳子", "cut-the-rope", "Cut the Rope Om Nom official game art png"),
]

ROOT = Path("assets/characters/cutouts")


def request_bytes(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://duckduckgo.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read()


def ddg_images(query: str) -> list[dict]:
    page = "https://duckduckgo.com/?q=" + urllib.parse.quote(query) + "&iax=images&ia=images"
    html = request_bytes(page).decode("utf-8", "ignore")
    match = re.search(r"vqd=([\d-]+)&", html)
    if not match:
        return []
    api = (
        "https://duckduckgo.com/i.js?l=us-en&o=json&q="
        + urllib.parse.quote(query)
        + "&vqd="
        + urllib.parse.quote(match.group(1))
        + "&f=,,,&p=1"
    )
    return json.loads(request_bytes(api).decode("utf-8", "ignore")).get("results", [])


def suffix_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path.lower()
    for suffix in [".png", ".jpg", ".jpeg", ".webp"]:
        if suffix in path:
            return suffix
    return ".jpg"


def looks_wrong(title: str, url: str) -> bool:
    text = (title + " " + url).lower()
    blocked = [
        "ai",
        "deviantart",
        "pinterest",
        "freepik",
        "pngtree",
        "vecteezy",
        "wallpaper",
        "youtube",
        "tiermaker",
    ]
    return any(word in text for word in blocked)


def make_cutout(source: Path, output: Path) -> str:
    from rembg import remove

    output.write_bytes(remove(source.read_bytes()))
    return "ok"


def main() -> int:
    summary = []
    for name, slug, query in REPLACEMENTS:
        out_dir = ROOT / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        archive_dir = out_dir / "previous"
        archive_dir.mkdir(exist_ok=True)
        for old in list(out_dir.glob("source.*")) + [out_dir / "cutout.png", out_dir / "sources.md"]:
            if old.exists():
                old.replace(archive_dir / old.name)

        print(f"\n## {name} :: {query}")
        selected = None
        source_path = None
        for candidate in ddg_images(query)[:20]:
            title = candidate.get("title", "")
            image_url = candidate.get("image", "")
            page_url = candidate.get("url", "")
            if not image_url or looks_wrong(title, page_url):
                continue
            try:
                data = request_bytes(image_url)
                if len(data) < 12_000:
                    continue
                source_path = out_dir / f"source{suffix_from_url(image_url)}"
                source_path.write_bytes(data)
                selected = candidate
                break
            except Exception as exc:
                print("download failed:", type(exc).__name__, image_url)

        if not selected or not source_path:
            print("no replacement found")
            summary.append((name, "failed"))
            continue

        status = make_cutout(source_path, out_dir / "cutout.png")
        (out_dir / "sources.md").write_text(
            "\n".join(
                [
                    f"# {name}",
                    "",
                    f"Replacement query: {query}",
                    f"Image page: {selected.get('url', '')}",
                    f"Direct image: {selected.get('image', '')}",
                    f"Title: {selected.get('title', '')}",
                    "",
                    "Replacement note: selected to be closer to original game art/sprite/screenshot style.",
                    "Note: Game character images may be copyrighted. Use according to the rights holder's terms.",
                    f"Cutout status: {status}",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        print("selected:", selected.get("title", ""))
        summary.append((name, status))
        time.sleep(1)

    print("\nSummary")
    for row in summary:
        print(row[0], row[1])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
