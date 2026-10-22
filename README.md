# Site visit booking

A booking page for Belimo Energy Valve site visits, sent to people who visit the Rite Products, Incorporated booth at trade events. Each booking includes the mock-up walkthrough and a Belimo presentation with our principal. It's a static page (plain HTML, CSS and JS, no build step) styled with the Industry design system in `industry.css`.

## Reusing it for a new event

Edit `config.js`:

- `eventName`: full label, e.g. `'FMOP 2026'`. Shown in the header, the kicker and the browser tab, and saved in the Event column of every booking.
- `eventShortName`: used in "Thank you for visiting us at …", e.g. `'FMOP'`.
- `sheetEndpoint`: the Apps Script URL (below). You can keep one Sheet for all events and filter by the Event column.

## Files

- `index.html`: markup
- `booking.css`: page layout on top of the design system tokens
- `booking.js`: validation (required fields, weekdays only, earliest date tomorrow), submission and the confirmation screen
- `config.js`: per-event settings
- `logos/`: add `rite.png` and `belimo.png`; until then the header shows dashed placeholders
- `apps-script/Code.gs`: the Google Sheets backend

## Connecting it to a Google Sheet

1. Create a Google Sheet, then open Extensions → Apps Script.
2. Replace the editor contents with `apps-script/Code.gs`. Set `NOTIFY_EMAIL` if you want an email for each booking.
3. Deploy → New deployment → type "Web app". Execute as "Me", access "Anyone". Authorize when prompted.
4. Copy the web app URL into `sheetEndpoint` in `config.js`.

Each submission adds a row to a `Bookings` tab (created on the first submission) with a timestamp, the event and every form field.

With `sheetEndpoint` empty, the form still shows the confirmation but saves nothing; the booking is logged to the browser console instead.

## Hosting

GitHub Pages works: Settings → Pages → Deploy from branch → `main` / root. The page is then at `https://<user>.github.io/site-visit-booking/`.
