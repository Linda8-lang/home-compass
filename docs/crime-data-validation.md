# Crime Dataset Validation — "Check the Place"

**Reviewer:** Product Manager review of data readiness
**Date:** 2026-09-08
**Dataset:** `src/data/generated/safety_indices.json`
**Source:** Toronto Police Service — Neighbourhood Crime Rates Open Data (ArcGIS FeatureServer)
**Ingested:** 2026-08-21 · `data_status: ok` · `data_level: neighbourhood`

## Verdict

**Go.** The dataset is complete, internally consistent, and fully joinable to the address
lookup that Check the Place depends on. No blocking defects. Three interpretation risks
need product-side wording, and one freshness process is missing.

## What was checked

| Check | Result |
| --- | --- |
| Neighbourhood coverage | 158 / 158 Toronto neighbourhoods |
| Duplicate or missing `hood_id` | None — 158 unique IDs |
| Missing population values | 0 |
| Missing offence counts | 0 across all 9 offence types |
| Missing rates per 100k | 0 across all 9 offence types |
| Rate vs. count arithmetic | 0 mismatches (all rates reconcile to count ÷ population × 100k) |
| Join to boundary polygons (address lookup) | 158 / 158 match — no orphan on either side |
| Join to rent benchmarks | 158 / 158 match |
| Empty/placeholder neighbourhoods | None — no neighbourhood is all-zero across offences |
| Population total | 3,214,722 (consistent with Toronto's population) |

Offence types available: assault, auto theft, bike theft, break & enter, homicide, robbery,
shooting, theft over, theft from motor vehicle. The UI surfaces five of these; the other
four are already available at no additional ingestion cost.

## Does it power the feature end to end?

Yes. The user journey — type an address → resolve to a neighbourhood → show crime vs. the
Toronto average — is fully supported:

1. **Address → neighbourhood.** Every boundary polygon has a matching crime record, so any
   address that geocodes inside Toronto returns data. There is no "matched but empty" state.
2. **Neighbourhood figures.** Every offence row will render a real number; the "—" fallback
   in the table will never fire for Toronto addresses.
3. **Toronto average.** The comparison column is a population-weighted aggregate computed
   from the same 158 records, so it is internally consistent with the neighbourhood column
   rather than a differently-sourced figure.
4. **Saved places.** Records are keyed by `hood_id`, which is stable across TPS releases —
   saved places will not break when the data refreshes.

Failure mode is limited to addresses outside Toronto or ones the geocoder cannot resolve,
which the UI already handles with the "not enough data for this area" state.

## Risks to manage (product, not data)

**1. Downtown rates are inflated by the daytime-population denominator.**
Rates are per 100,000 *residents*. Neighbourhoods with large commuter, tourist, or nightlife
populations divide incidents by a small residential base. Assault rates range from ~196 per
100k (Forest Hill South) to ~4,209 (Mimico-Queensway) and ~3,361 (Yonge-Bay Corridor). A
newcomer reading this without framing will conclude downtown is 20× more dangerous than it
is experienced to be. *Mitigation:* keep the "describes the neighbourhood, not this unit"
note, and add a line that busy commercial areas count incidents against residents only.

**2. Small neighbourhoods make rare offences statistically noisy.**
21 neighbourhoods have under 12,000 residents. For homicide and shooting, a single incident
swings the rate dramatically, and zero incidents reads as "perfectly safe" rather than "too
few events to say." *Mitigation:* the current table wisely shows only higher-volume offences
(assault, break & enter, robbery, auto theft, theft from vehicle). Do not add homicide or
shooting rows without a low-count caveat.

**3. Percentage difference vs. the city average can mislead on small bases.**
A +40% difference on a low-frequency offence is a handful of incidents. *Mitigation:* the
±5% neutral band already in the UI is the right instinct; consider showing raw counts on
tap for context.

## Gaps and follow-ups

- **Freshness has no owner or schedule.** The file is from 2026-08-21 and covers offence
  year 2025. TPS appends a new year annually, and the ingester's `LATEST_YEAR` constant must
  be bumped manually or the app silently keeps serving the prior year. *Action:* schedule a
  quarterly refresh run and an annual `LATEST_YEAR` review; the ingester already preserves
  last-known-good data and marks a failed file stale, so a broken refresh degrades safely.
- **No trend view.** Only the latest year is retained, so we cannot say "burglary is down
  year over year," which is often more decision-useful than a level. *Action:* backlog item —
  the source publishes prior years in the same response.
- **Attribution copy is available but must be shown.** The source disclaimer (locations are
  spatially offset for privacy; counts are reported occurrences, not convictions) is stored
  in the file and should be visible wherever these figures appear.
- **Not a building-level signal.** The data is neighbourhood-resolution only. Copy must never
  imply the figures describe a specific address or building.

## Recommendation

Ship Check the Place on this dataset. Add the daytime-population caveat to the "How to read
this" panel and put the refresh schedule on the roadmap before launch. Hold homicide,
shooting, and any year-over-year claim until low-count handling and multi-year retention are
in place.
