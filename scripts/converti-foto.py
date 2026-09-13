"""Convert new photos for the notebook catalogue to WebP, at web size.

The site reads src/assets/quaderni/<slug>/ directly (see LEGGIMI.md there);
this script only saves resizing photos by hand. Lay a notebook out in
references/images/quaderni/<slug>/ the way it should end up in src:

    cover1.png    ->  src/assets/quaderni/<slug>/cover1.webp    (square, 1000px)
    cover2.png    ->  src/assets/quaderni/<slug>/cover2.webp    (square, 1000px)
    images/x.png  ->  src/assets/quaderni/<slug>/images/x.webp  (1600px long side)

PNG, JPG and WebP all work; the covers are cropped square from the centre,
which is what the grid would do anyway. Anything else loose in the folder, like
the camera originals already there, is the archive and is left alone. A WebP
already newer than its source is skipped, so a re-run only converts what
changed, and nothing in src is ever deleted.

    python scripts/converti-foto.py             every notebook
    python scripts/converti-foto.py onde-rosse  just that one
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'references' / 'images' / 'quaderni'
DST = ROOT / 'src' / 'assets' / 'quaderni'
FOTO = {'.png', '.jpg', '.jpeg', '.webp'}
LATO_COVER = 1000
LATO_FOTO = 1600
QUALITA = 80


def apri(src: Path) -> Image.Image:
    """The photo the right way up, keeping transparency only where it has some."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        trasparente = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
        return im.convert('RGBA' if trasparente else 'RGB')


def cover(src: Path, out: Path) -> Image.Image:
    im = apri(src)
    lato = min(im.size)
    x, y = (im.width - lato) // 2, (im.height - lato) // 2
    im = im.crop((x, y, x + lato, y + lato))
    if lato > LATO_COVER:
        im = im.resize((LATO_COVER, LATO_COVER), Image.Resampling.LANCZOS)
    im.save(out, 'WEBP', quality=QUALITA, method=6)
    return im


def foto(src: Path, out: Path) -> Image.Image:
    im = apri(src)
    im.thumbnail((LATO_FOTO, LATO_FOTO), Image.Resampling.LANCZOS)
    im.save(out, 'WEBP', quality=QUALITA, method=6)
    return im


def main() -> None:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    scelte = set(sys.argv[1:])
    cartelle = sorted(p for p in SRC.iterdir() if p.is_dir() and (not scelte or p.name in scelte))
    for nome in sorted(scelte - {p.name for p in cartelle}):
        print(f'{nome}: non c’è una cartella con questo nome in {SRC.relative_to(ROOT).as_posix()}')

    convertite = aggiornate = sciolte = 0
    for cartella in cartelle:
        dest = DST / cartella.name
        lavori = []
        for f in sorted(cartella.iterdir()):
            if f.suffix.lower() not in FOTO:
                continue
            if f.stem.lower() in ('cover1', 'cover2'):
                lavori.append((f, dest / f'{f.stem.lower()}.webp', cover))
            else:
                sciolte += 1
        if (cartella / 'images').is_dir():
            for f in sorted((cartella / 'images').iterdir()):
                if f.suffix.lower() in FOTO:
                    lavori.append((f, dest / 'images' / f'{f.stem}.webp', foto))

        for src, out, converti in lavori:
            if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
                aggiornate += 1
                continue
            out.parent.mkdir(parents=True, exist_ok=True)
            im = converti(src, out)
            convertite += 1
            print(
                f'{src.relative_to(SRC).as_posix()}  ->  {out.relative_to(ROOT).as_posix()}'
                f'  ({im.width}×{im.height}, {out.stat().st_size // 1000} KB)'
            )
        if lavori and not (dest / 'quaderno.json').exists():
            print(f'  manca ancora {(dest / "quaderno.json").relative_to(ROOT).as_posix()}: scrivilo tu (vedi LEGGIMI.md)')

    riepilogo = f'\n{convertite} convertite, {aggiornate} già aggiornate'
    if sciolte:
        riepilogo += (
            f', {sciolte} foto sciolte lasciate stare'
            ' (per convertirne una, mettila in images/ o chiamala cover1 o cover2)'
        )
    print(riepilogo + '.')


if __name__ == '__main__':
    main()
