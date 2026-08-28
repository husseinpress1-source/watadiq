"""Build WATAD ONE lockup from the company logo + ONE sub-brand."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\projects Watad\wadd")
SRC = ROOT / "public" / "images" / "watad-logo-red.png"
OUT_DIR = ROOT / "public" / "images"

BRAND_RED = (228, 0, 43, 255)
ONE_INK = (228, 0, 43, 255)


def load_logo_rgba() -> Image.Image:
    img = Image.open(SRC).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # Drop checkerboard/black backdrops if present
            if r < 24 and g < 24 and b < 24:
                px[x, y] = (0, 0, 0, 0)
    return img


def pick_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def compose_lockup(logo: Image.Image, scale: float = 1.0) -> Image.Image:
    """Company mark + ONE badge aligned like a product sub-brand."""
    lw, lh = logo.size
    pad_x = int(14 * scale)
    pad_y = int(10 * scale)
    gap = int(8 * scale)

    one_font = pick_font(max(12, int(22 * scale)), bold=True)
    badge_font = pick_font(max(10, int(18 * scale)), bold=True)

    one_text = "ONE"
    draw_probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    one_bbox = draw_probe.textbbox((0, 0), one_text, font=one_font)
    one_w = one_bbox[2] - one_bbox[0]
    one_h = one_bbox[3] - one_bbox[1]

    badge_pad_x = int(10 * scale)
    badge_pad_y = int(4 * scale)
    badge_w = one_w + badge_pad_x * 2
    badge_h = one_h + badge_pad_y * 2

    canvas_w = lw + gap + badge_w + pad_x * 2
    canvas_h = max(lh, badge_h) + pad_y * 2
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    logo_y = (canvas_h - lh) // 2
    canvas.paste(logo, (pad_x, logo_y), logo)

    badge_x = pad_x + lw + gap
    badge_y = (canvas_h - badge_h) // 2

    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge)
    radius = max(4, int(8 * scale))
    bdraw.rounded_rectangle((0, 0, badge_w - 1, badge_h - 1), radius=radius, fill=BRAND_RED)
    text_x = badge_pad_x - one_bbox[0]
    text_y = badge_pad_y - one_bbox[1]
    bdraw.text((text_x, text_y), one_text, font=badge_font, fill=(255, 255, 255, 255))
    canvas.paste(badge, (badge_x, badge_y), badge)

    return canvas


def compose_stacked(logo: Image.Image, scale: float = 1.0) -> Image.Image:
    """Vertical lockup for larger hero placements."""
    lw, lh = logo.size
    pad = int(12 * scale)
    gap = int(6 * scale)
    font = pick_font(max(14, int(26 * scale)), bold=True)
    text = "ONE"

    draw_probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = draw_probe.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    w = max(lw, tw + pad * 2)
    h = lh + gap + th + pad * 2
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(logo, ((w - lw) // 2, pad), logo)
    draw = ImageDraw.Draw(canvas)
    tx = (w - tw) // 2 - bbox[0]
    ty = pad + lh + gap - bbox[1]
    draw.text((tx, ty), text, font=font, fill=ONE_INK)
    return canvas


def export_sizes(base: Image.Image, prefix: str, sizes: dict[str, int]) -> None:
    max_side = max(base.size)
    square = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
    ox = (max_side - base.width) // 2
    oy = (max_side - base.height) // 2
    square.paste(base, (ox, oy), base)

    for name, size in sizes.items():
        out = square.resize((size, size), Image.Resampling.LANCZOS)
        path = OUT_DIR / name
        out.save(path, optimize=True)
        print(f"wrote {path}")


def main() -> None:
    logo = load_logo_rgba()

    horizontal = compose_lockup(logo, scale=1.0)
    export_sizes(
        horizontal,
        "watad-one-signin",
        {
            "watad-one-signin.png": 512,
            "watad-one-signin-128.png": 128,
            "watad-one-signin-64.png": 64,
            "watad-one-signin-48.png": 48,
        },
    )

    stacked = compose_stacked(logo, scale=1.6)
    stacked_square = stacked.resize((256, 256), Image.Resampling.LANCZOS)
    stacked_square.save(OUT_DIR / "watad-one-hero.png", optimize=True)
    print(f"wrote {OUT_DIR / 'watad-one-hero.png'}")

    # Wide SVG-friendly horizontal asset
    h128 = horizontal.resize(
        (int(horizontal.width * 128 / horizontal.height), 128),
        Image.Resampling.LANCZOS,
    )
    h128.save(OUT_DIR / "watad-one-lockup.png", optimize=True)
    print(f"wrote {OUT_DIR / 'watad-one-lockup.png'}")

    for height, name in ((44, "watad-one-lockup-44.png"), (64, "watad-one-lockup-64.png")):
        ratio = height / horizontal.height
        out = horizontal.resize(
            (max(1, int(horizontal.width * ratio)), height),
            Image.Resampling.LANCZOS,
        )
        out.save(OUT_DIR / name, optimize=True)
        print(f"wrote {OUT_DIR / name}")


if __name__ == "__main__":
    main()
