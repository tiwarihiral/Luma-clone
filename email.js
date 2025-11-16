// Lightweight client script to collect application data and send to backend
(function() {
    const EMAIL_API_ENDPOINT = (window.EMAIL_API_ENDPOINT || '/api/send-email');
    // Change recipient in backend: server.js (EMAIL_RECIPIENT or .env EMAIL_RECIPIENT)

    function getJobTitle() {
        const el = document.querySelector('.job-title-main');
        return el ? el.textContent.trim() : document.title.replace(/\s*-\s*AIGETAI.*$/i, '').trim();
    }

    function getApplicationRoot() {
        return document.getElementById('application') || document;
    }

    function collectFields() {
        const root = getApplicationRoot();
        const fields = {};
        const elements = root.querySelectorAll('input, textarea, select');
        elements.forEach((el) => {
            const type = (el.getAttribute('type') || '').toLowerCase();
            const name = el.name || el.id || el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'field';
            let value = '';
            if (type === 'radio') {
                if (el.checked) value = el.value;
                else return;
            } else if (type === 'checkbox') {
                value = el.checked ? (el.value || 'Yes') : 'No';
            } else if (el.tagName.toLowerCase() === 'select') {
                value = el.value;
            } else {
                value = el.value;
            }
            const labelEl = el.id ? root.querySelector(`label[for="${el.id}"]`) : null;
            const label = labelEl ? labelEl.textContent.trim().replace(/\*$/, '').trim() : null;
            const key = (label || name).replace(/\s+/g, ' ').trim();
            if (key) fields[key] = value;
        });
        return fields;
    }

    function sendEmailPayload(payload) {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' });
            const ok = navigator.sendBeacon(EMAIL_API_ENDPOINT, blob);
            if (ok) return Promise.resolve();
        }
        return fetch(EMAIL_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        }).then(() => undefined).catch(() => undefined);
    }

    function handleSubmitEvent(e) {
        try {
            const payload = {
                jobTitle: getJobTitle(),
                pageUrl: window.location.href,
                fields: collectFields()
            };
            sendEmailPayload(payload);
        } catch (_) {}
    }

    function wireUp() {
        const form = document.getElementById('applicationForm');
        if (form) {
            form.addEventListener('submit', handleSubmitEvent, { capture: true });
        }
        const submitButtons = document.querySelectorAll('#application button[type="submit"], .apply-button-section button[type="submit"]');
        submitButtons.forEach((btn) => {
            btn.addEventListener('click', handleSubmitEvent, { capture: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireUp);
    } else {
        wireUp();
    }
})();


