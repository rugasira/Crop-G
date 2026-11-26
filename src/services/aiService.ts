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

export interface DiagnosisCorrection {
  originalDisease: string;
  correctedDisease: string;
  correctedBy: 'Farmer' | 'Agronomist' | 'Extension Officer';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  treatmentOverride?: string;
  correctedAt: string;
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
  correction?: DiagnosisCorrection;
}

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

const MOCK_DIAGNOSES: Record<Language, AnalysisResult> = {
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

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your internet connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status}).`);
  return data as T;
}

// Diagnosis is done by Claude on the server (see server/claude.ts), so the API key stays secret.
export async function analyzeCropData(
  language: Language,
  imageBase64: string | null,
  description: string
): Promise<AnalysisResult> {
  try {
    return await postJSON<AnalysisResult>('/api/diagnose', { language, imageBase64, description });
  } catch (err: any) {
    // One retry for flaky rural connections / busy service.
    if (/busy|reach the server/i.test(err?.message || '')) {
      await new Promise(r => setTimeout(r, 1500));
      return postJSON<AnalysisResult>('/api/diagnose', { language, imageBase64, description });
    }
    throw err;
  }
}

export async function chatWithAI(
  language: Language,
  diseaseContext: AnalysisResult,
  question: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> {
  const { reply } = await postJSON<{ reply: string }>('/api/chat', {
    language,
    context: {
      disease: diseaseContext.disease,
      cause: diseaseContext.cause,
      symptoms: diseaseContext.symptoms,
      treatment: diseaseContext.treatment,
    },
    question,
    history,
  });
  return reply;
}
