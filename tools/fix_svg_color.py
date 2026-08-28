from pathlib import Path

src = Path(r"C:\projects Watad\wadd\public\images\watad-one-signin-clean.svg")
dst = Path(r"C:\projects Watad\wadd\public\images\watad-one-signin.svg")
text = src.read_text(encoding="utf-8")
text = text.replace('fill="#000000"', 'fill="#E4002B"')
text = text.replace(
    'width="512" height="512"',
    'viewBox="0 0 512 512" width="512" height="512"',
)
dst.write_text(text, encoding="utf-8")
print(f"Wrote {dst} ({len(text)} bytes)")
