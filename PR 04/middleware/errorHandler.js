function notFound(req, res) {
  res.status(404).render("errors/404", {
    title: "Page not found",
  });
}

function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);

  console.error(error);
  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : error.message;

  res.status(statusCode).render("errors/500", {
    title: "Application error",
    message,
  });
}

module.exports = {
  handleError,
  notFound,
};
