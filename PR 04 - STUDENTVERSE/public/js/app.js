const storedTheme = localStorage.getItem("studentverse-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

document.documentElement.dataset.theme = initialTheme;

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("studentverse-theme", nextTheme);
  });
});

document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!window.confirm(form.dataset.confirm)) {
      event.preventDefault();
    }
  });
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", () => {
    const submitButton = form.querySelector("button[type='submit']");
    if (!submitButton || form.dataset.confirm) return;
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
  });
});

window.setTimeout(() => {
  document.querySelectorAll(".toast").forEach((toast) => {
    toast.classList.add("hide");
    window.setTimeout(() => toast.remove(), 240);
  });
}, 4200);
