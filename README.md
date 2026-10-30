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

Inter and Source Serif 4 are served locally; monospace text uses system fonts. Font licenses are included in assets/font-licenses. No analytics or third-party scripts are used.

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

GitHub Pages serves the reviewed orange research page from `main /`. The 30 October 2026 launch replaces the coming-soon page, preserving its existing assets. The local `production-page` review checkout remains intact.

The citation identifies arXiv:2609.38764 and remains a preprint citation. The paper states that experiment code will be released upon publication; the website source is not the experiment code.

## Local production review — 2 October 2026

The `production-page` branch uses the light academic visual language of the verified reference https://zlshinnick.github.io/procedural-pretraining-page/ (linked by the personal homepage). The similarly named `/procedural-pretraining/` URL is not that website. Existing interactive demonstrations and original result datasets are preserved. `academic.css` contains the typography and shared layout refinements.

Figure 1 is copied unmodified from the corresponding arXiv v1 paper (CC BY 4.0), with attribution next to the figure. Primary reading links go to the official arXiv PDF to avoid presenting an older supplied manuscript as current. The title and author order follow arXiv. Neither paper is described as accepted, and website source is not presented as released experiment code.

Nothing has been pushed or deployed. Publishing needs a separate explicit approval.

### Paper values selected by the author — 2 October 2026
The author selected arXiv v1 Appendix Table 6 as authoritative for the 135M STACK HotpotQA (43.54) and 2WikiMultiHopQA (51.24) means. `assets/results.json` now uses those values. Their deltas are +2.20 and +0.87 F1 after rounding; the initial timing mean recomputes to +2.32. Baseline means, MuSiQue, all 360M results, loss curves and other timing conditions are unchanged.

Table 6 does not report matching SDs for these two means. Their `stdF1` and aggregation count are null and the rendered table says “SD not reported”; no companion uncertainty is relabeled as paper uncertainty. The table specifies three pretraining seeds. The unchanged original companion JSON is preserved as `assets/results-companion-original.json` for provenance. Original static experiment figures are preserved; the corrected interactive summaries cite Table 6 explicitly.

## Method animation

`assets/method-sequence.mp4` is a silent 36-second H.264 explainer in the paper's orange takeaway palette, with local Source Serif 4, Inter and JetBrains Mono fonts. Its three stages show an explicitly illustrative last-in/first-out stack; all54 logged validation-loss checkpoints from the135M model's `languageModeling.curve` in `assets/results.json` (original source `smolm/losscurves/curves.tsv`); and final task-specific QA means from the same JSON, including the paper-aligned HotpotQA/2Wiki values. The loss series ends at2.66482483B logged tokens;2.69B is the training budget. Lines connect measured checkpoints, and QA bar growth reveals final means rather than inventing fine-tuning trajectories. No uncertainty is fabricated.

Editable source: `tools/render-method-video.py`. Install `tools/requirements-video.txt`, then run the renderer; `--stills-only` creates review frames and the poster. All data and fonts are local. Native controls and English descriptive captions are included. Playback requires user action; reduced motion disables looping and switching away pauses playback.

Stack readout follows the paper definition: top to bottom. After PUSH A, PUSH B, POP B, PUSH C, memory has C above A and emits C then A. The video highlights and emits them in that order.

The method videos are standalone deliverables only. Video players, video captions, download links and playback hooks have been removed from the project page at the author's request. MP4s, posters, subtitle files and editable renderers are retained for separate use.

## Local review — 14 October 2026

Updated the research page to match the final published Procedural Core design (commit `92724c747b07d9c5913099daa35d449378f88af5`), retaining Beyond's #CC5908 / #FFF4E8 / #DDB080 palette. Removed the large hero paper image, redundant links, result callout, and verbose result disclosure. The compact pipeline, stack/queue demo, model selector, authentic loss checkpoints, timing selector, and paper figure viewer remain available. The paper card and aligned article-format BibTeX follow the approved Core treatment.

Existing result JSON, uncertainty provenance, paper figures, and standalone videos are unchanged. No video appears on the page. Local branch remains `production-page`; GitHub Pages remains `main /` with no push or deployment in this review. ICLR 2027 submission is not represented as acceptance.

Preview: `http://127.0.0.1:4173/beyond-perplexity/`. Desktop, tablet, 390px, and 320px interaction/overflow checks are in the task workspace. The X thread draft is separate from this repository and is not published to X.
