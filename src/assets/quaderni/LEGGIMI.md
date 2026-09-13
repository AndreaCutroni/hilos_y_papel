# Quaderni del sito

Ogni cartella qui dentro è un quaderno del catalogo su `/quaderni`. Il sito le
legge così come sono: per aggiungere, cambiare o togliere un quaderno basta
aggiungere, cambiare o togliere la sua cartella.

## Com’è fatta una cartella

```
onde-rosse/
├── quaderno.json        le informazioni del quaderno
├── cover1.webp          la foto nel catalogo
├── cover2.webp          la foto che compare passandoci sopra con il mouse
└── images/              le foto della pagina del quaderno
    ├── 01-onde-rosse.webp
    └── 02-onde-rosse.webp
```

- Il nome della cartella diventa l’indirizzo della pagina
  (`/quaderni/onde-rosse`): usa minuscole, con i trattini al posto degli spazi.
- Le foto possono essere webp, jpg o png.
- `cover1` e `cover2` è meglio che siano quadrate, altrimenti il catalogo le
  taglia al centro. `cover2` è facoltativa.
- Le foto in `images` si chiamano con un numero e il nome del quaderno
  (`01-onde-rosse`, `02-onde-rosse`…) e compaiono in quell’ordine.

## Il peso delle foto

Il sito mostra le foto così come sono, senza rimpicciolirle. Una foto del
telefono pesa 3–5 MB e renderebbe le pagine lente, quindi prima di metterla qui
salvala più piccola:

- `cover1` e `cover2`: circa 1000 × 1000 px
- le foto in `images`: circa 1600 px sul lato lungo

Puoi farlo con lo script qui sotto, oppure a mano: su Windows con l’app Foto
(«Ridimensiona immagine») o dal browser con squoosh.app. In locale, la pagina
`/quaderni` segnala le foto che pesano più di 1 MB.

## Convertire le foto con lo script

Invece di ridimensionarle a mano, puoi preparare il quaderno in
`references/images/quaderni/` con la stessa struttura della sua cartella qui,
con le foto in png o jpg:

```
references/images/quaderni/onde-rosse/
├── cover1.png
├── cover2.png
└── images/
    ├── 01-onde-rosse.png
    └── 02-onde-rosse.png
```

e poi, dalla cartella del progetto, lanciare:

```
python scripts/converti-foto.py
```

oppure `python scripts/converti-foto.py onde-rosse` per un quaderno solo. Lo
script le converte in webp alla misura giusta (cover quadrate da 1000 px, foto
da 1600 px) e le mette nella cartella corrispondente qui, con lo stesso nome,
creandola se non c’è. Converte solo le foto nuove o cambiate e non cancella
niente; le foto originali già in `references` restano dove sono. Il
`quaderno.json` scrivilo tu.

## Il file quaderno.json

```json
{
  "nome": "Onde rosse",
  "tipologia": "rigido",
  "formato": "A5 verticale",
  "personalizzato": false,
  "ordine": 1
}
```

| Campo            | Cosa scrivere                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `nome`           | il nome che compare sul sito                                                                  |
| `tipologia`      | `"rigido"` oppure `"flex"`                                                                    |
| `formato`        | `"A5 verticale"`, `"A5 orizzontale"`, `"A6 verticale"` oppure `"A6 orizzontale"`              |
| `personalizzato` | `true` se la copertina è personalizzata, altrimenti `false`                                   |
| `ordine`         | facoltativo: la posizione nel catalogo, dal numero più piccolo; senza, il quaderno va in fondo |
| `descrizione`    | facoltativo: qualche riga sul quaderno, che compare nella sua pagina                          |

I testi vanno tra virgolette dritte (`"`); `true`, `false` e i numeri senza
virgolette. Tra un campo e l’altro ci vuole una virgola, dopo l’ultimo no.

## Se qualcosa non va

Aprendo il sito in locale, la pagina `/quaderni` mostra un riquadro «Da
sistemare» con cosa correggere. Finché `quaderno.json` non è a posto, il
quaderno non compare sul sito.
