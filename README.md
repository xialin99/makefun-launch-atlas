# Launch Atlas

An offline research dashboard built from the make.fun protocol snapshot. It ranks 758 protocols and covers all 40 entries on the supplied launch watchlist.

## Model

Implied capitalization equals TVL multiplied by a market-cap/TVL ratio fitted at that scale. The model uses the median of pairwise slopes in log space for peer pairs at least one log unit apart. A priced protocol is excluded from its own fit. Displayed scenarios apply the 10th and 90th percentiles of peer residuals. The model uses the supplied snapshot.

Every row includes a research plan that starts with official-source verification and read-only previews. No wallet connection or transaction is performed by this application.

## Run and package

Use Node.js 22.18 or later. Run `node main.ts --input /path/to/snapshot.json --output ./out`, serve the output directory with a static server, and open `dashboard/index.html`. The competition supplies snapshot.json; no live API is called at runtime.

The unmodified vendored dossier helper packages the dashboard source and real browser screenshots. Generated board.json and data.js belong in the output directory, outside the source tree.

## Evidence

Structural checks verify unique protocol slugs, ordered positive integer estimates, consecutive ranks, all 40 watchlist subjects and bounded research-step lengths. The browser rendered all 758 results; selecting Watchlist only returned exactly 40, and a row opened its protocol detail. The submitted version’s four unedited browser screenshots show the full board, filtered watchlist, detail and research-plan area at 1440 by 900 pixels. Each is below 512 KiB.

The platform passed the submission’s validity gate. In leave-one-protocol-out validation on the 116 eligible tokenized peers, the mean absolute log error was 1.334 for the size-based model, 1.502 for the previous sector-and-growth model and 1.500 for a global-median baseline. This diagnostic covers observed market-cap/TVL ratios from the snapshot. It provides no direct test of future launch valuations. No prize has been received. MIT licensed; see LICENSE and the retained notice in the vendored helper.
