const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");

// Every original Nozha component/demo page, now served as a protected EJS view
const ALLOWED_PAGES = [
  "Chart", "Icon", "Input", "alert", "animation", "badge", "breadcrumb",
  "button", "card", "collapse", "color", "dark-mode", "dark", "fa",
  "jumborton", "modal", "pagination", "progress", "rtl", "toast",
  "typo", "widget",
];

router.get("/ui/:page", ensureAuthenticated, (req, res) => {
  const page = req.params.page;
  if (!ALLOWED_PAGES.includes(page)) {
    return res.status(404).send("Page not found");
  }
  res.render("ui-page", { title: page, page });
});

module.exports = router;
