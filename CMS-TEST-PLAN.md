# CMS Test Plan (Keystatic) - EVOLEA

## Goals
- Verify every CMS entry loads, saves, and renders without validation errors.
- Confirm CMS edits are reflected on the deployed site with no regressions.
- Ensure bilingual (DE/EN) content paths work for all editable pages.

## Scope
- Keystatic CMS UI at `/keystatic` (Cloudflare Pages).
- Content stored in `src/content/**` (JSON + MDX).
- Frontend pages under `src/pages/**`.

## Preflight Checklist
- CMS URL loads and OAuth login succeeds.
- Repo access and branch selection work (no 404 on content).
- Latest deploy is green (GitHub Actions / Pages build).
- Local repo clean enough to spot new CMS commits.

## CMS Access Tests
1) Open `/keystatic`.
2) Sign in with GitHub and confirm repo and branch.
3) Confirm sidebar sections load: Inhalte, Seiten, Programme, Medien, Einstellungen.
4) Open a collection entry and a singleton; ensure no red validation banners.

## Validation Tests (Global)
- Icon fields: ensure all select values are valid and no "Must be a valid option" errors.
- Color fields: verify all used colors appear in the dropdown.
- URL fields: set a valid URL, then clear the value; save without error.
- Images: upload new image, save, reload, and confirm path persistence.
- Arrays: add, remove, reorder items; verify labels and data persist.
- Bilingual text: fill DE and EN, reload, verify both survive.

## Collections

### Blog (Collection)
- Create a new post with title, description, date, image, tags.
- Save, reload, ensure markdown content persists.
- Verify blog index lists it and detail page renders it.
- Delete the test post and confirm removal from index.

### Team (Collection)
- Open each team member entry and save without changes.
- Add a test member with photo, role (DE/EN), and optional LinkedIn.
- Verify team page renders the new member.
- Delete the test member.

### Principles (Collection)
- Open each entry and confirm icon + color render in CMS.
- Change one icon to a different valid option and save.
- Verify homepage and Ueber-uns pages update the icon.
- Revert the change.

## Singletons (Pages)

### Homepage
- Hero: edit title and subtitle (DE/EN); verify on `/`.
- Angebote section: edit intro text and one list item; verify on `/`.
- Cards: edit one program badge/status and verify card updates.
- Team section: adjust count and confirm grid size changes.

### About (Ueber uns)
- Mission: edit text and image; verify on `/ueber-uns/`.
- Zielgruppen: add one group with icon + color; verify render.
- Verein: edit founding year and location; verify render.

### Contact
- Edit contact info fields (email/phone/instagram URL).
- Verify `/kontakt/` and `/en/contact/` reflect changes.
- Test form subjects: add a new option, save, reload, and confirm.

### Angebote Index
- Edit intro text and one program card icon/color.
- Verify `/angebote/` reflects updates.

### Mini Garten
- Update one Info Karte icon/label/value; verify `/angebote/mini-garten/`.
- Update a Typischer Tag activity icon; verify render.
- Update Anmeldung info list; verify render.

### Mini Projekte
- Update Info Karte icons; verify `/angebote/mini-projekte/`.
- Update Besonderheiten feature icon/text; verify render.
- Update Praktische Infos list; verify render.

### Mini Turnen
- Update Info Karte icons; verify `/angebote/mini-turnen/`.
- Update Trainings-Aktivitaeten icons; verify render.
- Update Praktische Infos list; verify render.

### Tagesschule
- Update hero fields; verify `/angebote/tagesschule/`.
- Update any key section text; verify render.

### Site Images
- Swap one hero image (Mini Projekte) and verify new image on page.
- Restore original image.

### Site Settings
- Navigation labels: update one label and verify Header updates.
- Footer tagline: update DE/EN and verify Footer updates.
- Social link: update Instagram URL and verify Footer link.
- Contact email: update and verify Footer email link.

## Frontend Regression Pass (All Pages)
- Check DE and EN homepage.
- Check Ueber uns, Team, Blog index, Blog detail.
- Check Kontakt and EN Contact.
- Check Angebote index + each program page.
- Confirm no layout shifts or missing icons after edits.

## Deploy Pipeline
- Make one small CMS change and save.
- Confirm commit appears in GitHub (keystatic branch or main).
- Confirm build completes and site updates.
- Revert the change via CMS and confirm deployment.

## Data Integrity
- Verify JSON files remain valid and minimal diffs are produced.
- Ensure icons/colors in content are within allowed options.
- Confirm images are saved under the correct public paths.

## Exit Criteria
- No CMS validation errors for any entry.
- All edits reflected on the live site.
- No regressions on key pages (home, programs, contact).
