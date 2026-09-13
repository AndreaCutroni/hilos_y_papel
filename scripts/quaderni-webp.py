"""Convert the notebook photos in references/images/quaderni to web-sized WebP.

Every folder under references/images/quaderni is one notebook. Each photo is
written twice to src/assets/quaderni/<folder>/, scaled to a fixed width so the
sizes can go straight into `srcset`: <name>-800.webp for the grid and the
thumbnails, <name>-1600.webp for the gallery. The EXIF orientation is applied
first, so phone photos come out the right way up.

The output mirrors the originals: re-run it after adding, renaming or removing
photos. Files already newer than their original are skipped, and WebPs whose
original is gone are deleted, or a renamed photo would show up twice in the
gallery. To rebuild everything (after changing SIZES or QUALITY), delete
src/assets/quaderni first. The originals are never touched.

    python scripts/quaderni-webp.py
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'references' / 'images' / 'quaderni'
DST = ROOT / 'src' / 'assets' / 'quaderni'
SIZES = (800, 1600)
QUALITY = 80
PHOTO = {'.jpg', '.jpeg', '.png', '.webp'}


def convert(src: Path, out_dir: Path) -> int:
    written = 0
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        if im.width < max(SIZES):
            print(f'  attenzione: {src.name} e largo solo {im.width}px, srcset lo sovrastima')
        for size in SIZES:
            out = out_dir / f'{src.stem}-{size}.webp'
            if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
                continue
            copy = im
            if im.width > size:
                copy = im.resize((size, round(im.height * size / im.width)), Image.Resampling.LANCZOS)
            copy.save(out, 'WEBP', quality=QUALITY, method=6)
            written += 1
    return written


def prune(out_dir: Path, stems: set[str]) -> list[str]:
    """Delete the WebPs in out_dir whose original photo no longer exists."""
    gone = []
    for f in sorted(out_dir.glob('*.webp')):
        if f.stem.rsplit('-', 1)[0] not in stems:
            f.unlink()
            gone.append(f.name)
    return gone


def main() -> None:
    total = written = 0
    for folder in sorted(p for p in SRC.iterdir() if p.is_dir()):
        out_dir = DST / folder.name
        out_dir.mkdir(parents=True, exist_ok=True)
        photos = sorted(p for p in folder.iterdir() if p.suffix.lower() in PHOTO)
        for photo in photos:
            written += convert(photo, out_dir)
        gone = prune(out_dir, {p.stem for p in photos})
        total += len(photos)
        print(f'{folder.name:<24} {len(photos)} foto' + (f'  (rimossi: {", ".join(gone)})' if gone else ''))
    for out_dir in sorted(p for p in DST.iterdir() if p.is_dir()):
        if not (SRC / out_dir.name).is_dir():
            for f in out_dir.glob('*.webp'):
                f.unlink()
            out_dir.rmdir()
            print(f'{out_dir.name:<24} cartella rimossa (nessun originale)')
    size = sum(f.stat().st_size for f in DST.rglob('*.webp')) / 1e6
    print(f'\n{total} foto, {written} file scritti, {size:.1f} MB in {DST.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
