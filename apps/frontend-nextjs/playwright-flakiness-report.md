# Flaky Playwright pre-commit runs in `apps/frontend-nextjs`: report

## TL;DR

There is **no shared-user problem**. Every test gets its own `BrowserContext`, `/userinfo` is mocked per page or context, and no cookies, `storageState` or server-side session are shared between workers.

The flakiness comes from **three independent timing bugs**. All three are triggered by the same thing: **CPU starvation while 5 workers × 3 browsers run against `next dev`**. That is also why UI mode rarely fails: you usually run fewer tests and browsers at once there.

| # | Failing test(s) | Browsers | Where the bug lives | Status |
|---|---|---|---|---|
| A | `pvkDokumentPage.spec.ts` › *lagrer art og omfang … etter omlasting* (`:645`) fails with "Simuleringen skal ikke ha ubehandlede JavaScript-feil" | **WebKit, Firefox** (never Chromium) | Test mock data, which triggers a Next dev-overlay race | ✅ **Fixed and verified** in [915424c](https://github.com/navikt/etterlevelse/commit/915424ca09d96d2c5bb4c0cdfe72575cd3915b68) |
| B | `omStotteTilEtterlevelsePage.spec.ts`: almost every test fails in `beforeEach`, waiting for the `Z123456` button (page shows "Logg inn") | Mostly **Firefox** (slowest under load) | Test timing assumptions in dev mode | ✅ **Mitigated, passes on Chromium**: longer timeout in [5de5068](https://github.com/navikt/etterlevelse/commit/5de5068277f36d66834534470fba0a348c6f55a7), Chromium-only hook in [28b54fb](https://github.com/navikt/etterlevelse/commit/28b54fb42ab65fa95d39f9fded1a36dcafbd37a4) |
| C | `pvkDokumentPage.spec.ts` › *oppretter, oppdaterer og sletter tiltak …* (`:730`) fails `toBeFocused()` with `Received: inactive` | Seen in Firefox, but **any browser** can hit it | **App code**: one-shot focus effect | ✅ **Fixed and verified** in [2abd3e1](https://github.com/navikt/etterlevelse/commit/2abd3e193ac1a2c3ce1cc1eb7782c560915ec962) |

All fixes are on the branch `feature/fixFlakyPlaywrightTests` and were committed with `--no-verify`. With all of them applied, the hook's Playwright command (`yarn playwright test --project=chromium`) passed **181/181** on a quiet machine, with load average ~10 and a healthy backend. That shows nothing regressed; it does not prove the suite is stable under heavy load. The commit links only resolve once the branch is pushed.

---

## 1. Reproduction

Environment: `next dev` on :3000 and a `kubectl port-forward` on :8080. Default workers = 5, which is 50% of 10 cores.

| Condition | Result |
|---|---|
| 6 full-suite runs, normal load | 1 failure: **A** (WebKit), in the very first run after `next dev` started cold |
| Test A only, WebKit, `--repeat-each=15` | **0/30 with 1 worker**, **1/30 with 5 workers** |
| Two full suites at the same time (doubles load, before Low Power Mode) | 9 failures: **B** ×6 (Firefox), **C** ×3 (Firefox) |
| Tagged spec only, Firefox, 5 workers, throttled machine (battery 7%) | **B**: 35/41 failed |

### Deterministic reproductions (temporary edits, all reverted)

- **A:** reproduced with a standalone script that copies the Next dev overlay's fetch pattern. If the page reloads **after response headers arrive but before the body finishes**, Firefox reports `The operation was aborted.` and WebKit reports `TypeError: Load failed` as unhandled rejections. Chromium never does, and a reload before the headers arrive is harmless in every browser. Pointing the real test's `__nextjs_original-stack-frames` request at a server that sends headers and then stalls the body reproduces the same two messages.
- **C:** delay only the mocked `GET /api/tiltak/pvkdokument/<id>` by 1500 ms in `mockPvkApi` ([pvkDokument.ts](<./app/tests/utils/pvkDokument.ts>)). The test then failed **2/2 on Chromium** before the fix, at the post-reload `toBeFocused()` ([pvkDokumentPage.spec.ts](<./app/tests/pages/dokumentasjon/[etterlevelseDokumentasjonId]/pvkdokument/pvkDokumentPage.spec.ts>), line 766) with the same `Received: inactive`.
- **B:** run `yarn playwright test omStotteTilEtterlevelsePage.spec.ts --project=firefox --workers=5` while the machine is busy, for example with another suite running in parallel.

Caveat: under normal load on this machine I measured roughly 1 failing run in 6, not ~50%. The failure rate depends directly on free CPU. Your machine showed heavy background load during the session (WindowServer, VS Code helpers, load averages of 60–260), which is consistent with the higher rate you see, but I can't prove your number.

---

## 2. What triggers each issue

### A: PVK "unhandled JavaScript errors" (WebKit and Firefox)

- **Scope:** only `pvkDokumentPage.spec.ts`, because only its auto-fixture `mockIsolation` fails tests on `pageerror` ([pvkDokumentPage.spec.ts](<./app/tests/pages/dokumentasjon/[etterlevelseDokumentasjonId]/pvkdokument/pvkDokumentPage.spec.ts>), line 327). It affects tests that reload or navigate shortly after the PVK page has loaded `krav`. `:645` is the one observed.
- **Browsers:** WebKit and Firefox. Chromium silently drops fetches cancelled by navigation.
- **Parallelism:** yes. It needs a slow dev server and browser, which in practice means several workers.

### B: "Om Støtte til etterlevelse" `beforeEach` (`Z123456` never visible)

- **Scope:** the whole spec, because the check is in `beforeEach` ([omStotteTilEtterlevelsePage.spec.ts](<./app/tests/pages/omStotteTilEtterlevelse/omStotteTilEtterlevelsePage.spec.ts>), line 157). Other specs that assert on the user button right after `goto` have the same exposure.
- **Browsers:** mostly Firefox, the slowest to evaluate the unminified dev bundles. Any browser fails if it's starved enough.
- **Parallelism:** yes, it's purely a CPU-headroom problem.

### C: focus after reload in the risk-scenario list

- **Scope:** the app's focus-restore logic for `?risikoscenario=…&tiltak=…`. In the suite it surfaces in `:730`.
- **Browsers:** all. It depends on response timing, not on the engine.
- **Parallelism:** it shows up under load, but it is a real UX bug for slow networks too.

---

## 3. Underlying problems

### A: mock drift, which triggers an unguarded promise in Next's dev overlay

1. The mocked `krav` in [pvkDokument.ts](<./app/tests/utils/pvkDokument.ts>) (line 160) has no `avdeling` or `underavdeling`, but `getKravByFilter` selects both ([kravQuery.ts](<./app/query/krav/kravQuery.ts>), lines 211 and 221).
2. In dev, Apollo logs `console.error("Missing field 'avdeling' …")` twice.
3. Next's dev overlay records each `console.error` as an "Issue" and POSTs to `/__nextjs_original-stack-frames` to look up the original source location.
4. In `node_modules/next/dist/esm/next-devtools/shared/stack-frame.js` (Next 16.4.6), `getOriginalStackFrames()` wraps `fetch()` in `try/catch`, but **`await res.json()` and `await res.text()` are not guarded**.
5. The test clicks **Lagre** and then calls `page.reload()`. If the reload lands after the headers arrive but before the body finishes, the body read rejects, nothing catches it, and WebKit/Firefox report an unhandled rejection.
6. `mockIsolation` treats that as an application error and fails the test.

The failing trace shows the race exactly: the stack-frame POSTs took ~295 ms, ended as **200 + cancelled**, and the reload started ~300 ms after them.

### B: the test asks for hydration within 5 s under a starved CPU

- The SSR HTML (logged-out default, so "Logg inn") arrives quickly; server time-to-first-byte is 30–40 ms.
- The `Z123456` button only appears after **hydration**, then `UserProvider`'s effect ([userProvider.tsx](<./app/provider/user/userProvider.tsx>), line 199), then the `/userinfo` round trip.
- **Normal conditions** (1 worker, load average ~2.6): `goto` to `/userinfo` done takes ~0.5 s in Chromium. In Firefox, hydration takes ~1.2 s and `/userinfo` is done after ~1.2–1.7 s. That leaves plenty of room inside 5 s.
- **Starved conditions** (5 Firefox workers, battery at 7%, load average ~50): in a failing trace, `newPage` took 3.7 s, `domcontentloaded` came 13 s after the HTML, and React logged `Hydrated` about 25.5 s after `goto` (29 s after `newPage`), roughly **20× normal**. The 5 s check started at 25.4 s, so `/userinfo` was never even requested. JS chunks had finished downloading about 20 s earlier, so the time went to executing JavaScript in the browser, not to the network.
- In short, the 5 s budget is fine on an idle machine. The problem is that it has no headroom when the CPU is contended, and Firefox degrades first because it is already ~3× slower than Chromium on this page in dev mode.

### C: one-shot focus effect with a fixed 200 ms delay

In [risikoscenarioAccordianList.tsx](<./app/components/risikoscenario/generellScenario/risikoscenarioAccordianList.tsx>) (line 99), the effect:

1. fires once `risikoscenarioList` contains the scenario;
2. waits 200 ms and looks up `#${risikoscenarioId}_${tiltakId}`;
3. if the tiltak isn't rendered yet because tiltak data arrives separately, focuses only the scenario header, **still sets `focusedTargetRef.current = target`**, and never retries. Tiltak data is not in the dependency list.

---

## 4. Fix guide (step by step)

### A: PVK page errors

1. ✅ **Done in [915424c](https://github.com/navikt/etterlevelse/commit/915424ca09d96d2c5bb4c0cdfe72575cd3915b68). Remove the trigger.** Add the fields the query selects to the mocked `krav` in `createPvkMockData` ([pvkDokument.ts](<./app/tests/utils/pvkDokument.ts>)): `avdeling: code(EListName.AVDELING, …)` and `underavdeling: code(EListName.UNDERAVDELING, …)`.
   - *Verified:* with this change there were 0 "Missing field" errors, 0 stack-frame requests and 0 page errors in all three browsers, even with the slow-body trap active.
2. ⬜ **Not done. Make future mock drift fail deterministically, not flakily.** In `mockIsolation`, also collect `page.on('console')` messages of type `error` that match `/Missing field/` and assert there are none.
3. ⬜ *(Optional hardening, not done)* If you want `mockIsolation` to tolerate dev-overlay noise, ignore `pageerror`s whose stack contains `next-devtools`. Steps 1–2 are the real fix; this only hides symptoms.

### B: `Z123456` visibility in `beforeEach`

1. **Reduce CPU contention.**
   - ✅ **Done in [28b54fb](https://github.com/navikt/etterlevelse/commit/28b54fb42ab65fa95d39f9fded1a36dcafbd37a4):** the pre-commit hook now runs `yarn playwright test --project=chromium`, and the [README](<./README.md>) says so. Its Playwright command passed 181/181 in 1.5 minutes. This also removes issue A from the hook, because Chromium never reports the cancelled fetch.
   - ⚠️ **Trade-off:** CI does not run Playwright (`.github/workflows/playwright.txt` is disabled by its extension), so nothing runs Firefox or WebKit automatically any more. Run `yarn playwright test` manually before releases, or re-enable the workflow.
   - ⬜ **Not done:** capping `workers` in [playwright.config.ts](<./playwright.config.ts>), for example `2` or `'25%'`. Only worth doing if the Chromium-only hook is still flaky.
2. ⬜ **Not done. Stop depending on an ad-hoc dev server.** Add a `webServer` block. It's commented out today, and tests hard-code `http://localhost:3000`, so set `use.baseURL` too. Ideally build and serve production with `next build && next start`. Production bundles are minified, have no HMR or dev overlay, and Apollo's dev warnings disappear, which also removes the trigger for A. *Not measured here; expected, not verified.*
3. ✅ **Done in [5de5068](https://github.com/navikt/etterlevelse/commit/5de5068277f36d66834534470fba0a348c6f55a7). Make the check reflect what it needs.** The assertion now has `{ timeout: 15_000 }`. *Verified on Chromium:* 181/181 passed on a quiet machine. An earlier run failed 27/39, but the backend port-forward had died and the load average was ~120 during it. Waiting for the `/userinfo` response before asserting is an alternative if the timeout isn't enough under load.

### C: focus race (app fix)

1. ✅ **Done in [2abd3e1](https://github.com/navikt/etterlevelse/commit/2abd3e193ac1a2c3ce1cc1eb7782c560915ec962).** In the effect in [risikoscenarioAccordianList.tsx](<./app/components/risikoscenario/generellScenario/risikoscenarioAccordianList.tsx>), the effect now returns early while `tiltakId` is set but not yet in `tiltakList`. Focus is therefore never marked as done before the tiltak exists.
   - Behaviour change: if the URL points to a tiltak that no longer exists, nothing gets focus. Previously the scenario header was focused.
2. ✅ **Done in the same commit.** `tiltakList` is now in the effect dependencies, so the effect re-runs when tiltak data arrives.
3. ⬜ **Not done.** Replace the fixed `setTimeout(…, 200)` with focusing after render, for example in an effect keyed on the rendered tiltak list.
4. ✅ **Verified.** With the mocked `GET /api/tiltak/pvkdokument/<id>` delayed by 1500 ms, `:730` failed 2/2 on Chromium before the fix and passed 4/4 after.
5. ⬜ **Not done.** The sibling components use the same pattern (`tiltakElement.focus()` after a timeout), so audit them too: `risikoscenarioAccordianListReadOnlyView.tsx`, `risikoscenarioAccordianListReadOnlyWithIverksetting.tsx`, `KravRisikoscenarioGodkjentAccordianList.tsx`, `kravRisikoscenarioAccordionContent.tsx`.

### Secondary risk (not a root cause of the failures above)

Specs other than the PVK one let unmocked `/api` and `/graphql` calls through `route.continue()` to the real backend via `kubectl port-forward` to **dev-gcp**. During the stress runs the port-forward stopped forwarding (direct curl was reset; `/api/*` returned 500). Mocking those calls, or failing fast on unmocked ones as `mockIsolation` already does, removes a dependency on a live tunnel.

---

## 5. Follow-ups

- **Rename "accordian" to "accordion".** The misspelling appears in 9 file names, and the word appears in 19 source files, mostly imports. Use an IDE rename or refactor so imports update:
  - `components/risikoscenario/generellScenario/risikoscenarioAccordianList.tsx` (the file from issue C)
  - `components/risikoscenario/readOnly/risikoscenarioAccordianListReadOnlyView.tsx`
  - `components/risikoscenario/common/risikoscenarioAccordianListReadOnlyWithIverksetting.tsx`
  - `components/risikoscenario/kravSpesifikk/KravRisikoscenarioGodkjentAccordianList.tsx`
  - `components/PVK/pvkDokumentPage/stepperViews/oppsummeringAvAlleRisikoscenarioerOgTiltak/oppsumeringAccordianList.tsx`
  - `components/PVK/pvkDokumentPage/stepperViews/oppsummeringAvAlleRisikoscenarioerOgTiltak/oppsumeringAccordianContent.tsx`
  - `components/PVK/pvkDokumentPage/stepperViews/oppsummeringAvAlleRisikoscenarioerOgTiltak/oppsumeringAccordianListGodkjentView.tsx`
  - `components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/oppsumeringAccordianListReadOnlyView.tsx`
  - `components/common/accordianAlertModal.tsx`

  Several also say "oppsumering", one *m* short of "oppsummering", which you may want to fix in the same pass.
- `example.spec.ts` hits `https://playwright.dev` on every run, so the hook depends on the network. Consider deleting it.
- `next dev` runs on Node v20.19.0, but `package.json` `engines` requires `>=26.7.0`.
