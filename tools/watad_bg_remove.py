"""
WATAD image background removal via rembg (https://github.com/danielgatis/rembg).

Local, open-source, no API key. MIT license.
"""
from __future__ import annotations

import io
from functools import lru_cache
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

WATAD_RED = (228, 0, 43)

# Best general-purpose model for flat icons and illustrations.
DEFAULT_MODEL = "isnet-general-use"


@lru_cache(maxsize=1)
def get_session(model_name: str = DEFAULT_MODEL):
    return new_session(model_name)


def snap_watad_red(img: Image.Image, threshold: int = 15) -> Image.Image:
    """Normalize near-red pixels to brand red for consistent icons."""
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r > g + threshold and r > b + threshold:
                px[x, y] = (*WATAD_RED, a)
    return img


def trim_alpha(img: Image.Image, pad: int = 6) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def resize_max(img: Image.Image, max_dim: int) -> Image.Image:
    if max(img.width, img.height) <= max_dim:
        return img
    ratio = max_dim / max(img.width, img.height)
    return img.resize(
        (max(1, int(img.width * ratio)), max(1, int(img.height * ratio))),
        Image.Resampling.LANCZOS,
    )


def export_icon_sizes(
    cutout: Image.Image,
    out_dir: Path,
    base_name: str,
    *,
    master_max: int = 512,
    sizes: tuple[int, ...] = (512, 256, 192, 128, 96, 64),
) -> None:
    """Write a capped master PNG plus sharp downscale variants for retina displays."""
    out_dir.mkdir(parents=True, exist_ok=True)
    cutout = trim_alpha(cutout.convert("RGBA"))
    master = resize_max(cutout, master_max)

    master_path = out_dir / f"{base_name}.png"
    master.save(master_path, optimize=True)
    print(f"wrote {master_path}")

    for size in sizes:
        ratio = size / max(master.width, master.height)
        out = master.resize(
            (max(1, int(master.width * ratio)), max(1, int(master.height * ratio))),
            Image.Resampling.LANCZOS,
        )
        sized_path = out_dir / f"{base_name}-{size}.png"
        out.save(sized_path, optimize=True)
        print(f"wrote {sized_path}")


def remove_background(
    src: Path | Image.Image,
    *,
    model_name: str = DEFAULT_MODEL,
    snap_red: bool = True,
    trim: bool = True,
) -> Image.Image:
    if isinstance(src, Path):
        input_img = Image.open(src).convert("RGBA")
    else:
        input_img = src.convert("RGBA")

    session = get_session(model_name)
    buf = io.BytesIO()
    input_img.save(buf, format="PNG")
    cutout = Image.open(io.BytesIO(remove(buf.getvalue(), session=session))).convert("RGBA")

    if snap_red:
        cutout = snap_watad_red(cutout)
    if trim:
        cutout = trim_alpha(cutout)
    return cutout
