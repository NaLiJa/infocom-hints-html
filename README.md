# PRIZM Invisiclues Converted to HTML

The [Infocom Documentation Project](https://infodoc.plover.net/hints/index.html) includes hints for Infocom games in Z-machine format. This project scrapes the hints out of Z-Machine menus, stores the results as JSON, then converts the JSON into clickable HTML.

## Scraping the hints into JSON

`parchment-hint-scraper.js` scrapes the hints. To use it, launch the hints in Parchment, e.g. <https://iplayif.com/?story=https%3A%2F%2Finfodoc.plover.net%2Fhints%2Fzork1.z5> and copy and paste the contents of `parchment-hint-scraper.js` into Chrome Dev Tools. Then, copy and paste the resulting object into `scraped-json`.

We convert Parchment's HTML into normalized stripped-down HTML, suitable for conversion into Markdown or other simplified formats.

## Converting the JSON to HTML

`generate-html.mjs` genrates HTML based on the JSON in `scraped-json`, and outputs it in `generated-html`.