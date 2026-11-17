# Launch Atlas

An offline research dashboard built from the make.fun protocol snapshot. It ranks 758 protocols and covers all 40 entries on the supplied launch watchlist.

## Model

Implied capitalization equals TVL multiplied by a sector-comparable market-cap/TVL ratio and a bounded weekly-growth adjustment. Sector medians shrink toward the global median using eight global pseudo-peers. Estimates use only the supplied snapshot. The dashboard displays peer counts, model inputs, dispersion scenarios and explicit limits of the data. It does not predict a token launch, token allocations or farming rewards.

Every row includes a research plan that starts with official-source verification and read-only previews. No wallet connection or transaction is performed by this application.

## Run and package

Use Node.js 22.18 or later. Run `node main.ts --input /path/to/snapshot.json --output ./out`, serve the output directory with a static server, and open `dashboard/index.html`. The competition supplies snapshot.json; no live API is called at runtime.

The unmodified vendored dossier helper packages the dashboard source and real browser screenshots. Generated board.json and data.js belong in the output directory, outside the source tree.

## Evidence

Structural checks verify unique protocol slugs, ordered positive integer estimates, consecutive ranks, all 40 watchlist subjects and bounded research-step lengths. The browser rendered all 758 results; selecting Watchlist only returned exactly 40, and a row opened its protocol detail. Four unedited browser screenshots show the full board, filtered watchlist, detail and research-plan area at 1440 by 900 pixels. Each is below 512 KiB.

The application has not received a competition score yet. No prize has been received. MIT licensed; see LICENSE and the retained notice in the vendored helper.
