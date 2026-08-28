"""Generate WATAD expertise/about service icons with transparent backgrounds via rembg."""
from __future__ import annotations

from pathlib import Path

from watad_bg_remove import export_icon_sizes, remove_background

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\husse\.cursor\projects\c-projects-Watad\assets")
OUT_DIR = ROOT / "public" / "assets" / "expertise"

JOBS: tuple[tuple[str, str], ...] = (
    ("expertise-web-source-v2.png", "expertise-web"),
    ("expertise-mobile-source-v2.png", "expertise-mobile"),
    ("expertise-security-source-v2.png", "expertise-security"),
    ("expertise-design-source-v2.png", "expertise-design"),
    ("expertise-commerce-source-v2.png", "expertise-commerce"),
    ("expertise-cloud-source-v2.png", "expertise-cloud"),
)


def main() -> None:
    for source_name, base_name in JOBS:
        src = ASSETS / source_name
        if not src.exists():
            raise SystemExit(f"Source not found: {src}")
        print(f"rembg -> {base_name}")
        export_icon_sizes(remove_background(src), OUT_DIR, base_name)
    print("done")


if __name__ == "__main__":
    main()
