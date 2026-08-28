"""Re-export sharp icon sizes from existing high-res PNG masters (no rembg)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from watad_bg_remove import export_icon_sizes, trim_alpha

ROOT = Path(__file__).resolve().parents[1]
EXPERTISE = ROOT / "public" / "assets" / "expertise"
CONSENT = ROOT / "public" / "assets" / "icons" / "consent"

EXPERTISE_MASTERS = (
    "expertise-web",
    "expertise-mobile",
    "expertise-security",
    "expertise-design",
    "expertise-commerce",
    "expertise-cloud",
)
CONSENT_MASTERS = (
    "scope-openid",
    "scope-profile",
    "scope-email",
    "scope-offline",
    "scope-default",
    "link-connector",
    "window-shield",
)


def reexport_dir(out_dir: Path, names: tuple[str, ...]) -> None:
    for name in names:
        master = out_dir / f"{name}.png"
        if not master.exists():
            print(f"skip missing {master}")
            continue
        print(f"re-export -> {name}")
        img = trim_alpha(Image.open(master).convert("RGBA"))
        export_icon_sizes(img, out_dir, name)


def main() -> None:
    reexport_dir(EXPERTISE, EXPERTISE_MASTERS)
    reexport_dir(CONSENT, CONSENT_MASTERS)
    print("done")


if __name__ == "__main__":
    main()
