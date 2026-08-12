(() => {
  const form = document.querySelector('.contact-form');
  if (!form || !window.fetch || !window.FormData || !window.URLSearchParams) return;

  const errorMessage = form.querySelector('.contact-form-error');
  const card = document.querySelector('#contact-form-card');
  const isEnglish = document.documentElement.lang === 'en';

  form.addEventListener('submit', async event => {
    if (!form.reportValidity()) return;
    event.preventDefault();
    form.setAttribute('aria-busy', 'true');
    errorMessage.hidden = true;

    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      card.innerHTML = `<div class="contact-success" role="status" aria-live="polite" tabindex="-1"><h2>${isEnglish ? 'Message sent' : 'Message envoyé'}</h2><p>${isEnglish ? 'Thank you. Our team will get back to you shortly.' : 'Merci. Notre équipe revient vers vous rapidement.'}</p></div>`;
      card.querySelector('.contact-success').focus();
    } catch (error) {
      form.removeAttribute('aria-busy');
      errorMessage.hidden = false;
      errorMessage.focus?.();
    }
  });
})();
