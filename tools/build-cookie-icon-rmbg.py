"""Generate WATAD cookie consent icon PNGs with transparent background via rembg."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from watad_bg_remove import remove_background

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "tools" / "assets" / "cookie-icon-source.png"
FALLBACK_SRC = Path(r"C:\Users\husse\.cursor\projects\c-projects-Watad\assets\cookie-icon-source.png")
OUT_DIR = ROOT / "public" / "assets" / "icons"


def export_assets(cutout: Image.Image) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    cutout.save(OUT_DIR / "cookie-consent.png", optimize=True)
    print(f"wrote {OUT_DIR / 'cookie-consent.png'}")

    for size, name in ((96, "cookie-consent-96.png"), (64, "cookie-consent-64.png"), (48, "cookie-consent-48.png")):
        ratio = size / max(cutout.width, cutout.height)
        out = cutout.resize(
            (max(1, int(cutout.width * ratio)), max(1, int(cutout.height * ratio))),
            Image.Resampling.LANCZOS,
        )
        out.save(OUT_DIR / name, optimize=True)
        print(f"wrote {OUT_DIR / name}")


def main() -> None:
    src = SRC if SRC.exists() else FALLBACK_SRC
    if not src.exists():
        raise SystemExit(f"Source not found: {SRC}")

    print(f"rembg -> cookie icon ({src.name})")
    export_assets(remove_background(src))
    print("done")


if __name__ == "__main__":
    main()
