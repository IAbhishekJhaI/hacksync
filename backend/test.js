import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import { runTeamGA } from "./teamGA.js";
import { User } from "./models/User.js";
import findTeamsRouter from "./routes/findTeams.js";

const mongoUrl ='mongodb+srv://admin:k4g8bhGr2qureYJJ@cluster0.ry2odsn.mongodb.net/hacksync_test';
dotenv.config();

mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(express.json()); 
app.use(cors());

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user profile', error });
    }
});

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

// New improved teammate finding algorithm
app.get('/api/users/find-teammates', async (req, res) => {
    try {
        const { mySkills, myInterests, currentUserEmail } = req.query;

        if (!mySkills && !myInterests) {
            return res
                .status(400)
                .json({ message: 'Please provide skills or interests to find teammates.' });
        }

        // Parse comma-separated inputs and normalize case
        const requiredSkills = mySkills 
            ? mySkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0)
            : [];
        const requiredInterests = myInterests 
            ? myInterests.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0)
            : [];

        // Fetch potential teammates who want to be found (excluding current user if email provided)
        const query = { wantToBeFound: true };
        if (currentUserEmail) {
            query.mail = { $ne: currentUserEmail };
        }
        const potentialTeammates = await User.find(query);

        // Helper: flatten skill levels into numeric values with case normalization
        const normalizeSkills = (skillsObj) => {
            const normalized = {};
            if (!skillsObj) return normalized;
            
            // Normalize all skills to lowercase for better matching
            (skillsObj.beginner || []).forEach(s => {
                normalized[s.toLowerCase()] = 1;
            });
            (skillsObj.intermediate || []).forEach(s => {
                normalized[s.toLowerCase()] = 2;
            });
            (skillsObj.advanced || []).forEach(s => {
                normalized[s.toLowerCase()] = 3;
            });
            return normalized;
        };

        // Jaccard similarity coefficient
        const jaccard = (setA, setB) => {
            if (setA.size === 0 && setB.size === 0) return 0;
            const intersection = new Set([...setA].filter(x => setB.has(x)));
            const union = new Set([...setA, ...setB]);
            return union.size === 0 ? 0 : intersection.size / union.size;
        };

        // Fixed complementarity score - measures how well skills complement each other
        const complementarity = (mySkillsObj, teammateSkillsObj) => {
            const allSkills = new Set([...Object.keys(mySkillsObj), ...Object.keys(teammateSkillsObj)]);
            if (allSkills.size === 0) return 0;

            let complementScore = 0;
            let maxPossibleScore = 0;

            allSkills.forEach(skill => {
                const myLevel = mySkillsObj[skill] || 0;
                const teammateLevel = teammateSkillsObj[skill] || 0;
                
                // Award points for skills where teammate is stronger (can teach me)
                if (teammateLevel > myLevel) {
                    complementScore += (teammateLevel - myLevel);
                }
                // Award points for skills where I'm stronger (I can contribute)
                if (myLevel > teammateLevel) {
                    complementScore += (myLevel - teammateLevel);
                }
                // Award small points for matching skill levels (good collaboration)
                if (myLevel > 0 && teammateLevel > 0) {
                    complementScore += 0.5;
                }
                
                maxPossibleScore += 3; // Maximum possible difference is 3
            });

            return maxPossibleScore === 0 ? 0 : complementScore / maxPossibleScore;
        };

        // Skill overlap score - rewards having some common skills for collaboration
        const skillOverlap = (mySkillsObj, teammateSkillsObj) => {
            const mySkillNames = new Set(Object.keys(mySkillsObj));
            const teammateSkillNames = new Set(Object.keys(teammateSkillsObj));
            return jaccard(mySkillNames, teammateSkillNames);
        };

        // Normalize input skills (assume intermediate level by default)
        const mySkillObj = {};
        requiredSkills.forEach(skill => {
            mySkillObj[skill] = 2; // Default to intermediate level
        });

        // Compute match score for each teammate
        const matches = potentialTeammates
            .map(teammate => {
                // Normalize teammate skills with case insensitive matching
                const teammateSkills = normalizeSkills(teammate.skills);

                // Normalize teammate interests for case insensitive matching
                const teammateInterestsNormalized = (teammate.interests || [])
                    .map(interest => interest.toLowerCase());

                // Compute complementary skill score
                const complementScore = complementarity(mySkillObj, teammateSkills);
                
                // Compute skill overlap score
                const overlapScore = skillOverlap(mySkillObj, teammateSkills);
                
                // Compute interest similarity
                const interestScore = jaccard(
                    new Set(requiredInterests), 
                    new Set(teammateInterestsNormalized)
                );

                // Weighted total score with improved weighting
                // Higher weight on complementarity (what they can teach/learn from each other)
                // Moderate weight on interests (shared goals/passions)
                // Lower weight on skill overlap (some common ground is good but not most important)
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
            .filter(match => match.score > 0) // Only include matches with some relevance
            .sort((a, b) => b.score - a.score); // Sort by score descending

        // Return results with percentage scores
        res.status(200).json(
            matches.map(match => ({
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

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Get user by email
app.get('/api/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ mail: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});