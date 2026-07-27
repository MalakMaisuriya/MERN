const { body } = require("express-validator");

const courses = [
  "Full Stack Development",
  "Frontend Engineering",
  "Backend Engineering",
  "UI UX Design",
  "Data Analytics",
  "Cyber Security",
];

const statuses = ["active", "inactive", "placed", "alumni"];
const grades = ["A+", "A", "B+", "B", "C", "D"];

const studentRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid student email.").normalizeEmail(),
  body("phone").trim().matches(/^[0-9]{10}$/).withMessage("Phone must contain exactly 10 digits."),
  body("course").isIn(courses).withMessage("Please choose a valid course."),
  body("enrollmentNumber")
    .trim()
    .isLength({ min: 4, max: 24 })
    .withMessage("Enrollment number must be 4-24 characters.")
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage("Enrollment number can use letters, numbers and hyphen only."),
  body("semester").isInt({ min: 1, max: 8 }).withMessage("Semester must be between 1 and 8."),
  body("status").isIn(statuses).withMessage("Please choose a valid status."),
  body("grade").isIn(grades).withMessage("Please choose a valid grade."),
  body("city").optional({ checkFalsy: true }).trim().isLength({ max: 60 }).withMessage("City is too long."),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters."),
];

module.exports = {
  courses,
  grades,
  statuses,
  studentRules,
};
