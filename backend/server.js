import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import { runTeamGA } from "./teamGA.js";
import { User } from "./models/User.js";
import findTeamsRouter from "./routes/findTeams.js"; // ✅ genetic algorithm router

const mongoUrl = 'mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test';
dotenv.config();

mongoose.connect(mongoUrl)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();
app.use(express.json());
app.use(cors());

// ---------------- CREATE USER PROFILE ----------------
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user profile', error });
  }
});

// ---------------- PARSE SKILLS VIA GEMINI AI ----------------
const ai = new GoogleGenAI(process.env.GOOGLE_AI_API_KEY || 'your-api-key');

app.post('/api/parse-skills', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing input text" });

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: "From the next message, find data tags as in what is the user skilled in. For example: If it says 'I know Java a little bit and I know C++ quite well' Java and C++ will be skills and give me beginner, intermediate or advanced as levels. Respond ONLY in JSON like { 'beginner': ['Skill1'], 'intermediate': ['Skill2'], 'advanced': ['Skill3'] }",
        temperature: 0,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      }
    });

    let textResponse = completion.response?.text() || completion.candidates?.[0]?.content?.parts?.[0]?.text;
    textResponse = textResponse.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(textResponse);
    res.json(parsed);

  } catch (error) {
    console.error('LLM parsing error:', error);
    res.status(500).json({ error: "LLM parsing failed" });
  }
});

// ---------------- EXISTING TEAMMATE FINDER (Rule-based) ----------------
app.get('/api/users/find-teammates', async (req, res) => {
  try {
    const { mySkills, myInterests, currentUserEmail } = req.query;

    if (!mySkills && !myInterests) {
      return res
        .status(400)
        .json({ message: 'Please provide skills or interests to find teammates.' });
    }

    const requiredSkills = mySkills
      ? mySkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];
    const requiredInterests = myInterests
      ? myInterests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];

    const query = { wantToBeFound: true };
    if (currentUserEmail) query.mail = { $ne: currentUserEmail };

    const potentialTeammates = await User.find(query);

    const normalizeSkills = (skillsObj) => {
      const normalized = {};
      if (!skillsObj) return normalized;
      (skillsObj.beginner || []).forEach(s => { normalized[s.toLowerCase()] = 1; });
      (skillsObj.intermediate || []).forEach(s => { normalized[s.toLowerCase()] = 2; });
      (skillsObj.advanced || []).forEach(s => { normalized[s.toLowerCase()] = 3; });
      return normalized;
    };

    const jaccard = (setA, setB) => {
      if (setA.size === 0 && setB.size === 0) return 0;
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      return union.size === 0 ? 0 : intersection.size / union.size;
    };

    const complementarity = (mySkillsObj, teammateSkillsObj) => {
      const allSkills = new Set([...Object.keys(mySkillsObj), ...Object.keys(teammateSkillsObj)]);
      if (allSkills.size === 0) return 0;
      let complementScore = 0;
      let maxPossibleScore = 0;

      allSkills.forEach(skill => {
        const myLevel = mySkillsObj[skill] || 0;
        const teammateLevel = teammateSkillsObj[skill] || 0;
        if (teammateLevel > myLevel) complementScore += (teammateLevel - myLevel);
        if (myLevel > teammateLevel) complementScore += (myLevel - teammateLevel);
        if (myLevel > 0 && teammateLevel > 0) complementScore += 0.5;
        maxPossibleScore += 3;
      });

      return complementScore / maxPossibleScore;
    };

    const skillOverlap = (mySkillsObj, teammateSkillsObj) => {
      const mySkillNames = new Set(Object.keys(mySkillsObj));
      const teammateSkillNames = new Set(Object.keys(teammateSkillsObj));
      return jaccard(mySkillNames, teammateSkillNames);
    };

    const mySkillObj = {};
    requiredSkills.forEach(skill => {
      mySkillObj[skill] = 2;
    });

    const matches = potentialTeammates
      .map(teammate => {
        const teammateSkills = normalizeSkills(teammate.skills);
        const teammateInterestsNormalized = (teammate.interests || []).map(i => i.toLowerCase());
        const complementScore = complementarity(mySkillObj, teammateSkills);
        const overlapScore = skillOverlap(mySkillObj, teammateSkills);
        const interestScore = jaccard(new Set(requiredInterests), new Set(teammateInterestsNormalized));
        const totalScore = (0.5 * complementScore) + (0.3 * interestScore) + (0.2 * overlapScore);
        return {
          teammate,
          score: totalScore,
          breakdown: {
            complementarity: complementScore,
            interests: interestScore,
            skillOverlap: overlapScore
          }
        };
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score);

    res.status(200).json(
      matches.slice(0, 50).map(match => ({
        teammate: match.teammate,
        matchScore: Math.round(match.score * 100),
        breakdown: {
          complementarity: Math.round(match.breakdown.complementarity * 100),
          interests: Math.round(match.breakdown.interests * 100),
          skillOverlap: Math.round(match.breakdown.skillOverlap * 100)
        }
      }))
    );

  } catch (error) {
    console.error('Error finding teammates:', error);
    res.status(500).json({ message: 'Server error while finding teammates', error: error.message });
  }
});

// ---------------- GET ALL USERS ----------------
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// ---------------- GET USER BY EMAIL ----------------
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ mail: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// ---------------- INTEGRATE GENETIC ALGORITHM ROUTE ----------------
app.use("/api/find-teams", findTeamsRouter); // ✅ new endpoint: /api/find-teams/:rollNo

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
