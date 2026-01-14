import mongoose from "mongoose";
import { faker } from "@faker-js/faker"; // install this package
import { User } from "./models/User.js"; // adjust import if needed


// --------------- CONFIG ---------------
const MONGO_URI = "mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test";
const TOTAL_USERS = 50000;

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Krishna", "Ishaan", "Rohan", "Atharv",
  "Ayaan", "Ananya", "Diya", "Aarohi", "Isha", "Saanvi", "Meera", "Priya", "Kavya",
  "Nisha", "Aditi", "Shruti", "Tanvi", "Sneha", "Ritika", "Pooja", "Riya", 
  "Harshita", "Abhishek", "Siddharth", "Yash", "Karan", "Devansh", "Lakshya",
  "Shaurya", "Tanishq", "Parth", "Aniket", "Rudra", "Samar", "Kabir", "Aarush",
   "Dhruv", "Om", "Veer", "Zayan", "Aahan", "Ritvik", "Lakshay", "Advik", "Divyansh",
   "Vineet", "Pranav", "Sahil", "Manan", "Gaurav", "Nikhil", "Ansh", "Aayush", "Raghav",
   "Manav", "Yuvraj", "Kshitij", "Anirudh", "Shaunak", "Tushar", "Ujjwal", "Ritansh",
   "Darsh", "Amod", "Chirag", "Jatin", "Kunal", "Mayank", "Naman", "Parthiv", "Rachit",
   "Saurabh", "Tejas", "Uday", "Vikram", "Yashwant"

];

const lastNames = [
  "Patel", "Sharma", "Verma", "Gupta", "Reddy", "Nair", "Iyer", "Das", "Ghosh",
  "Mehta", "Agarwal", "Jha", "Singh", "Chowdhury", "Mishra", "Yadav",
  "Bansal", "Chatterjee", "Sinha", "Pandey", "Raj", "Bora", "Dutta", "Shrivastava",
  "Chakraborty", "Trivedi", "Joshi", "Tiwari", "Dubey",
   "Bhattacharya", "Kapoor", "Malhotra", "Agrawal", "Vats", "Kashyap", "Mohanty", "Sahoo"
];

// Common skill and interest pools
const skillPool = [
  "C", "C++", "Java", "Python", "JavaScript", "HTML", "CSS", "React", "Node.js",
  "MongoDB", "SQL", "Machine Learning", "Data Analysis", "Cloud", "Networking",
  "Cybersecurity", "Blockchain", "UI/UX", "AI", "Flutter", "Kotlin", "Go", "Rust", "Swift",
    "Django", "Ruby on Rails", "PHP", "TypeScript", "Angular", "Vue.js",
    "GraphQL", "Hadoop", "React"
];

const interestPool = [
  "Hackathons", "Case Studies", "App Development", "Web Development",
  "Research", "Competitive Programming", "Open Source", "Business",
  "Finance", "Design", "Startups", "Data Science", "Cybersecurity", "Robotics",
    "Gaming", "Cloud Computing", "IoT", "AR/VR", "Social Impact", "Health Tech",
    "EdTech", "FinTech"
];

// --------------- RANDOM HELPERS ---------------
function randomSubset(arr, min, max) {
  const size = faker.number.int({ min, max });
  return faker.helpers.shuffle(arr).slice(0, size);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSkillLevels() {
  const beginner = randomSubset(skillPool, 1, 4);
  const intermediate = randomSubset(skillPool, 2, 5).filter(s => !beginner.includes(s));
  const advanced = randomSubset(skillPool, 1, 3).filter(s => !beginner.includes(s) && !intermediate.includes(s));
  return { beginner, intermediate, advanced };
}

// --------------- MAIN SEED FUNCTION ---------------
async function seedUsers() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB ✅");

  await User.deleteMany({});
  console.log("Cleared existing users.");

  const users = [];
  const usedRolls = new Set();

  for (let i = 0; i < TOTAL_USERS; i++) {
    const fullName = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    let rollNo;
    do {
        const randomDigits = faker.number.int({ min: 1000, max: 99999 });
        rollNo = `2205${randomDigits}`;
    } while (usedRolls.has(rollNo));
    usedRolls.add(rollNo);

    const mail = `${rollNo.replace(/\s+/g, "")}@kiit.ac.in`;
    const phoneNumber = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const skills = generateSkillLevels();
    const interests = randomSubset(interestPool, 2, 5);
    const wantToBeFound = true;

    users.push({
      name: fullName,
      rollNo,
      mail,
      phoneNumber,
      skills,
      interests,
      wantToBeFound
    });
  }

  await User.insertMany(users);
  console.log(`✅ Inserted ${users.length} users successfully.`);

  await mongoose.connection.close();
  console.log("Database connection closed.");
}

seedUsers().catch(err => console.error(err));
