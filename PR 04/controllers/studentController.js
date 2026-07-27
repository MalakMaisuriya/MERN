const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Student = require("../models/Student");
const asyncHandler = require("../utils/asyncHandler");
const { courses, grades, statuses } = require("../validators/studentValidator");
const { buildStudentQuery, getPagination, getSort } = require("../utils/queryBuilder");

function validationErrors(req) {
  return validationResult(req)
    .array()
    .reduce((errors, error) => {
      errors[error.path] = error.msg;
      return errors;
    }, {});
}

function formOptions() {
  return { courses, grades, statuses };
}

function normalizePayload(body) {
  return {
    name: body.name,
    email: body.email,
    phone: body.phone,
    course: body.course,
    enrollmentNumber: String(body.enrollmentNumber || "").toUpperCase(),
    semester: Number(body.semester),
    status: body.status,
    grade: body.grade,
    city: body.city,
    notes: body.notes,
  };
}

async function hasDuplicate(payload, currentId = null) {
  const duplicate = await Student.findOne({
    _id: { $ne: currentId },
    $or: [{ email: payload.email }, { enrollmentNumber: payload.enrollmentNumber }],
  });

  if (!duplicate) return null;
  if (duplicate.email === payload.email) return { email: "Email is already used by another student." };
  return { enrollmentNumber: "Enrollment number already exists." };
}

exports.index = asyncHandler(async (req, res) => {
  const filter = buildStudentQuery(req.query);
  const sort = getSort(req.query.sort);
  const { page, limit, skip } = getPagination(req.query);

  const [students, total] = await Promise.all([
    Student.find(filter).sort(sort).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  res.render("students/index", {
    title: "Students",
    students,
    query: req.query,
    options: formOptions(),
    pagination: {
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
      total,
      limit,
    },
  });
});

exports.create = (req, res) => {
  res.render("students/form", {
    title: "Add Student",
    mode: "create",
    student: {},
    errors: {},
    options: formOptions(),
  });
};

exports.store = asyncHandler(async (req, res) => {
  const errors = validationErrors(req);
  const payload = normalizePayload(req.body);

  if (!Object.keys(errors).length) {
    Object.assign(errors, (await hasDuplicate(payload)) || {});
  }

  if (Object.keys(errors).length) {
    return res.status(422).render("students/form", {
      title: "Add Student",
      mode: "create",
      student: payload,
      errors,
      options: formOptions(),
    });
  }

  await Student.create(payload);
  req.flash("success", "Student profile created successfully.");
  res.redirect("/students");
});

exports.show = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();

  const student = await Student.findById(req.params.id);
  if (!student) return next();

  res.render("students/show", {
    title: student.name,
    student,
  });
});

exports.edit = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();

  const student = await Student.findById(req.params.id);
  if (!student) return next();

  res.render("students/form", {
    title: "Edit Student",
    mode: "edit",
    student,
    errors: {},
    options: formOptions(),
  });
});

exports.update = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();

  const student = await Student.findById(req.params.id);
  if (!student) return next();

  const errors = validationErrors(req);
  const payload = normalizePayload(req.body);

  if (!Object.keys(errors).length) {
    Object.assign(errors, (await hasDuplicate(payload, student._id)) || {});
  }

  if (Object.keys(errors).length) {
    return res.status(422).render("students/form", {
      title: "Edit Student",
      mode: "edit",
      student: { ...payload, _id: student._id },
      errors,
      options: formOptions(),
    });
  }

  await Student.findByIdAndUpdate(student._id, payload, { runValidators: true });
  req.flash("success", "Student profile updated successfully.");
  res.redirect(`/students/${student._id}`);
});

exports.destroy = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next();

  const deletedStudent = await Student.findByIdAndDelete(req.params.id);
  if (!deletedStudent) return next();

  req.flash("success", "Student profile deleted.");
  res.redirect("/students");
});
