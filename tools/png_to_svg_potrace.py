#!/usr/bin/env python3
"""Convert PNG logo to SVG using Potrace (potracer)."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image
from potrace import Bitmap


def trace_png(input_path: Path, output_path: Path, *, size: int = 512) -> None:
    with Image.open(input_path) as source:
        rgba = source.convert("RGBA")
        # Alpha-aware luminance: transparent -> white background for tracing.
        bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        composed = Image.alpha_composite(bg, rgba).convert("L")
        if composed.size != (size, size):
            composed = composed.resize((size, size), Image.Resampling.LANCZOS)

    bitmap = Bitmap(composed, blacklevel=0.45)
    path_list = bitmap.trace(
        turdsize=2,
        turnpolicy="minority",
        alphamax=1.0,
        opticurve=True,
        opttolerance=0.15,
    )

    d_paths: list[str] = []
    for curve in path_list:
        parts = [f"M {curve.start_point.x:.2f} {curve.start_point.y:.2f}"]
        for segment in curve.segments:
            if segment.is_corner:
                parts.append(f"L {segment.c.x:.2f} {segment.c.y:.2f}")
                parts.append(f"L {segment.end_point.x:.2f} {segment.end_point.y:.2f}")
            else:
                parts.append(
                    f"C {segment.c1.x:.2f} {segment.c1.y:.2f} "
                    f"{segment.c2.x:.2f} {segment.c2.y:.2f} "
                    f"{segment.end_point.x:.2f} {segment.end_point.y:.2f}"
                )
        parts.append("Z")
        d_paths.append(" ".join(parts))

    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">\n'
        + "\n".join(f'  <path d="{d}" fill="#E4002B"/>' for d in d_paths)
        + "\n</svg>\n"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(svg, encoding="utf-8")
    print(f"Saved {output_path} ({len(d_paths)} paths, {len(svg)} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path, required=True)
    parser.add_argument("-s", "--size", type=int, default=512)
    args = parser.parse_args()
    trace_png(args.input, args.output, size=args.size)


if __name__ == "__main__":
    main()
