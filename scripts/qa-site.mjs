/**
 * Island Route — browser QA harness.
 *
 * Temporary tooling. Not part of the application build; nothing imports it.
 *
 *   npx playwright install chromium     # once
 *   node scripts/qa-site.mjs            # dev server must already be running
 *   BASE_URL=http://localhost:3000 node scripts/qa-site.mjs
 *
 * Writes qa-results.json and qa-results.md to the project root.
 *
 * Principle: this reports what the browser actually did. It never infers a bug
 * from source. Anything it could not observe is recorded as NOT TESTED rather
 * than assumed to pass.
 *
 * It never submits the enquiry form. Validation is checked with the DOM's own
 * checkValidity() API, which evaluates constraints without firing a submit.
 */

import { writeFileSync } from "node:fs";

const RAW_BASE = process.env.BASE_URL?.replace(/\/+$/, "");
const CANDIDATES = RAW_BASE ? [RAW_BASE] : ["http://localhost:3001", "http://localhost:3000"];

const ROUTES = [
  "/", "/about",
  "/destinations",
  "/destinations/sigiriya", "/destinations/kandy", "/destinations/ella",
  "/destinations/nuwara-eliya", "/destinations/yala", "/destinations/galle",
  "/destinations/mirissa", "/destinations/arugam-bay", "/destinations/colombo",
  "/tours", "/tours/essential-sri-lanka-7-days",
  "/blog", "/blog/when-to-visit-sri-lanka",
  "/gallery", "/services", "/book",
  "/experiences", "/experiences/wildlife", "/experiences/tea-country",
];

/* Merged away in Phase 2 — these must answer with a permanent redirect, not a
   200 and not a 404. Checked separately because the crawler above follows
   redirects and would report them as healthy pages. */
const REDIRECTS = [
  ["/contact", "/book"],
  ["/fleet", "/about#fleet"],
  ["/reviews", "/about#reviews"],
];

const FILTER_ROUTES = [
  "/tours?theme=wildlife",
  "/tours?theme=wildlife&duration=8-10",
  "/tours?theme=wellness",
  "/tours?duration=3-4",
  "/tours?theme=wildlife&duration=8-10&party=family",
  "/tours?theme=unknown",
  "/tours?duration=unknown",
];

const results = [];
let base = null;

const add = (r) => {
  results.push(r);
  const tag = { PASS: "  ok ", FAIL: "FAIL ", WARN: "warn ", "NOT TESTED": "skip " }[r.status];
  console.log(`${tag} ${r.route ?? ""} — ${r.test}${r.actual ? ` :: ${r.actual}` : ""}`);
};

/* ------------------------------ page recorder ------------------------------ */

function attach(page) {
  const rec = { consoleErrors: [], pageErrors: [], failedRequests: [] };
  page.on("console", (m) => {
    if (m.type() === "error") {
      const t = m.text();
      // Ignore noise that isn't an application fault.
      if (/favicon|Download the React DevTools|\[Fast Refresh\]/i.test(t)) return;
      rec.consoleErrors.push(t.slice(0, 400));
    }
  });
  page.on("pageerror", (e) => rec.pageErrors.push(String(e).slice(0, 400)));
  page.on("requestfailed", (req) => {
    const u = req.url();
    if (/favicon|hot-update|_next\/webpack-hmr|analytics/i.test(u)) return;
    rec.failedRequests.push(`${req.failure()?.errorText ?? "failed"} ${u.slice(0, 180)}`);
  });
  page.on("response", (res) => {
    const u = res.url();
    if (res.status() >= 400 && !/favicon|hot-update|webpack-hmr/i.test(u)) {
      rec.failedRequests.push(`HTTP ${res.status()} ${u.slice(0, 180)}`);
    }
  });
  return rec;
}

/** Next's dev error overlay / error boundary, as rendered. */
async function detectErrorScreen(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector("nextjs-portal, #__next-build-watcher");
    const overlayText = overlay?.shadowRoot?.textContent ?? "";
    const body = document.body?.innerText ?? "";
    const hit = (s) =>
      /Unhandled Runtime Error|Application error: a (client|server)-side exception|That didn't load as it should|The site didn't load|ReferenceError|__webpack_modules__/i.test(s);
    return {
      overlay: hit(overlayText),
      body: hit(body),
      sample: (hit(overlayText) ? overlayText : hit(body) ? body : "").trim().slice(0, 300),
    };
  });
}

async function visit(ctx, route, { expectText } = {}) {
  const page = await ctx.newPage();
  const rec = attach(page);
  const url = base + route;
  let status = null, title = null, err = null;

  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    status = resp?.status() ?? null;
    // Dev compiles on first hit; give hydration a moment to surface errors.
    await page.waitForTimeout(1200);
    title = await page.title();
  } catch (e) {
    err = String(e).slice(0, 300);
  }

  let main = false, errScreen = { overlay: false, body: false, sample: "" }, text = "";
  if (!err) {
    try {
      main = await page.evaluate(() => {
        const m = document.querySelector("main");
        return !!m && m.innerText.trim().length > 80;
      });
      errScreen = await detectErrorScreen(page);
      text = await page.evaluate(() => document.body.innerText.slice(0, 20000));
    } catch (e) {
      err = String(e).slice(0, 300);
    }
  }

  const evidence = [
    err && `nav error: ${err}`,
    rec.pageErrors.length && `pageerror: ${rec.pageErrors[0]}`,
    rec.consoleErrors.length && `console: ${rec.consoleErrors[0]}`,
    rec.failedRequests.length && `network: ${rec.failedRequests[0]}`,
    errScreen.sample && `screen: ${errScreen.sample}`,
  ].filter(Boolean).join(" | ");

  const bad =
    err || status === null || status >= 400 ||
    rec.pageErrors.length > 0 || errScreen.overlay || errScreen.body;

  add({
    route, test: "route loads without runtime error",
    status: bad ? "FAIL" : rec.consoleErrors.length || rec.failedRequests.length ? "WARN" : "PASS",
    expected: "HTTP 200, no uncaught error, no error screen",
    actual: `HTTP ${status ?? "n/a"}${errScreen.overlay || errScreen.body ? ", ERROR SCREEN" : ""}${rec.pageErrors.length ? `, ${rec.pageErrors.length} pageerror` : ""}`,
    severity: bad ? "P0" : rec.consoleErrors.length ? "P2" : "-",
    title, evidence,
    consoleErrors: rec.consoleErrors, pageErrors: rec.pageErrors, failedRequests: rec.failedRequests,
  });

  if (!bad) {
    add({
      route, test: "main content rendered",
      status: main ? "PASS" : "FAIL",
      expected: "<main> contains substantive text",
      actual: main ? "present" : "empty or missing",
      severity: main ? "-" : "P1", evidence: "",
    });
  }

  if (expectText) {
    for (const needle of expectText) {
      const ok = text.toLowerCase().includes(needle.toLowerCase());
      add({
        route, test: `page shows "${needle}"`,
        status: ok ? "PASS" : "FAIL",
        expected: `body text contains "${needle}"`,
        actual: ok ? "found" : "not found",
        severity: ok ? "-" : "P1", evidence: "",
      });
    }
  }

  return { page, rec, text, status };
}

/* --------------------------------- suites --------------------------------- */

async function suiteRoutes(ctx) {
  for (const r of ROUTES) {
    const { page } = await visit(ctx, r);
    await page.close();
  }
}

/**
 * Retired routes must answer with a permanent redirect. Uses fetch with
 * redirect:"manual" rather than the browser, because the browser follows the
 * hop and the resulting 200 tells us nothing about whether the redirect fired
 * or the old page is simply still being served.
 */
async function suiteRedirects() {
  for (const [from, to] of REDIRECTS) {
    let res;
    try {
      res = await fetch(base + from, { redirect: "manual" });
    } catch (e) {
      add({ route: from, test: "permanent redirect", status: "FAIL", actual: String(e).slice(0, 160) });
      continue;
    }
    const location = res.headers.get("location") ?? "";
    const permanent = res.status === 301 || res.status === 308;
    const lands = location === to || location.endsWith(to);
    add({
      route: from,
      test: `permanent redirect → ${to}`,
      status: permanent && lands ? "PASS" : "FAIL",
      expected: `301/308 → ${to}`,
      actual: `HTTP ${res.status}${location ? ` → ${location}` : " (no Location header)"}`,
    });
  }
}

/**
 * A URL with no content behind it must return a real 404, not a 200 carrying
 * the not-found page. Google treats the latter as a soft 404 and can index it.
 */
async function suiteNotFound() {
  const probes = [
    "/tours/definitely-not-a-tour",
    "/destinations/definitely-not-a-place",
    "/blog/definitely-not-a-post",
    "/experiences/food",
    "/experiences/luxury",
    "/definitely-not-a-page",
  ];
  for (const p of probes) {
    let res;
    try {
      res = await fetch(base + p, { redirect: "manual" });
    } catch (e) {
      add({ route: p, test: "true 404", status: "FAIL", actual: String(e).slice(0, 160) });
      continue;
    }
    add({
      route: p,
      test: "true 404 (not a soft 404)",
      status: res.status === 404 ? "PASS" : "FAIL",
      expected: "HTTP 404",
      actual: `HTTP ${res.status}`,
    });
  }
}

async function suiteTourFilters(ctx) {
  // Baseline: how many journey cards with no filters at all?
  const b = await visit(ctx, "/tours");
  const baseCount = await b.page.evaluate(
    () => document.querySelectorAll('a[href^="/tours/"]').length
  );
  await b.page.close();
  add({
    route: "/tours", test: "baseline journey cards present",
    status: baseCount > 0 ? "PASS" : "FAIL",
    expected: "at least one /tours/<slug> link", actual: `${baseCount} links`,
    severity: baseCount > 0 ? "-" : "P0", evidence: "",
  });

  for (const r of FILTER_ROUTES) {
    const { page, text } = await visit(ctx, r);
    const count = await page.evaluate(
      () => document.querySelectorAll('a[href^="/tours/"]').length
    );
    const hasSummary = /journey|journeys/i.test(text) && /clear filters/i.test(text);
    const zero = /no set journey matches/i.test(text);
    const known = !/unknown/.test(r);

    // A known filter must visibly change state: either a filter summary bar or
    // the designed zero-result state. Silently returning the full list is the
    // exact failure this whole exercise exists to catch.
    const reflected = hasSummary || zero;
    add({
      route: r, test: "filter state reflected in page",
      status: reflected ? "PASS" : "FAIL",
      expected: "filter summary bar or zero-result state visible",
      actual: `${count} cards; summary=${hasSummary}; zeroState=${zero}`,
      severity: reflected ? "-" : "P1", evidence: "",
    });

    if (known) {
      add({
        route: r, test: "filter narrows or empties the list",
        status: count < baseCount || zero ? "PASS" : "WARN",
        expected: `fewer than ${baseCount} cards, or the zero state`,
        actual: `${count} cards`,
        severity: count < baseCount || zero ? "-" : "P2", evidence: "",
      });
    }
    await page.close();
  }

  // AND semantics, observed rather than assumed.
  const counts = {};
  for (const q of ["theme=wildlife", "duration=8-10", "theme=wildlife&duration=8-10"]) {
    const { page } = await visit(ctx, `/tours?${q}`);
    counts[q] = await page.evaluate(
      () => document.querySelectorAll('a[href^="/tours/"]').length
    );
    await page.close();
  }
  const combined = counts["theme=wildlife&duration=8-10"];
  const ok = combined <= counts["theme=wildlife"] && combined <= counts["duration=8-10"];
  add({
    route: "/tours", test: "filters combine with AND",
    status: ok ? "PASS" : "FAIL",
    expected: "combined result ≤ each single-filter result",
    actual: JSON.stringify(counts),
    severity: ok ? "-" : "P1", evidence: "",
  });
}

/*
  Destination cards are counted inside [data-qa="destination-grid"], not
  page-wide. /destinations now also carries the region explorer, whose cards
  link to published guides too — a page-wide `a[href^="/destinations/"]` count
  would fold those in and make a filtered page look unfiltered. The attribute
  marks the one grid the region filter actually governs.
*/
const CARD_SEL = '[data-qa="destination-grid"] a[href^="/destinations/"]';

async function suiteRegions(ctx) {
  // Unfiltered baseline, for comparison against each filtered result.
  const { page: basePage } = await visit(ctx, "/destinations");
  const baseCount = await basePage.evaluate(
    (sel) => document.querySelectorAll(sel).length,
    CARD_SEL
  );
  const baseSlugs = await basePage.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll(sel))
        .map((a) => a.getAttribute("href").split("?")[0].replace("/destinations/", ""))
        .filter((v, i, arr) => v && arr.indexOf(v) === i),
    CARD_SEL
  );
  await basePage.close();

  /*
    Region links are rendered by IslandMap and the homepage region index — both
    of which live on `/`, not on `/destinations`. An earlier version of this
    harness looked for them on `/destinations` and reported "0 found", which was
    correct about that page and wrong about the site: the discovery loop below
    silently iterated an empty list, so none of the per-region assertions ever
    ran. Discovering from `/` is what makes them execute.
  */
  const { page: home } = await visit(ctx, "/");
  const regionSlugs = await home.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="region="]'))
      .map((a) => {
        const href = a.getAttribute("href") ?? "";
        const q = href.includes("?") ? href.slice(href.indexOf("?")) : "";
        return new URLSearchParams(q).get("region");
      })
      .filter((v, i, arr) => v && arr.indexOf(v) === i)
  );
  await home.close();

  add({
    route: "/", test: "region links exposed in UI (homepage map + region index)",
    status: regionSlugs.length ? "PASS" : "FAIL",
    expected: "one or more ?region= links on the homepage",
    actual: `${regionSlugs.length} unique region slugs found`,
    severity: regionSlugs.length ? "-" : "P1",
    evidence: regionSlugs.join(", "),
  });

  for (const slug of regionSlugs) {
    const route = `/destinations?region=${slug}`;
    const { page: p, text } = await visit(ctx, route);
    const slugs = await p.evaluate(
      (sel) =>
        Array.from(document.querySelectorAll(sel))
          .map((a) => a.getAttribute("href").split("?")[0].replace("/destinations/", ""))
          .filter((v, i, arr) => v && arr.indexOf(v) === i),
      CARD_SEL
    );
    const count = slugs.length;
    const summary = /region:/i.test(text);
    const empty = /no published guides for this region/i.test(text);

    // The filter must be acknowledged in the UI at all.
    add({
      route, test: "region filter state is reflected",
      status: summary || empty ? "PASS" : "FAIL",
      expected: "region summary chip, or the region empty state",
      actual: `${count} cards; summary=${summary}; empty=${empty}`,
      severity: summary || empty ? "-" : "P1", evidence: "",
    });

    /*
      And it must actually change the result: either a strict subset of the
      unfiltered list, or legitimately zero. Returning the full catalogue while
      claiming to be filtered is the failure mode worth catching — a chip that
      says "Region: Hill Country" over all nine destinations would otherwise
      pass the check above.
    */
    const isSubset = count < baseCount && slugs.every((s) => baseSlugs.includes(s));
    add({
      route, test: "region filter narrows the destination list",
      status: (isSubset && count > 0) || (empty && count === 0) ? "PASS" : "FAIL",
      expected: `fewer than ${baseCount} destinations (subset), or 0 with the empty state`,
      actual: `${count} of ${baseCount} — [${slugs.join(", ")}]`,
      severity: (isSubset && count > 0) || (empty && count === 0) ? "-" : "P1",
      evidence: "",
    });
    await p.close();
  }

  const { page: u, text: ut } = await visit(ctx, "/destinations?region=not-a-region");
  const uCount = await u.evaluate(
    (sel) => document.querySelectorAll(sel).length,
    CARD_SEL
  );
  add({
    route: "/destinations?region=not-a-region", test: "unknown region degrades safely",
    status: uCount > 0 && !/region:/i.test(ut) ? "PASS" : "WARN",
    expected: "full unfiltered list, no crash",
    actual: `${uCount} cards; summary=${/region:/i.test(ut)}`,
    severity: uCount > 0 ? "-" : "P1", evidence: "",
  });
  await u.close();
}

/*
  The region explorer on /destinations.

  It is the only client-interactive component on the page, so nothing else in
  this harness would notice if it stopped switching panels — the server HTML
  would still contain the first region's cards and every other check would pass.
  These assertions exercise it the way a visitor does: click, keyboard, and the
  mobile control.
*/
async function suiteRegionExplorer(ctx, browser) {
  const readPanel = (page) =>
    page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const panel = document.querySelector('[role="tabpanel"]');
      return {
        tabs: tabs.length,
        selected: tabs.find((t) => t.getAttribute("aria-selected") === "true")?.textContent?.trim() ?? null,
        roving: tabs.filter((t) => t.tabIndex === 0).length,
        cards: Array.from(panel?.querySelectorAll("li h3") ?? []).map((h) => h.textContent.trim()),
        links: Array.from(panel?.querySelectorAll('a[href^="/destinations/"]') ?? []).length,
      };
    });

  const { page } = await visit(ctx, "/destinations");
  const first = await readPanel(page);

  add({
    route: "/destinations", test: "region explorer renders all seven tabs",
    status: first.tabs === 7 ? "PASS" : "FAIL",
    expected: "7 tabs, exactly one selected, roving tabindex",
    actual: `${first.tabs} tabs; selected=${first.selected}; tabindex0=${first.roving}`,
    severity: first.tabs === 7 ? "-" : "P2", evidence: "",
  });

  // Click the last tab — a different region must actually load into the panel.
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    tabs[tabs.length - 1].click();
  });
  await page.waitForTimeout(700);
  const clicked = await readPanel(page);
  const changed =
    clicked.selected !== first.selected &&
    clicked.cards.length > 0 &&
    clicked.cards.join() !== first.cards.join();
  add({
    route: "/destinations", test: "clicking a region tab swaps the panel",
    status: changed ? "PASS" : "FAIL",
    expected: "new region selected and a different set of place cards",
    actual: `${first.selected} → ${clicked.selected}; [${clicked.cards.join(", ")}]`,
    severity: changed ? "-" : "P2", evidence: "",
  });

  // Arrow keys must move between tabs — the widget is unusable without them.
  await page.evaluate(() =>
    document.querySelector('[role="tab"][aria-selected="true"]')?.focus()
  );
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  const keyed = await readPanel(page);
  add({
    route: "/destinations", test: "region tabs respond to arrow keys",
    status: keyed.selected && keyed.selected !== clicked.selected ? "PASS" : "FAIL",
    expected: "ArrowRight selects the next region (wrapping)",
    actual: `${clicked.selected} → ${keyed.selected}`,
    severity: keyed.selected !== clicked.selected ? "-" : "P2", evidence: "",
  });
  await page.close();

  // On a phone the tablist is replaced by a native select. Both must not be
  // visible at once, and the select must drive the same panel.
  // Viewport is a context-level setting here, so the phone case needs its own.
  const mobileCtx = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const m = await mobileCtx.newPage();
  await m.goto(base + "/destinations", { waitUntil: "domcontentloaded", timeout: 60000 });
  await m.waitForTimeout(1200);
  const mobile = await m.evaluate(() => {
    const sel = document.querySelector("select");
    const tablist = document.querySelector('[role="tablist"]');
    return {
      select: !!sel && sel.offsetParent !== null,
      options: sel?.options?.length ?? 0,
      tablist: !!tablist && tablist.offsetParent !== null,
    };
  });
  add({
    route: "/destinations @ mobile 320", test: "region control degrades to a select",
    status: mobile.select && mobile.options === 7 && !mobile.tablist ? "PASS" : "FAIL",
    expected: "select with 7 options visible, tablist hidden",
    actual: `select=${mobile.select} (${mobile.options} options); tablist=${mobile.tablist}`,
    severity: mobile.select ? "-" : "P2", evidence: "",
  });

  if (mobile.select) {
    const before = await readPanel(m);
    await m.selectOption("select", "hill-country");
    await m.waitForTimeout(700);
    const after = await readPanel(m);
    add({
      route: "/destinations @ mobile 320", test: "select changes the region panel",
      status: after.cards.length && after.cards.join() !== before.cards.join() ? "PASS" : "FAIL",
      expected: "Hill Country places replace the previous set",
      actual: `[${after.cards.join(", ")}]`,
      severity: after.cards.length ? "-" : "P2", evidence: "",
    });
  }
  await m.close();
  await mobileCtx.close();

  // ?region= should open the matching tab, so the homepage map lands correctly.
  const { page: deep } = await visit(ctx, "/destinations?region=east-coast");
  const deepPanel = await readPanel(deep);
  add({
    route: "/destinations?region=east-coast", test: "explorer opens on the linked region",
    status: /east coast/i.test(deepPanel.selected ?? "") ? "PASS" : "WARN",
    expected: "East Coast tab selected on load",
    actual: `selected=${deepPanel.selected}`,
    severity: "-", evidence: "",
  });
  await deep.close();
}

async function suiteBook(ctx) {
  // Bare /book must behave exactly as before.
  const bare = await visit(ctx, "/book");
  const bareMsg = await bare.page.evaluate(
    () => document.querySelector("textarea")?.value ?? null
  );
  add({
    route: "/book", test: "bare /book has empty message",
    status: bareMsg === "" ? "PASS" : "WARN",
    expected: '""', actual: JSON.stringify(bareMsg),
    severity: bareMsg === "" ? "-" : "P2", evidence: "",
  });
  await bare.page.close();

  // Planner context.
  const r = "/book?theme=wildlife&duration=8-10&party=family";
  const { page } = await visit(ctx, r);
  const msg = await page.evaluate(() => document.querySelector("textarea")?.value ?? "");
  const hasCtx = /looking for:/i.test(msg) && /wildlife/i.test(msg);
  add({
    route: r, test: "planner context appears in message",
    status: hasCtx ? "PASS" : "FAIL",
    expected: 'message contains "Looking for: … Wildlife"',
    actual: JSON.stringify(msg.slice(0, 200)),
    severity: hasCtx ? "-" : "P1", evidence: "",
  });
  const notPolluted = !/I'm interested in:/i.test(msg);
  add({
    route: r, test: "no phantom tour line when no tour param",
    status: notPolluted ? "PASS" : "FAIL",
    expected: "no \"I'm interested in:\" line", actual: notPolluted ? "absent" : "present",
    severity: notPolluted ? "-" : "P1", evidence: "",
  });

  // Editable.
  await page.fill("textarea", "rewritten by QA");
  const edited = await page.evaluate(() => document.querySelector("textarea")?.value);
  add({
    route: r, test: "message is editable",
    status: edited === "rewritten by QA" ? "PASS" : "FAIL",
    expected: "textarea accepts input", actual: JSON.stringify(edited),
    severity: edited === "rewritten by QA" ? "-" : "P1", evidence: "",
  });
  await page.close();

  // Tour + filters together: the tour line must stay exactly parseable.
  const r2 = "/book?service=Multi-Day&tour=Essential%20Sri%20Lanka&theme=wildlife";
  const { page: p2 } = await visit(ctx, r2);
  const msg2 = await p2.evaluate(() => document.querySelector("textarea")?.value ?? "");
  const lines = msg2.split("\n");
  const cleanTourLine = lines[0] === "I'm interested in: Essential Sri Lanka";
  add({
    route: r2, test: "tour line unpolluted by filter context",
    status: cleanTourLine ? "PASS" : "FAIL",
    expected: `first line exactly "I'm interested in: Essential Sri Lanka"`,
    actual: JSON.stringify(lines[0]),
    severity: cleanTourLine ? "-" : "P1", evidence: JSON.stringify(msg2.slice(0, 200)),
  });
  const svc = await p2.evaluate(() => document.querySelector("select")?.value ?? null);
  add({
    route: r2, test: "service select prefilled",
    status: svc === "Multi-Day Tour" ? "PASS" : "FAIL",
    expected: '"Multi-Day Tour"', actual: JSON.stringify(svc),
    severity: svc === "Multi-Day Tour" ? "-" : "P1", evidence: "",
  });

  // Validation WITHOUT submitting: constraint API only.
  const validity = await p2.evaluate(() => {
    const form = document.querySelector("form");
    if (!form) return { error: "no form" };

    /*
      Resolve fields the way a user would: via the visible <label>, falling back
      to id/name/type. An earlier version of this harness looked only for
      input[name="name"] and reported the name field as not-required — the field
      is actually id="bf-name" and has always carried `required`. That was a
      false positive in the test, not a defect in the form, so the lookup is now
      label-driven and independent of naming conventions.
    */
    const byLabel = (re) => {
      const label = Array.from(form.querySelectorAll("label")).find((l) =>
        re.test(l.textContent?.trim() ?? "")
      );
      const id = label?.getAttribute("for");
      return id ? form.querySelector(`#${CSS.escape(id)}`) : null;
    };

    const name =
      byLabel(/^your name$/i) ??
      form.querySelector('input[name="name"], #name, [id$="-name"]');
    const email =
      byLabel(/^email$/i) ??
      form.querySelector('input[type="email"], input[name="email"], #email, [id$="-email"]');
    const honeypot = form.querySelector(
      'input[name="company"], #company, [id$="-company"], input[autocomplete="off"][tabindex="-1"]'
    );
    const out = {};
    if (email) {
      email.value = "not-an-email";
      email.dispatchEvent(new Event("input", { bubbles: true }));
      out.invalidEmailRejected = email.checkValidity() === false;
      email.value = "";
      email.dispatchEvent(new Event("input", { bubbles: true }));
    }
    out.emailRequired = !!email?.required;
    out.nameRequired = !!name?.required;
    out.emptyFormInvalid = form.checkValidity() === false;
    if (honeypot) {
      const cs = getComputedStyle(honeypot);
      const rect = honeypot.getBoundingClientRect();
      out.honeypotHidden =
        cs.display === "none" || cs.visibility === "hidden" ||
        cs.opacity === "0" || rect.width === 0 || rect.height === 0 ||
        honeypot.tabIndex === -1 || cs.position === "absolute";
    } else out.honeypotHidden = null;
    return out;
  });
  for (const [k, expected] of [
    ["invalidEmailRejected", true], ["emailRequired", true],
    ["nameRequired", true], ["emptyFormInvalid", true], ["honeypotHidden", true],
  ]) {
    const v = validity[k];
    add({
      route: r2, test: `validation: ${k}`,
      status: v === expected ? "PASS" : v === null || v === undefined ? "NOT TESTED" : "FAIL",
      expected: String(expected), actual: String(v),
      severity: v === expected ? "-" : "P1", evidence: "",
    });
  }
  add({
    route: r2, test: "form submission",
    status: "NOT TESTED",
    expected: "-", actual: "deliberately not submitted — no test enquiry created",
    severity: "-", evidence: "",
  });
  await p2.close();
}

async function suiteNav(ctx) {
  const page = await ctx.newPage();
  attach(page);
  await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(800);

  const targets = [
    { label: "Destinations", expect: "/destinations" },
    { label: "Journeys", expect: "/tours" },
    { label: "Journal", expect: "/blog" },
    { label: "About", expect: "/about" },
  ];

  for (const t of targets) {
    try {
      await page.goto(base + "/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const link = page.locator(`header a:has-text("${t.label}")`).first();
      if ((await link.count()) === 0) {
        add({ route: "/", test: `nav link "${t.label}" exists`, status: "FAIL",
          expected: "link present in header", actual: "not found", severity: "P1", evidence: "" });
        continue;
      }
      /*
        Wait for the URL to change, don't sleep and hope.

        The previous form was `click()` → `waitForLoadState("domcontentloaded")`
        → `waitForTimeout(600)`. On a client-side App Router transition
        `domcontentloaded` has already fired for the current document, so that
        load-state wait resolves instantly and the whole assertion rests on the
        600ms sleep. Any main-thread work that pushes the transition past 600ms
        reads as "still on /" — a false FAIL that points at routing when nothing
        is wrong with routing. The homepage hero now mounts additional images as
        the slideshow advances, which is exactly the kind of work that can eat
        that budget.

        waitForURL resolves the moment the navigation actually completes and
        throws on genuine failure, so a FAIL here now means a real one.
      */
      await Promise.all([
        page.waitForURL((u) => new URL(u).pathname === t.expect, {
          timeout: 15000,
        }),
        link.click(),
      ]);
      const got = new URL(page.url()).pathname;
      add({
        route: "/", test: `nav "${t.label}" navigates`,
        status: got === t.expect ? "PASS" : "FAIL",
        expected: t.expect, actual: got,
        severity: got === t.expect ? "-" : "P1", evidence: "",
      });
    } catch (e) {
      add({ route: "/", test: `nav "${t.label}" navigates`, status: "FAIL",
        expected: t.expect, actual: "exception", severity: "P1", evidence: String(e).slice(0, 200) });
    }
  }

  // back / forward
  try {
    await page.goto(base + "/", { waitUntil: "domcontentloaded" });
    await page.goto(base + "/tours", { waitUntil: "domcontentloaded" });
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const backPath = new URL(page.url()).pathname;
    add({ route: "-", test: "browser back", status: backPath === "/" ? "PASS" : "FAIL",
      expected: "/", actual: backPath, severity: backPath === "/" ? "-" : "P1", evidence: "" });
    await page.goForward({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const fwdPath = new URL(page.url()).pathname;
    add({ route: "-", test: "browser forward", status: fwdPath === "/tours" ? "PASS" : "FAIL",
      expected: "/tours", actual: fwdPath, severity: fwdPath === "/tours" ? "-" : "P1", evidence: "" });
  } catch (e) {
    add({ route: "-", test: "back/forward", status: "FAIL", expected: "history works",
      actual: "exception", severity: "P1", evidence: String(e).slice(0, 200) });
  }
  await page.close();
}

async function suiteResponsive(browser) {
  const viewports = [
    // 320 is the narrowest viewport worth supporting and the one the layout is
    // most likely to break at: the homepage map box is max-w-[17.5rem] (280px)
    // inside px-5 padding, which consumes the full 320 with nothing to spare.
    { name: "mobile 320", width: 320, height: 640 },
    { name: "mobile 375", width: 375, height: 812 },
    { name: "tablet 768", width: 768, height: 1024 },
    { name: "desktop 1440", width: 1440, height: 900 },
  ];
  const pages = ["/", "/destinations", "/tours", "/tours/essential-sri-lanka-7-days", "/book", "/blog"];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const route of pages) {
      const page = await ctx.newPage();
      attach(page);
      try {
        await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(900);
        const m = await page.evaluate(() => {
          const de = document.documentElement;
          const overflowing = Array.from(document.querySelectorAll("body *"))
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2);
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
          return { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, overflowing };
        });
        const overflow = m.scrollWidth > m.innerWidth + 2;
        add({
          route: `${route} @ ${vp.name}`, test: "no horizontal overflow",
          status: overflow ? "FAIL" : "PASS",
          expected: `scrollWidth ≤ ${m.innerWidth}`,
          actual: `scrollWidth ${m.scrollWidth}`,
          severity: overflow ? "P1" : "-",
          evidence: overflow ? m.overflowing.join(" | ") : "",
        });
      } catch (e) {
        add({ route: `${route} @ ${vp.name}`, test: "no horizontal overflow", status: "FAIL",
          expected: "page loads", actual: "exception", severity: "P1", evidence: String(e).slice(0, 200) });
      }
      await page.close();
    }
    await ctx.close();
  }
}

/* ---------------------------------- report --------------------------------- */

function report() {
  const n = (s) => results.filter((r) => r.status === s).length;
  const counts = { total: results.length, PASS: n("PASS"), FAIL: n("FAIL"), WARN: n("WARN"), NOT_TESTED: n("NOT TESTED") };
  const consoleErrors = results.flatMap((r) => (r.consoleErrors ?? []).map((e) => `${r.route}: ${e}`));
  const netFailures = results.flatMap((r) => (r.failedRequests ?? []).map((e) => `${r.route}: ${e}`));
  const pageErrors = results.flatMap((r) => (r.pageErrors ?? []).map((e) => `${r.route}: ${e}`));
  const overflow = results.filter((r) => r.test === "no horizontal overflow" && r.status === "FAIL");

  writeFileSync("qa-results.json", JSON.stringify({ base, counts, results }, null, 2));

  const sec = (title, rows) =>
    `## ${title}\n\n` +
    (rows.length
      ? rows.map((r) =>
          `- **${r.route ?? "-"}** — ${r.test}\n` +
          `  - severity: ${r.severity ?? "-"}\n` +
          `  - expected: ${r.expected}\n` +
          `  - actual: ${r.actual}\n` +
          (r.evidence ? `  - evidence: ${r.evidence}\n` : "")
        ).join("")
      : "_none_\n") + "\n";

  const md =
    `# Island Route — browser QA\n\n` +
    `Base URL: \`${base}\`  ·  ${new Date().toISOString()}\n\n` +
    `| total | PASS | FAIL | WARN | NOT TESTED |\n|---|---|---|---|---|\n` +
    `| ${counts.total} | ${counts.PASS} | ${counts.FAIL} | ${counts.WARN} | ${counts.NOT_TESTED} |\n\n` +
    sec("FAIL", results.filter((r) => r.status === "FAIL")) +
    sec("WARN", results.filter((r) => r.status === "WARN")) +
    sec("NOT TESTED", results.filter((r) => r.status === "NOT TESTED")) +
    `## Uncaught page errors\n\n${pageErrors.length ? pageErrors.map((e) => `- ${e}`).join("\n") : "_none_"}\n\n` +
    `## Console errors\n\n${consoleErrors.length ? consoleErrors.map((e) => `- ${e}`).join("\n") : "_none_"}\n\n` +
    `## Network failures\n\n${netFailures.length ? netFailures.map((e) => `- ${e}`).join("\n") : "_none_"}\n\n` +
    `## Horizontal overflow\n\n${overflow.length ? overflow.map((r) => `- ${r.route}: ${r.actual} (${r.evidence})`).join("\n") : "_none_"}\n\n` +
    `## PASS\n\n${results.filter((r) => r.status === "PASS").map((r) => `- ${r.route ?? "-"} — ${r.test}`).join("\n") || "_none_"}\n`;

  writeFileSync("qa-results.md", md);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`total ${counts.total} | PASS ${counts.PASS} | FAIL ${counts.FAIL} | WARN ${counts.WARN} | NOT TESTED ${counts.NOT_TESTED}`);
  console.log(`uncaught page errors : ${pageErrors.length}`);
  console.log(`console errors       : ${consoleErrors.length}`);
  console.log(`network failures     : ${netFailures.length}`);
  console.log(`horizontal overflow  : ${overflow.length}`);
  console.log(`${"=".repeat(60)}\nwrote qa-results.json and qa-results.md`);
  return counts;
}

/* ----------------------------------- main ---------------------------------- */

(async () => {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "Playwright is not installed.\n\n" +
      "  npm i -D playwright && npx playwright install chromium\n"
    );
    process.exit(2);
  }

  // Find the running dev server before launching a browser.
  for (const c of CANDIDATES) {
    try {
      const res = await fetch(c, { signal: AbortSignal.timeout(4000) });
      if (res.ok || res.status < 500) { base = c; break; }
    } catch { /* try next */ }
  }
  if (!base) {
    console.error(
      `No dev server reachable at ${CANDIDATES.join(" or ")}.\n` +
      `Start it with \`npm run dev\`, or set BASE_URL.\n`
    );
    process.exit(2);
  }
  console.log(`QA target: ${base}\n`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  try {
    await suiteRoutes(ctx);
    await suiteRedirects();
    await suiteNotFound();
    await suiteTourFilters(ctx);
    await suiteRegions(ctx);
    await suiteRegionExplorer(ctx, browser);
    await suiteBook(ctx);
    await suiteNav(ctx);
    await ctx.close();
    await suiteResponsive(browser);
  } finally {
    await browser.close().catch(() => {});
  }

  const counts = report();
  process.exit(counts.FAIL > 0 ? 1 : 0);
})();
