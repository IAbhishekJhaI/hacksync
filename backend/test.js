import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({apiKey: "AIzaSyDqEMQOygXrh1k_8_pJ92ENz9r0v6e7klo"});

const { text } = { text: "I know Java a little bit and I know C++ quite well" };
async function main() {
  const response = await ai.models.generateContent({
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
  console.log(response.text);
}

await main();

