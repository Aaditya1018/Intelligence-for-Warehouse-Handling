import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Activity, Eye, AlertOctagon, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { BenchmarkScenario } from '../types';

interface DigitalTwin3DProps {
  scenarios: BenchmarkScenario[];
  activeScenario: BenchmarkScenario;
  onSelectScenario: (scenarioId: string) => void;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedBay, setSelectedBay] = useState<string>(activeScenario.bayId);
  const [heatmapMode, setHeatmapMode] = useState<boolean>(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 450;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0E17');
    scene.fog = new THREE.FogExp2('#0A0E17', 0.025);

    // 2. Camera Setup (Isometric view)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 26, 32);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight('#94A3B8', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#60A5FA', 1.6);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const redAlertLight = new THREE.PointLight('#EF4444', 3.0, 18);
    redAlertLight.position.set(4, 6, 0);
    scene.add(redAlertLight);

    // 5. Ground Floor & Grid
    const floorGeo = new THREE.PlaneGeometry(60, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(60, 30, '#1E293B', '#1E293B');
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // 6. Loading Bays 1 to 4 Setup
    const bayMeshes: THREE.Group[] = [];
    const bayCoords = [
      { id: 'Bay 1', x: -18, z: -10, color: '#3B82F6', isFlagged: false },
      { id: 'Bay 2', x: -6, z: -10, color: '#F59E0B', isFlagged: false },
      { id: 'Bay 3', x: 6, z: -10, color: '#EF4444', isFlagged: true },
      { id: 'Bay 4', x: 18, z: -10, color: '#10B981', isFlagged: false }
    ];

    bayCoords.forEach((bay) => {
      const bayGroup = new THREE.Group();
      bayGroup.position.set(bay.x, 0, bay.z);

      // Dock Gate Structure
      const gateGeo = new THREE.BoxGeometry(8, 6, 0.4);
      const gateMat = new THREE.MeshStandardMaterial({
        color: '#1E293B',
        metalness: 0.6,
        roughness: 0.4
      });
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(0, 3, 0);
      gate.castShadow = true;
      bayGroup.add(gate);

      // Parked Truck Trailer Behind Dock
      const truckGeo = new THREE.BoxGeometry(7, 5, 12);
      const truckMat = new THREE.MeshStandardMaterial({
        color: bay.isFlagged ? '#450A0A' : '#1E293B',
        metalness: 0.3,
        roughness: 0.6
      });
      const truck = new THREE.Mesh(truckGeo, truckMat);
      truck.position.set(0, 2.5, -6.5);
      truck.castShadow = true;
      bayGroup.add(truck);

      // Staging Pallet Area on Inside Floor
      const stageGeo = new THREE.BoxGeometry(5, 0.1, 5);
      const stageMat = new THREE.MeshBasicMaterial({
        color: bay.color,
        wireframe: true
      });
      const stage = new THREE.Mesh(stageGeo, stageMat);
      stage.position.set(0, 0.05, 5);
      bayGroup.add(stage);

      // Cargo Pallet Stacks inside
      const boxGeo = new THREE.BoxGeometry(1.6, 1.4, 1.6);
      const boxMat = new THREE.MeshStandardMaterial({
        color: '#854D0E',
        roughness: 0.7
      });
      const b1 = new THREE.Mesh(boxGeo, boxMat);
      b1.position.set(-0.8, 0.7, 5);
      b1.castShadow = true;
      bayGroup.add(b1);

      if (bay.isFlagged) {
        // High Risk Glowing Beacon Indicator
        const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: '#EF4444' });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, 6.8, 0);
        bayGroup.add(beacon);
      }

      scene.add(bayGroup);
      bayMeshes.push(bayGroup);
    });

    // 7. Dynamic Moving Forklift
    const forkliftGroup = new THREE.Group();
    const flBodyGeo = new THREE.BoxGeometry(2.4, 1.8, 3.8);
    const flMat = new THREE.MeshStandardMaterial({ color: '#EAB308', metalness: 0.5, roughness: 0.3 });
    const flBody = new THREE.Mesh(flBodyGeo, flMat);
    flBody.position.set(0, 1.2, 0);
    flBody.castShadow = true;
    forkliftGroup.add(flBody);

    // Mast
    const mastGeo = new THREE.BoxGeometry(1.8, 3.0, 0.3);
    const mastMat = new THREE.MeshStandardMaterial({ color: '#0F172A' });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 1.8, 2.0);
    forkliftGroup.add(mast);

    // Safety Halo Light on Ground
    const haloGeo = new THREE.RingGeometry(3.2, 3.6, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: '#EF4444', side: THREE.DoubleSide });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    forkliftGroup.add(halo);

    forkliftGroup.position.set(-10, 0, 8);
    scene.add(forkliftGroup);

    // 8. Spatio-Temporal Risk Heatmap Overlay
    const heatmapCanvas = document.createElement('canvas');
    heatmapCanvas.width = 512;
    heatmapCanvas.height = 512;
    const hCtx = heatmapCanvas.getContext('2d')!;

    // Draw realistic warehouse risk hotspots
    hCtx.fillStyle = '#000000';
    hCtx.fillRect(0, 0, 512, 512);

    const drawRadialGradient = (x: number, y: number, r: number, color: string) => {
      const g = hCtx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(0.5, color.replace('1)', '0.4)'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      hCtx.fillStyle = g;
      hCtx.beginPath();
      hCtx.arc(x, y, r, 0, Math.PI * 2);
      hCtx.fill();
    };

    // Hotspots: Bay 3 Drop zone (Red), Bay 1 Drag lane (Amber), Forklift intersection (Red)
    drawRadialGradient(310, 200, 70, 'rgba(239, 68, 68, 1)'); // Bay 3
    drawRadialGradient(160, 220, 55, 'rgba(245, 158, 11, 1)'); // Bay 1
    drawRadialGradient(250, 360, 80, 'rgba(239, 68, 68, 0.9)'); // Forklift pinch zone
    drawRadialGradient(420, 200, 45, 'rgba(59, 130, 246, 0.8)'); // Bay 4 (Safe)

    const heatTexture = new THREE.CanvasTexture(heatmapCanvas);
    const heatPlaneGeo = new THREE.PlaneGeometry(60, 40);
    const heatPlaneMat = new THREE.MeshBasicMaterial({
      map: heatTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const heatPlane = new THREE.Mesh(heatPlaneGeo, heatPlaneMat);
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = 0.08;
    scene.add(heatPlane);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Move forklift back and forth along transit corridor
      forkliftGroup.position.x = Math.sin(elapsed * 0.6) * 14;
      forkliftGroup.rotation.y = Math.cos(elapsed * 0.6) > 0 ? 0 : Math.PI;

      // Pulse alert lighting
      redAlertLight.intensity = 2.0 + Math.sin(elapsed * 4) * 1.5;

      // Rotate camera gently
      camera.position.x = 22 + Math.sin(elapsed * 0.1) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              3D Digital Twin & Hazard Heatmap
            </h3>
            <p className="text-[11px] text-slate-400">Real-Time Spatial Loading Bay Simulation</p>
          </div>
        </div>

        {/* Bay Quick Jump Buttons */}
        <div className="flex items-center gap-1.5">
          {['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'].map((bayId) => (
            <button
              key={bayId}
              onClick={() => {
                setSelectedBay(bayId);
                const match = scenarios.find((s) => s.bayId === bayId);
                if (match) onSelectScenario(match.id);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                selectedBay === bayId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {bayId} {bayId === 'Bay 3' && '⚠️'}
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative flex-1 min-h-[380px] bg-[#0A0E17]">
        <div ref={mountRef} className="w-full h-full" />

        {/* Heatmap Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 space-y-1.5 shadow-xl">
          <div className="font-bold text-slate-400 text-xs border-b border-slate-800 pb-1">
            SPATIO-TEMPORAL RISK HEATMAP
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span>High Risk Drop / Pinch Zone (Bay 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Floor Friction Dragging Corridor (Bay 1)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Safe Autonomous Transit Path (Bay 4)</span>
          </div>
        </div>

        {/* 3D Viewport Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 backdrop-blur-md flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>3D Mesh Sync: <strong className="text-white">60 FPS</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-[11px] font-mono text-red-300 backdrop-blur-md flex items-center gap-2">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Bay 3 Alert: <strong className="text-white">Impact Hazard</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
