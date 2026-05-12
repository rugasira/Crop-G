import { useRef } from 'react';
import { Camera, Upload, Info, X } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
  image: string | null;
  description: string;
  onImageChange: (file: File | null, dataUrl: string | null) => void;
  onDescriptionChange: (desc: string) => void;
}

const TRANSLATIONS = {
  en: { takePhoto: 'Take a photo or upload', camera: 'Camera', gallery: 'Gallery', describeProblem: 'Describe the problem', placeholderDesc: 'Example: My potato leaves have dark brown spots and are wilting...' },
  sw: { takePhoto: 'Piga picha au pakia', camera: 'Kamera', gallery: 'Picha', describeProblem: 'Eleza tatizo', placeholderDesc: 'Mfano: Majani yangu ya viazi yana madoa ya kahawia na yananyauka...' },
  rw: { takePhoto: 'Fata ifoto cyangwa ushyireho ifoto', camera: 'Kamera', gallery: 'Ububiko', describeProblem: 'Sobanura ikibazo', placeholderDesc: 'Urugero: Amababi y’ibirayi byanjye afite amabara y’ikigina kandi ari kugandara...' },
  fr: { takePhoto: 'Prendre une photo ou télécharger', camera: 'Caméra', gallery: 'Galerie', describeProblem: 'Décrire le problème', placeholderDesc: 'Exemple : Mes feuilles de pomme de terre ont des taches brunes et flétrissent...' }
};

export function CameraUploader({ language, image, description, onImageChange, onDescriptionChange }: Props) {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onImageChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Image Section */}
      <div className="space-y-4">
        <label className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-900 flex items-center gap-2.5 opacity-60">
          <Camera size={14} className="text-brand-500" /> {t.takePhoto}
        </label>
        
        <div className="relative group">
          {image ? (
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-brand-200 shadow-inner group">
              <img 
                src={image} 
                alt="Crop preview" 
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <button 
                onClick={clearImage}
                className="absolute top-4 right-4 p-2.5 bg-white/90 text-brand-950 rounded-full hover:bg-white transition-all shadow-lg active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 h-48 border-2 border-dashed border-brand-200 rounded-[2rem] hover:border-brand-500 hover:bg-brand-50/50 transition-all group active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Camera size={32} />
                </div>
                <span className="font-sans font-bold text-brand-900 text-lg">{t.camera}</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 h-48 border-2 border-dashed border-brand-200 rounded-[2rem] hover:border-brand-500 hover:bg-brand-50/50 transition-all group active:scale-[0.98]"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Upload size={32} />
                </div>
                <span className="font-sans font-bold text-brand-900 text-lg">{t.gallery}</span>
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={cameraInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <label className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-900 flex items-center gap-2.5 opacity-60">
          <Info size={14} className="text-brand-500" /> {t.describeProblem}
        </label>
        <textarea 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t.placeholderDesc}
          className="w-full p-6 rounded-[2rem] border-2 border-brand-50 focus:border-brand-500 focus:ring-0 font-sans text-brand-950 placeholder:text-brand-900/30 min-h-[160px] resize-none transition-all bg-brand-50/30 hover:bg-brand-50/50 text-lg"
        />
      </div>
    </div>
  );
}
