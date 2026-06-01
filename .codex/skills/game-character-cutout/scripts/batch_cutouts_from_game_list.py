import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


GAMES = [
    ("疯狂小人战斗", "madness-combat", "Madness Combat Hank character png"),
    ("狂扁小朋友", "dad-n-me", "Dad n Me character official art png"),
    ("勇者之路精灵物语", "brave-road-elf-story", "勇者之路精灵物语 角色 图片"),
    ("小鳄鱼爱洗澡", "wheres-my-water-swampy", "Where's My Water Swampy official art png"),
    ("双刃战士", "double-edge-warrior", "双刃战士 4399 角色 图片"),
    ("混乱大枪战2", "chaos-faction-2", "Chaos Faction 2 character png"),
    ("闪客快打3", "crazy-flasher-3", "Crazy Flasher 3 Andy Law character png"),
    ("死神VS火影", "bleach-vs-naruto", "死神VS火影 角色 透明 png"),
    ("冒险王之神兵传奇", "adventure-king", "冒险王之神兵传奇 角色 图片"),
    ("造梦西游3", "dream-journey-3", "造梦西游3 孙悟空 透明 png"),
    ("冰火小人闯关", "fireboy-watergirl", "Fireboy and Watergirl official character png"),
    ("割绳子", "cut-the-rope", "Cut the Rope Om Nom official png"),
    ("粘粘世界", "world-of-goo", "World of Goo goo ball png"),
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
    data = request_bytes(api).decode("utf-8", "ignore")
    return json.loads(data).get("results", [])


def suffix_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path.lower()
    for suffix in [".png", ".jpg", ".jpeg", ".webp"]:
        if path.endswith(suffix):
            return suffix
    return ".jpg"


def make_cutout(source: Path, output: Path) -> str:
    try:
        from rembg import remove
    except ImportError:
        return "missing rembg"

    output.write_bytes(remove(source.read_bytes()))
    return "ok"


def main() -> int:
    ROOT.mkdir(parents=True, exist_ok=True)
    summary = []

    for name, slug, query in GAMES:
        out_dir = ROOT / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n## {name} :: {query}")
        candidates = []
        try:
            candidates = ddg_images(query)
        except Exception as exc:
            print("search failed:", type(exc).__name__, exc)

        selected = None
        source_path = None
        for candidate in candidates[:12]:
            image_url = candidate.get("image")
            if not image_url:
                continue
            try:
                data = request_bytes(image_url)
                if len(data) < 10_000:
                    continue
                suffix = suffix_from_url(image_url)
                source_path = out_dir / f"source{suffix}"
                source_path.write_bytes(data)
                selected = candidate
                break
            except Exception as exc:
                print("download failed:", type(exc).__name__, image_url)
                continue

        if not selected or not source_path:
            (out_dir / "sources.md").write_text(
                f"# {name}\n\nSearch query: {query}\n\nStatus: no downloadable candidate found.\n",
                encoding="utf-8",
            )
            summary.append((name, "failed", str(out_dir)))
            continue

        cutout_path = out_dir / "cutout.png"
        status = make_cutout(source_path, cutout_path)
        (out_dir / "sources.md").write_text(
            "\n".join(
                [
                    f"# {name}",
                    "",
                    f"Search query: {query}",
                    f"Image page: {selected.get('url', '')}",
                    f"Direct image: {selected.get('image', '')}",
                    f"Title: {selected.get('title', '')}",
                    "",
                    "Note: Game character images may be copyrighted. Use according to the rights holder's terms.",
                    f"Cutout status: {status}",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        print("selected:", selected.get("title", ""))
        print("source:", source_path)
        print("cutout:", cutout_path, status)
        summary.append((name, status, str(out_dir)))
        time.sleep(1)

    (ROOT / "batch-summary.md").write_text(
        "\n".join([f"- {name}: {status} -> {path}" for name, status, path in summary]) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
