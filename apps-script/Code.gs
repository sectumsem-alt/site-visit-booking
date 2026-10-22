// Google Apps Script backend for the site visit booking form.
// Paste into Extensions → Apps Script of the target Google Sheet, then deploy as a web app.

const SHEET_NAME = 'Bookings';
// Set to an email address to get a message for every booking, or leave empty.
const NOTIFY_EMAIL = '';

const FIELDS = [
  ['event', 'Event'],
  ['name', 'Full name'],
  ['company', 'Company'],
  ['position', 'Position'],
  ['email', 'Email'],
  ['mobile', 'Mobile'],
  ['guests', 'Attendees'],
  ['building', 'Building / project'],
  ['type', 'Building type'],
  ['interest', 'Interest'],
  ['date', 'Preferred date'],
  ['slot', 'Time slot'],
  ['topics', 'Presentation topics'],
  ['notes', 'Notes'],
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    sheet.appendRow([new Date()].concat(FIELDS.map(([key]) => p[key] || '')));
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    const body = FIELDS.map(([key, label]) => `${label}: ${p[key] || '—'}`).join('\n');
    MailApp.sendEmail(NOTIFY_EMAIL, `Site visit request: ${p.company || p.name || 'new booking'}`, body);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted'].concat(FIELDS.map(([, label]) => label)));
    sheet.setFrozenRows(1);
  }
  return sheet;
}
