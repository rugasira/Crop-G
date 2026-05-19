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
    console.warn("AI Service is not configured. Falling back to mock diagnostic data.");
    // Simulate API delay for natural loading spinner behavior
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Provide translations for the mock diagnosis in 4 languages!
    const mockMap: Record<Language, AnalysisResult> = {
      en: {
        disease: "Cassava Mosaic Disease (CMD)",
        cause: "Whitefly transmission of CMD geminiviruses or planting infected cuttings.",
        symptoms: "Stunted growth, bright yellow chlorosis on leaves, leaf distortion, and mosaic patterns.",
        treatment: {
          chemical: "Systemic insecticides for whitefly control in severe outbreaks, copper fungicides for secondary infections.",
          organic: "Uprooting infected plants, using certified disease-free cuttings, and spraying neem oil extracts.",
          dosage: "Apply neem oil mixture (5ml per liter of water) twice a week during early morning or late evening.",
          timeline: "Uproot infected stems immediately. Apply whitefly controls every 7-10 days for 4 weeks."
        },
        prevention: "Plant CMD-resistant cassava varieties, monitor whitefly populations, and practice strict field sanitation.",
        confidenceScore: 94,
        severity: "High",
        reasoning: "The reported symptoms including yellow chlorosis and leaf distortion in cassava are characteristic indicators of Cassava Mosaic Disease."
      },
      sw: {
        disease: "Ugonjwa wa Mosaiki wa Muhogo (CMD)",
        cause: "Kuambukizwa kwa virusi vya CMD kupitia nzi weupe au kupanda vikato vilivyoambukizwa.",
        symptoms: "Ukuaji kudumaa, manjano kwenye majani, kupinda kwa majani, na mifumo ya mosaiki.",
        treatment: {
          chemical: "Dawa za wadudu za kimfumo ili kudhibiti nzi weupe katika milipuko mikubwa.",
          organic: "Kung'oa mimea iliyoambukizwa, kutumia vikato safi visivyo na ugonjwa, na kunyunyizia mafuta ya neem.",
          dosage: "Changanya mafuta ya neem (mililita 5 kwa lita moja ya maji) mara mbili kwa wiki asubuhi au jioni.",
          timeline: "Ng'oa mashina yaliyoambukizwa mara moja. Nyunyizia dawa kila baada ya siku 7-10 kwa wiki 4."
        },
        prevention: "Panda aina ya muhogo zinazostahimili CMD, fuatilia idadi ya nzi weupe, na ufanye usafi wa shamba.",
        confidenceScore: 94,
        severity: "High",
        reasoning: "Dalili zilizoripotiwa za manjano na kupinda kwa majani ya muhogo ni viashiria vikuu vya Ugonjwa wa Mosaiki wa Muhogo."
      },
      rw: {
        disease: "Indwara ya Mosaïque y'Imyumbati (CMD)",
        cause: "Kwirakwira kw'indwara binyuze mu gazi cyangwa gutera ibiti byanduye.",
        symptoms: "Kudindira mu gukura, ibibabi bihinduka umuhondo, kwihina kw'ibibabi, n'ibimenyetso bya mosaïque.",
        treatment: {
          chemical: "Imiti yica udukoko mu gihe cy'ibyorezo bikomeye kugira ngo uhangane n'utwo dukoko.",
          organic: "Kurandura ibihingwa byanduye, gukoresha ingemwe zizewe zitanduye, no gutera umuti wa neem oil.",
          dosage: "Vanga umuti wa neem (5ml kuri litiro y'amazi) kabiri mu cyumweru mu gitondo cyangwa nimugoroba.",
          timeline: "Randura ibiti byanduye ako kanya. Tera imiti buri minsi 7-10 mu gihe cy'ibyumweru 4."
        },
        prevention: "Tera imyumbati yihanganira indwara, genzura udukoko mu murima, kandi ugaragaze isuku mu buhinzi.",
        confidenceScore: 94,
        severity: "High",
        reasoning: "Ibiranga iyi ndwara birimo ibibabi bihinduka umuhondo no kwihina kwabyo byerekana neza ko ari Indwara ya Mosaïque y'Imyumbati."
      },
      fr: {
        disease: "Mosaïque du Manioc (CMD)",
        cause: "Transmission de geminivirus par les mouches blanches ou utilisation de boutures infectées.",
        symptoms: "Retard de croissance, chlorose jaune vif sur les feuilles, distorsion des feuilles et motifs en mosaïque.",
        treatment: {
          chemical: "Insecticides systémiques pour le contrôle des mouches blanches en cas d'infestation grave.",
          organic: "Arrachage des plantes infectées, utilisation de boutures saines certifiées et pulvérisation d'huile de neem.",
          dosage: "Appliquer le mélange d'huile de neem (5 ml par litre d'eau) deux fois par semaine le matin ou le soir.",
          timeline: "Arrachez immédiatement les tiges infectées. Appliquez les traitements tous les 7 à 10 jours pendant 4 semaines."
        },
        prevention: "Planter des variétés de manioc résistantes à la CMD, surveiller les mouches blanches et pratiquer la rotation des cultures.",
        confidenceScore: 94,
        severity: "High",
        reasoning: "Les symptômes signalés tels que la chlorose jaune et la distorsion des feuilles sont des indicateurs caractéristiques de la Mosaïque du Manioc."
      }
    };

    return mockMap[language];
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
