import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, AlertTriangle, ShieldCheck, Zap, Video, Brain, FileVideo, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { RiskLevel, KinematicTelemetry } from '../types';

interface LiveCameraFeedProps {
  privacyShield: boolean;
  onAlertTriggered: (alertData: any) => void;
}

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  privacyShield,
  onAlertTriggered
}) => {
  const [sourceMode, setSourceMode] = useState<'webcam' | 'file'>('webcam');
  const [isStreaming, setIsStreaming] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeRiskLevel, setActiveRiskLevel] = useState<RiskLevel>('LOW');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ filename: string; file_size_mb: number; analysis: string; model_used: string } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<KinematicTelemetry>({
    timestampSec: 0,
    velocityX: 0,
    velocityY: 0,
    velocityTotal: 0,
    accelerationY: 0,
    dropHeightMeters: 0,
    impactEnergyJoules: 0,
    impactForceNewtons: 0,
    stackTiltDegrees: 0,
    overhangRatio: 0,
    pinchDistanceMeters: 3.5,
    riskScore: 12
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const prevBoxY = useRef<number>(200);
  const prevTime = useRef<number>(Date.now());
  const previousFrameRef = useRef<ImageData | null>(null);
  const trajectoryRef = useRef<[number, number, number][]>([]);
  const lastBackendCallRef = useRef<number>(0);

  // Start Webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      alert('Could not access camera. Please allow camera permissions or upload a video file.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Play video preview
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setSourceMode('file');
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.play();
      setIsStreaming(true);
    }

    // Send to AI backend for analysis
    handleVideoAnalysis(file);
  };

  const handleVideoAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setAnalysisError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Analysis failed');
      }

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      setAnalysisError(err.message || 'Could not reach AI backend.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time Canvas Processing Loop
  useEffect(() => {
    if (!isStreaming) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Draw Video Feed
      ctx.drawImage(video, 0, 0, w, h);

      // Privacy Shield Masking
      if (privacyShield) {
        // Blur / Silhouette worker zones
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(w * 0.2, h * 0.15, w * 0.25, h * 0.7);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillText('[WORKER SILHOUETTE PROTECTED]', w * 0.2 + 10, h * 0.15 + 25);
      }

      // Motion-based video analysis
const now = Date.now();
const dt = Math.max((now - prevTime.current) / 1000, 0.01);
prevTime.current = now;

// Analyze the actual video frame for motion
const currentFrame = ctx.getImageData(0, 0, w, h);
let motionPixels = 0;
let sumX = 0;
let sumY = 0;

if (previousFrameRef.current) {
  const previousFrame = previousFrameRef.current.data;
  const current = currentFrame.data;

  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const index = (y * w + x) * 4;

      const diff =
        Math.abs(current[index] - previousFrame[index]) +
        Math.abs(current[index + 1] - previousFrame[index + 1]) +
        Math.abs(current[index + 2] - previousFrame[index + 2]);

      if (diff > 100) {
        motionPixels++;
        sumX += x;
        sumY += y;
      }
    }
  }
}

previousFrameRef.current = currentFrame;

const motionDetected = motionPixels > 150 && motionPixels < 5000;

const motionCenterX =
  motionPixels > 0 ? sumX / motionPixels : w / 2;

const motionCenterY =
  motionPixels > 0 ? sumY / motionPixels : h / 2;

// Keep the detected region inside the video frame
const boxW = 120;
const boxH = 100;

// Smooth the detected motion region to reduce frame-to-frame jumps
const rawBoxX = Math.max(
  0,
  Math.min(w - boxW, motionCenterX - boxW / 2)
);

const rawBoxY = Math.max(
  0,
  Math.min(h - boxH, motionCenterY - boxH / 2)
);

const maxJumpPerFrame = 35;

const previousX =
  trajectoryRef.current.length > 0
    ? trajectoryRef.current[trajectoryRef.current.length - 1][0]
    : rawBoxX;

const previousY =
  trajectoryRef.current.length > 0
    ? trajectoryRef.current[trajectoryRef.current.length - 1][1]
    : rawBoxY;

const boxX =
  Math.abs(rawBoxX - previousX) > maxJumpPerFrame
    ? previousX
    : rawBoxX;

const boxY =
  Math.abs(rawBoxY - previousY) > maxJumpPerFrame
    ? previousY
    : rawBoxY;

// Send recent trajectory to FastAPI backend once per second
if (motionDetected) {
  const timestampSec = now / 1000;

  trajectoryRef.current.push([
  boxX,
  boxY,
  timestampSec
]);

if (trajectoryRef.current.length > 6) {
  trajectoryRef.current.shift();
}

  if (trajectoryRef.current.length > 10) {
    trajectoryRef.current.shift();
  }

  if (
    trajectoryRef.current.length >= 3 &&
    now - lastBackendCallRef.current > 1000
  ) {
    lastBackendCallRef.current = now;

    fetch("http://127.0.0.1:8000/api/analyze-kinematics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bbox_coordinates: [
          boxX,
          boxY,
          boxW,
          boxH
        ],
        trajectory: trajectoryRef.current,
        package_mass_kg: 15
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        return response.json();
      })
      .then((backendResult) => {
  console.log("Backend kinematics:", backendResult);

  const k = backendResult.kinematics || {};
  const impact = backendResult.impact || {};
  const evaluation = backendResult.evaluation || {};

  const backendVelocity = Number(k.v_total ?? 0);
  const backendAcceleration = Number(k.ay ?? 0);
  const backendRiskScore = Number(evaluation.risk_score ?? 0);

  let backendRisk: RiskLevel = 'LOW';

  if (backendRiskScore >= 80) {
    backendRisk = 'CRITICAL';
  } else if (backendRiskScore >= 50) {
    backendRisk = 'HIGH';
  } else if (backendRiskScore >= 25) {
    backendRisk = 'MEDIUM';
  }

  setActiveRiskLevel(backendRisk);

  setTelemetry((previous) => ({
    ...previous,
    velocityY: Number(k.v_y ?? 0),
    velocityTotal: backendVelocity,
    accelerationY: backendAcceleration,
    dropHeightMeters: Number(k.drop_height_m ?? 0),
    impactEnergyJoules: Number(
      impact.kinetic_energy_joules ?? 0
    ),
    impactForceNewtons: Number(
      impact.impact_force_newtons ?? 0
    ),
    riskScore: backendRiskScore
  }));
})
      .catch((error) => {
        console.warn("Backend kinematics unavailable:", error);
      });
  }
}

const dy = (boxY - prevBoxY.current) / 120;
const vy = dy / dt;
const ay = Math.abs(vy) / dt;

prevBoxY.current = boxY;

const isHighDrop =
  motionDetected && (ay > 8.0 || Math.abs(vy) > 2.2);

const risk = isHighDrop
  ? 'CRITICAL'
  : motionDetected && ay > 4.0
  ? 'HIGH'
  : 'LOW';

      // Draw AI Bounding Box & HUD
      ctx.strokeStyle = risk === 'CRITICAL' ? '#EF4444' : risk === 'HIGH' ? '#F59E0B' : '#3B82F6';
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Label
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(boxX, boxY - 24, 180, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(
  `Motion Region (v=${Math.abs(vy).toFixed(1)}m/s)`,
  boxX + 6,
  boxY - 8
);

      if (isHighDrop) {
        onAlertTriggered({
          type: 'DROP_IMPACT',
          severity: 'CRITICAL',
          message: 'LIVE ALERT: High velocity drop detected on camera!',
          hindiMessage: 'चेतावनी: लाइव कैमरे पर बक्सा गिरने का संकेत!',
          preventativeTip: 'Grip carton with two hands.'
        });
      }

      animRef.current = requestAnimationFrame(processFrame);
    };

    animRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isStreaming, privacyShield, onAlertTriggered]);

  // Render AI analysis text — convert basic markdown to JSX
  const renderAnalysis = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        return <h4 key={i} className="font-bold text-white mt-3 mb-1 text-sm">{trimmed.slice(2, -2)}</h4>;
      }
      // inline bold
      const parts = trimmed.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-slate-300 text-xs leading-relaxed">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Live Edge Camera / Custom Video Ingestion
            </h3>
            <p className="text-[11px] text-slate-400">Stream warehouse CCTV or upload smartphone video for AI analysis</p>
          </div>
        </div>

        {/* Source Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isStreaming) stopWebcam();
              else startWebcam();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              isStreaming
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isStreaming ? 'Stop Camera' : 'Start Webcam'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload & Analyse Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* Hidden video element for stream decoding */}
        <video
          ref={videoRef}
          playsInline
          muted
          loop
          className="hidden"
        />

        {/* Display Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="w-full h-full object-contain"
        />

        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80 backdrop-blur-sm space-y-3">
            <Video className="w-12 h-12 text-slate-600" />
            <h4 className="text-sm font-bold text-white">Live Camera Ingestion Idle</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Start your webcam for real-time monitoring, or upload a video file to get an AI safety analysis report.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={startWebcam}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
              >
                Launch Device Camera
              </button>
              <label className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 cursor-pointer flex items-center gap-1.5">
                <FileVideo className="w-3.5 h-3.5" />
                Upload Video for AI Analysis
                <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* Telemetry Badge Overlay */}
        {isStreaming && (
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 shadow-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1">
              EDGE INFERENCE TELEMETRY
            </div>
            <div>Velocity: <strong className="text-blue-400">{telemetry.velocityTotal} m/s</strong></div>
            <div>Accel Y: <strong className="text-red-400">{telemetry.accelerationY} m/s²</strong></div>
            <div>Live Risk: <strong className={activeRiskLevel === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}>{activeRiskLevel} ({telemetry.riskScore}/100)</strong></div>
          </div>
        )}
      </div>

      {/* ─── AI Analysis Panel ─── */}
      {(isAnalyzing || aiAnalysis || analysisError) && (
        <div className="border-t border-slate-800 bg-slate-900">

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                <Brain className="w-4 h-4 text-violet-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Safety Analysis in Progress…</p>
                <p className="text-xs text-slate-400 mt-0.5">LoadGuard AI (GPT-4o via OpenRouter) is reviewing your video for warehouse safety incidents. This takes 10–20 seconds.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {analysisError && !isAnalyzing && (
            <div className="flex items-start gap-3 px-5 py-4">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Analysis Failed</p>
                <p className="text-xs text-slate-400 mt-0.5">{analysisError}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {aiAnalysis && !isAnalyzing && (
            <div className="px-5 py-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">AI Safety Analysis Report</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileVideo className="w-3 h-3" />
                    {aiAnalysis.filename}
                  </span>
                  <span>{aiAnalysis.file_size_mb} MB</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-300 border border-violet-700/50">
                    {aiAnalysis.model_used}
                  </span>
                </div>
              </div>

              {/* Analysis Body */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
                {renderAnalysis(aiAnalysis.analysis)}
              </div>

              {/* Re-analyze button */}
              <div className="flex justify-end">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  Analyse Another Video
                  <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
