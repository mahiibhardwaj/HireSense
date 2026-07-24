const { GoogleGenAI } = require("@google/genai");

// Debug check to verify env loading
if (!process.env.GEMINI_API_KEY) {
  console.error(" ERROR: GEMINI_API_KEY is not defined in process.env!");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================
   1. ATS ANALYSIS FUNCTION
========================= */
async function analyzeResume(resumeText, jobDescription) {
  try {
    const prompt = `
You are a senior ATS resume evaluator and recruiter.

Analyze resume vs job description and return STRICT JSON.

RULES:
- Be strict and realistic
- Return ONLY valid JSON
- No markdown, no explanation

FORMAT:
{
  "matchScore": number,
  "strengths": string[],
  "missingSkills": string[],
  "suggestions": string[]
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Clean shortcut provided by @google/genai
    const text = result.text;

    if (!text) throw new Error("Empty Gemini response");

    return JSON.parse(text);

  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    throw err;
  }
}

/* =========================
   2. RESUME REWRITE FUNCTION
========================= */
async function rewriteResume(resumeText, jobDescription) {
  try {
    const prompt = `
You are an expert ATS resume writer.

Rewrite the resume for maximum ATS optimization.

RULES:
- Improve clarity and structure
- Add relevant ATS keywords from job description
- Keep it realistic (DO NOT invent experience)
- Return ONLY improved resume text
- No JSON, no explanation

RESUME:
${resumeText}
JOB DESCRIPTION:
${jobDescription}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    return text;

  } catch (err) {
    console.error("REWRITE ERROR:", err);
    throw err;
  }
}

module.exports = {
  analyzeResume,
  rewriteResume,
};