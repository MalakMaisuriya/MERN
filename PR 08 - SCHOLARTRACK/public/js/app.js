document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm') || 'Are you sure?';
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.closest('form')?.addEventListener('submit', () => {
      button.classList.add('is-processing');
      button.setAttribute('aria-busy', 'true');
    });
  });
});
