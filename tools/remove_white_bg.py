#!/usr/bin/env python3
"""Remove near-white backgrounds from PNG images and optionally resize."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def remove_white_background(
    image: Image.Image,
    *,
    threshold: int = 240,
    soften: int = 15,
) -> Image.Image:
    """Convert near-white pixels to transparent with soft edges."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            brightness = max(r, g, b)
            if brightness >= threshold:
                pixels[x, y] = (r, g, b, 0)
                continue

            if brightness >= threshold - soften:
                alpha = int((threshold - brightness) / soften * 255)
                pixels[x, y] = (r, g, b, min(a, alpha))

    return rgba


def trim_transparent(image: Image.Image, padding: int = 2) -> Image.Image:
    bbox = image.getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def resize_image(image: Image.Image, size: int) -> Image.Image:
    return image.resize((size, size), Image.Resampling.LANCZOS)


def process_file(
    input_path: Path,
    output_path: Path,
    *,
    size: int | None,
    threshold: int,
    soften: int,
) -> None:
    with Image.open(input_path) as source:
        processed = remove_white_background(source, threshold=threshold, soften=soften)
        processed = trim_transparent(processed)
        if size:
            processed = resize_image(processed, size)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        processed.save(output_path, format="PNG", optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Remove white background from PNG images.")
    parser.add_argument("input", type=Path, help="Input PNG path")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output PNG path (defaults to input with -nobg suffix)",
    )
    parser.add_argument(
        "-s",
        "--size",
        type=int,
        default=128,
        help="Square output size in pixels (default: 128)",
    )
    parser.add_argument(
        "-t",
        "--threshold",
        type=int,
        default=240,
        help="White threshold 0-255 (default: 240)",
    )
    parser.add_argument(
        "--soften",
        type=int,
        default=15,
        help="Edge softness range below threshold (default: 15)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output = args.output or args.input.with_name(f"{args.input.stem}-nobg.png")
    process_file(
        args.input,
        output,
        size=args.size,
        threshold=args.threshold,
        soften=args.soften,
    )
    print(f"Saved: {output}")


if __name__ == "__main__":
    main()
