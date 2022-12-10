# nyt-crossword

Download PDFs from the NYT crossword puzzle archive. Requires a paid subscription.

> Usage:
> 
> `nyt-crossword [--day (mon|tue|wed|thu|fri|sat|sun)] [--latex] [<start> [<end>]]`

| Option | Description |
|---|---|
| `<start>`, `<end>` | Download a specific date, or a range. Use ISO dates, e.g. `2022-10-24`. |
| `--day` | Download only a particular weekday. |
| `--latex` | Convert the resulting crossword to A4 format with a header containing the date and weekday. Requires `pdflatex`. |

On first launch, Chromium will open and wait for you to log in. Cookies are written to `cookies.json` and used for subsequent runs.
