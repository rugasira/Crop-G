import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Stethoscope, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { AnalysisResult, DiagnosisCorrection, Language } from '../services/aiService';

interface Props {
  currentResult: AnalysisResult;
  language: Language;
  onClose: () => void;
  onSave: (updatedResult: AnalysisResult) => void;
}

const TRANSLATIONS = {
  en: {
    modalTitle: "Correct Diagnosis",
    modalSubtitle: "Provide human expertise to correct or refine this AI assessment",
    roleLabel: "Your Role / Identity",
    farmer: "Farmer",
    agronomist: "Agronomist",
    extensionOfficer: "Extension Officer",
    diseaseLabel: "Correct Crop Condition / Disease",
    diseasePlaceholder: "e.g., Healthy Crop, Late Blight, Fall Armyworm...",
    quickSelectLabel: "Common Options:",
    healthyCrop: "Healthy Crop (No Disease)",
    severityLabel: "Severity Level",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    notesLabel: "Observation Notes & Reason for Correction",
    notesPlaceholder: "Describe the visual symptoms or reasons for overriding the AI diagnosis...",
    treatmentLabel: "Recommended Treatment / Action (Optional)",
    treatmentPlaceholder: "What chemical, organic, or cultural action should be taken?",
    saveBtn: "Save Correction",
    cancelBtn: "Cancel",
    alertMissingDisease: "Please specify the correct disease or condition name."
  },
  sw: {
    modalTitle: "Sahihisha Uchunguzi",
    modalSubtitle: "Toa utaalamu wako kusahihisha au kuboresha uchunguzi huu wa AI",
    roleLabel: "Wajibu / Utambulisho Wako",
    farmer: "Mkulima",
    agronomist: "Mtaalamu wa Kilimo",
    extensionOfficer: "Afisa Ugani",
    diseaseLabel: "Hali Sahihi ya Zao / Ugonjwa",
    diseasePlaceholder: "mf., Zao Lenye Afya, Ukungu wa Majani, Funza wa Jeshi...",
    quickSelectLabel: "Chaguo za Haraka:",
    healthyCrop: "Zao Lenye Afya (Hakuna Ugonjwa)",
    severityLabel: "Kiwango cha Ukali",
    low: "Chini",
    medium: "Kati",
    high: "Juu",
    critical: "Hatari",
    notesLabel: "Maelezo ya Uchunguzi & Sababu ya Marekebisho",
    notesPlaceholder: "Eleza dalili unazoona au sababu ya kubadilisha uamuzi wa AI...",
    treatmentLabel: "Tiba / Hatua Inayopendekezwa (Hiari)",
    treatmentPlaceholder: "Ni hatua gani za kikemikali au za asili zinazopaswa kuchukuliwa?",
    saveBtn: "Hifadhi Marekebisho",
    cancelBtn: "Ghairi",
    alertMissingDisease: "Tafadhali taja jina la ugonjwa au hali sahihi ya zao."
  },
  rw: {
    modalTitle: "Kosora Isuzuma",
    modalSubtitle: "Tanga ubumenyi bwawe kugira ngo ukosore cyangwa unoze iri suzuma rya AI",
    roleLabel: "Umwirondoro / Uruhare rwawe",
    farmer: "Umuhinzi",
    agronomist: "Inzobere mu buhinzi",
    extensionOfficer: "Umukozi ushinzwe ubuhinzi",
    diseaseLabel: "Uburwayi nyabwo / Imimerere y'igihingwa",
    diseasePlaceholder: "urug., Igihingwa kizima, Imvura y'umuhondo, Nkongwa...",
    quickSelectLabel: "Guhitamo byihuse:",
    healthyCrop: "Igihingwa Kizima (Nta burwayi)",
    severityLabel: "Uburemere bw'indwara",
    low: "Bworoheje",
    medium: "Buringaniye",
    high: "Bukomeye",
    critical: "Burenze / Biteye inkeke",
    notesLabel: "Ibisobanuro & Impamvu yo gukosora",
    notesPlaceholder: "Sobanura ibimenyetso wabonye cyangwa impamvu uhinduye ibya AI...",
    treatmentLabel: "Umuti cyangwa inama z'ubuvuzi (Bihitwamo)",
    treatmentPlaceholder: "Ni iyihe miti y'inganda cyangwa gakondo ikwiye gukoreshwa?",
    saveBtn: "Bika Ibikosowe",
    cancelBtn: "Kureka",
    alertMissingDisease: "Nyamuneka andika izina ry'indwara cyangwa imimerere nyayo."
  },
  fr: {
    modalTitle: "Corriger le Diagnostic",
    modalSubtitle: "Apportez votre expertise pour corriger ou affiner cette analyse de l'IA",
    roleLabel: "Votre Rôle / Statut",
    farmer: "Agriculteur",
    agronomist: "Agronome",
    extensionOfficer: "Agent de vulgarisation",
    diseaseLabel: "État de la culture / Maladie exacte",
    diseasePlaceholder: "ex., Plante saine, Mildiou, Chenille légionnaire...",
    quickSelectLabel: "Options rapides :",
    healthyCrop: "Culture saine (Aucune maladie)",
    severityLabel: "Niveau de sévérité",
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    critical: "Critique",
    notesLabel: "Notes d'observation & Raison de la correction",
    notesPlaceholder: "Décrivez les symptômes visibles justifiant la modification...",
    treatmentLabel: "Traitement recommandé (Optionnel)",
    treatmentPlaceholder: "Quel traitement chimique ou biologique préconisez-vous ?",
    saveBtn: "Enregistrer la correction",
    cancelBtn: "Annuler",
    alertMissingDisease: "Veuillez préciser le nom de la maladie ou de l'état."
  }
};

export function CorrectionModal({ currentResult, language, onClose, onSave }: Props) {
  const t = TRANSLATIONS[language];
  const [role, setRole] = useState<'Farmer' | 'Agronomist' | 'Extension Officer'>('Agronomist');
  const [correctedDisease, setCorrectedDisease] = useState(
    currentResult.correction?.correctedDisease || currentResult.disease || ''
  );
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>(
    (currentResult.correction?.severity || currentResult.severity as any) || 'Medium'
  );
  const [notes, setNotes] = useState(currentResult.correction?.notes || '');
  const [treatment, setTreatment] = useState(
    currentResult.correction?.treatmentOverride ||
    (typeof currentResult.treatment === 'string' ? currentResult.treatment : '')
  );
  const [validationError, setValidationError] = useState('');

  const quickOptions = [
    t.healthyCrop,
    'Early Blight',
    'Late Blight',
    'Cassava Mosaic Disease',
    'Maize Lethal Necrosis',
    'Fall Armyworm',
    'Nutrient Deficiency'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedDisease.trim()) {
      setValidationError(t.alertMissingDisease);
      return;
    }

    const originalDisease = currentResult.correction?.originalDisease || currentResult.disease || 'Unknown';

    const correctionData: DiagnosisCorrection = {
      originalDisease,
      correctedDisease: correctedDisease.trim(),
      correctedBy: role,
      severity,
      notes: notes.trim() || undefined,
      treatmentOverride: treatment.trim() || undefined,
      correctedAt: new Date().toISOString()
    };

    // Build the updated AnalysisResult with the correction applied
    const updated: AnalysisResult = {
      ...currentResult,
      disease: correctedDisease.trim(),
      severity: severity,
      // If healthy, adjust cause and symptoms
      cause: correctedDisease.trim().toLowerCase().includes('healthy') || correctedDisease.trim() === t.healthyCrop
        ? 'Natural vigorous plant physiology without pathogenic infection.'
        : currentResult.cause,
      symptoms: correctedDisease.trim().toLowerCase().includes('healthy') || correctedDisease.trim() === t.healthyCrop
        ? 'Vibrant foliage, robust stems, and no visible necrotic lesions.'
        : currentResult.symptoms,
      confidenceScore: 98,
      reasoning: `Manual verification by ${role}: ${notes.trim() || 'Visual characteristics confirm this diagnosis.'}`,
      correction: correctionData
    };

    onSave(updated);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0A1F17] border border-[#10B981]/30 rounded-[28px] p-6 sm:p-8 text-white shadow-2xl shadow-emerald-950/50 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#10B981]/20 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow-lg shadow-[#10B981]/10">
              <Stethoscope size={26} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">{t.modalTitle}</h3>
              <p className="text-sm text-[#6EE7B7]/80">{t.modalSubtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Current AI Suggestion Banner */}
          <div className="bg-[#0F2E22] p-4 rounded-2xl border border-[#10B981]/20 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#6EE7B7]/70 tracking-wider">AI Suggestion</span>
              <p className="text-lg font-bold text-white">{currentResult.disease || "Unknown Issue"}</p>
            </div>
            {currentResult.confidenceScore && (
              <span className="text-xs px-3 py-1 bg-[#10B981]/20 text-[#6EE7B7] rounded-full border border-[#10B981]/30 font-semibold">
                {currentResult.confidenceScore}% AI Confidence
              </span>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#6EE7B7] tracking-wider mb-2">
              {t.roleLabel}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['Farmer', 'Agronomist', 'Extension Officer'] as const).map((r) => {
                const label = r === 'Farmer' ? t.farmer : r === 'Agronomist' ? t.agronomist : t.extensionOfficer;
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#10B981] text-[#0A1F17] border-[#10B981] shadow-lg shadow-[#10B981]/20'
                        : 'bg-[#0F2E22] text-[#D1FAE5] border-[#10B981]/20 hover:border-[#10B981]/40'
                    }`}
                  >
                    {isSelected && <Check size={16} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Correct Disease Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#6EE7B7] tracking-wider mb-2">
              {t.diseaseLabel} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={correctedDisease}
              onChange={(e) => {
                setCorrectedDisease(e.target.value);
                setValidationError('');
              }}
              placeholder={t.diseasePlaceholder}
              className="w-full bg-[#0F2E22] border border-[#10B981]/30 rounded-xl px-4 py-3 text-white placeholder-[#6EE7B7]/40 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-medium"
            />
            {validationError && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1 font-semibold">
                <AlertTriangle size={14} /> {validationError}
              </p>
            )}

            {/* Quick Suggestions Chips */}
            <div className="mt-2.5">
              <span className="text-[11px] text-[#6EE7B7]/70 font-semibold mr-2">{t.quickSelectLabel}</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {quickOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCorrectedDisease(opt);
                      setValidationError('');
                    }}
                    className="text-xs px-2.5 py-1 bg-white/5 hover:bg-[#10B981]/20 text-[#D1FAE5] border border-white/10 hover:border-[#10B981]/40 rounded-lg transition-colors font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#6EE7B7] tracking-wider mb-2">
              {t.severityLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((sev) => {
                const label = sev === 'Low' ? t.low : sev === 'Medium' ? t.medium : sev === 'High' ? t.high : t.critical;
                const isSelected = severity === sev;
                const colors: Record<string, string> = {
                  Low: isSelected ? 'bg-green-500 border-green-400 text-black' : 'hover:border-green-500/50',
                  Medium: isSelected ? 'bg-yellow-500 border-yellow-400 text-black' : 'hover:border-yellow-500/50',
                  High: isSelected ? 'bg-orange-500 border-orange-400 text-black' : 'hover:border-orange-500/50',
                  Critical: isSelected ? 'bg-red-600 border-red-500 text-white' : 'hover:border-red-500/50'
                };
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                      isSelected
                        ? colors[sev]
                        : 'bg-[#0F2E22] text-[#D1FAE5] border-[#10B981]/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes & Reasoning */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#6EE7B7] tracking-wider mb-2">
              {t.notesLabel}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full bg-[#0F2E22] border border-[#10B981]/30 rounded-xl px-4 py-3 text-white placeholder-[#6EE7B7]/40 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-sans text-sm resize-none"
            />
          </div>

          {/* Treatment Override (Optional) */}
          <div>
            <label className="block text-xs uppercase font-bold text-[#6EE7B7] tracking-wider mb-2">
              {t.treatmentLabel}
            </label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder={t.treatmentPlaceholder}
              className="w-full bg-[#0F2E22] border border-[#10B981]/30 rounded-xl px-4 py-3 text-white placeholder-[#6EE7B7]/40 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all font-medium text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#10B981]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors font-bold text-sm"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#10B981] text-[#0A1F17] hover:bg-[#34D399] transition-all font-bold text-sm shadow-lg shadow-[#10B981]/20 flex items-center gap-2"
            >
              <Check size={18} />
              {t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
