const Student = require("../models/Student");
const asyncHandler = require("../utils/asyncHandler");

exports.home = (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.redirect("/login");
};

exports.dashboard = asyncHandler(async (req, res) => {
  const [totalStudents, activeStudents, placedStudents, courses, recentStudents] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: "active" }),
    Student.countDocuments({ status: "placed" }),
    Student.aggregate([{ $group: { _id: "$course", total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Student.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.render("pages/dashboard", {
    title: "Dashboard",
    stats: {
      totalStudents,
      activeStudents,
      placedStudents,
      courseCount: courses.length,
    },
    courses,
    recentStudents,
  });
});
