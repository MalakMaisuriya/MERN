const allowedSorts = new Map([
  ["newest", { createdAt: -1 }],
  ["oldest", { createdAt: 1 }],
  ["name_asc", { name: 1 }],
  ["name_desc", { name: -1 }],
  ["semester_asc", { semester: 1 }],
  ["semester_desc", { semester: -1 }],
]);

function buildStudentQuery(query) {
  const filter = {};
  const search = String(query.search || "").trim();
  const course = String(query.course || "").trim();
  const status = String(query.status || "").trim();

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { enrollmentNumber: new RegExp(search, "i") },
    ];
  }

  if (course) filter.course = course;
  if (status) filter.status = status;

  return filter;
}

function getSort(sortKey) {
  return allowedSorts.get(sortKey) || allowedSorts.get("newest");
}

function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = 8;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

module.exports = {
  buildStudentQuery,
  getPagination,
  getSort,
};
