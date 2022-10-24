# nyt-crossword

Download PDFs from the NYT crossword puzzle archive. Requires a paid subscription.

> Usage:
> 
> `nyt-crossword [--day (mon|tue|wed|thu|fri|sat|sun)] <start> [<end>]`

Start and end are ISO dates, e.g. `2022-10-24`. The `--day` flag is used to download only a particular weekday.

On first launch, Chromium will open and wait for you to log in. Cookies are written to `cookies.json` and used for subsequent runs.
