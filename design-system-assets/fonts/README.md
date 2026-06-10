# EVOLEA — Brand Fonts

Offizielle Brand-Schriften der Live-Site www.evolea.ch, selbst-gehostet.

## Dateien

| Familie | Weight | Datei |
|---|---|---|
| Fredoka | 600 (SemiBold) | `Fredoka-SemiBold.woff2` |
| Fredoka | 700 (Bold) | `Fredoka-Bold.woff2` |
| Poppins | 400 (Regular) | `Poppins-Regular.woff2` |
| Poppins | 500 (Medium) | `Poppins-Medium.woff2` |
| Poppins | 600 (SemiBold) | `Poppins-SemiBold.woff2` |

Subset: **Latin** (deckt DE + EN). Falls weitere Subsets benötigt werden (z. B. Latin-Extended, Cyrillic), direkt von Google Fonts nachziehen.

## Lizenz

Beide Schriften sind unter der **SIL Open Font License 1.1** veröffentlicht.

- **Fredoka** © Milena Brandão, Hafontia, Google Fonts Team
- **Poppins** © Indian Type Foundry, Jonny Pinhorn

Erlaubt: Selfhost, Redistribution, Verwendung in kommerziellen Projekten.
Pflicht: Lizenzdatei mitgeben wenn redistributed. Schrift-Dateien nicht umbenennen.
Vollständige Lizenz: <https://openfontlicense.org/>

## CSS — Selfhosting Snippet

```css
/* Fredoka */
@font-face {
  font-family: 'Fredoka';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./Fredoka-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'Fredoka';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./Fredoka-Bold.woff2') format('woff2');
}

/* Poppins */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./Poppins-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./Poppins-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./Poppins-SemiBold.woff2') format('woff2');
}
```

## Quelle

Direkt aus der Google-Fonts-CDN gezogen — identisch zu dem, was www.evolea.ch über den `<link href="fonts.googleapis.com/...">` an den Browser liefert.

Zum Aktualisieren:

```bash
# Fredoka
curl -sS -A "Mozilla/5.0 Chrome/125.0" "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap"
# Poppins
curl -sS -A "Mozilla/5.0 Chrome/125.0" "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
```

Die zurückgegebenen CSS-Dateien enthalten die woff2-URLs im Latin-Subset.
