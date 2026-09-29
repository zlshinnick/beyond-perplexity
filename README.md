# Beyond Perplexity

Research page for **Lasting Effects of Abstract Pretraining Beyond Perplexity** by Zachary Shinnick, Hemanth Saratchandran, Damien Teney, and Anton van den Hengel.

Live site: https://zlshinnick.github.io/beyond-perplexity/

## Local preview

This is a static website. No build or package installation is required.

```sh
python3 -m http.server 4173
```

Open http://localhost:4173/ . The page also works under the `/beyond-perplexity/` GitHub Pages project path because asset URLs are relative.

## Editing

- `index.html`: paper metadata, research narrative, and accessible page structure.
- `style.css`: responsive visual design, with reduced-motion support.
- `script.js`: model comparison, validation-loss explorer, stack/queue demonstration, timing explorer, figure viewer, and copyable citation.
- `assets/results.json`: exact chart data, source-relative paths, sample counts, and metric definitions.
- `assets/paper.pdf`: supplied preprint.
- `assets/*.png`: figures from the supplied experiment visualization folder.

Google Fonts supplies DM Sans, Source Serif 4, and IBM Plex Mono. System fonts provide a fallback. No analytics or third-party scripts are used.

## Data provenance

All results originate from the supplied `ICLR2026-MultiHop` visualization directory. Only the selected figures and aggregate chart data are included in this repository. Full experimental logs and individual example predictions are not published here.

| Website asset | Source relative to ICLR2026-MultiHop |
|---|---|
| Main 135M QA results | `smolm/final6/summary.tsv` |
| Main 360M QA results | `smolm/scale360m/summary.tsv` |
| 135M loss curves | `smolm/losscurves/curves.tsv` |
| 360M loss curves | `smolm/losscurves/loss_curves_360m.csv` |
| Timing comparison | `smolm/interleave/plot_interleave.py`, `data.csv`, and main QA summaries |
| `question-structure.png` | `smolm/breakdowns/structure_options/01_two_structure_panels.png` |
| `depo-learning.png` | `DEPO_n10_k4_m4-4-512/nl_mix_single.png` |
| `lasting-gains.png` | `smolm/trajectory/trajectory_hotpotqa_2wiki/trajectory_f1_all3.png` |

QA values are arithmetic mean token-level answer F1, scaled to 0–100. Differences are **F1 points**, not relative percentages. Standard deviations use the population convention, matching the plotting scripts. The 135M comparisons contain three pretraining seeds × three fine-tuning seeds; 360M has one pretraining seed × three fine-tuning seeds. The question-structure figure uses gold contexts for all benchmarks, while the main QA comparison uses MuSiQue gold and distractors for HotpotQA and 2WikiMultiHopQA.

Loss curves show validation cross-entropy, not perplexity. In `results.json`, explicitly named derived perplexity fields are exp(mean loss). The site plots recorded losses. Language-token counts are step × 96 × 2048. The final logged evaluation is slightly before the last training step.

The approximately 80M warm-up tokens are **additional** to the matched language-training budgets. This is about 3% at 135M and 1.1% at 360M; the site does not assert equal total token budgets.

The 100% timing point comes from the `BACK` constants in the source plotting script; the intermediate points come from the corresponding data file. The small timing schedule illustration is schematic, not to token scale.

## Hosting

GitHub Pages serves the `main` branch from `/` using `.nojekyll`. Push changes to `main` to update the live page. No build workflow or server configuration is required.

The citation is a preprint citation for the supplied paper. Update it when an official arXiv identifier or publication venue is available. The paper states that experiment code will be released upon publication; the website source is not the experiment code.
