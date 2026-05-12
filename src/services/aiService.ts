import { GoogleGenAI } from "@google/genai";
import imageCompression from "browser-image-compression";

export type Language = 'en' | 'sw' | 'rw' | 'fr';

export interface AnalysisResult {
  disease?: string;
  cause?: string;
  symptoms?: string;
  treatment?: string;
  prevention?: string;
  error?: string;
  confidenceScore?: number;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning?: string;
}

const SYSTEM_INSTRUCTION = (lang: string) => `You are FarmDiag, an agricultural expert AI. 
Your job is to identify crop diseases from images or descriptions. 
You provide simple, practical, and affordable advice for small-scale farmers, especially in Africa.

CRITICAL RULES:
1. Detect the language of the user's description (it could be English, Kinyarwanda, Swahili, or French).
2. Regardless of the language used by the user, you MUST provide your entire response strictly in ${lang}.
3. Every single field in the JSON result MUST be written in ${lang}.

You MUST respond strictly in valid JSON format with the following structure:
{
  "disease": "Name of the disease in ${lang}",
  "cause": "What causes it in ${lang}",
  "symptoms": "Simple description of what to look for in ${lang}",
  "treatment": "Practical, affordable, locally available solutions in ${lang}",
  "prevention": "How to stop it from coming back in ${lang}",
  "confidenceScore": <a number between 0 and 100 representing how confident you are>,
  "severity": "Must be one of: Low, Medium, High, Critical (translate this word to ${lang})",
  "reasoning": "A simple explanation of WHY you chose this diagnosis based on visual or text symptoms in ${lang}"
}

If the image is NOT a plant, is too blurry, or if the description is completely irrelevant to agriculture, return a JSON object with an "error" field explaining the issue in ${lang}:
{
  "error": "Short clear error message in ${lang} explaining why you cannot analyze it"
}`;

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
    // Fallback to original
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
  const model = 'gemini-3-flash-preview'; // Updated to faster model if needed, sticking to what was there
  
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

  // Retry logic for weak internet
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION(languageMap[language]),
          temperature: 0.2, // Lower temp for more consistent JSON structure
          responseMimeType: "application/json",
        }
      });

      const textResponse = response.text || "{}";
      try {
        return JSON.parse(textResponse) as AnalysisResult;
      } catch (parseError) {
        console.error("Failed to parse JSON:", textResponse);
        throw new Error("Received an invalid response format from the AI.");
      }
    } catch (err: any) {
      retries--;
      if (retries === 0) {
        console.error("Analysis error:", err);
        throw new Error("Something went wrong. Please check your internet connection.");
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
    }
  }
  
  throw new Error("Analysis failed after retries.");
}
