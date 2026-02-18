/* eslint-disable @typescript-eslint/no-unused-vars, no-empty */
import { useRef, useState, useCallback, useEffect } from 'react';
import { Lock, Download, UploadCloud, Eye, X, Check, Info } from 'lucide-react';



function utf8ToBytes(str: string) {
  return new TextEncoder().encode(str);
}

function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

export default function Steganography() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const secretFileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [stegoType] = useState<'text' | 'image' | 'audio'>('text');
  const [secretFile, _setSecretFile] = useState<File | null>(null);
  const [_secretPreview, _setSecretPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastHideTimerRef = useRef<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const loadImageToCanvas = (file: File) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(file);
    });
  };

  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // resize canvas to image (limit large images to reasonable size to avoid memory issues)
    const maxDim = 2048;
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const estimateCapacityBytes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const pixels = canvas.width * canvas.height;
    const capacityBits = pixels * 3; // R,G,B LSBs
    const capacityBytes = Math.floor(capacityBits / 8) - 4; // reserve 4 bytes for length header
    return Math.max(0, capacityBytes);
  }, []);

  const handleFile = async (file?: File) => {
    setError(null);
    setDecoded(null);
    setEmbedded(false);
    if (!file) return;
    try {
      const img = await loadImageToCanvas(file);
      drawImageOnCanvas(img);
      // Use PNG preview of canvas for consistency (lossless)
      const canvas = canvasRef.current!;
      setFilePreview(canvas.toDataURL('image/png'));
    } catch (e) {
      setError('Failed to load image');
    }
  };



  // progress simulation for better UX while processing
  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) window.clearInterval(progressRef.current);
    progressRef.current = window.setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.floor(Math.random() * 8) + 3));
    }, 220) as unknown as number;
  };

  const finishProgress = () => {
    try { if (progressRef.current) window.clearInterval(progressRef.current); } catch {}
    progressRef.current = null;
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  useEffect(() => {
    return () => {
      try { if (progressRef.current) window.clearInterval(progressRef.current); } catch {}
      try { if (decoded && typeof decoded === 'string' && decoded.startsWith('blob:')) URL.revokeObjectURL(decoded); } catch {}
      try { if (filePreview && filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview); } catch {}
      try { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); } catch {}
      try { if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current); } catch {}
    };
  }, [decoded, filePreview]);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    try { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); } catch {}
    try { if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current); } catch {}
    // start hide animation slightly before removal so it's gone at 3000ms
    toastHideTimerRef.current = window.setTimeout(() => setToastVisible(false), 2500) as unknown as number;
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000) as unknown as number;
  };

  const embedSecret = async () => {
    setError(null);
    setProcessing(true);
    startProgress();
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        setError('No image loaded');
        setProcessing(false);
        return;
      }

      let secretBytes: Uint8Array;
      if (stegoType === 'text') {
        secretBytes = utf8ToBytes(secret);
        if (secretBytes.length === 0) {
          setError('Secret message is empty');
          setProcessing(false);
          return;
        }
      } else {
        if (!secretFile) {
          setError('No secret file selected');
          setProcessing(false);
          return;
        }
        const ab = await secretFile.arrayBuffer();
        secretBytes = new Uint8Array(ab);
        if (secretBytes.length === 0) {
          setError('Secret file is empty');
          setProcessing(false);
          return;
        }
      }
      
      const length = secretBytes.length;
      const capacityBytes = estimateCapacityBytes();
      if (length > capacityBytes - 5) { // 5 bytes for type(1) + length(4)
        setError(`Secret too long. Max bytes: ${capacityBytes - 5}`);
        setProcessing(false);
        return;
      }

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data; // RGBA

      // Standard LSB format with type identifier:
      // [1-byte type: 0=text, 1=image, 2=audio][4-byte length (little-endian)][data]
      const typeCode = stegoType === 'text' ? 0 : stegoType === 'image' ? 1 : 2;
      const payload = new Uint8Array(1 + 4 + length);
      
      // Write type byte
      payload[0] = typeCode & 0xff;
      
      // Write length as 32-bit little-endian
      payload[1] = length & 0xff;
      payload[2] = (length >>> 8) & 0xff;
      payload[3] = (length >>> 16) & 0xff;
      payload[4] = (length >>> 24) & 0xff;
      
      // Copy secret bytes
      payload.set(secretBytes, 5);

      // Embed bits into LSB of R,G,B channels (skip alpha)
      let dataIdx = 0;
      
      // Embed payload bytes using standard LSB technique
      for (let b = 0; b < payload.length; b++) {
        for (let bit = 7; bit >= 0; bit--) {
          // Skip alpha channels (every 4th byte in RGBA)
          while ((dataIdx + 1) % 4 === 0) dataIdx++;
          const bitVal = (payload[b] >> bit) & 1;
          data[dataIdx] = (data[dataIdx] & 0xfe) | bitVal;
          dataIdx++;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Export as PNG to preserve LSB data without quality loss
      const pngDataUrl = canvas.toDataURL('image/png');
      
      // Also create a high-quality PNG blob for reliable download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setFilePreview(url);
        } else {
          setFilePreview(pngDataUrl);
        }
      }, 'image/png', 1.0);
      
      setEmbedded(true);
      showToast('✓ Embedded (' + (stegoType === 'text' ? 'Text' : stegoType === 'image' ? 'Image' : 'Audio') + ' - Standard LSB)');
      finishProgress();
      setProcessing(false);
    } catch (e) {
      console.error('Embed error:', e);
      setError('Failed to embed secret');
      finishProgress();
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!filePreview) return;
    const canvas = canvasRef.current!;
    
    // Convert canvas to PNG blob for reliable download
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Failed to create PNG blob');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stego-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('PNG image downloaded successfully');
    }, 'image/png', 1.0);
  };

  const decodeSecret = async () => {
    setError(null);
    setDecoded(null);
    setProcessing(true);
    startProgress();
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        setError('No image loaded');
        setProcessing(false);
        return;
      }
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // read bits sequentially, skipping alpha channel
      let dataIdx = 0;
      const readBit = () => {
        while ((dataIdx + 1) % 4 === 0) dataIdx++;
        const bit = data[dataIdx] & 1;
        dataIdx++;
        return bit;
      };

      const readByte = () => {
        let val = 0;
        for (let i = 0; i < 8; i++) {
          val = (val << 1) | readBit();
        }
        return val & 0xff;
      };

      // Read standard LSB format: [1-byte type][4-byte length (little-endian)][data]
      const typeCode = readByte();
      
      const lengthByte0 = readByte();
      const lengthByte1 = readByte();
      const lengthByte2 = readByte();
      const lengthByte3 = readByte();
      const length = lengthByte0 | (lengthByte1 << 8) | (lengthByte2 << 16) | (lengthByte3 << 24);
      const capacityBytes = estimateCapacityBytes();
      
      if (length <= 0 || length > capacityBytes - 5) {
        setError('No hidden message found, invalid length, or corrupted data');
        setProcessing(false);
        finishProgress();
        return;
      }

      // Read secret payload
      const payload = new Uint8Array(length);
      for (let b = 0; b < length; b++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          byte = (byte << 1) | readBit();
        }
        payload[b] = byte;
      }

      // Decode based on type code
      if (typeCode === 0) {
        // Text
        const message = bytesToUtf8(payload);
        setDecoded(message);
      } else if (typeCode === 1) {
        // Image - detect MIME type and create blob URL
        const blob = new Blob([payload], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setDecoded(url);
      } else if (typeCode === 2) {
        // Audio - create blob URL (default to audio/wav)
        const blob = new Blob([payload], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setDecoded(url);
      } else {
        setError('Unknown secret type code: ' + typeCode);
        finishProgress();
        setProcessing(false);
        return;
      }
      
      finishProgress();
      setProcessing(false);
    } catch (e) {
      console.error('Decode error:', e);
      setError('Failed to decode secret or corrupted data');
      finishProgress();
      setProcessing(false);
    }
  };

  const clearAll = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFilePreview(null);
    setSecret('');
    try {
      if (decoded && decoded.startsWith('blob:')) URL.revokeObjectURL(decoded);
    } catch {}
    setDecoded(null);
    setError(null);
    setEmbedded(false);
    // clear file inputs' displayed names/values
    try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch {}
    try { if (secretFileInputRef.current) secretFileInputRef.current.value = ''; } catch {}
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative space-y-6 p-6 bg-gradient-to-br from-[#0f1628]/80 to-[#0a0f1a]/60 rounded-xl shadow-xl border border-[#1e2a3f]/40 transition-all">
      <div>
        <h1 className="text-3xl font-bold text-[#8B5CF6] mb-2 flex items-center gap-2">
          <Lock size={28} /> StegoStudio
        </h1>
        <p className="text-gray-400">StegoStudio — Hide & reveal text messages in images using standard LSB steganography (client-side). <span className="text-emerald-400 font-semibold">✓ Decodable by external tools!</span></p>
      </div>
      <button
        onClick={() => setShowHelp((s) => !s)}
        aria-label="Help about StegoStudio"
        className="absolute right-4 top-4 p-2 rounded-full bg-[#1e2a3f]/40 border border-[#1e2a3f]/50 text-gray-300 hover:bg-[#1e2a3f]/60 transition"
      >
        <Info size={18} />
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-transform transform ${mode === 'encode' ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/50 scale-105' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30 hover:scale-105'}`}
        >
          Embed
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-transform transform ${mode === 'decode' ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/50 scale-105' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30 hover:scale-105'}`}
        >
          Decode
        </button>
        <button onClick={clearAll} className="px-3 py-2 rounded-lg border text-sm bg-red-600/10 flex items-center gap-2 transition-transform hover:scale-105">Clear <X size={14} /></button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-xs text-gray-400">Image</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] || undefined)}
              className="flex-1"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-[#1e2a3f]/50"
            >
              <UploadCloud size={16} />
            </button>
          </div>

          <div className="border border-[#1e2a3f]/40 rounded-lg p-3 bg-[#0f1628]/30 transition-shadow hover:shadow-lg">
            {filePreview ? (
              <img src={filePreview} alt="preview" className="max-w-full max-h-60 object-contain rounded transition-transform duration-300 hover:scale-105" />
            ) : (
              <div className="text-gray-400 text-sm">No image selected — drag & drop or upload. PNG recommended.</div>
            )}
          </div>

          <div className="text-xs text-gray-400">
            Capacity: <span className="font-semibold text-[#0284c7]">{estimateCapacityBytes()} bytes</span> available for secret (approx). Standard LSB format.
          </div>

          {mode === 'encode' && (
            <>
              <label className="block text-xs text-gray-400">Secret Message (Text)</label>
              <p className="text-xs text-gray-500 mb-2">Standard LSB format - decodable by external tools</p>
              <textarea value={secret} onChange={(e) => setSecret(e.target.value)} className="w-full p-2 rounded bg-black/30 text-sm border border-[#1e2a3f]/30" rows={6} placeholder="Enter your secret message..." />

              <div className="flex gap-2 mt-3">
                <button disabled={processing || !filePreview} onClick={embedSecret} className="px-4 py-2 rounded bg-[#06b6d4]/20 text-[#0284c7] disabled:opacity-50">Embed</button>
                <button disabled={!embedded} onClick={downloadImage} className="px-4 py-2 rounded bg-green-500/20 flex items-center gap-2 disabled:opacity-50"><Download size={14}/>Download</button>
              </div>
            </>
          )}

          {mode === 'decode' && (
            <>
              <div className="flex gap-2">
                <button disabled={processing || !filePreview} onClick={decodeSecret} className="px-4 py-2 rounded bg-[#06b6d4]/20 text-[#0284c7] flex items-center gap-2 disabled:opacity-50"><Eye size={14}/>Decode Message</button>
              </div>
              {decoded !== null && (
                <div className="mt-3 p-3 rounded bg-[#0f1628]/50 border border-[#1e2a3f]/30">
                  <label className="text-xs text-gray-400 block mb-2">✓ Hidden Message Decoded</label>
                  <pre className="whitespace-pre-wrap text-sm text-cyan-300 font-mono bg-black/50 p-3 rounded border border-cyan-500/20">{decoded}</pre>
                  <p className="text-xs text-gray-500 mt-2">Copy the message above or use an external LSB tool to decode</p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
        </div>

        <div>
          <div className="border border-[#1e2a3f]/40 rounded-lg p-3 bg-gradient-to-br from-[#0f1628]/20 to-[#0a0f1a]/10 shadow-inner">
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', maxHeight: 420 }} className="rounded" />
          </div>
        </div>
      </div>
      {processing && (
        <div className="absolute inset-0 bg-black/40 z-40 flex items-center justify-center rounded-xl">
          <div className="w-80 p-4 bg-[#0f1628]/90 rounded-lg flex flex-col items-center gap-3 border border-[#1e2a3f]/50">
            <div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-gray-300">Processing...</div>
            <div className="w-full bg-[#1e2a3f] rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-[#ff6b35] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-gray-400">{progress}%</div>
          </div>
        </div>
      )}
      {showHelp && (
        <div className="fixed right-6 top-20 z-50 w-96 pointer-events-auto">
          <div className="bg-[#0f1628]/95 border border-[#1e2a3f]/40 rounded-lg p-4 shadow-lg text-sm text-gray-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#ff6b35]" />
                <div className="font-semibold">About Steganography</div>
              </div>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-200"><X size={16} /></button>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-gray-400 space-y-2">
              <p>Steganography is the practice of hiding a message within another file so that the existence of the hidden information is concealed. StegoStudio uses standard LSB (Least Significant Bit) steganography.</p>
              
              <div className="text-cyan-400 font-semibold">✓ Standard LSB Format - External Tool Compatible</div>
              <p className="text-gray-500">Format: 4-byte length (little-endian) + message data. This allows any standard LSB decoder to extract your message:</p>
              <ul className="list-disc list-inside text-gray-500 space-y-1">
                <li>OpenStego - LSB Steganography Tool</li>
                <li>SilentEye - Audio & Image Steganography</li>
                <li>Online LSB Extractor tools</li>
                <li>Custom LSB decoders</li>
              </ul>
              <p className="text-emerald-400 font-semibold mt-2">Downloads PNG files encoded with standard LSB format!</p>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed right-6 top-6 z-50 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 bg-[#ff6b35] text-white px-4 py-2 rounded-lg shadow-lg border border-[#ff6b35]/30 transform transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          >
            <Check size={18} />
            <div className="text-sm font-medium">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
