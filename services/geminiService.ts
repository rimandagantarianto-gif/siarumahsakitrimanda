import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Ideally, in a real app, backend proxying is preferred to hide the key, 
// but for this prototype, we use the env variable directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a highly constrained clinical administrative assistant for a hospital.
Your tasks are strictly limited to documentation formatting and summarization.

RULES:
1. You MUST NOT diagnose conditions, recommend treatments, or offer medical advice.
2. If the input text contains PHI (Protected Health Information), handle it securely by treating it as confidential context.
3. Your output is a DRAFT for the physician to review.
4. Maintain a professional, objective tone.
5. Identify yourself as an AI assistant in the output if asked.
6. Do not introduce bias based on race, gender, or religion.
`;

export const summarizeClinicalNote = async (rawNote: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; // Using Flash for speed and text tasks
    
    const prompt = `
    Please convert the following unstructured clinical notes into a structured "After Visit Summary" format (S.O.A.P note structure preferred if applicable).
    
    Raw Notes:
    "${rawNote}"
    
    Output Format:
    **Subjective:** [Patient complaints]
    **Objective:** [Observations/Vitals]
    **Assessment:** [Summary of condition - DO NOT DIAGNOSE NEWLY, only summarize stated facts]
    **Plan:** [Next steps mentioned]
    
    ---
    DISCLAIMER: This summary is AI-generated and must be verified by a licensed clinician.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual consistency
      }
    });

    return response.text || "Error: No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to process the request due to an API error. Please check your connection or API key.";
  }
};