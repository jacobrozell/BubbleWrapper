# Pop & Breathe — Phase 3 Design Handoff: Achievements & Company Tags

**Audience:** Implementing engineer / agent  
**Status:** Sector tags & per-tag ladders remain **future**; **Flair + MVP achievements + cosmetic shop (blue outline)** are **implemented** (see `docs/Pop_and_Breathe_Spec.md` changelog).  
**Aligned with:** `docs/Pop_and_Breathe_Spec.md`, `docs/incremental_ui_design_handoff.md` (Phase B economy & Shop)

---

## 0. Goals (locked for Phase 3)

1. **Achievements** are a second, explicit progression layer: players see goals, earn **rewards**, and feel the **dry workplace satire** in titles and descriptions.
2. **Rewards grant Flair** (`flair` in `zenStore`) — a **separate** soft currency from **Credits**. Flair is spent only in the **Cosmetics** section of the Shop (MVP: bubble outline color). Credits remain the currency for **comfort / sensory / Credit-priced tray** upgrades in Phase B tables.
3. **Companies carry industry tags** (e.g. Medical, Agricultural). **Tiered achievements** track how many **contracts you completed** for companies with each tag (see §3 for the canonical counting rule).
4. **Calm UX:** no achievement toasts on **Pop** during zen play by default; surfacing lives on **Progress** (MVP **auto-grants Flair** on unlock—no “claim” button).

---

## 0.1 MVP already in code (reference)

| Piece | Location |
|-------|-----------|
| Flair + lifetime contracts + claims | `src/storage/zenStore/` (persistence + mutations); `src/storage/useZenStore.ts` (UI subscription) |
| MVP achievement defs | `src/content/achievementsMvp.ts` |
| Pure “what’s claimable” helper | `src/economy/achievementsMvpLogic.ts` |
| Cosmetic defs (blue outline) | `src/content/cosmetics.ts` |
| Shop cosmetics UI | `src/screens/ShopScreen.tsx` |
| Progress achievement list | `src/screens/ProgressScreen.tsx` |
| Blue rim colors | `src/theme/bubbleCosmetic.ts` → `PopScreen` / `ZenCanvas` / `BubbleItem` |

---

## 1. Relationship to Phase B systems

| Phase B concept | Phase 3 use |
|-----------------|-------------|
| **Credits** (`credits`) | Unchanged: pops, contract bonus, **Credit-priced** upgrades in Shop. |
| **Flair** (`flair`) | Achievement unlock → **add** `rewardFlair`; spent via **`purchaseCosmetic`** only. |
| **Shop** | Two wallets in one screen: **Upgrades (Credits)** vs **Cosmetics (Flair)**. |
| **Contract complete** + **Next Company** | Increments **`lifetimeContractsCompleted`** (not reset by prestige); MVP achievements evaluate this counter; later: per-tag counters on the same hook. |
| **Prestige** | **Keeps** Flair, owned cosmetics, claimed achievements, and **lifetime** contract count (MVP). Sector ladders (§3) should use the same **lifetime** rule. |

**Balance principle:** Flair payouts should not trivialize earning cosmetics too fast; MVP intentionally starts small (two achievements + one cosmetic). Tune with the same spreadsheet discipline as `incremental_ui_design_handoff.md` §17.

---

## 2. Content model: company tags

### 2.1 Schema (extend `content/companies.ts`)

Each company row gains at least:

- **`primaryTagId`**: `string` — one canonical tag for achievements and UI chip.
- Optional later: **`secondaryTagId`** — only if you add achievements for “dual-sector” clients; skip at first ship to keep counters simple.

### 2.2 Tag catalog (`content/companyTags.ts` or inline const)

Start with **8–14** tags. Mix real industries with optional satire tags if tone stays readable.

**Suggested baseline set**

| `id` | Display label | Notes |
|------|----------------|-------|
| `medical` | Medical | Hospitals, device vendors, wellness cosplay. |
| `agricultural` | Agricultural | Farms, agritech, “crop yield” jokes. |
| `logistics` | Logistics | Shipping, warehousing, last-mile absurdity. |
| `manufacturing` | Manufacturing | Plants, QA, “bubble stress test” lore. |
| `finance` | Finance | Banks, fintech, spreadsheets with feelings. |
| `retail` | Retail | Stores, seasonal panic, inventory theater. |
| `energy` | Energy | Utilities, oil & gas, “grid stability (bubble edition).” |
| `hospitality` | Hospitality | Hotels, catering, conference buffets. |
| `education` | Education | Edtech, universities, compliance training. |
| `government` | Government | Agencies, RFPs, forms in triplicate. |
| `tech` | Tech / Software | SaaS, platforms, “AI-powered bubble.” |

**Optional satire tags (Phase 3.1)**  
`compliance`, `executive_wellness`, `innovation_theater`, `merger_integration` — use sparingly; each extra tag multiplies ladder content.

### 2.3 UI

- **Pop:** optional **small tag chip** under company name (readable, non-bouncy).  
- **Progress / Achievements:** tag icon + name for sector ladder rows.

---

## 3. Sector ladder achievements (per tag)

### 3.1 Tiers (same for every tag)

Unlock when **`contractsCompletedWithTag[tagId]`** reaches:

`1, 5, 10, 50, 100, 500, 1000, 5000`

### 3.2 Counting rule (canonical)

**Recommended:** Increment `contractsCompletedWithTag[tag]` **once** when the player taps **Next Company** (or equivalent advance) **after** a **completed** contract for a company whose **`primaryTagId`** is `tag`.

- Do **not** increment on sheet-only refresh.  
- Do **not** double-count if they prestige (if prestige resets `companyIndex` but **not** lifetime tag counts).

### 3.3 Reward shape

Each tier row in data:

- `id`, `tagId`, `threshold`, `rewardFlair`, `title`, `description` (flavor), `hiddenUntilProgress` optional.

**Suggested payout curve (placeholder — balance in spreadsheet):** small at 1–10, meaningful at 50–100, large at 500+; **sum** of all sector rewards for one tag should not fully clear **all** cosmetics without pops still mattering.

### 3.4 Copy pattern (examples — Medical)

| Threshold | Example title | Example description |
|-----------|----------------|----------------------|
| 1 | First Responder (Paperwork) | One medical contract cleared. The bubbles were sterile. The jokes were not. |
| 5 | Rotations Complete | Five healthcare clients served. Your finger is now HIPAA-adjacent. |
| 10 | Department Headcount Met | Ten. HR would like a word about your throughput. |
| 50 | Clinical Trial (Bubble Edition) | Fifty medical contracts. Side effects may include smugness. |
| 100 | FDA: Fully Documented Absurdity | One hundred. You are technically not a device, but you are effective. |
| 500 | National Health Plan (Unofficial) | Five hundred. Paging Dr. Pop. |
| 1000 | Pandemic Preparedness (Bubble Stockpile) | One thousand. You have outlasted several wellness initiatives. |
| 5000 | World Health Popganization | Five thousand. The sector thanks you. The bubbles fear you. |

**Implementation note:** titles/descriptions live in **content tables**; engineers should not hardcode per achievement in UI.

---

## 4. General achievements (non-sector)

Use the same **`rewardFlair`** pattern (or mixed rewards later). Examples (ids illustrative):

| Theme | Example triggers | Tone |
|--------|------------------|------|
| **Contracts** | First contract complete; 10 / 50 / 200 **total** companies completed | Straight milestones with one joke each. |
| **Collection** | Complete **at least one** contract for **each** tag in the catalog (“Well-Rounded Technician”) | Encourages roster variety, not grind on one tag. |
| **Lifetime pops** | Thresholds at e.g. 1K / 10K / 100K / 1M | Pairs with existing `lifetimePops` stat. |
| **Credits spent** | Spend 500 / 5K / 50K **total** Credits in Shop | Sinks credits back into engagement. |
| **Shop / cosmetics** | Purchase **first** cosmetic; own **N** cosmetic upgrades | Ties achievement loop to Shop without forcing order. |
| **Prestige** | First prestige; prestige **3** / **10** times | Match actual `prestigeCount` semantics from Phase B. |
| **Zen / preference** | Complete a contract with **Sound** off; with **Haptics** off | Frame as accessibility-positive, not “hard mode.” |
| **Sheet discipline** | Complete a contract **without** using pull-to-refresh that contract | Only if telemetry exists; optional / hard to explain → lower priority. |
| **Hidden** | Encounter a specific rare company `id`; complete a **very large** quota company | 1–3 secrets max; no UI spam. |

---

## 5. Player-facing UI

### 5.1 Placement

- **Primary:** New **Achievements** section on **Progress** (scrollable list grouped by: **Sector ladders**, **Career**, **Shop & zen**, **Secret**).  
- **Optional:** Badge count on tab icon — **off by default** to respect calm-app positioning; if shown, restrict to Progress only.

### 5.2 States

- **Locked:** show title (or “???” for hidden), progress bar `current / threshold` where applicable.  
- **Unlocked:** show description + **Flair earned** (e.g. “+30 Flair”).  
- **Claim vs auto-grant:** **Auto-grant Flair on unlock** (MVP) avoids “unclaimed” FOMO. If you ever add non-currency rewards, revisit a claim button.

### 5.3 Pop screen

- **Default:** no interrupting modals on unlock.  
- **Optional setting:** “Milestone toasts” for players who want dopamine on Pop (off by default).

---

## 6. Technical deliverables (checklist)

- [ ] `content/companyTags.ts` — tag ids + display labels (+ optional icon key).  
- [ ] `content/companies.ts` — add `primaryTagId` per company; backfill all rows.  
- [ ] `content/achievements.ts` (or extend `achievementsMvp.ts`) — sector + misc defs: trigger kind, threshold, `rewardFlair`, copy, optional `tagId`.  
- [ ] Pure evaluator module e.g. `economy/achievementsLogic.ts` — given state + **event** (`contractAdvanced`, …), returns `{ newlyUnlockedIds, flairToGrant }` — **unit tests** for counters and edge cases.  
- [x] `zenStore` — MVP: `flair`, `lifetimeContractsCompleted`, `claimedAchievementsJson`, `ownedCosmeticsJson`, migration flag; prestige **does not** clear these.  
- [x] Wire **Next Company** to increment lifetime contracts + run MVP achievement grants + add Flair.  
- [x] `ProgressScreen` — MVP Achievements list + stats (`docs/Pop_and_Breathe_Spec.md` updated).  
- [x] Cosmetic shop MVP (`content/cosmetics.ts`, `ShopScreen` Flair section, blue bubble outline).

---

## 7. Out of scope (later)

- Cloud sync, leaderboards, share cards.  
- Account systems.  
- Achievements that require **network** or **time-limited** events (unless you add dated content later).  
- **Real-money** premium currency — deferred; **Flair** is earn-only (achievements), not purchased.

---

*End of Phase 3 achievements handoff.*
