"""Build WATAD ONE lockup from company logo + ONE, background removed via remove.bg."""
from __future__ import annotations

import io
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\projects Watad\wadd")
SRC = ROOT / "public" / "images" / "watad-logo-red.png"
OUT_DIR = ROOT / "public" / "images"
TMP = ROOT / "tools" / ".tmp-lockup-white.png"
API_KEY = __import__("os").environ.get("REMOVEBG_API_KEY", "")

BRAND_RED = (228, 0, 43, 255)
WHITE = (255, 255, 255, 255)


def pick_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def compose_on_white() -> Image.Image:
    logo = Image.open(SRC).convert("RGBA")
    scale = 2.4
    logo = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)

    pad = 48
    gap = 18
    one_font = pick_font(34, bold=True)
    one_text = "ONE"
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = probe.textbbox((0, 0), one_text, font=one_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    badge_px, badge_py = 22, 8
    badge_w = tw + badge_px * 2
    badge_h = th + badge_py * 2

    w = max(logo.width, badge_w) + pad * 2
    h = pad + logo.height + gap + badge_h + pad
    canvas = Image.new("RGBA", (w, h), WHITE)

    lx = (w - logo.width) // 2
    canvas.paste(logo, (lx, pad), logo)

    badge = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge)
    bdraw.rounded_rectangle((0, 0, badge_w - 1, badge_h - 1), radius=14, fill=BRAND_RED)
    bdraw.text((badge_px - bbox[0], badge_py - bbox[1]), one_text, font=one_font, fill=WHITE)
    bx = (w - badge_w) // 2
    by = pad + logo.height + gap
    canvas.paste(badge, (bx, by), badge)

    rgb = Image.new("RGB", canvas.size, (255, 255, 255))
    rgb.paste(canvas, mask=canvas.split()[3])
    return rgb


def remove_background(src: Path, dest: Path) -> None:
    boundary = "----WatadBoundary7MA4YWxkTrZu0gW"
    data = src.read_bytes()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image_file"; filename="lockup.png"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode("utf-8") + data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="size"\r\n\r\n'
        f"auto\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="format"\r\n\r\n'
        f"png\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="type"\r\n\r\n'
        f"auto\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        "https://api.remove.bg/v1.0/removebg",
        data=body,
        headers={
            "X-Api-Key": API_KEY,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        dest.write_bytes(resp.read())


def trim(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def export_assets(cutout: Image.Image) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cutout = trim(cutout.convert("RGBA"))

    # Horizontal lockup (side-by-side) for header buttons
    logo = Image.open(SRC).convert("RGBA")
    logo = logo.resize((int(logo.width * 1.8), int(logo.height * 1.8)), Image.Resampling.LANCZOS)
    gap = 14
    one_font = pick_font(26, bold=True)
    one_text = "ONE"
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = probe.textbbox((0, 0), one_text, font=one_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    bpx, bpy = 16, 7
    bw, bh = tw + bpx * 2, th + bpy * 2
    hw = logo.width + gap + bw + 24
    hh = max(logo.height, bh) + 16
    horizontal = Image.new("RGBA", (hw, hh), (0, 0, 0, 0))
    ly = (hh - logo.height) // 2
    horizontal.paste(logo, (12, ly), logo)
    badge = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.rounded_rectangle((0, 0, bw - 1, bh - 1), radius=12, fill=BRAND_RED)
    bd.text((bpx - bbox[0], bpy - bbox[1]), one_text, font=one_font, fill=WHITE)
    bx = 12 + logo.width + gap
    by = (hh - bh) // 2
    horizontal.paste(badge, (bx, by), badge)

    stacked = cutout

    stacked.save(OUT_DIR / "watad-one-signin.png")
    print(f"wrote {OUT_DIR / 'watad-one-signin.png'}")

    for height, name in (
        (128, "watad-one-signin-128.png"),
        (64, "watad-one-signin-64.png"),
        (48, "watad-one-signin-48.png"),
    ):
        ratio = height / stacked.height
        out = stacked.resize((max(1, int(stacked.width * ratio)), height), Image.Resampling.LANCZOS)
        out.save(OUT_DIR / name, optimize=True)
        print(f"wrote {OUT_DIR / name}")

    stacked.resize((256, 256), Image.Resampling.LANCZOS).save(OUT_DIR / "watad-one-hero.png", optimize=True)
    print(f"wrote {OUT_DIR / 'watad-one-hero.png'}")

    h128 = horizontal.resize(
        (int(horizontal.width * 128 / horizontal.height), 128),
        Image.Resampling.LANCZOS,
    )
    h128.save(OUT_DIR / "watad-one-lockup.png", optimize=True)
    print(f"wrote {OUT_DIR / 'watad-one-lockup.png'}")

    for height, name in ((44, "watad-one-lockup-44.png"), (64, "watad-one-lockup-64.png")):
        ratio = height / horizontal.height
        out = horizontal.resize((max(1, int(horizontal.width * ratio)), height), Image.Resampling.LANCZOS)
        out.save(OUT_DIR / name, optimize=True)
        print(f"wrote {OUT_DIR / name}")


def main() -> None:
    TMP.parent.mkdir(parents=True, exist_ok=True)
    white = compose_on_white()
    white.save(TMP, optimize=True)
    print(f"composed {TMP}")

    out_cutout = TMP.with_name(".tmp-lockup-nobg.png")
    remove_background(TMP, out_cutout)
    print(f"remove.bg -> {out_cutout}")

    export_assets(Image.open(out_cutout))
    print("done")


if __name__ == "__main__":
    main()
