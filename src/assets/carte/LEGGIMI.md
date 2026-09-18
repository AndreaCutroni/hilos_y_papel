# Carte del sito

Ogni cartella qui dentro è una carta della pagina `/carte`. Il sito le legge
così come sono: per aggiungere, cambiare o togliere una carta basta aggiungere,
cambiare o togliere la sua cartella.

## Com’è fatta una cartella

```
onde-rosse/
├── carta.json    nome, tipo di carta, se sta finendo, il quaderno, la posizione
└── foto.webp     la foto del foglio
```

- Il nome della cartella serve a te: sulla pagina compare il `nome` scritto in
  `carta.json`. Usa minuscole, con i trattini al posto degli spazi.
- Una sola foto per cartella; il nome del file non importa. Può essere webp,
  jpg o png.

## La foto

Sulla pagina la carta si srotola, e il rotolo lo disegna il sito partendo dalla
foto: basta una foto del foglio disteso. Perché l’effetto riesca:

- il foglio disteso, con gli angoli fermati così non si arriccia, oppure
  appeso dritto a una parete;
- il telefono parallelo al foglio, esattamente dall’alto, tenuto in verticale;
- solo carta nell’inquadratura, un foglio per foto;
- luce diffusa, vicino a una finestra, senza sole diretto né flash.

Il sito la mostra in verticale, 3 per 4, tagliando dal centro se serve.
Salvala di circa 900 × 1200 px: si vede bene e pesa poco.

## Il file carta.json

```json
{
  "nome": "Onde rosse",
  "tipo": "giapponese",
  "ultimi fogli": false,
  "quaderno": "onde-rosse",
  "ordine": 1
}
```

Sotto la carta compaiono il nome, il tipo («Carta giapponese», «Carta
stampata», «Carta artigianale»), il timbro «Ultimi fogli» se la carta sta
finendo e, in basso a destra, l’icona di un quaderno che porta al quaderno
fatto con questa carta.

| Campo          | Cosa scrivere                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `nome`         | il nome che compare sotto la carta; se manca, uso il nome della cartella |
| `tipo`         | `"giapponese"`, `"artigianale"` oppure `"stampata"` |
| `ultimi fogli` | facoltativo: `true` se la carta sta finendo e compare il timbro «Ultimi fogli», altrimenti `false`     |
| `quaderno`     | facoltativo: il nome della cartella di un quaderno fatto con questa carta (in `src/assets/quaderni/`); compare l’icona che ci porta |
| `ordine`       | facoltativo: la posizione nella pagina, dal numero più piccolo; senza, la carta va in fondo            |

I testi vanno tra virgolette dritte (`"`); `true`, `false` e i numeri senza
virgolette. Tra un campo e l’altro ci vuole una virgola, dopo l’ultimo no.

## Se qualcosa non va

Aprendo il sito in locale, la pagina `/carte` mostra un riquadro «Da
sistemare» con cosa correggere. Finché `carta.json` non è a posto, la carta
non compare sul sito.
