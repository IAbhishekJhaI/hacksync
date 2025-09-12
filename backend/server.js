
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const mongoUrl ='mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test';
dotenv.config();

mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(express.json()); 
app.use(cors());

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true }, // Using unique to prevent duplicate roll numbers
    mail: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    skills: {
        beginner: [String],
        intermediate: [String],
        advanced: [String],
    },
    //hostel: { type: String, default: null },
    interests: [String],
    wantToBeFound: { type: Boolean, default: true },
});

const User = mongoose.model('User', userSchema);

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user profile', error });
    }
});
const ai = new GoogleGenAI({});
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
    //console.log("Parsed skills:", parsed);
    res.json(parsed);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "LLM parsing failed" });
  }
});

app.get('/api/users/find-teammates', async (req, res) => {
    try {
        const { mySkills, myInterests } = req.query;
        if (!mySkills && !myInterests) {
            return res.status(400).json({ message: 'Please provide skills or interests to find teammates.' });
        }
        const requiredSkills = mySkills ? mySkills.split(',') : [];
        const requiredInterests = myInterests ? myInterests.split(',') : [];

        const potentialTeammates = await User.find({ wantToBeFound: true });
        const matches = potentialTeammates.map(teammate => {
            let score = 0;
            requiredSkills.forEach(skill => {
                if (teammate.skills.advanced.includes(skill)) {
                    score += 3; // High score for advanced match
                } else if (teammate.skills.intermediate.includes(skill)) {
                    score += 2;
                } else if (teammate.skills.beginner.includes(skill)) {
                    score += 1;
                }
            });
            // Score based on matching interests
            requiredInterests.forEach(interest => {
                if (teammate.interests.includes(interest)) {
                    score += 1;
                }
            });

            // A basic check to ensure the user isn't matching with themselves
            // To-Do: use a user ID to filter this out

            return { teammate, score };
        }).filter(match => match.score > 0) // Only include users with at least one match
          .sort((a, b) => b.score - a.score); // Sort by score in descending order

        res.status(200).json(matches.map(match => ({
            teammate: match.teammate,
            matchScore: match.score.toFixed(2),
        })));

    } catch (error) {
        res.status(500).json({ message: 'Server error while finding teammates', error });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});