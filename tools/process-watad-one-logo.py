"""Remove white background and export WATAD ONE logo sizes."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\husse\.cursor\projects\c-projects-Watad\assets\watad-one-logo-source.png")
OUT_DIR = Path(r"C:\projects Watad\wadd\public\images")

SIZES = {
    "watad-one-signin.png": 512,
    "watad-one-signin-128.png": 128,
    "watad-one-signin-64.png": 64,
}


def remove_white(img: Image.Image, threshold: int = 245) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                px[x, y] = (r, g, b, 0)
            elif r >= 230 and g >= 230 and b >= 230:
                # Soft edge feather for anti-aliased whites
                dist = max(r, g, b)
                alpha = int((255 - dist) * 8)
                alpha = max(0, min(255, alpha))
                px[x, y] = (r, g, b, min(a, alpha))
    return img


def trim_transparent(img: Image.Image, pad: int = 24) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base = remove_white(Image.open(SRC))
    base = trim_transparent(base, pad=32)

    # Square canvas for consistent UI sizing
    side = max(base.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - base.width) // 2
    oy = (side - base.height) // 2
    square.paste(base, (ox, oy), base)

    for name, size in SIZES.items():
        out = square.resize((size, size), Image.Resampling.LANCZOS)
        out.save(OUT_DIR / name, optimize=True)
        print(f"wrote {OUT_DIR / name} ({size}px)")

    # Favicon-style small asset
    square.resize((48, 48), Image.Resampling.LANCZOS).save(
        OUT_DIR / "watad-one-signin-48.png", optimize=True
    )
    print("done")


if __name__ == "__main__":
    main()
