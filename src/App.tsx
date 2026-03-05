import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Camera, 
  Leaf, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeLeafImage, PredictionResult } from './services/geminiService';
import { diseaseDatabase } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const prediction = await analyzeLeafImage(selectedImage);
      setResult(prediction);
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const diseaseInfo = result ? (diseaseDatabase[result.disease] || (result.disease.toLowerCase().includes('healthy') ? diseaseDatabase['Healthy'] : null)) : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">AgroDetect AI</h1>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Plant Health Engine</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Disease Library</a>
            <a href="#" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Support</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-7 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Upload size={20} className="text-emerald-600" />
                Upload Leaf Image
              </h2>
              {selectedImage && (
                <button 
                  onClick={reset}
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              )}
            </div>

            {!selectedImage && !showCamera ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-emerald-500 transition-colors">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-zinc-900">Drop your leaf image here</p>
                    <p className="text-sm text-zinc-500">or click to browse from your device</p>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startCamera(); }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Camera size={18} />
                      Use Camera
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden" 
                  />
                </div>
              </div>
            ) : showCamera ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-200">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <div className="w-12 h-12 border-4 border-emerald-600 rounded-full"></div>
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="absolute right-6 bottom-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                <img 
                  src={selectedImage!} 
                  alt="Selected leaf" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary py-2 px-4 text-sm"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            {selectedImage && !result && (
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing Leaf...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Run Diagnosis
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Info size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Instant Analysis</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Get results in seconds using our deep learning engine.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">High Accuracy</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Trained on thousands of images for reliable detection.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Treatment Plans</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Receive actionable advice for detected diseases.</p>
            </div>
          </section>
        </div>

        {/* Right Column: Results & Info */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Diagnosis Result</h2>
                      <h3 className="text-2xl font-bold text-zinc-900 mt-1">{result.disease}</h3>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      result.disease.toLowerCase().includes('healthy') 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {Math.round(result.confidence * 100)}% Confidence
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <p className="text-sm text-zinc-600 leading-relaxed italic">
                      "{result.description}"
                    </p>
                  </div>

                  {diseaseInfo && (
                    <div className="space-y-6 pt-4 border-t border-zinc-100">
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-500" />
                          Key Symptoms
                        </h4>
                        <ul className="space-y-2">
                          {diseaseInfo.symptoms.map((symptom, i) => (
                            <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-500" />
                          Recommended Treatment
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {diseaseInfo.treatment}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Info size={16} className="text-blue-500" />
                          Prevention Strategy
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {diseaseInfo.prevention}
                        </p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={reset}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    New Diagnosis
                  </button>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Disclaimer:</strong> This diagnosis is powered by AI and should be used as a reference. For critical agricultural decisions, consult with a local plant pathologist or agricultural expert.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-zinc-300">
                  <Leaf size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Waiting for Data</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
                    Upload or capture a leaf image to see the detailed diagnosis and treatment plan.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-zinc-300 rounded-full" />
                  </div>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-zinc-300 rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Leaf size={20} />
            <span className="text-sm font-bold tracking-tight">AgroDetect AI</span>
          </div>
          <p className="text-sm text-zinc-500">© 2026 AgroDetect AI. Empowering farmers with technology.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
