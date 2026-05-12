import { GoogleGenAI } from "@google/genai";
import imageCompression from "browser-image-compression";

export type Language = 'en' | 'sw' | 'rw' | 'fr';

export interface TreatmentPlan {
  chemical: string;
  organic: string;
  dosage: string;
  timeline: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface AnalysisResult {
  disease?: string;
  cause?: string;
  symptoms?: string;
  treatment?: TreatmentPlan;
  prevention?: string;
  error?: string;
  confidenceScore?: number;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning?: string;
  boundingBox?: BoundingBox;
}

const SYSTEM_INSTRUCTION = (lang: string) => `You are FarmDiag, an advanced agricultural expert AI ecosystem. 
Your job is to identify crop diseases from images or descriptions and act as a conversational agronomy assistant.

CRITICAL RULES:
1. Detect the language of the user's description (English, Kinyarwanda, Swahili, or French).
2. You MUST provide your entire response strictly in ${lang}.
3. Respond strictly in valid JSON format.

If this is a NEW diagnosis, return this structure:
{
  "disease": "Name of the disease in ${lang}",
  "cause": "What causes it in ${lang}",
  "symptoms": "Detailed description of what to look for in ${lang}",
  "treatment": {
    "chemical": "Specific chemical treatments (active ingredients) in ${lang}",
    "organic": "Specific organic/natural treatments in ${lang}",
    "dosage": "How much and how often to apply in ${lang}",
    "timeline": "Prevention and treatment timeline (e.g. apply every 7 days for 2 weeks) in ${lang}"
  },
  "prevention": "How to stop it from coming back in ${lang}",
  "confidenceScore": <a number between 0 and 100>,
  "severity": "Must be one of: Low, Medium, High, Critical (translate this word to ${lang})",
  "reasoning": "Explain WHY you chose this diagnosis based on visual cues (e.g. 'The leaf shows yellow halos around brown necrotic spots, which is typical of Early Blight') in ${lang}",
  "boundingBox": { "ymin": <0-1 float>, "xmin": <0-1 float>, "ymax": <0-1 float>, "xmax": <0-1 float> } // Provide normalized coordinates (0.0 to 1.0) roughly framing the primary diseased area in the image. If no image, omit this.
}

If the image is NOT a plant, is too blurry, or if the description is completely irrelevant to agriculture, return a JSON object with an "error" field explaining the issue in ${lang}:
{
  "error": "Short clear error message in ${lang} explaining why you cannot analyze it"
}

If the user is asking a FOLLOW-UP QUESTION in the chat, return a simple JSON with a "chatResponse" field:
{
  "chatResponse": "Your expert agronomy answer in ${lang}"
}
`;

export async function compressImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error("Image compression error:", error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export async function analyzeCropData(
  language: Language,
  imageBase64: string | null,
  description: string
): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI Service is not configured. Please add your GEMINI_API_KEY.");
  }

  const languageMap: Record<Language, string> = {
    en: 'English',
    sw: 'Swahili',
    rw: 'Kinyarwanda',
    fr: 'French'
  };

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const parts: any[] = [];
  
  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType
      }
    });
  }
  
  if (description.trim()) {
    parts.push({ text: description });
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION(languageMap[language]),
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });

      const textResponse = response.text || "{}";
      try {
        return JSON.parse(textResponse) as AnalysisResult;
      } catch (parseError) {
        throw new Error("Received an invalid response format from the AI.");
      }
    } catch (err: any) {
      retries--;
      if (retries === 0) {
        throw new Error("Something went wrong. Please check your internet connection.");
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
    }
  }
  
  throw new Error("Analysis failed after retries.");
}

export async function chatWithAI(
  language: Language,
  diseaseContext: AnalysisResult,
  question: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI Service is not configured.");
  }

  const languageMap: Record<Language, string> = {
    en: 'English',
    sw: 'Swahili',
    rw: 'Kinyarwanda',
    fr: 'French'
  };

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  // Add the current disease as context to the system instruction
  const contextInstruction = `${SYSTEM_INSTRUCTION(languageMap[language])}
  
  The user is currently viewing the diagnosis for: ${diseaseContext.disease}.
  Context:
  Cause: ${diseaseContext.cause}
  Symptoms: ${diseaseContext.symptoms}
  Treatment: ${JSON.stringify(diseaseContext.treatment)}
  `;

  try {
    const chatSession = await ai.chats.create({
      model,
      config: {
        systemInstruction: contextInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
      },
      history: history.length > 0 ? history : undefined
    });

    const response = await chatSession.sendMessage({ message: { text: question } });
    const textResponse = response.text || "{}";
    const parsed = JSON.parse(textResponse);
    return parsed.chatResponse || "I'm sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("Chat error", err);
    throw new Error("Failed to communicate with AI Agronomist.");
  }
}
