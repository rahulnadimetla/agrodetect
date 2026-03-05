import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PredictionResult {
  disease: string;
  confidence: number;
  description: string;
}

export async function analyzeLeafImage(base64Image: string): Promise<PredictionResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this plant leaf image for diseases. 
    Identify the most likely disease or if the leaf is healthy.
    Return the result in JSON format with the following structure:
    {
      "disease": "Name of the disease (or 'Healthy')",
      "confidence": 0.95,
      "description": "A brief 1-2 sentence description of the findings."
    }
    
    Common diseases include: Apple Scab, Apple Black Rot, Cedar Apple Rust, Corn Common Rust, Tomato Early Blight, Tomato Late Blight, Powdery Mildew.
    If you are unsure, provide the most likely candidate based on visual symptoms.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disease: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ["disease", "confidence", "description"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      disease: result.disease || "Unknown",
      confidence: result.confidence || 0.0,
      description: result.description || "No description available.",
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
