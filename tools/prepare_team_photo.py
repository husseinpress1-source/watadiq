#!/usr/bin/env python3
"""Crop and resize team portraits for card layout."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def smart_portrait_crop(image: Image.Image, target_ratio: float = 4 / 5) -> Image.Image:
    """Center crop toward upper area for portrait cards."""
    width, height = image.size
    current_ratio = width / height

    if current_ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        box = (left, 0, left + new_width, height)
    else:
        new_height = int(width / target_ratio)
        top = max(0, int((height - new_height) * 0.12))
        box = (0, top, width, min(height, top + new_height))

    return image.crop(box)


def square_avatar_crop(image: Image.Image, top_bias: float = 0.0) -> Image.Image:
    """Center-horizontal square crop, anchored toward the top for portraits."""
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    max_top = max(0, height - side)
    top = int(max_top * top_bias)
    return image.crop((left, top, left + side, top + side))


def process_portrait(input_path: Path, output_path: Path, size: tuple[int, int]) -> None:
    with Image.open(input_path) as source:
        rgb = ImageOps.exif_transpose(source).convert("RGB")
        cropped = smart_portrait_crop(rgb)
        resized = cropped.resize(size, Image.Resampling.LANCZOS)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        resized.save(output_path, format="JPEG", quality=88, optimize=True)


def process_avatar(input_path: Path, output_path: Path, size: int = 960, top_bias: float = 0.0) -> None:
    with Image.open(input_path) as source:
        rgb = ImageOps.exif_transpose(source).convert("RGB")
        cropped = square_avatar_crop(rgb, top_bias=top_bias)
        resized = cropped.resize((size, size), Image.Resampling.LANCZOS)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        resized.save(output_path, format="JPEG", quality=90, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare team card portraits.")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--width", type=int, default=480)
    parser.add_argument("--height", type=int, default=600)
    parser.add_argument("--avatar", action="store_true", help="Export a square avatar crop.")
    parser.add_argument("--avatar-size", type=int, default=960)
    parser.add_argument(
        "--top-bias",
        type=float,
        default=0.0,
        help="0 keeps the top of a portrait; 1 keeps the bottom.",
    )
    args = parser.parse_args()
    if args.avatar:
        process_avatar(args.input, args.output, size=args.avatar_size, top_bias=args.top_bias)
    else:
        process_portrait(args.input, args.output, (args.width, args.height))
    print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()
