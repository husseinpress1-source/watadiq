"""Generate WATAD OAuth consent icon PNGs with transparent backgrounds via rembg."""
from __future__ import annotations

from pathlib import Path

from watad_bg_remove import export_icon_sizes, remove_background

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "tools" / "assets" / "consent-sources"
OUT_DIR = ROOT / "public" / "assets" / "icons" / "consent"

ICON_JOBS: tuple[tuple[str, str], ...] = (
    ("consent-scope-openid-source.png", "scope-openid"),
    ("consent-scope-profile-source.png", "scope-profile"),
    ("consent-scope-email-source.png", "scope-email"),
    ("consent-scope-offline-source.png", "scope-offline"),
    ("consent-scope-default-source.png", "scope-default"),
    ("consent-link-connector-source.png", "link-connector"),
    ("consent-window-shield-source.png", "window-shield"),
)


def main() -> None:
    for source_name, base_name in ICON_JOBS:
        src = ASSETS / source_name
        if not src.exists():
            raise SystemExit(f"Source not found: {src}")
        print(f"rembg -> {base_name}")
        export_icon_sizes(remove_background(src), OUT_DIR, base_name, master_max=384, sizes=(384, 256, 192, 128, 96, 64))
    print("done")


if __name__ == "__main__":
    main()
