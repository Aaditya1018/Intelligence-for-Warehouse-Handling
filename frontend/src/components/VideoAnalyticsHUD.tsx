import React, { useRef, useEffect } from 'react';
import { BenchmarkScenario, ScenarioFrame } from '../types';
import { Shield, Zap, AlertTriangle, Crosshair, EyeOff, Activity, Gauge } from 'lucide-react';

interface VideoAnalyticsHUDProps {
  scenario: BenchmarkScenario;
  currentFrame: ScenarioFrame;
  showSkeletons: boolean;
  showBoxes: boolean;
  showKinematics: boolean;
  privacyShield: boolean;
  onFrameSelect?: (frameIdx: number) => void;
}

export const VideoAnalyticsHUD: React.FC<VideoAnalyticsHUDProps> = ({
  scenario,
  currentFrame,
  showSkeletons,
  showBoxes,
  showKinematics,
  privacyShield
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Warehouse Loading Bay Environment
    ctx.clearRect(0, 0, width, height);

    // Dark Warehouse Floor gradient
    const floorGrad = ctx.createLinearGradient(0, 0, 0, height);
    floorGrad.addColorStop(0, '#0F172A');
    floorGrad.addColorStop(0.5, '#1E293B');
    floorGrad.addColorStop(1, '#0B1120');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 0, width, height);

    // Floor perspective lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(width, 360);
    ctx.stroke();

    // Hazard Yellow Safety Stripes on Loading Edge
    ctx.save();
    ctx.fillStyle = '#EAB308';
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 355);
      ctx.lineTo(x + 15, 355);
      ctx.lineTo(x + 5, 365);
      ctx.lineTo(x - 10, 365);
      ctx.fill();
    }
    ctx.restore();

    // Loading Bay Wall & Truck Body
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(20, 40, 200, 315);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 40, 200, 315);

    // Truck Door Graphic
    ctx.fillStyle = '#334155';
    ctx.fillRect(30, 50, 180, 295);
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${scenario.bayId} — ${scenario.vehicleType}`, 35, 75);

    // Staging Area Grid
    ctx.strokeStyle = '#22C55E33';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(340, 260, 200, 110);
    ctx.fillStyle = '#22C55E11';
    ctx.fillRect(340, 260, 200, 110);
    ctx.fillStyle = '#4ADE8088';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('STAGING CELL #02 (SAFE ZONE)', 350, 280);
    ctx.setLineDash([]);

    // 2. Draw Impact Shockwave if active
    if (currentFrame.impactWave && currentFrame.impactWave.intensity > 0) {
      const iw = currentFrame.impactWave;
      ctx.save();
      ctx.beginPath();
      ctx.arc(iw.x, iw.y, iw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239, 68, 68, ${iw.intensity})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(iw.x, iw.y, iw.radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 158, 11, ${iw.intensity * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Bounding Boxes & Objects
    currentFrame.bboxes.forEach((b) => {
      // Draw object graphic
      if (b.category === 'product') {
        // Draw corrugated cardboard box styling
        ctx.fillStyle = '#854D0E';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // Box seam tape
        ctx.fillStyle = '#D97706';
        ctx.fillRect(b.x + b.width / 2 - 4, b.y, 8, b.height);

        // Fragile icon / Godrej packaging stamp
        ctx.fillStyle = '#FEF08A';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText('FRAGILE ☂ ↑', b.x + 8, b.y + 18);
        ctx.fillText(`${scenario.productMassKg}kg`, b.x + 8, b.y + b.height - 10);
      } else if (b.category === 'person') {
        // Worker representation
        if (privacyShield) {
          // Silhouette / Privacy Mask
          ctx.fillStyle = '#065F46';
          ctx.beginPath();
          ctx.ellipse(b.x + b.width / 2, b.y + 30, 20, 24, 0, 0, Math.PI * 2); // Head
          ctx.fill();
          ctx.fillRect(b.x + 10, b.y + 55, b.width - 20, b.height - 55); // Body
          ctx.fillStyle = '#10B981';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText('[ANONYMIZED]', b.x + 5, b.y + 20);
        } else {
          // Normal Worker Avatar
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(b.x + 10, b.y + 60, b.width - 20, b.height - 60);
          ctx.fillStyle = '#FDE047'; // High-vis vest
          ctx.fillRect(b.x + 15, b.y + 70, b.width - 30, 70);
          ctx.fillStyle = '#FCA5A5'; // Head
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, b.y + 30, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38BDF8'; // Hard hat
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, b.y + 22, 20, Math.PI, 0);
          ctx.fill();
        }
      } else if (b.category === 'forklift') {
        // Forklift drawing
        ctx.fillStyle = '#EAB308';
        ctx.fillRect(b.x, b.y + 30, b.width, b.height - 30);
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(b.x + 20, b.y, 60, 40); // Mast
        // Wheels
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(b.x + 25, b.y + b.height - 5, 16, 0, Math.PI * 2);
        ctx.arc(b.x + b.width - 25, b.y + b.height - 5, 16, 0, Math.PI * 2);
        ctx.fill();

        // Forklift safety perimeter halo
        ctx.save();
        ctx.strokeStyle = '#EF444488';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw AI Bounding Box HUD
      if (showBoxes) {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // Corner HUD crosshairs
        const cLen = 8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(b.x, b.y + cLen);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(b.x + cLen, b.y);
        // Top-right
        ctx.moveTo(b.x + b.width - cLen, b.y);
        ctx.lineTo(b.x + b.width, b.y);
        ctx.lineTo(b.x + b.width, b.y + cLen);
        // Bottom-left
        ctx.moveTo(b.x, b.y + b.height - cLen);
        ctx.lineTo(b.x, b.y + b.height);
        ctx.lineTo(b.x + cLen, b.y + b.height);
        // Bottom-right
        ctx.moveTo(b.x + b.width - cLen, b.y + b.height);
        ctx.lineTo(b.x + b.width, b.y + b.height);
        ctx.lineTo(b.x + b.width, b.y + b.height - cLen);
        ctx.stroke();

        // Label Pill
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y - 20, Math.min(b.width + 40, 160), 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(`${b.label} (${Math.round(b.confidence * 100)}%)`, b.x + 6, b.y - 6);
        ctx.restore();
      }
    });

    // 4. Draw Worker Pose Skeleton Tracking
    if (showSkeletons && currentFrame.skeletons.length > 0) {
      currentFrame.skeletons.forEach((skel) => {
        ctx.save();
        ctx.strokeStyle = skel.isLiftingProperly ? '#10B981' : '#EF4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = skel.isLiftingProperly ? '#10B981' : '#EF4444';
        ctx.shadowBlur = 6;

        // Draw bone connections
        const jointMap = new Map(skel.joints.map((j) => [j.name, j]));
        const bones: [string, string][] = [
          ['head', 'neck'],
          ['neck', 'l_shoulder'],
          ['neck', 'r_shoulder'],
          ['l_shoulder', 'l_elbow'],
          ['r_shoulder', 'r_elbow'],
          ['l_elbow', 'l_wrist'],
          ['r_elbow', 'r_wrist'],
          ['neck', 'hip'],
          ['hip', 'l_knee'],
          ['hip', 'r_knee'],
          ['l_knee', 'l_ankle'],
          ['r_knee', 'r_ankle']
        ];

        bones.forEach(([j1, j2]) => {
          const p1 = jointMap.get(j1);
          const p2 = jointMap.get(j2);
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        // Draw joint nodes
        skel.joints.forEach((j) => {
          ctx.beginPath();
          ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#F8FAFC';
          ctx.fill();
        });

        // Draw Spine Flexion Angle Indicator
        ctx.fillStyle = skel.isLiftingProperly ? '#10B981' : '#EF4444';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(`Spine Flexion: ${skel.spineAngleDeg}° ${skel.isLiftingProperly ? '✓' : '⚠ STRAIN'}`, 240, 110);
        ctx.restore();
      });
    }

    // 5. Draw Kinematic Telemetry Vectors (Physics HUD)
    if (showKinematics) {
      const tel = currentFrame.telemetry;
      const targetBox = currentFrame.bboxes.find((b) => b.category === 'product');

      if (targetBox) {
        const centerX = targetBox.x + targetBox.width / 2;
        const centerY = targetBox.y + targetBox.height / 2;

        // Draw Velocity Vector Arrow
        if (tel.velocityTotal > 0.3) {
          ctx.save();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          const arrowLen = Math.min(tel.velocityTotal * 25, 90);
          ctx.lineTo(centerX + tel.velocityX * 20, centerY + tel.velocityY * 20);
          ctx.stroke();

          // Vector Label
          ctx.fillStyle = '#38BDF8';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText(`v = ${tel.velocityTotal} m/s`, centerX + 15, centerY - 10);
          ctx.restore();
        }

        // Draw Free-Fall Acceleration Vector if dropping
        if (tel.accelerationY > 4.0) {
          ctx.save();
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(centerX, targetBox.y + targetBox.height);
          ctx.lineTo(centerX, targetBox.y + targetBox.height + 40);
          ctx.stroke();

          // Downward arrowhead
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.moveTo(centerX - 6, targetBox.y + targetBox.height + 34);
          ctx.lineTo(centerX + 6, targetBox.y + targetBox.height + 34);
          ctx.lineTo(centerX, targetBox.y + targetBox.height + 44);
          ctx.fill();

          ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillText(`a_y = ${tel.accelerationY} m/s² (g-force)`, centerX + 12, targetBox.y + targetBox.height + 30);
          ctx.restore();
        }
      }
    }
  }, [scenario, currentFrame, showSkeletons, showBoxes, showKinematics, privacyShield]);

  const tel = currentFrame.telemetry;
  const alert = currentFrame.activeAlert;

  return (
    <div className="relative flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Stream Info Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-semibold border border-red-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            LIVE FEED INGESTION
          </span>
          <span className="text-slate-300 font-medium">
            {scenario.bayId} • Cam 04 (Ultra HD 4K) • 30 FPS
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Latency: <strong className="text-emerald-400">38ms (Edge)</strong></span>
          <span>PI-TK Engine: <strong className="text-blue-400">ACTIVE</strong></span>
          <span>Resolution: <strong>1920x1080</strong></span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="w-full h-full object-contain"
        />

        {/* Real-time Physics Kinematics HUD Widget Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 font-mono shadow-xl space-y-1.5 w-60">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Gauge className="w-3.5 h-3.5" /> KINEMATIC TELEMETRY
            </span>
            <span className={tel.riskScore > 75 ? 'text-red-400 font-bold' : tel.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}>
              Risk: {tel.riskScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div>
              <span className="text-slate-400">Velocity:</span>{' '}
              <span className="text-blue-400 font-bold">{tel.velocityTotal} m/s</span>
            </div>
            <div>
              <span className="text-slate-400">Accel Y:</span>{' '}
              <span className={tel.accelerationY > 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {tel.accelerationY} m/s²
              </span>
            </div>
            <div>
              <span className="text-slate-400">Drop Hgt:</span>{' '}
              <span className="text-amber-400 font-bold">{tel.dropHeightMeters} m</span>
            </div>
            <div>
              <span className="text-slate-400">Impact E:</span>{' '}
              <span className={tel.impactEnergyJoules > 40 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {tel.impactEnergyJoules} J
              </span>
            </div>
            <div>
              <span className="text-slate-400">Tilt Angle:</span>{' '}
              <span className={tel.stackTiltDegrees > 10 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {tel.stackTiltDegrees}°
              </span>
            </div>
            <div>
              <span className="text-slate-400">Overhang:</span>{' '}
              <span className={tel.overhangRatio > 0.25 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {Math.round(tel.overhangRatio * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Distinction Chain Badge Overlay */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-md text-[11px] font-mono shadow-lg">
            <span className="text-slate-400">Chain:</span>
            <span className="text-amber-400 font-semibold">Observed</span>
            <span className="text-slate-600">→</span>
            <span className="text-orange-400 font-semibold">Potential Risk</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 font-bold">Intervened</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border ${
            scenario.severity === 'CRITICAL'
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : scenario.severity === 'HIGH'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            SEVERITY: {scenario.severity}
          </div>
        </div>

        {/* Live Audio / Visual Alert Banner */}
        {alert && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border-2 border-red-500 rounded-xl p-3.5 backdrop-blur-md shadow-2xl shadow-red-900/50 animate-pulse flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-red-200 tracking-wide">
                  {alert.message}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white font-mono font-bold">
                  AUDIO NUDGE SENT
                </span>
              </div>
              <p className="text-xs text-yellow-300 font-medium">
                🗣 Hindi: {alert.hindiMessage}
              </p>
              <p className="text-[11px] text-slate-300 italic">
                💡 Preventative Tip: {alert.preventativeTip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
