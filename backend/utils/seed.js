/* Seeds the database with demo clubs, users, events, requests and notifications.
   Run with: npm run seed  (from the backend folder, after setting MONGO_URI in .env) */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Club = require("../models/Club");
const Event = require("../models/Event");
const Request = require("../models/Request");
const Notification = require("../models/Notification");

async function seed() {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    Event.deleteMany({}),
    Request.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log("Creating clubs...");
  const clubDefs = [
    { name: "Coding Club", icon: "💻", description: "Programming, development and competitive coding.", memberCount: 125 },
    { name: "Robotics Club", icon: "🤖", description: "Build robots, automate ideas and learn hardware.", memberCount: 78 },
    { name: "Gaming Club", icon: "🎮", description: "Esports, tournaments and gaming community.", memberCount: 150 },
    { name: "Photography Club", icon: "📷", description: "Photography walks, editing and creative media.", memberCount: 64 },
    { name: "Cultural Club", icon: "🎭", description: "Music, dance, drama and college celebrations.", memberCount: 110 },
    { name: "Literary Club", icon: "📚", description: "Writing, debates, poetry and public speaking.", memberCount: 53 },
  ];
  const clubs = await Club.insertMany(clubDefs);

  console.log("Creating users...");
  const clubAdminNames = ["Rahul Sharma", "Priya Singh", "Arjun Verma", "Neha Gupta", "Karan Mehta", "Simran Kapoor"];
  const clubAdmins = [];
  for (let i = 0; i < clubs.length; i++) {
    const email = clubAdminNames[i].toLowerCase().replace(" ", ".") + "@college.edu";
    const admin = await User.create({
      name: clubAdminNames[i],
      email,
      password: "password123",
      role: "clubadmin",
      club: clubs[i]._id,
    });
    clubs[i].admin = admin._id;
    clubs[i].adminName = admin.name;
    await clubs[i].save();
    clubAdmins.push(admin);
  }

  const superAdmin = await User.create({
    name: "Super Admin",
    email: "superadmin@college.edu",
    password: "password123",
    role: "superadmin",
  });

  const demoStudent = await User.create({
    name: "Dhruv Singh",
    email: "student@college.edu",
    password: "password123",
    role: "student",
    joinedClubs: [clubs[0]._id, clubs[1]._id],
  });

  const otherStudentDefs = [
    { name: "Rohan Kumar", email: "rohan@college.edu" },
    { name: "Ananya Verma", email: "ananya@college.edu" },
    { name: "Vivek Sharma", email: "vivek@college.edu" },
    { name: "Priya Sharma", email: "priya.sharma@college.edu" },
  ];
  const otherStudents = [];
  for (const s of otherStudentDefs) {
    otherStudents.push(await User.create({ ...s, password: "password123", role: "student" }));
  }

  console.log("Creating events...");
  const eventDefs = [
    { name: "Campus Hackathon 2026", club: clubs[0], date: "2026-09-12", time: "10:00 AM", venue: "Computer Lab 3", description: "24-hour coding challenge for college students.", status: "Approved" },
    { name: "Inter College Gaming Tournament", club: clubs[2], date: "2026-09-18", time: "11:00 AM", venue: "Auditorium", description: "Competitive gaming tournament.", status: "Approved" },
    { name: "Photography Walk", club: clubs[3], date: "2026-09-20", time: "7:00 AM", venue: "Main Gate", description: "Explore the city and capture creative shots.", status: "Approved" },
    { name: "Cultural Fest 2026", club: clubs[4], date: "2026-09-25", time: "5:00 PM", venue: "Main Ground", description: "Annual college cultural celebration.", status: "Approved" },
    { name: "Robotics Workshop", club: clubs[1], date: "2026-10-03", time: "2:00 PM", venue: "Innovation Lab", description: "Hands-on robotics workshop.", status: "Pending" },
  ];
  for (const e of eventDefs) {
    await Event.create({
      name: e.name,
      club: e.club._id,
      clubName: e.club.name,
      date: e.date,
      time: e.time,
      venue: e.venue,
      description: e.description,
      status: e.status,
    });
  }

  console.log("Creating membership requests...");
  await Request.create([
    { student: otherStudents[0]._id, name: otherStudents[0].name, email: otherStudents[0].email, club: clubs[0]._id, clubName: clubs[0].name },
    { student: otherStudents[1]._id, name: otherStudents[1].name, email: otherStudents[1].email, club: clubs[1]._id, clubName: clubs[1].name },
    { student: otherStudents[2]._id, name: otherStudents[2].name, email: otherStudents[2].email, club: clubs[2]._id, clubName: clubs[2].name },
  ]);

  console.log("Creating notifications...");
  await Notification.create([
    { title: "Campus Hackathon 2026", message: "Registration is now open. Seats are limited.", scope: "All Students" },
    { title: "Coding Club Meeting", message: "Weekly meeting tomorrow at 4 PM in Lab 3.", scope: "Coding Club Members" },
    { title: "Gaming Tournament", message: "Registration closes on September 15.", scope: "Gaming Club Members" },
  ]);

  console.log("\nSeed complete! Demo accounts (password: password123):");
  console.log("  Student:     student@college.edu");
  console.log("  Club Admin:  rahul.sharma@college.edu (Coding Club)");
  console.log("  Super Admin: superadmin@college.edu");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
