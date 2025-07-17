// File: netlify/functions/process-diagnostic.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from the environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The instruction prompt for the AI
// This is the most important part! We tell the AI exactly how to behave
// and what format to return the data in.
const getInstructionPrompt = (dimensionName, userText) => `
  You are an expert life-planning assistant integrated into an application called Livia.
  Your task is to analyze a user's free-form text about a specific life dimension and extract actionable items.

  The life dimension is: "${dimensionName}".
  The user's input is: "${userText}".

  From the user's input, perform the following actions:
  1.  Identify 1-3 distinct challenges.
  2.  Identify 1-3 distinct goals.
  3.  Based on the goals and challenges, suggest 1-2 relevant projects. A project is a larger effort with a clear outcome.
  4.  Based on the goals and challenges, suggest 1-2 relevant routines. A routine is a recurring action. For each routine, specify a frequency (daily, weekly, or monthly).

  You MUST return the output as a valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The JSON object must have the following structure:
  {
    "challenges": [{"name": "A short description of the challenge"}],
    "goals": [{"name": "A short, actionable goal statement", "status": 0, "importance": "Medium"}],
    "projects": [{"name": "A descriptive project name", "status": 0, "importance": "Medium"}],
    "routines": [{"name": "A descriptive routine name", "frequency": "daily|weekly|monthly", "importance": "Medium", "compliance": false}]
  }

  If you cannot find any items for a category, return an empty array for that key (e.g., "challenges": []).
`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { dimensionName, userText } = JSON.parse(event.body);

    if (!userText || !dimensionName) {
        // If the user didn't type anything, return empty arrays.
        return {
            statusCode: 200,
            body: JSON.stringify({ challenges: [], goals: [], projects: [], routines: [] }),
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = getInstructionPrompt(dimensionName, userText);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedJsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    // We will parse it here to ensure it's valid before sending it to the client
    const parsedJson = JSON.parse(cleanedJsonText);

    return {
      statusCode: 200,
      body: JSON.stringify(parsedJson),
    };
  } catch (error) {
    console.error("Error processing with Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process your request with the AI." }),
    };
  }
};