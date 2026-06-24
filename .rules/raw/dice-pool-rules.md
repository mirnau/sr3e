# Dice Pool Rules
Source: SR3 p.43–44, p.246

## Usage
- Dice drawn from a pool for a test are unavailable until the pool refreshes (p.43).
- Pools are mutually exclusive per roll — cannot combine two pools on one test.

## Major Pool Refresh (Combat, Spell, Hacking, Control, Astral Combat)
- Refresh to full value at the start of every Combat Turn (p.44).
- Unused dice do NOT carry over (p.44).

## Karma Pool Refresh
- Does NOT refresh every Combat Turn.
- Refreshes on GM's discretion — typically each gaming session or every 24 hours game time (p.246).
- Burned points (buying successes, Hooper-Nelson, Hand of God) permanently reduce pool total and do not refresh (p.246).

## Data Model Requirements
- Major pools need: `max` (full computed value) + `current` (available this turn, decreases on spend, resets to max on combat turn start).
- Karma pool needs: `total` (permanent max, decreases on burn) + `current` (available, decreases on spend, refreshes to total at session start).
