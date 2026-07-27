const mongoose = require("mongoose");
const validator = require("validator");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
      enum: [
        "Full Stack Development",
        "Frontend Engineering",
        "Backend Engineering",
        "UI UX Design",
        "Data Analytics",
        "Cyber Security",
      ],
    },
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 24,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "placed", "alumni"],
      default: "active",
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C", "D"],
      default: "B+",
    },
    city: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

studentSchema.index({ name: "text", email: "text", course: "text", enrollmentNumber: "text" });

module.exports = mongoose.model("Student", studentSchema);
