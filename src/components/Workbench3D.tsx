import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Box,
  Layers,
  RotateCcw,
  Scissors,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Shape3DId, View3DMode } from '../types/geometry';
import { fmtNum } from '../data/shapesCatalog';

interface Workbench3DProps {
  shapeId: Shape3DId;
  params: Record<string, number>;
  viewMode: View3DMode;
  onChangeViewMode: (mode: View3DMode) => void;
}

interface LabelAnchor {
  id: string;
  text: string;
  pos: THREE.Vector3;
  tone: 'primary' | 'height' | 'proof';
}

const _projVec = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createCmGridTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);

  // Subtle minor 0.5cm lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  const step = size / 2;
  ctx.beginPath();
  ctx.moveTo(step, 0);
  ctx.lineTo(step, size);
  ctx.moveTo(0, step);
  ctx.lineTo(size, step);
  ctx.stroke();

  // Major 1cm border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBaseUnitTileTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, size - 6, size - 6);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createGlueTabMesh(
  width: number,
  depth: number,
  mat: THREE.Material,
  edgeMat: THREE.LineBasicMaterial
): THREE.Group {
  const g = new THREE.Group();
  const bevel = Math.min(width * 0.16, depth * 0.75);
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2 - bevel, depth);
  shape.lineTo(-width / 2 + bevel, depth);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(Math.PI / 2); // Lie flat in XZ extending toward +Z
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  g.add(mesh);

  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
  g.add(edges);
  return g;
}

function createPolygonShape(points2D: Array<[number, number]>): THREE.Shape {
  const s = new THREE.Shape();
  points2D.forEach(([x, y], i) => {
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  });
  s.closePath();
  return s;
}

function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh || (child as THREE.LineSegments).isLineSegments) {
      const m = child as THREE.Mesh;
      m.geometry?.dispose();
      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => mat.dispose());
      } else if (m.material) {
        m.material.dispose();
      }
    }
  });
}

export const Workbench3D: React.FC<Workbench3DProps> = ({
  shapeId,
  params,
  viewMode,
  onChangeViewMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelOverlayRef = useRef<HTMLDivElement | null>(null);
  const [webglLost, setWebglLost] = useState(false);

  // Max stack height for current solid
  const maxStackHeight = useMemo(() => {
    switch (shapeId) {
      case 'cubo':
        return params.a ?? 4;
      case 'paralelepipedo':
        return params.h ?? 5;
      case 'prisma_triangular':
      case 'prisma_hexagonal':
        return params.H ?? 6;
      case 'piramide_quadrada':
      case 'piramide_triangular':
      case 'cilindro':
      case 'cone':
        return params.h ?? 6;
      case 'esfera':
        return (params.r ?? 3.5) * 2;
    }
  }, [shapeId, params]);

  const [stackHeight, setStackHeight] = useState<number>(maxStackHeight);
  const [foldPercent, setFoldPercent] = useState<number>(65); // 0 = flat net, 100 = closed 3D solid

  // Keep stackHeight clamped when solid height changes
  useEffect(() => {
    setStackHeight(maxStackHeight);
  }, [shapeId, maxStackHeight]);

  // Persistent refs for Three.js objects so UI updates don't re-create WebGLRenderer
  const threeStateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    modelGroup: THREE.Group;
    requestRender: () => void;
    resetCamera: () => void;
    nudgeOrbit: (dAzimuth: number, dPolar: number, zoomFactor?: number) => void;
    anchors: LabelAnchor[];
    foldTarget: number;
    foldCurrent: number;
    foldUpdater: ((t: number) => void) | null;
    isAnimatingFold: boolean;
  } | null>(null);

  // Initialize Three.js Scene ONCE
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 460;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const handleContextRestored = () => {
      setWebglLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.Fog(0xf1f5f9, 26, 60);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(10.5, 8.5, 11.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 2.2, 0);
    controls.minDistance = 4;
    controls.maxDistance = 36;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.update();

    // 3-Point Studio Lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0xcbd5e1, 0.75);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    keyLight.position.set(10, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.8);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    // Workbench Ground Plane (1 cm drafting mat)
    const matTex = createCmGridTexture();
    matTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const groundGeo = new THREE.PlaneGeometry(48, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: matTex,
      roughness: 0.92,
      metalness: 0.02,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.01;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Subtle axes indicator on mat corner
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const updateProjectedLabels = () => {
      const overlay = labelOverlayRef.current;
      const state = threeStateRef.current;
      if (!overlay || !state) return;
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      const children = overlay.children;
      for (let i = 0; i < state.anchors.length; i++) {
        const el = children[i] as HTMLElement | undefined;
        if (!el) continue;
        _projVec.copy(state.anchors[i].pos);
        _projVec.project(camera);
        if (_projVec.z > 1) {
          el.style.opacity = '0';
          continue;
        }
        const sx = (_projVec.x * 0.5 + 0.5) * w;
        const sy = (-_projVec.y * 0.5 + 0.5) * h;
        el.style.opacity = '1';
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    let lastTime = performance.now();

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const st = threeStateRef.current;
        let needsAnotherFrame = false;

        if (st && st.isAnimatingFold && st.foldUpdater) {
          st.foldCurrent = THREE.MathUtils.damp(st.foldCurrent, st.foldTarget, 10, dt);
          if (Math.abs(st.foldCurrent - st.foldTarget) < 0.002) {
            st.foldCurrent = st.foldTarget;
            st.isAnimatingFold = false;
          } else {
            needsAnotherFrame = true;
          }
          st.foldUpdater(st.foldCurrent);
        }

        if (controls.enableDamping) {
          controls.update();
        }
        renderer.render(scene, camera);
        updateProjectedLabels();

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsAnotherFrame) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    controls.addEventListener('change', requestRender);

    const resetCamera = () => {
      camera.position.set(10.5, 8.5, 11.5);
      controls.target.set(0, 2.2, 0);
      controls.update();
      requestRender();
    };

    const nudgeOrbit = (dAzimuth: number, dPolar: number, zoomFactor = 1) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta += dAzimuth;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + dPolar, 0.18, Math.PI / 2 - 0.05);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * zoomFactor, 4.5, 34);
      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      requestRender();
    };

    threeStateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      modelGroup,
      requestRender,
      resetCamera,
      nudgeOrbit,
      anchors: [],
      foldTarget: 0.65,
      foldCurrent: 0.65,
      foldUpdater: null,
      isAnimatingFold: false,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeHierarchy(scene);
      matTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      threeStateRef.current = null;
    };
  }, []);

  // Build / Update 3D Geometry whenever shape, params, viewMode, or stackHeight changes
  const [activeAnchors, setActiveAnchors] = useState<
    Array<{ id: string; text: string; tone: 'primary' | 'height' | 'proof' }>
  >([]);

  useEffect(() => {
    const st = threeStateRef.current;
    if (!st) return;

    const { modelGroup } = st;
    while (modelGroup.children.length > 0) {
      const ch = modelGroup.children[0];
      modelGroup.remove(ch);
      disposeHierarchy(ch);
    }
    st.foldUpdater = null;

    // Materials
    const solidMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.32,
      metalness: 0.05,
      transparent: true,
      opacity: 0.84,
      side: THREE.DoubleSide,
    });
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.45,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.52,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    const tabMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.65,
      metalness: 0.02,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x0f172a });
    const tabEdgeMat = new THREE.LineBasicMaterial({ color: 0x92400e });
    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const addSolidWithEdges = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      parent: THREE.Object3D = modelGroup,
      castShadow = true
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = castShadow;
      m.receiveShadow = true;
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 18), edgeMat);
      const g = new THREE.Group();
      g.add(m, e);
      parent.add(g);
      return g;
    };

    const anchors: LabelAnchor[] = [];

    // Helper: create regular polygon vertices in XZ plane (counter-clockwise from +Y)
    const regularPolyXZ = (n: number, sideLen: number): Array<[number, number]> => {
      const R = sideLen / (2 * Math.sin(Math.PI / n));
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) {
        const ang = (i * 2 * Math.PI) / n;
        pts.push([R * Math.cos(ang), -R * Math.sin(ang)]);
      }
      return pts;
    };

    // Helper: hinged panel along edge P1->P2 in XZ plane
    const createEdgeHinge = (
      p1: [number, number],
      p2: [number, number]
    ): { pivot: THREE.Group; edgeLen: number } => {
      const dx = p2[0] - p1[0];
      const dz = p2[1] - p1[1];
      const edgeLen = Math.hypot(dx, dz);
      const midX = (p1[0] + p2[0]) / 2;
      const midZ = (p1[1] + p2[1]) / 2;
      const pivot = new THREE.Group();
      pivot.position.set(midX, 0, midZ);
      // Local +X along (dx, 0, dz), Local +Y = (0,1,0), Local +Z outward = (dx,0,dz) x (0,1,0) = (-dz, 0, dx)
      const angleY = Math.atan2(-dz, dx);
      pivot.rotation.y = angleY;
      return { pivot, edgeLen };
    };

    // =========================================================================
    // MODE 1: SÓLIDO COMPLETO
    // =========================================================================
    if (viewMode === 'solido') {
      if (shapeId === 'cubo') {
        const a = params.a ?? 4;
        const geo = new THREE.BoxGeometry(a, a, a);
        geo.translate(0, a / 2, 0);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'a1', text: `Aresta (a) = ${fmtNum(a)} cm`, pos: new THREE.Vector3(0, 0.1, a / 2 + 0.55), tone: 'primary' },
          { id: 'a2', text: `Altura (a) = ${fmtNum(a)} cm`, pos: new THREE.Vector3(a / 2 + 0.6, a / 2, 0), tone: 'height' }
        );
      } else if (shapeId === 'paralelepipedo') {
        const c = params.c ?? 6;
        const l = params.l ?? 4;
        const h = params.h ?? 5;
        const geo = new THREE.BoxGeometry(c, h, l);
        geo.translate(0, h / 2, 0);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'c', text: `Comprimento (c) = ${fmtNum(c)} cm`, pos: new THREE.Vector3(0, 0.1, l / 2 + 0.6), tone: 'primary' },
          { id: 'l', text: `Largura (l) = ${fmtNum(l)} cm`, pos: new THREE.Vector3(c / 2 + 0.65, 0.1, 0), tone: 'primary' },
          { id: 'h', text: `Altura (h) = ${fmtNum(h)} cm`, pos: new THREE.Vector3(c / 2 + 0.65, h / 2, l / 2), tone: 'height' }
        );
      } else if (shapeId === 'prisma_triangular') {
        const b = params.b ?? 5;
        const ht = params.ht ?? 4;
        const H = params.H ?? 6;
        const tri = createPolygonShape([
          [-b / 2, -ht / 3],
          [b / 2, -ht / 3],
          [0, (2 * ht) / 3],
        ]);
        const geo = new THREE.ExtrudeGeometry(tri, { depth: H, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'b', text: `Base (b) = ${fmtNum(b)} cm`, pos: new THREE.Vector3(0, 0.15, ht / 3 + 0.55), tone: 'primary' },
          { id: 'H', text: `Altura Prisma (H) = ${fmtNum(H)} cm`, pos: new THREE.Vector3(b / 2 + 0.65, H / 2, ht / 3), tone: 'height' }
        );
      } else if (shapeId === 'prisma_hexagonal') {
        const l = params.l ?? 3;
        const H = params.H ?? 5;
        const verts = regularPolyXZ(6, l);
        const shape = createPolygonShape(verts.map(([x, z]) => [x, -z]));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'l', text: `Aresta Base (l) = ${fmtNum(l)} cm`, pos: new THREE.Vector3(0, 0.15, l + 0.4), tone: 'primary' },
          { id: 'H', text: `Altura (H) = ${fmtNum(H)} cm`, pos: new THREE.Vector3(l + 0.8, H / 2, 0), tone: 'height' }
        );
      } else if (shapeId === 'piramide_quadrada') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const radius = l / Math.SQRT2;
        const geo = new THREE.ConeGeometry(radius, h, 4);
        geo.rotateY(Math.PI / 4);
        geo.translate(0, h / 2, 0);
        addSolidWithEdges(geo, solidMat);
        const ap = Math.hypot(h, l / 2);
        anchors.push(
          { id: 'l', text: `Aresta Base (l) = ${fmtNum(l)} cm`, pos: new THREE.Vector3(0, 0.15, l / 2 + 0.55), tone: 'primary' },
          { id: 'h', text: `Altura (h) = ${fmtNum(h)} cm`, pos: new THREE.Vector3(0, h / 2, 0), tone: 'height' },
          { id: 'ap', text: `Apótema (ap) ≈ ${fmtNum(ap)} cm`, pos: new THREE.Vector3(l / 4 + 0.5, h / 2, l / 4 + 0.4), tone: 'proof' }
        );
      } else if (shapeId === 'piramide_triangular') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const R = l / Math.sqrt(3);
        const geo = new THREE.ConeGeometry(R, h, 3);
        geo.translate(0, h / 2, 0);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'l', text: `Aresta Base (l) = ${fmtNum(l)} cm`, pos: new THREE.Vector3(0, 0.15, R + 0.45), tone: 'primary' },
          { id: 'h', text: `Altura (h) = ${fmtNum(h)} cm`, pos: new THREE.Vector3(0, h / 2, 0), tone: 'height' }
        );
      } else if (shapeId === 'cilindro') {
        const r = params.r ?? 3;
        const h = params.h ?? 6;
        const geo = new THREE.CylinderGeometry(r, r, h, 36);
        geo.translate(0, h / 2, 0);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'r', text: `Raio (r) = ${fmtNum(r)} cm`, pos: new THREE.Vector3(r / 2, h + 0.35, 0), tone: 'primary' },
          { id: 'h', text: `Altura (h) = ${fmtNum(h)} cm`, pos: new THREE.Vector3(r + 0.75, h / 2, 0), tone: 'height' }
        );
      } else if (shapeId === 'cone') {
        const r = params.r ?? 3;
        const h = params.h ?? 6;
        const g = Math.hypot(r, h);
        const geo = new THREE.ConeGeometry(r, h, 36);
        geo.translate(0, h / 2, 0);
        addSolidWithEdges(geo, solidMat);
        anchors.push(
          { id: 'r', text: `Raio (r) = ${fmtNum(r)} cm`, pos: new THREE.Vector3(r / 2, 0.25, r * 0.4), tone: 'primary' },
          { id: 'h', text: `Altura (h) = ${fmtNum(h)} cm`, pos: new THREE.Vector3(0, h / 2, 0), tone: 'height' },
          { id: 'g', text: `Geratriz (g) ≈ ${fmtNum(g)} cm`, pos: new THREE.Vector3(r * 0.65 + 0.4, h / 2, 0), tone: 'proof' }
        );
      } else if (shapeId === 'esfera') {
        const r = params.r ?? 3.5;
        const geo = new THREE.SphereGeometry(r, 32, 24);
        geo.translate(0, r, 0);
        const mesh = new THREE.Mesh(geo, solidMat);
        mesh.castShadow = true;
        modelGroup.add(mesh);
        // Equator + meridian guide rings
        const ringGeo = new THREE.TorusGeometry(r + 0.015, 0.025, 8, 48);
        const eq = new THREE.Mesh(ringGeo, edgeMat);
        eq.rotation.x = Math.PI / 2;
        eq.position.y = r;
        const mer = new THREE.Mesh(ringGeo.clone(), edgeMat);
        mer.position.y = r;
        modelGroup.add(eq, mer);
        anchors.push(
          { id: 'r', text: `Raio (r) = ${fmtNum(r)} cm`, pos: new THREE.Vector3(r * 0.6, r + 0.2, 0), tone: 'primary' },
          { id: 'd', text: `Diâmetro (2r) = ${fmtNum(2 * r)} cm`, pos: new THREE.Vector3(0, 2 * r + 0.45, 0), tone: 'height' }
        );
      }
    }

    // =========================================================================
    // MODE 2: EMPILHAMENTO DE CAMADAS
    // =========================================================================
    else if (viewMode === 'camadas') {
      const unitTileTex = createBaseUnitTileTexture();
      const targetH = Math.min(stackHeight, maxStackHeight);
      const numLayers = Math.max(1, Math.ceil(targetH));

      // Ghost reference container for Pyramids / Cones (1/3) or Sphere (2/3)
      if (shapeId === 'piramide_quadrada') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const boxGhost = new THREE.BoxGeometry(l, h, l);
        boxGhost.translate(0, h / 2, 0);
        modelGroup.add(new THREE.Mesh(boxGhost, ghostMat));
      } else if (shapeId === 'piramide_triangular') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const R = l / Math.sqrt(3);
        const triGhost = new THREE.CylinderGeometry(R, R, h, 3);
        triGhost.translate(0, h / 2, 0);
        modelGroup.add(new THREE.Mesh(triGhost, ghostMat));
      } else if (shapeId === 'cone') {
        const r = params.r ?? 3;
        const h = params.h ?? 6;
        const cylGhost = new THREE.CylinderGeometry(r, r, h, 24);
        cylGhost.translate(0, h / 2, 0);
        modelGroup.add(new THREE.Mesh(cylGhost, ghostMat));
      } else if (shapeId === 'esfera') {
        const r = params.r ?? 3.5;
        const cylGhost = new THREE.CylinderGeometry(r, r, 2 * r, 24);
        cylGhost.translate(0, r, 0);
        modelGroup.add(new THREE.Mesh(cylGhost, ghostMat));
      }

      for (let i = 0; i < numLayers; i++) {
        const yBottom = i;
        const slabH = Math.min(1, targetH - i);
        if (slabH <= 0.01) continue;
        const yMid = yBottom + slabH / 2;
        const isBaseLayer = i === 0;

        const layerColor = isBaseLayer ? 0x0284c7 : i % 2 === 1 ? 0x38bdf8 : 0x0ea5e9;
        const layerMat = new THREE.MeshStandardMaterial({
          color: layerColor,
          roughness: 0.42,
          metalness: 0.05,
          transparent: !isBaseLayer,
          opacity: isBaseLayer ? 0.96 : 0.78,
        });

        if (shapeId === 'cubo' || shapeId === 'paralelepipedo') {
          const w = shapeId === 'cubo' ? (params.a ?? 4) : (params.c ?? 6);
          const d = shapeId === 'cubo' ? (params.a ?? 4) : (params.l ?? 4);
          const geo = new THREE.BoxGeometry(w, slabH - 0.04, d);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);

          if (isBaseLayer) {
            const tileTex = unitTileTex.clone();
            tileTex.needsUpdate = true;
            tileTex.repeat.set(w, d);
            const gridPlate = new THREE.Mesh(
              new THREE.PlaneGeometry(w, d),
              new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.6 })
            );
            gridPlate.rotation.x = -Math.PI / 2;
            gridPlate.position.y = slabH - 0.01;
            modelGroup.add(gridPlate);
          }
        } else if (shapeId === 'prisma_triangular') {
          const b = params.b ?? 5;
          const ht = params.ht ?? 4;
          const tri = createPolygonShape([
            [-b / 2, -ht / 3],
            [b / 2, -ht / 3],
            [0, (2 * ht) / 3],
          ]);
          const geo = new THREE.ExtrudeGeometry(tri, { depth: slabH - 0.04, bevelEnabled: false });
          geo.rotateX(-Math.PI / 2);
          geo.translate(0, yBottom, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'prisma_hexagonal') {
          const l = params.l ?? 3;
          const verts = regularPolyXZ(6, l);
          const shape = createPolygonShape(verts.map(([x, z]) => [x, -z]));
          const geo = new THREE.ExtrudeGeometry(shape, { depth: slabH - 0.04, bevelEnabled: false });
          geo.rotateX(-Math.PI / 2);
          geo.translate(0, yBottom, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'cilindro') {
          const r = params.r ?? 3;
          const geo = new THREE.CylinderGeometry(r, r, slabH - 0.04, 32);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'piramide_quadrada') {
          const l = params.l ?? 5;
          const h = params.h ?? 6;
          const t0 = Math.max(0, 1 - yBottom / h);
          const t1 = Math.max(0, 1 - (yBottom + slabH) / h);
          const rBottom = (l / Math.SQRT2) * t0;
          const rTop = (l / Math.SQRT2) * t1;
          const geo = new THREE.CylinderGeometry(rTop, rBottom, slabH - 0.03, 4);
          geo.rotateY(Math.PI / 4);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'piramide_triangular') {
          const l = params.l ?? 5;
          const h = params.h ?? 6;
          const R = l / Math.sqrt(3);
          const rBottom = R * Math.max(0, 1 - yBottom / h);
          const rTop = R * Math.max(0, 1 - (yBottom + slabH) / h);
          const geo = new THREE.CylinderGeometry(rTop, rBottom, slabH - 0.03, 3);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'cone') {
          const r = params.r ?? 3;
          const h = params.h ?? 6;
          const rBottom = r * Math.max(0, 1 - yBottom / h);
          const rTop = r * Math.max(0, 1 - (yBottom + slabH) / h);
          const geo = new THREE.CylinderGeometry(rTop, rBottom, slabH - 0.03, 32);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);
        } else if (shapeId === 'esfera') {
          const r = params.r ?? 3.5;
          const dy = yMid - r;
          const sliceR = Math.sqrt(Math.max(0.02, r * r - dy * dy));
          const geo = new THREE.CylinderGeometry(sliceR, sliceR, slabH - 0.04, 32);
          geo.translate(0, yMid, 0);
          addSolidWithEdges(geo, layerMat);
        }
      }

      anchors.push({
        id: 'stack',
        text: `Camadas empilhadas: ${fmtNum(targetH)} cm / ${fmtNum(maxStackHeight)} cm`,
        pos: new THREE.Vector3(0, targetH + 0.6, 0),
        tone: 'height',
      });
    }

    // =========================================================================
    // MODE 3: PLANIFICAÇÃO MAKER (2D ↔ 3D)
    // =========================================================================
    else if (viewMode === 'planificacao') {
      const initialT = THREE.MathUtils.clamp(foldPercent / 100, 0, 1);
      st.foldTarget = initialT;
      st.foldCurrent = initialT;

      const makeRectPanel = (w: number, d: number, mat: THREE.Material, zSign: 1 | -1) => {
        const geo = new THREE.PlaneGeometry(w, d);
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, 0, zSign * (d / 2));
        const g = new THREE.Group();
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        g.add(m, new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
        return g;
      };

      const makeTriPanel = (baseLen: number, slantH: number, mat: THREE.Material) => {
        const shape = createPolygonShape([
          [-baseLen / 2, 0],
          [baseLen / 2, 0],
          [0, slantH],
        ]);
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(Math.PI / 2); // +Y in shape -> +Z in XZ plane
        const g = new THREE.Group();
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        g.add(m, new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
        return g;
      };

      if (shapeId === 'cubo' || shapeId === 'paralelepipedo') {
        const w = shapeId === 'cubo' ? (params.a ?? 4) : (params.c ?? 6);
        const d = shapeId === 'cubo' ? (params.a ?? 4) : (params.l ?? 4);
        const h = shapeId === 'cubo' ? (params.a ?? 4) : (params.h ?? 5);
        const tabD = Math.min(0.45, Math.min(w, d, h) * 0.18);

        // Base centered at origin
        const baseGeo = new THREE.PlaneGeometry(w, d);
        baseGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(baseGeo, baseMat);

        // Front wall (+Z)
        const frontPivot = new THREE.Group();
        frontPivot.position.set(0, 0, d / 2);
        frontPivot.add(makeRectPanel(w, h, cardMat, 1));
        const frontTab = createGlueTabMesh(h, tabD, tabMat, tabEdgeMat);
        frontTab.position.set(w / 2, 0, h / 2);
        frontTab.rotation.y = Math.PI / 2;
        frontPivot.add(frontTab);
        modelGroup.add(frontPivot);

        // Back wall (-Z) + Top Lid
        const backPivot = new THREE.Group();
        backPivot.position.set(0, 0, -d / 2);
        backPivot.add(makeRectPanel(w, h, cardMat, -1));
        const backTab = createGlueTabMesh(h, tabD, tabMat, tabEdgeMat);
        backTab.position.set(-w / 2, 0, -h / 2);
        backTab.rotation.y = -Math.PI / 2;
        backPivot.add(backTab);

        const topPivot = new THREE.Group();
        topPivot.position.set(0, 0, -h);
        topPivot.add(makeRectPanel(w, d, solidMat, -1));
        const topTabFront = createGlueTabMesh(w, tabD, tabMat, tabEdgeMat);
        topTabFront.position.set(0, 0, -d);
        topTabFront.rotation.y = Math.PI;
        topPivot.add(topTabFront);
        backPivot.add(topPivot);
        modelGroup.add(backPivot);

        // Right wall (+X)
        const rightPivot = new THREE.Group();
        rightPivot.position.set(w / 2, 0, 0);
        const rightGeo = new THREE.PlaneGeometry(h, d);
        rightGeo.rotateX(-Math.PI / 2);
        rightGeo.translate(h / 2, 0, 0);
        addSolidWithEdges(rightGeo, cardMat, rightPivot);
        modelGroup.add(rightPivot);

        // Left wall (-X)
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2, 0, 0);
        const leftGeo = new THREE.PlaneGeometry(h, d);
        leftGeo.rotateX(-Math.PI / 2);
        leftGeo.translate(-h / 2, 0, 0);
        addSolidWithEdges(leftGeo, cardMat, leftPivot);
        modelGroup.add(leftPivot);

        const applyFold = (t: number) => {
          const ang = t * (Math.PI / 2);
          frontPivot.rotation.x = -ang;
          backPivot.rotation.x = ang;
          topPivot.rotation.x = ang;
          rightPivot.rotation.z = ang;
          leftPivot.rotation.z = -ang;
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'prisma_triangular') {
        const b = params.b ?? 5;
        const ht = params.ht ?? 4;
        const H = params.H ?? 6;
        const tabD = Math.min(0.4, b * 0.15);

        const verts: Array<[number, number]> = [
          [-b / 2, ht / 3],
          [b / 2, ht / 3],
          [0, (-2 * ht) / 3],
        ];
        const baseShape = createPolygonShape(verts.map(([x, z]) => [x, -z]));
        const baseGeo = new THREE.ShapeGeometry(baseShape);
        baseGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(baseGeo, baseMat);

        const pivots: THREE.Group[] = [];
        for (let i = 0; i < 3; i++) {
          const p1 = verts[i];
          const p2 = verts[(i + 1) % 3];
          const { pivot, edgeLen } = createEdgeHinge(p1, p2);
          pivot.add(makeRectPanel(edgeLen, H, cardMat, 1));
          const tab = createGlueTabMesh(H, tabD, tabMat, tabEdgeMat);
          tab.position.set(edgeLen / 2, 0, H / 2);
          tab.rotation.y = Math.PI / 2;
          pivot.add(tab);

          // Attach top triangular lid to edge 0 (base side b)
          if (i === 0) {
            const topPivot = new THREE.Group();
            topPivot.position.set(0, 0, H);
            topPivot.add(makeTriPanel(b, ht, solidMat));
            pivot.add(topPivot);
            pivots.push(topPivot);
          }
          modelGroup.add(pivot);
          pivots.push(pivot);
        }

        const applyFold = (t: number) => {
          const ang = -t * (Math.PI / 2);
          pivots.forEach((p) => {
            p.rotation.x = ang;
          });
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'prisma_hexagonal') {
        const l = params.l ?? 3;
        const H = params.H ?? 5;
        const tabD = Math.min(0.35, l * 0.16);
        const verts = regularPolyXZ(6, l);
        const baseShape = createPolygonShape(verts.map(([x, z]) => [x, -z]));
        const baseGeo = new THREE.ShapeGeometry(baseShape);
        baseGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(baseGeo, baseMat);

        const pivots: THREE.Group[] = [];
        for (let i = 0; i < 6; i++) {
          const p1 = verts[i];
          const p2 = verts[(i + 1) % 6];
          const { pivot, edgeLen } = createEdgeHinge(p1, p2);
          pivot.add(makeRectPanel(edgeLen, H, cardMat, 1));
          if (i % 2 === 0) {
            const tab = createGlueTabMesh(H, tabD, tabMat, tabEdgeMat);
            tab.position.set(edgeLen / 2, 0, H / 2);
            tab.rotation.y = Math.PI / 2;
            pivot.add(tab);
          }
          if (i === 4) {
            // Attach top hexagon to front-facing edge
            const topPivot = new THREE.Group();
            topPivot.position.set(0, 0, H);
            const ap = (l * Math.sqrt(3)) / 2;
            const topGeo = new THREE.ShapeGeometry(
              createPolygonShape(verts.map(([x, z]) => [x, -z]))
            );
            topGeo.rotateX(-Math.PI / 2);
            topGeo.translate(0, 0, ap);
            const topMesh = new THREE.Mesh(topGeo, solidMat);
            topMesh.castShadow = true;
            topPivot.add(topMesh, new THREE.LineSegments(new THREE.EdgesGeometry(topGeo), edgeMat));
            pivot.add(topPivot);
            pivots.push(topPivot);
          }
          modelGroup.add(pivot);
          pivots.push(pivot);
        }

        const applyFold = (t: number) => {
          const ang = -t * (Math.PI / 2);
          pivots.forEach((p) => {
            p.rotation.x = ang;
          });
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'piramide_quadrada') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const ap = Math.hypot(h, l / 2);
        const tabD = Math.min(0.4, l * 0.14);
        const foldAngle = Math.PI / 2 + Math.asin(l / 2 / ap);

        const baseGeo = new THREE.PlaneGeometry(l, l);
        baseGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(baseGeo, baseMat);

        const verts: Array<[number, number]> = [
          [-l / 2, l / 2],
          [l / 2, l / 2],
          [l / 2, -l / 2],
          [-l / 2, -l / 2],
        ];
        const pivots: THREE.Group[] = [];
        for (let i = 0; i < 4; i++) {
          const { pivot, edgeLen } = createEdgeHinge(verts[i], verts[(i + 1) % 4]);
          pivot.add(makeTriPanel(edgeLen, ap, cardMat));
          // Glue tab on right slant edge
          const legLen = Math.hypot(edgeLen / 2, ap);
          const tab = createGlueTabMesh(legLen * 0.72, tabD, tabMat, tabEdgeMat);
          tab.position.set(edgeLen / 4, 0, ap / 2);
          tab.rotation.y = Math.atan2(ap, edgeLen / 2);
          pivot.add(tab);
          modelGroup.add(pivot);
          pivots.push(pivot);
        }

        const applyFold = (t: number) => {
          const ang = -t * foldAngle;
          pivots.forEach((p) => {
            p.rotation.x = ang;
          });
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'piramide_triangular') {
        const l = params.l ?? 5;
        const h = params.h ?? 6;
        const rIn = l / (2 * Math.sqrt(3));
        const ap = Math.hypot(h, rIn);
        const tabD = Math.min(0.4, l * 0.14);
        const foldAngle = Math.PI / 2 + Math.asin(rIn / ap);

        const verts = regularPolyXZ(3, l);
        const baseGeo = new THREE.ShapeGeometry(
          createPolygonShape(verts.map(([x, z]) => [x, -z]))
        );
        baseGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(baseGeo, baseMat);

        const pivots: THREE.Group[] = [];
        for (let i = 0; i < 3; i++) {
          const { pivot, edgeLen } = createEdgeHinge(verts[i], verts[(i + 1) % 3]);
          pivot.add(makeTriPanel(edgeLen, ap, cardMat));
          const legLen = Math.hypot(edgeLen / 2, ap);
          const tab = createGlueTabMesh(legLen * 0.7, tabD, tabMat, tabEdgeMat);
          tab.position.set(edgeLen / 4, 0, ap / 2);
          tab.rotation.y = Math.atan2(ap, edgeLen / 2);
          pivot.add(tab);
          modelGroup.add(pivot);
          pivots.push(pivot);
        }

        const applyFold = (t: number) => {
          const ang = -t * foldAngle;
          pivots.forEach((p) => {
            p.rotation.x = ang;
          });
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'cilindro') {
        const r = params.r ?? 3;
        const h = params.h ?? 6;
        const segs = 32;

        // Bottom circular cap at (0,0,0)
        const botGeo = new THREE.CircleGeometry(r, segs);
        botGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(botGeo, baseMat);

        // Hinged sheet group at tangent (0, 0, -r)
        const sheetRoot = new THREE.Group();
        sheetRoot.position.set(0, 0, -r);
        modelGroup.add(sheetRoot);

        // Dynamic curved lateral mesh
        const latGeo = new THREE.BufferGeometry();
        const vertCount = (segs + 1) * 2;
        const posArr = new Float32Array(vertCount * 3);
        const indices: number[] = [];
        for (let i = 0; i < segs; i++) {
          const a = i * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          indices.push(a, c, b, b, c, d);
        }
        latGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        latGeo.setIndex(indices);
        const latMesh = new THREE.Mesh(latGeo, cardMat);
        latMesh.castShadow = true;
        sheetRoot.add(latMesh);

        // Glue tab along right edge of lateral sheet
        const tabGeo = new THREE.PlaneGeometry(0.42, h);
        tabGeo.rotateX(-Math.PI / 2);
        const tabMesh = new THREE.Mesh(tabGeo, tabMat);
        sheetRoot.add(tabMesh);

        // Top circular cap hinged at midpoint of sheet top edge (0, 0, -h)
        const topPivot = new THREE.Group();
        topPivot.position.set(0, 0, -h);
        const topGeo = new THREE.CircleGeometry(r, segs);
        topGeo.rotateX(-Math.PI / 2);
        topGeo.translate(0, 0, -r);
        addSolidWithEdges(topGeo, solidMat, topPivot);
        sheetRoot.add(topPivot);

        const applyFold = (t: number) => {
          sheetRoot.rotation.x = t * (Math.PI / 2);
          topPivot.rotation.x = t * (Math.PI / 2);

          const pos = latGeo.attributes.position as THREE.BufferAttribute;
          const totalW = 2 * Math.PI * r;
          for (let i = 0; i <= segs; i++) {
            const s = (i / segs - 0.5) * totalW;
            let px: number;
            let pz: number;
            if (t < 0.001) {
              px = s;
              pz = 0;
            } else {
              const R = r / t;
              const ang = s / R;
              px = R * Math.sin(ang);
              // Local sheet extends along -Z, curl inward toward +Z (+R*(1-cos(ang))? Wait: after sheetRoot rotates +90deg around X, local -Z becomes +Y, and local +Y becomes +Z! Wait!)
              // Let's check: when sheetRoot rotates +90deg around X:
              // Local +X stays World +X.
              // Local -Z becomes World +Y (height h!).
              // Local +Y becomes World +Z (inward toward circle center (0,0,0) from (0,0,-r)!)
              pz = 0;
              const py = R * (1 - Math.cos(ang));
              pos.setXYZ(i * 2, px, py, 0);
              pos.setXYZ(i * 2 + 1, px, py, -h);
              continue;
            }
            pos.setXYZ(i * 2, px, 0, pz);
            pos.setXYZ(i * 2 + 1, px, 0, -h);
          }
          pos.needsUpdate = true;
          latGeo.computeVertexNormals();

          // Position glue tab at end of arc
          if (t < 0.001) {
            tabMesh.position.set(Math.PI * r + 0.21, 0, -h / 2);
            tabMesh.rotation.set(0, 0, 0);
          } else {
            const R = r / t;
            const angEnd = (Math.PI * r) / R;
            tabMesh.position.set(R * Math.sin(angEnd), R * (1 - Math.cos(angEnd)), -h / 2);
            tabMesh.rotation.set(0, 0, angEnd);
          }
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'cone') {
        const r = params.r ?? 3;
        const h = params.h ?? 6;
        const g = Math.hypot(r, h);
        const segs = 32;

        // Bottom circular base at (0,0,0)
        const botGeo = new THREE.CircleGeometry(r, segs);
        botGeo.rotateX(-Math.PI / 2);
        addSolidWithEdges(botGeo, baseMat);

        // Fan / cone mesh pivoted around back tangent (0, 0, -r)
        const fanPivot = new THREE.Group();
        fanPivot.position.set(0, 0, -r);
        modelGroup.add(fanPivot);

        const coneGeo = new THREE.BufferGeometry();
        // Vertex 0 = apex, vertices 1..segs+1 = rim arc
        const posArr = new Float32Array((segs + 2) * 3);
        const indices: number[] = [];
        for (let i = 1; i <= segs; i++) {
          indices.push(0, i, i + 1);
        }
        coneGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        coneGeo.setIndex(indices);
        const coneMesh = new THREE.Mesh(coneGeo, cardMat);
        coneMesh.castShadow = true;
        fanPivot.add(coneMesh);

        // Seam line & glue tab along one slant edge
        const tabGeo = new THREE.PlaneGeometry(0.4, g * 0.85);
        tabGeo.rotateX(-Math.PI / 2);
        const tabMesh = new THREE.Mesh(tabGeo, tabMat);
        fanPivot.add(tabMesh);

        const applyFold = (t: number) => {
          const arcLen = 2 * Math.PI * r;
          const theta0 = arcLen / g;
          const phiTotal = theta0 + t * (2 * Math.PI - theta0);
          const R = arcLen / phiTotal;
          const Hcone = Math.sqrt(Math.max(0, g * g - R * R));

          // Center generator pitch angle from +Z: at t=0 -> PI (flat in -Z), at t=1 -> atan2(h, r)
          const pitchTarget = Math.atan2(h, r);
          const pitch = Math.PI - t * (Math.PI - pitchTarget);

          // In fanPivot local space, first construct partial cone with rim midpoint at (0,0,0)
          // and cone axis tilted so center generator aligns with angle `pitch` in YZ plane
          // Wait: simpler! In canonical partial-cone frame:
          // apex = (0, Hcone, R) relative to rim midpoint (0, 0, 0) (center generator goes from (0,0,0) to (0, Hcone, R))
          // Notice center generator vector is (0, Hcone, R) which already has pitch atan2(Hcone, R) in YZ!
          // At t=0: Hcone=0, R=g -> center generator is (0, 0, g) (angle 0). We rotate around X so it points at angle `pitch`!
          const curGenAngle = Math.atan2(Hcone, R);
          const deltaPitch = pitch - curGenAngle;
          const cosP = Math.cos(deltaPitch);
          const sinP = Math.sin(deltaPitch);

          const rotYZ = (x: number, y: number, z: number): [number, number, number] => [
            x,
            y * cosP - z * sinP,
            y * sinP + z * cosP,
          ];

          const pos = coneGeo.attributes.position as THREE.BufferAttribute;
          const [ax, ay, az] = rotYZ(0, Hcone, R);
          pos.setXYZ(0, ax, ay, az);

          for (let i = 0; i <= segs; i++) {
            const ang = (i / segs - 0.5) * phiTotal;
            // Rim sits in local XZ plane around center (0, 0, R) with radius R; at ang=0, rim=(0,0,0)
            const rx = R * Math.sin(ang);
            const rz = R * (1 - Math.cos(ang));
            const [wx, wy, wz] = rotYZ(rx, 0, rz);
            pos.setXYZ(i + 1, wx, wy, wz);
          }
          pos.needsUpdate = true;
          coneGeo.computeVertexNormals();

          // Hide glue tab as cone closes near 100%
          tabMesh.visible = t < 0.96;
          const [endX, endY, endZ] = rotYZ(
            R * Math.sin(phiTotal / 2),
            0,
            R * (1 - Math.cos(phiTotal / 2))
          );
          tabMesh.position.set((ax + endX) / 2, (ay + endY) / 2, (az + endZ) / 2);
          tabMesh.lookAt(ax, ay, az);
          tabMesh.rotateX(Math.PI / 2);
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      } else if (shapeId === 'esfera') {
        const r = params.r ?? 3.5;
        const numGores = 12;
        const latSegs = 20;
        const dLambda = (2 * Math.PI) / numGores;

        // Build 12 meridianal gores
        const goreGeos: Array<{ geo: THREE.BufferGeometry; k: number }> = [];
        for (let k = 0; k < numGores; k++) {
          const geo = new THREE.BufferGeometry();
          const vCount = (latSegs + 1) * 2;
          const posArr = new Float32Array(vCount * 3);
          const indices: number[] = [];
          for (let i = 0; i < latSegs; i++) {
            const a = i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;
            indices.push(a, b, c, b, d, c);
          }
          geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
          geo.setIndex(indices);
          const m = new THREE.Mesh(geo, k % 2 === 0 ? cardMat : solidMat);
          m.castShadow = true;
          modelGroup.add(m);
          goreGeos.push({ geo, k });
        }

        const applyFold = (t: number) => {
          const centerOffset = (numGores - 1) / 2;
          for (const { geo, k } of goreGeos) {
            const pos = geo.attributes.position as THREE.BufferAttribute;
            const lamCenter = (k - centerOffset) * dLambda;

            for (let i = 0; i <= latSegs; i++) {
              const phi = ((i / latSegs) - 0.5) * Math.PI; // -pi/2 .. +pi/2
              const cosPhi = Math.cos(phi);
              for (let side = 0; side < 2; side++) {
                const u = side === 0 ? -0.5 : 0.5;
                const lam = lamCenter + u * dLambda;

                // Flat gore coordinate (t = 0) on y = 0 workbench
                const flatX = (lamCenter + u * dLambda * cosPhi) * r;
                const flatY = 0;
                const flatZ = -r * phi;

                // Sphere coordinate (t = 1) centered at (0, r, 0)
                const sphX = r * cosPhi * Math.sin(lam);
                const sphY = r + r * Math.sin(phi);
                const sphZ = r * cosPhi * Math.cos(lam);

                // Smooth curved blend via intermediate curl factor
                const curlT = t;
                const x = THREE.MathUtils.lerp(flatX, sphX, curlT);
                const y =
                  THREE.MathUtils.lerp(flatY, sphY, curlT) +
                  Math.sin(curlT * Math.PI) * 0.35 * r * cosPhi;
                const z = THREE.MathUtils.lerp(flatZ, sphZ, curlT);

                pos.setXYZ(i * 2 + side, x, y, z);
              }
            }
            pos.needsUpdate = true;
            geo.computeVertexNormals();
          }
        };
        applyFold(initialT);
        st.foldUpdater = applyFold;
      }

      anchors.push({
        id: 'fold',
        text: `Dobradura: ${foldPercent}% (${foldPercent === 0 ? 'Molde Plano 2D' : foldPercent === 100 ? 'Sólido Montado 3D' : 'Em montagem'})`,
        pos: new THREE.Vector3(0, 0.3, 0),
        tone: 'proof',
      });
    }

    st.anchors = anchors;
    setActiveAnchors(anchors.map(({ id, text, tone }) => ({ id, text, tone })));
    st.requestRender();
  }, [shapeId, params, viewMode, stackHeight, maxStackHeight]);

  // Animate fold slider smoothly without rebuilding meshes
  useEffect(() => {
    const st = threeStateRef.current;
    if (!st || viewMode !== 'planificacao') return;
    st.foldTarget = THREE.MathUtils.clamp(foldPercent / 100, 0, 1);
    st.isAnimatingFold = true;
    st.requestRender();

    setActiveAnchors((prev) =>
      prev.map((a) =>
        a.id === 'fold'
          ? {
              ...a,
              text: `Dobradura: ${foldPercent}% (${foldPercent === 0 ? 'Molde Plano 2D' : foldPercent === 100 ? 'Sólido Montado 3D' : 'Em montagem'})`,
            }
          : a
      )
    );
  }, [foldPercent, viewMode]);

  const showOneThirdNote =
    viewMode === 'camadas' &&
    (shapeId === 'piramide_quadrada' ||
      shapeId === 'piramide_triangular' ||
      shapeId === 'cone');

  const showTwoThirdsNote = viewMode === 'camadas' && shapeId === 'esfera';

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Mode Switcher Bar */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div
          role="tablist"
          aria-label="Modo de Visualização 3D"
          className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'solido'}
            onClick={() => onChangeViewMode('solido')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-600 ${
              viewMode === 'solido'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sólido Completo</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'camadas'}
            onClick={() => onChangeViewMode('camadas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-600 ${
              viewMode === 'camadas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Empilhamento de Camadas</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'planificacao'}
            onClick={() => onChangeViewMode('planificacao')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-600 ${
              viewMode === 'planificacao'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Planificação Maker (2D ↔ 3D)</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Viewport Stage */}
      <div
        className="relative flex-1 min-h-[360px] bg-slate-100 select-none focus-visible:outline-2 focus-visible:outline-sky-600"
        tabIndex={0}
        aria-label="Visualizador 3D interativo. Use as setas do teclado ou arraste com o mouse para rotacionar."
        onKeyDown={(e) => {
          const st = threeStateRef.current;
          if (!st) return;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            st.nudgeOrbit(-0.18, 0);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            st.nudgeOrbit(0.18, 0);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            st.nudgeOrbit(0, -0.14);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            st.nudgeOrbit(0, 0.14);
          } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            st.nudgeOrbit(0, 0, 0.88);
          } else if (e.key === '-') {
            e.preventDefault();
            st.nudgeOrbit(0, 0, 1.14);
          }
        }}
      >
        {/* Dedicated WebGL Canvas Container */}
        <div ref={mountRef} className="w-full h-full min-h-[360px]" />

        {/* Projected Crisp Semantic Dimension Labels */}
        <div
          ref={labelOverlayRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {activeAnchors.map((a) => {
            const cls =
              a.tone === 'height'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                : a.tone === 'proof'
                  ? 'bg-amber-50 border-amber-600 text-amber-950'
                  : 'bg-white border-sky-600 text-slate-900';
            return (
              <div
                key={a.id}
                className={`absolute top-0 left-0 px-2 py-0.5 rounded border text-[11px] font-mono font-semibold whitespace-nowrap shadow-xs ${cls}`}
              >
                {a.text}
              </div>
            );
          })}
        </div>

        {/* WebGL context lost graceful fallback */}
        {webglLost && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-semibold text-slate-900">
              Contexto 3D temporariamente suspenso
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Os cálculos e a bancada continuam ativos. Recarregue ou clique em Resetar Câmera.
            </p>
          </div>
        )}

        {/* Accessible Camera Controls Bar (bottom-right, unobstructed center) */}
        <div
          role="group"
          aria-label="Controles acessíveis de câmera 3D"
          className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-sm"
        >
          <button
            type="button"
            title="Girar para esquerda"
            aria-label="Girar modelo para a esquerda"
            onClick={() => threeStateRef.current?.nudgeOrbit(-0.22, 0)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Girar para direita"
            aria-label="Girar modelo para a direita"
            onClick={() => threeStateRef.current?.nudgeOrbit(0.22, 0)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Inclinar para cima"
            aria-label="Inclinar câmera para cima"
            onClick={() => threeStateRef.current?.nudgeOrbit(0, -0.15)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Inclinar para baixo"
            aria-label="Inclinar câmera para baixo"
            onClick={() => threeStateRef.current?.nudgeOrbit(0, 0.15)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-0.5" aria-hidden="true" />
          <button
            type="button"
            title="Aproximar zoom"
            aria-label="Aproximar visualização"
            onClick={() => threeStateRef.current?.nudgeOrbit(0, 0, 0.85)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Afastar zoom"
            aria-label="Afastar visualização"
            onClick={() => threeStateRef.current?.nudgeOrbit(0, 0, 1.18)}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Vista padrão"
            aria-label="Restaurar vista padrão da câmera"
            onClick={() => threeStateRef.current?.resetCamera()}
            className="p-2 rounded hover:bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mode-Specific Bottom Interactive Dock */}
      {viewMode === 'camadas' && (
        <div className="px-4 py-3 border-t border-slate-200 bg-sky-50/60 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="layer-stack-slider"
              className="text-xs font-semibold text-slate-900"
            >
              Empilhamento de andares (1 cm / camada):{' '}
              <span className="font-mono text-sky-800 tabular-nums">
                {fmtNum(stackHeight)} cm de {fmtNum(maxStackHeight)} cm
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStackHeight(1)}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
              >
                1ª Camada (Ab)
              </button>
              <button
                type="button"
                onClick={() => setStackHeight(maxStackHeight)}
                className="px-2.5 py-1 text-xs font-medium bg-sky-700 text-white rounded hover:bg-sky-800"
              >
                Preencher Tudo
              </button>
            </div>
          </div>
          <input
            id="layer-stack-slider"
            type="range"
            min={1}
            max={maxStackHeight}
            step={0.5}
            value={stackHeight}
            onChange={(e) => setStackHeight(Number(e.target.value))}
            className="maker-slider w-full"
          />
          {showOneThirdNote && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 font-medium">
              Comparativo visual (linha pontilhada laranja): este sólido ocupa exatamente <strong>1/3 do volume</strong> do prisma/cilindro envolvente de mesma base e altura.
            </p>
          )}
          {showTwoThirdsNote && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 font-medium">
              Princípio de Cavalieri: a esfera ocupa <strong>2/3 do volume</strong> do cilindro circunscrito de raio r e altura 2r (linha laranja).
            </p>
          )}
        </div>
      )}

      {viewMode === 'planificacao' && (
        <div className="px-4 py-3 border-t border-slate-200 bg-amber-50/50 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="net-fold-slider"
              className="text-xs font-semibold text-slate-900"
            >
              Dobradura Maker (Molde 2D ↔ Sólido 3D):{' '}
              <span className="font-mono text-amber-900 tabular-nums">
                {foldPercent}%
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFoldPercent(0)}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
              >
                Abrir Molde (0%)
              </button>
              <button
                type="button"
                onClick={() => setFoldPercent(100)}
                className="px-2.5 py-1 text-xs font-medium bg-amber-700 text-white rounded hover:bg-amber-800"
              >
                Fechar Sólido (100%)
              </button>
            </div>
          </div>
          <input
            id="net-fold-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={foldPercent}
            onChange={(e) => setFoldPercent(Number(e.target.value))}
            className="maker-slider w-full"
          />
          <p className="text-xs text-slate-600">
            {shapeId === 'esfera'
              ? 'Planificação em 12 gomos meridianos: abas laranjas indicam regiões de união para montagem esférica.'
              : 'As abas amarelas representam as abas de colagem para recorte em papel cartão e montagem física.'}
          </p>
        </div>
      )}
    </div>
  );
};
