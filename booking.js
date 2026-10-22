(() => {
  const form = document.getElementById('booking');
  const confirmation = document.getElementById('confirmation');
  const dateInput = document.getElementById('date');
  const weekendWarn = document.getElementById('weekend-warn');
  const errorBox = document.getElementById('error');
  const submitBtn = document.getElementById('submit');
  const submitLabel = submitBtn.querySelector('span');
  const config = window.BOOKING_CONFIG || {};
  const endpoint = config.sheetEndpoint || '';

  // Fill event-specific text from config.js so one page serves every event.
  document.querySelectorAll('[data-event]').forEach(el => {
    const value = config[el.dataset.event];
    if (value) el.textContent = value;
  });
  if (config.eventName) document.title = `Book an Energy Valve site visit · ${config.eventName} · Rite Products, Incorporated`;

  // Logo slots fall back to a dashed placeholder until a real file is dropped into logos/.
  document.querySelectorAll('.logo-slot img').forEach(img => {
    const slot = img.parentElement;
    const markEmpty = () => slot.classList.add('empty');
    if (img.complete && img.naturalWidth === 0) markEmpty();
    img.addEventListener('error', markEmpty);
  });

  // Earliest bookable date is tomorrow, in local time.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  dateInput.min = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  const parseDate = v => (v ? new Date(v + 'T00:00') : null);
  const isWeekend = d => !!d && [0, 6].includes(d.getDay());

  dateInput.addEventListener('change', () => {
    weekendWarn.hidden = !isWeekend(parseDate(dateInput.value));
  });

  form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.hidden = true;

    const invalid = [...form.elements].filter(el => el.willValidate && !el.checkValidity());
    invalid.forEach(el => el.setAttribute('aria-invalid', 'true'));
    if (invalid.length) {
      invalid[0].focus();
      invalid[0].reportValidity();
      return;
    }
    const date = parseDate(dateInput.value);
    if (isWeekend(date)) {
      weekendWarn.hidden = false;
      dateInput.focus();
      return;
    }

    const data = { event: config.eventName || '', ...Object.fromEntries(new FormData(form)) };
    data.dateLabel = date.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    try {
      if (endpoint) {
        // Apps Script web apps don't return CORS headers, so the response is opaque;
        // a network failure still rejects and lands in the catch below.
        await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) });
      } else {
        console.warn('BOOKING_CONFIG.sheetEndpoint is empty; booking was not saved.', data);
      }
      showConfirmation(data);
    } catch (err) {
      errorBox.textContent = 'We couldn’t send your request. Check your connection and try again.';
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = 'Request site visit';
    }
  });

  function showConfirmation(data) {
    const out = {
      firstName: (data.name || '').trim().split(/\s+/)[0],
      dateLabel: data.dateLabel,
      slot: data.slot,
      email: data.email,
    };
    confirmation.querySelectorAll('[data-out]').forEach(el => { el.textContent = out[el.dataset.out] || ''; });
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('reset').addEventListener('click', () => {
    form.reset();
    weekendWarn.hidden = true;
    confirmation.hidden = true;
    form.hidden = false;
    document.getElementById('name').focus();
  });
})();
