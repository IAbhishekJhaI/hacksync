import express from "express";
import { User } from "../models/User.js"; // adjust path if needed

const router = express.Router();

// ---------------- CONFIG ----------------
const TEAM_SIZE = 3;
const POPULATION_SIZE = 50;
const GENERATIONS = 100;
const MUTATION_RATE = 0.08;

// ---------------- HELPER FUNCTIONS ----------------
function similarityScore(arr1, arr2) {
  if (!arr1?.length || !arr2?.length) return 0;
  const intersection = arr1.filter(x => arr2.includes(x)).length;
  return intersection / Math.max(arr1.length, arr2.length);
}

function diversityScore(team) {
  const skillSet = new Set();
  team.forEach(u => {
    ["beginner", "intermediate", "advanced"].forEach(level => {
      (u.skills?.[level] || []).forEach(s => skillSet.add(s));
    });
  });
  return skillSet.size / (team.length * 5);
}

function fitnessFunction(user, team) {
  const interestSim =
    team.reduce((acc, mate) => acc + similarityScore(user.interests, mate.interests), 0) /
    team.length;

  const diversity = diversityScore([user, ...team]);

  // Weighted average between similarity and diversity
  return 0.6 * interestSim + 0.4 * diversity;
}

function randomTeam(others, teamSize) {
  const shuffled = [...others].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, teamSize - 1);
}

function mutateTeam(team, others) {
  if (Math.random() < MUTATION_RATE) {
    const idx = Math.floor(Math.random() * team.length);
    const replacement = others[Math.floor(Math.random() * others.length)];
    team[idx] = replacement;
  }
  return team;
}

function crossover(parent1, parent2) {
  const cut = Math.floor(Math.random() * parent1.length);
  const child = [...parent1.slice(0, cut), ...parent2.slice(cut)];
  return Array.from(new Set(child.map(p => p._id))).map(id =>
    parent1.concat(parent2).find(p => p._id.equals(id))
  );
}

// ---------------- MAIN GA FUNCTION ----------------
async function findBestTeamsForUser(user) {
  const allUsers = await User.find({ rollNo: { $ne: user.rollNo }, wantToBeFound: true });

  let population = Array.from({ length: POPULATION_SIZE }, () => randomTeam(allUsers, TEAM_SIZE));

  for (let gen = 0; gen < GENERATIONS; gen++) {
    const fitnesses = population.map(team => fitnessFunction(user, team));
    const bestFitness = Math.max(...fitnesses);
    console.log(`Generation ${gen + 1}: Best Fitness = ${bestFitness.toFixed(4)}`);

    const sorted = population
      .map((team, i) => ({ team, fit: fitnesses[i] }))
      .sort((a, b) => b.fit - a.fit);

    const parents = sorted.slice(0, POPULATION_SIZE / 2).map(p => p.team);
    const children = [];

    while (children.length < POPULATION_SIZE / 2) {
      const p1 = parents[Math.floor(Math.random() * parents.length)];
      const p2 = parents[Math.floor(Math.random() * parents.length)];
      const child = mutateTeam(crossover(p1, p2), allUsers);
      children.push(child);
    }

    population = [...parents, ...children];
  }

  const finalFitnesses = population.map(team => fitnessFunction(user, team));
  const ranked = population
    .map((team, i) => ({ team, fit: finalFitnesses[i] }))
    .sort((a, b) => b.fit - a.fit);

  return ranked.slice(0, 5); // ✅ Top 5
}

// ---------------- ROUTE HANDLER ----------------
router.get("/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const user = await User.findOne({ rollNo });

    if (!user) return res.status(404).json({ error: "User not found" });

    const topTeams = await findBestTeamsForUser(user);

    res.json({
      user: user.name,
      rollNo: user.rollNo,
      recommendations: topTeams.map((t, i) => ({
        rank: i + 1,
        fitness: t.fit.toFixed(4),
        teamMembers: t.team.map(u => ({
          name: u.name,
          rollNo: u.rollNo,
          interests: u.interests,
          keySkills: [
            ...(u.skills?.advanced || []),
            ...(u.skills?.intermediate || [])
          ].slice(0, 3)
        }))
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
