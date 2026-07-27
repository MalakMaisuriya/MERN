require("dotenv").config();

const connectDatabase = require("../config/database");
const User = require("../models/User");
const Student = require("../models/Student");

const students = [
  {
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "9876543210",
    course: "Full Stack Development",
    enrollmentNumber: "SV-2026-001",
    semester: 4,
    status: "active",
    grade: "A",
    city: "Ahmedabad",
  },
  {
    name: "Nisha Shah",
    email: "nisha.shah@example.com",
    phone: "9876501234",
    course: "UI UX Design",
    enrollmentNumber: "SV-2026-002",
    semester: 2,
    status: "active",
    grade: "A+",
    city: "Surat",
  },
  {
    name: "Dev Patel",
    email: "dev.patel@example.com",
    phone: "9825012345",
    course: "Data Analytics",
    enrollmentNumber: "SV-2026-003",
    semester: 5,
    status: "placed",
    grade: "B+",
    city: "Vadodara",
  },
];

async function seed() {
  await connectDatabase();

  const adminEmail = "admin@studentverse.test";
  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      name: "StudentVerse Admin",
      email: adminEmail,
      password: "Admin@12345",
    });
  }

  for (const student of students) {
    await Student.updateOne(
      { email: student.email },
      { $setOnInsert: student },
      { upsert: true, runValidators: true }
    );
  }

  console.log("Seed completed");
  console.log("Login: admin@studentverse.test / Admin@12345");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
