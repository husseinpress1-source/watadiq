"""One-off: compress hero images to WebP for faster loads."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "images"

# (source relative path, output widths)
JOBS: list[tuple[str, tuple[int, ...]]] = [
    ("heroes/hero-home.png", (768, 1280)),
    ("heroes/hero-about.png", (1280,)),
    ("heroes/hero-expertise.png", (1280,)),
    ("heroes/hero-team.png", (1280,)),
    ("heroes/hero-pricing.png", (1280,)),
    ("heroes/hero-contact.png", (1280,)),
    ("watad-one-hero.png", (960,)),
]


def to_webp(src: Path, dst: Path, max_w: int, quality: int = 82) -> int:
    img = Image.open(src).convert("RGB")
    if img.width > max_w:
        h = round(img.height * max_w / img.width)
        img = img.resize((max_w, h), Image.Resampling.LANCZOS)
    img.save(dst, "WEBP", quality=quality, method=6)
    return dst.stat().st_size


def main() -> None:
    for rel, widths in JOBS:
        src = ROOT / rel
        if not src.exists():
            print("skip missing", rel)
            continue
        for w in widths:
            if len(widths) == 1 and w == 1280:
                out = src.with_suffix(".webp")
            else:
                out = src.parent / f"{src.stem}-{w}.webp"
            kb = to_webp(src, out, w) // 1024
            print(f"{out.relative_to(ROOT.parent.parent)}  {kb} KB")


if __name__ == "__main__":
    main()
