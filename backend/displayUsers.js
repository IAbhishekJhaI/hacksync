import mongoose from "mongoose";
import { User } from "./models/User.js";

const MONGO_URI = "mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test";

async function showUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({}, { __v: 0 }).lean();

    console.log(`\n📋 Found ${users.length} users:\n`);
    users.forEach((u, i) => {
      console.log(
        `${i + 1}. ${u.name} (${u.rollNo}) | ${u.mail} | Hostel: ${u.hostel}`
      );
      console.log(`   Skills: Beginner(${u.skills.beginner.join(", ")}), Intermediate(${u.skills.intermediate.join(", ")}), Advanced(${u.skills.advanced.join(", ")})`);
      console.log(`   Interests: ${u.interests.join(", ")}`);
      console.log("--------------------------------------------------");
    });

    await mongoose.connection.close();
    console.log("\n🔒 Connection closed.");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

showUsers();
