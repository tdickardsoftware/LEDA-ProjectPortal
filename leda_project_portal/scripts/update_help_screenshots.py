"""
Regenerates the Help wiki screenshots in public/help-images.

Usage (dev server must be running):
    pip install playwright
    python scripts/update_help_screenshots.py [--base-url http://localhost:3000] [--channel msedge]

An Edge window opens on the login page. Log in yourself; the script continues once
you reach the portal, then captures every page the help markdown references.
Personal data (names, phones, emails, addresses, birth dates) is blurred before
each capture, so review the images before committing. Dev overlays are hidden.
"""
import argparse
import pathlib
import re

from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "help-images"

# name -> url. A shot is saved as <name>.png; "-add" shots open the "Add ... +" dialog.
LIST_PAGES = {
    "players": "/Portal/Management/Players",
    "places": "/Portal/Management/Places",
    "teams": "/Portal/Management/Teams",
    "divisions": "/Portal/Maintenance/Divisions",
    "mentions": "/Portal/Maintenance/Mentions",
    "payment-types": "/Portal/Maintenance/Payment-Types",
    "payments": "/Portal/Maintenance/Payments",
    "payout-tiers": "/Portal/Maintenance/Payout-Tiers",
    "penalties": "/Portal/Maintenance/Penalties",
    "people-types": "/Portal/Maintenance/People-Types",
    "place-types": "/Portal/Maintenance/Place-Types",
    "seasons": "/Portal/Maintenance/Seasons",
    "season-calendar": "/Portal/Maintenance/Seasons/Calendar",
    "maintenance-overview": "/Portal/Maintenance",
    "scheduling": "/Portal/Activities/Scheduling",
    "trails-activity": "/Portal/Activities/Trails",
    "payouts": "/Portal/Activities/Payouts",
}

# (name, list url, "View <kind>" link text)
DETAIL_PAGES = [
    ("player-detail", "/Portal/Management/Players", "Player"),
    ("place-detail", "/Portal/Management/Places", "Place"),
    ("team-detail", "/Portal/Management/Teams", "Team"),
]

REPORT_PAGES = {
    "captains-meeting-reports-menu": "/Portal/Reports/Captains-Meeting",
    "league-play-reports-menu": "/Portal/Reports/League-Play",
    "lists-reports-menu": "/Portal/Reports/Lists",
    "trails-reports-menu": "/Portal/Reports/Trails",
}

HIDE_DEV_OVERLAYS = (
    "nextjs-portal,[class*=tsqd],[aria-label*=Tanstack],[aria-label*='Next.js']"
    "{display:none !important}"
)

REDACT_JS = """
() => {
  const B = "blur(7px)";
  const pii = /(\\(?\\d{3}\\)?[-\\s.]\\d{3}[-.\\s]\\d{4})|([\\w.+-]+@[\\w-]+\\.[\\w.]+)/;
  const hdr = /name|phone|email|address|city|zip|birth|dob|captain|contact|street|member|player|owner/i;
  const safe = /team|place|division|season|mention|type|tier/i;
  document.querySelectorAll("table").forEach((t) => {
    const idx = [...t.querySelectorAll("thead th")]
      .map((th, i) => (hdr.test(th.innerText) && !safe.test(th.innerText) ? i : -1))
      .filter((i) => i >= 0);
    t.querySelectorAll("tbody tr").forEach((tr) =>
      idx.forEach((i) => { const c = tr.children[i]; if (c) c.style.filter = B; }));
  });
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const els = new Set();
  while (w.nextNode()) if (pii.test(w.currentNode.nodeValue)) els.add(w.currentNode.parentElement);
  els.forEach((e) => (e.style.filter = B));
  document.querySelectorAll("input,textarea").forEach((i) => {
    const k = (i.name || "") + (i.id || "") + (i.getAttribute("aria-label") || "");
    if (i.value && (pii.test(i.value) || /name|phone|email|address|city|zip|birth|street/i.test(k)))
      i.style.filter = B;
  });
}
"""

# Detail pages render "Label: value" paragraphs; blur only the personal values.
REDACT_DETAIL_JS = """
(kind) => {
  const B = "blur(7px)";
  if (kind === "Player") document.querySelectorAll("main h1").forEach((h) => (h.style.filter = B));
  document.querySelectorAll("main p").forEach((p) => {
    const m = p.innerText.match(/^([^:]+:)\\s*(.*)$/s);
    if (!m || !/Date of Birth|Email|Phone|Other Number|Address|City|State|Zip|Captain|Contact|Website/i.test(m[1])) return;
    p.textContent = m[1] + " ";
    const s = document.createElement("span");
    s.textContent = m[2];
    s.style.filter = B;
    p.append(s);
  });
}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:3000")
    ap.add_argument("--channel", default="msedge", help="installed browser channel, e.g. msedge or chrome")
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel=args.channel, headless=False)
        page = browser.new_context(viewport={"width": 1440, "height": 900}).new_page()

        def go(url):
            page.goto(args.base_url + url, wait_until="domcontentloaded")
            try:
                page.wait_for_load_state("networkidle")
                # The sidebar nav and user footer render after the abilities load.
                page.get_by_text("Admin Tools").wait_for(timeout=30000)
                page.locator("[data-sidebar=footer] button").first.wait_for(timeout=30000)
            except Exception:
                pass
            page.wait_for_timeout(4000)

        def shot(name):
            page.evaluate(REDACT_JS)
            page.screenshot(path=str(OUT / f"{name}.png"), style=HIDE_DEV_OVERLAYS)
            print("saved", name)

        def attempt(name, fn):
            # One broken page shouldn't abort the whole run.
            try:
                fn()
            except Exception as e:
                print("FAILED", name, str(e).splitlines()[0])

        print("Log in in the browser window that just opened...")
        page.goto(args.base_url + "/login")
        page.wait_for_url("**/Portal**", timeout=300_000)

        for name, url in LIST_PAGES.items():
            def run(name=name, url=url):
                go(url)
                shot(name)
                add = page.get_by_role("button", name=re.compile(r"^Add .*\+"))
                if add.count():
                    add.first.click()
                    page.wait_for_timeout(1500)
                    shot(name + "-add")
                    page.keyboard.press("Escape")
            attempt(name, run)

        for name, url, kind in DETAIL_PAGES:
            def run(name=name, url=url, kind=kind):
                go(url)
                page.get_by_role("checkbox", name="Select Row").first.check()
                page.get_by_role("link", name=f"View {kind}").first.click()
                page.wait_for_url("**/Portal/Management/*/*")
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(4000)
                page.evaluate(REDACT_DETAIL_JS, kind)
                shot(name)
            attempt(name, run)

        for name, url in REPORT_PAGES.items():
            def run(name=name, url=url):
                go(url)
                page.get_by_role("combobox").filter(has_text="Select a report").click()
                page.wait_for_timeout(1200)
                shot(name)
            attempt(name, run)

        def weekly():
            go("/Portal/Activities/Weekly-Score")
            page.get_by_role("combobox").filter(has_text="Select a Week").click()
            page.wait_for_timeout(1200)
            shot("weekly-score-weeks")
        attempt("weekly-score-weeks", weekly)

        def rosters():
            go("/Portal/Activities/Rosters")
            page.get_by_text("Summer", exact=True).first.click()
            page.wait_for_timeout(1200)
            shot("rosters-division")
        attempt("rosters-division", rosters)

        def payouts():
            go("/Portal/Activities/Payouts")
            page.get_by_role("button", name="Add Global Adjustment").click()
            page.wait_for_timeout(1200)
            shot("payouts-global-adjustment")
        attempt("payouts-global-adjustment", payouts)

        def generate():
            go("/Portal/Activities/Scheduling")
            page.get_by_role("button", name="Generate Schedule").click()
            page.wait_for_timeout(1200)
            shot("scheduling-generate")
        attempt("scheduling-generate", generate)

        browser.close()


if __name__ == "__main__":
    main()
