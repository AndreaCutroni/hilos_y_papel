"""Converte i JPG/PNG di una cartella in WebP, con qualità 80.

    python scripts/converti-webp.py "C:/Foto" "C:/Foto-web"

Salta i WebP esistenti e le sottocartelle. Conserva originali, dimensioni
e trasparenza; applica l'orientamento EXIF.
Richiede Pillow: python -m pip install Pillow
"""

import argparse
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Manca Pillow. Installalo con: python -m pip install Pillow')


FORMATI = {'.jpg', '.jpeg', '.png'}


def converti(origine: Path, destinazione: Path) -> None:
    with Image.open(origine) as originale:
        immagine = ImageOps.exif_transpose(originale).convert('RGBA')

    with tempfile.NamedTemporaryFile(
        dir=destinazione.parent, suffix='.webp', delete=False
    ) as file:
        temporaneo = Path(file.name)
    try:
        immagine.save(temporaneo, 'WEBP', quality=80, method=6)
        temporaneo.replace(destinazione)
    finally:
        temporaneo.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('origine', type=Path, help='Cartella delle foto JPG/PNG')
    parser.add_argument('destinazione', type=Path, help='Cartella dei WebP (creata se manca)')
    args = parser.parse_args()

    if not args.origine.is_dir():
        parser.error(f'La cartella di origine non esiste: {args.origine}')
    if args.destinazione.exists() and not args.destinazione.is_dir():
        parser.error('La destinazione deve essere una cartella')
    args.destinazione.mkdir(parents=True, exist_ok=True)

    errori = False
    for origine in sorted(args.origine.iterdir()):
        if not origine.is_file() or origine.suffix.lower() not in FORMATI:
            continue
        destinazione = args.destinazione / f'{origine.stem}.webp'
        if destinazione.exists():
            print(f'Saltata (destinazione esistente): {destinazione}')
            continue
        try:
            converti(origine, destinazione)
        except (OSError, ValueError) as errore:
            print(f'Errore con {origine}: {errore}', file=sys.stderr)
            errori = True
            continue
        print(f'{origine} -> {destinazione}')
    return 1 if errori else 0


if __name__ == '__main__':
    sys.exit(main())
