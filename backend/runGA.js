import mongoose from "mongoose";
import { runTeamGA } from "./teamGA.js";

mongoose.connect("mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test")
  .then(async () => {
    console.log("Connected to MongoDB");
    await runTeamGA();
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
