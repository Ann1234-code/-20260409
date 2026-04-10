import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Wand2, Download, RefreshCcw, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STYLES, transformImage } from './services/gemini';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [isTransforming, setIsTransforming] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!selectedImage) return;

    setIsTransforming(true);
    setError(null);
    try {
      // Extract base64 data from DataURL
      const base64Data = selectedImage.split(',')[1];
      const result = await transformImage(base64Data, mimeType, selectedStyle);
      setResultImage(result);
    } catch (err) {
      console.error(err);
      setError('轉換失敗，請稍後再試。');
    } finally {
      setIsTransforming(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `stylemorph-${selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedImage(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wand2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">StyleMorph AI</h1>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
          
          {/* Left Column: Image Area */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!selectedImage ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square md:aspect-video rounded-3xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">點擊或拖曳圖片至此</p>
                    <p className="text-sm text-gray-500 mt-1">支援 JPG, PNG 格式</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl shadow-gray-200 group">
                    <img
                      src={resultImage || selectedImage}
                      alt="Preview"
                      className={`w-full h-auto max-h-[70vh] object-contain transition-opacity duration-500 ${isTransforming ? 'opacity-50' : 'opacity-100'}`}
                    />
                    
                    {isTransforming && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                        <RefreshCcw className="w-12 h-12 text-white animate-spin mb-4" />
                        <p className="text-white font-medium tracking-wide">正在施展魔法...</p>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={reset}
                        className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="重新上傳"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {resultImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center gap-4"
                    >
                      <button
                        onClick={downloadImage}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                      >
                        <Download className="w-5 h-5" />
                        下載圖片
                      </button>
                      <button
                        onClick={() => setResultImage(null)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                      >
                        <RefreshCcw className="w-5 h-5" />
                        重新轉換
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-8 lg:sticky lg:top-28">
            <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">選擇風格</label>
                <div className="relative">
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 pr-12 font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer"
                  >
                    {STYLES.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  disabled={!selectedImage || isTransforming}
                  onClick={handleTransform}
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] ${
                    !selectedImage || isTransforming
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
                  }`}
                >
                  {isTransforming ? (
                    <>
                      <RefreshCcw className="w-6 h-6 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6" />
                      開始轉換
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-sm text-red-500 text-center font-medium bg-red-50 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Tips/Info */}
            <div className="px-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">使用提示</h3>
              <ul className="space-y-3">
                {[
                  '上傳清晰、光線充足的圖片效果更佳',
                  '不同風格會產生完全不同的藝術效果',
                  '轉換過程約需 10-20 秒，請耐心等候',
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-500 leading-relaxed">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-200 mt-12">
        <p className="text-center text-sm text-gray-400">
          &copy; 2026 StyleMorph AI. Created with Gemini.
        </p>
      </footer>
    </div>
  );
}
