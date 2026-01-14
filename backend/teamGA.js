// teamGA.js
import { User } from "./models/User.js";

// ---------- GA PARAMETERS ----------
const TEAM_SIZE = 3;
const POPULATION_SIZE = 30;
const GENERATIONS = 50;
const MUTATION_RATE = 0.07;

// ---------- HELPERS ----------

// Convert skill levels into numbers
function normalizeSkills(skillsObj = {}) {
  const normalized = {};
  (skillsObj.beginner || []).forEach(s => (normalized[s] = 1));
  (skillsObj.intermediate || []).forEach(s => (normalized[s] = 3));
  (skillsObj.advanced || []).forEach(s => (normalized[s] = 5));
  return normalized;
}

function jaccard(setA, setB) {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function complementarity(skillsArray) {
  // Reward diversity across skill levels
  const levels = skillsArray.map(s => Object.values(s));
  return levels.flat().length ? new Set(levels.flat()).size / 10 : 0.1;
}

// ---------- GA CORE ----------

function initializePopulation(numUsers, teamSize, popSize) {
  const population = [];
  for (let i = 0; i < popSize; i++) {
    const chromosome = Array(numUsers)
      .fill()
      .map(() => Math.floor(Math.random() * Math.ceil(numUsers / teamSize)));
    population.push(chromosome);
  }
  return population;
}

function fitness(chromosome, users, teamSize) {
  const teams = {};
  chromosome.forEach((teamId, idx) => {
    if (!teams[teamId]) teams[teamId] = [];
    teams[teamId].push(users[idx]);
  });

  let totalScore = 0;
  let teamCount = 0;

  for (const team of Object.values(teams)) {
    if (team.length === 0) continue;

    let pairwiseScore = 0;
    let comparisons = 0;

    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const userA = team[i];
        const userB = team[j];
        const interestsA = new Set(userA.interests || []);
        const interestsB = new Set(userB.interests || []);
        const sim = jaccard(interestsA, interestsB);

        const comp = complementarity([
          normalizeSkills(userA.skills),
          normalizeSkills(userB.skills),
        ]);

        const pairScore = 0.4 * sim + 0.7 * comp;
        pairwiseScore += pairScore;
        comparisons++;
      }
    }

    const avgPairScore = comparisons > 0 ? pairwiseScore / comparisons : 0;
    const balancePenalty = Math.abs(team.length - teamSize) * 0.2;
    totalScore += avgPairScore - balancePenalty;
    teamCount++;
  }

  return teamCount > 0 ? totalScore / teamCount : 0;
}

function selection(population, fitnessScores) {
  const totalFitness = fitnessScores.reduce((a, b) => a + b, 0);
  const probabilities = fitnessScores.map(f => f / totalFitness);

  const selectOne = () => {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < population.length; i++) {
      sum += probabilities[i];
      if (r <= sum) return population[i];
    }
    return population[population.length - 1];
  };

  const selected = [];
  for (let i = 0; i < population.length / 2; i++) {
    selected.push(selectOne());
  }
  return selected;
}

function crossover(parent1, parent2) {
  const point = Math.floor(Math.random() * parent1.length);
  const child1 = [...parent1.slice(0, point), ...parent2.slice(point)];
  const child2 = [...parent2.slice(0, point), ...parent1.slice(point)];
  return [child1, child2];
}

function mutate(chromosome, teamCount) {
  const newChromosome = [...chromosome];
  for (let i = 0; i < newChromosome.length; i++) {
    if (Math.random() < MUTATION_RATE) {
      newChromosome[i] = Math.floor(Math.random() * teamCount);
    }
  }
  return newChromosome;
}

function getBest(population, users, teamSize) {
  let best = population[0];
  let bestScore = fitness(best, users, teamSize);
  for (const chrom of population) {
    const score = fitness(chrom, users, teamSize);
    if (score > bestScore) {
      best = chrom;
      bestScore = score;
    }
  }
  return { best, bestScore };
}

// ---------- MAIN EXECUTION ----------

export async function runTeamGA() {
  const users = await User.find({ wantToBeFound: true });

  if (users.length < TEAM_SIZE) {
    console.log("Not enough users to form teams.");
    return;
  }
  console.log(`Results for \n Population Size: ${POPULATION_SIZE} \n Generations:${GENERATIONS} \n Mutation Rate:${MUTATION_RATE}`); 
  let population = initializePopulation(users.length, TEAM_SIZE, POPULATION_SIZE);

  for (let gen = 0; gen < GENERATIONS; gen++) {
    const fitnessScores = population.map(ch => fitness(ch, users, TEAM_SIZE));
    const parents = selection(population, fitnessScores);

    const offspring = [];
    for (let i = 0; i < parents.length; i += 2) {
      const [child1, child2] = crossover(
        parents[i],
        parents[i + 1] || parents[0]
      );
      offspring.push(mutate(child1, users.length / TEAM_SIZE));
      offspring.push(mutate(child2, users.length / TEAM_SIZE));
    }

    population = [...parents, ...offspring].slice(0, POPULATION_SIZE);

    const { bestScore } = getBest(population, users, TEAM_SIZE);
    console.log(`Generation ${gen + 1}: Best Fitness = ${bestScore.toFixed(4)}`);
  }

  const { best, bestScore } = getBest(population, users, TEAM_SIZE);
  console.log("\nFinal Best Team Assignment (Fitness:", bestScore.toFixed(4), ")");
  
  // Print resulting teams
//   const teams = {};
//   best.forEach((teamId, idx) => {
//     if (!teams[teamId]) teams[teamId] = [];
//     teams[teamId].push(users[idx].name);
//   });

  console.log(teams);
}
