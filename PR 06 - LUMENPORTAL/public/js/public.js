document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-flash-dismiss]').forEach((banner) => {
    const closeButton = banner.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => banner.remove());
    }
    setTimeout(() => banner.remove(), 5000);
  });
});
