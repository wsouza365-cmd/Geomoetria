import React, { useMemo, useState } from 'react';
import { RotateCcw, Target } from 'lucide-react';
import {
  AnyShapeId,
  GeometryCategory,
  MakerChallenge,
  PolygonSubtype,
  Shape2DId,
  Shape3DId,
  TriangleSubtype,
  View3DMode,
} from './types/geometry';
import {
  computeShapeMath,
  getDefaultParamsForShape,
  getShapeDefinition,
} from './data/shapesCatalog';
import { evaluateChallenge, generateRandomChallenge } from './data/challenges';
import { ShapeMenu } from './components/ShapeMenu';
import { Workbench2D } from './components/Workbench2D';
import { Workbench3D } from './components/Workbench3D';
import { FormulaPanel } from './components/FormulaPanel';

export default function App() {
  const [selectedShapeId, setSelectedShapeId] = useState<AnyShapeId>('triangulo');
  const [paramsByShape, setParamsByShape] = useState<Record<string, Record<string, number>>>({
    triangulo: getDefaultParamsForShape('triangulo'),
  });
  const [triangleType, setTriangleType] = useState<TriangleSubtype>('retangulo');
  const [polygonType, setPolygonType] = useState<PolygonSubtype>('hexagono');
  const [sectorEnabled, setSectorEnabled] = useState<boolean>(false);
  const [view3DMode, setView3DMode] = useState<View3DMode>('solido');
  const [activeChallenge, setActiveChallenge] = useState<MakerChallenge | null>(null);

  const shapeDef = useMemo(
    () => getShapeDefinition(selectedShapeId),
    [selectedShapeId]
  );

  const activeCategory: GeometryCategory = shapeDef.category;

  const currentParams = useMemo(
    () => paramsByShape[selectedShapeId] ?? getDefaultParamsForShape(selectedShapeId),
    [paramsByShape, selectedShapeId]
  );

  const mathResult = useMemo(
    () =>
      computeShapeMath(selectedShapeId, currentParams, {
        triangleType,
        polygonType,
        sectorEnabled,
      }),
    [selectedShapeId, currentParams, triangleType, polygonType, sectorEnabled]
  );

  const challengeEval = useMemo(() => {
    if (!activeChallenge) return null;
    return evaluateChallenge(activeChallenge, currentParams, mathResult, {
      shapeId: selectedShapeId,
      triangleType,
      polygonType,
      sectorEnabled,
    });
  }, [activeChallenge, currentParams, mathResult, selectedShapeId, triangleType, polygonType, sectorEnabled]);

  const handleSelectShape = (id: AnyShapeId) => {
    setSelectedShapeId(id);
    setParamsByShape((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: getDefaultParamsForShape(id) };
    });
  };

  const handleSelectCategory = (cat: GeometryCategory) => {
    if (cat === activeCategory) return;
    handleSelectShape(cat === '2D' ? 'quadrado' : 'cubo');
  };

  const handleParamChange = (key: string, value: number) => {
    setParamsByShape((prev) => {
      const current = prev[selectedShapeId] ?? getDefaultParamsForShape(selectedShapeId);
      const next = { ...current, [key]: value };
      // Keep trapezoid Base Maior > Base Menor
      if (selectedShapeId === 'trapezio') {
        if (key === 'B' && next.B <= (next.b ?? 4) + 0.4) {
          next.b = Math.max(1, Math.round((next.B - 0.5) * 10) / 10);
        } else if (key === 'b' && next.b >= (next.B ?? 8) - 0.4) {
          next.B = Math.min(16, Math.round((next.b + 0.5) * 10) / 10);
        }
      }
      return { ...prev, [selectedShapeId]: next };
    });
  };

  const handleStartChallenge = () => {
    const ch = generateRandomChallenge(activeChallenge?.shapeId);
    setActiveChallenge(ch);
    handleSelectShape(ch.shapeId);
    if (ch.subtypeKey === 'triangleType' && ch.subtypeValue) {
      setTriangleType(ch.subtypeValue as TriangleSubtype);
    }
    if (typeof ch.sectorEnabled === 'boolean') {
      setSectorEnabled(ch.sectorEnabled);
    }
    // Reset params of that shape to default so student works from clean baseline
    setParamsByShape((prev) => ({
      ...prev,
      [ch.shapeId]: getDefaultParamsForShape(ch.shapeId),
    }));
  };

  const handleResetWorkbench = () => {
    setParamsByShape((prev) => ({
      ...prev,
      [selectedShapeId]: getDefaultParamsForShape(selectedShapeId),
    }));
    if (selectedShapeId === 'triangulo') setTriangleType('retangulo');
    if (selectedShapeId === 'poligono') setPolygonType('hexagono');
    if (selectedShapeId === 'circulo') setSectorEnabled(false);
    setActiveChallenge(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top 3-Zone Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Title */}
        <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Construtor Geométrico GET
        </span>

        {/* Zone 2: Primary Mode Links */}
        <nav
          aria-label="Navegação Principal"
          className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleSelectCategory('2D')}
            className={`whitespace-nowrap shrink-0 pb-0.5 border-b-2 transition-colors ${
              activeCategory === '2D'
                ? 'border-sky-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Figuras 2D
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('3D')}
            className={`whitespace-nowrap shrink-0 pb-0.5 border-b-2 transition-colors ${
              activeCategory === '3D'
                ? 'border-sky-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sólidos 3D
          </button>
          <button
            type="button"
            onClick={handleStartChallenge}
            className={`whitespace-nowrap shrink-0 pb-0.5 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeChallenge
                ? 'border-amber-600 text-amber-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Desafio de Bancada</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleResetWorkbench}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Resetar Bancada</span>
          </button>
        </div>
      </header>

      {/* Main 3-Area Integrated Maker Workbench */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_390px] xl:grid-cols-[256px_minmax(0,1fr)_420px] gap-4 items-start">
        {/* Area A: Shape Menu */}
        <ShapeMenu
          selectedShapeId={selectedShapeId}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onSelectShape={handleSelectShape}
        />

        {/* Area B: Interactive Visual Workbench (2D Blueprint / 3D Viewport) */}
        <section
          aria-label="Bancada Visual Interativa"
          className="lg:sticky lg:top-4 min-h-[460px] lg:h-[calc(100vh-110px)] flex flex-col"
        >
          {activeCategory === '2D' ? (
            <Workbench2D
              shapeId={selectedShapeId as Shape2DId}
              params={currentParams}
              triangleType={triangleType}
              polygonType={polygonType}
              sectorEnabled={sectorEnabled}
            />
          ) : (
            <Workbench3D
              shapeId={selectedShapeId as Shape3DId}
              params={currentParams}
              viewMode={view3DMode}
              onChangeViewMode={setView3DMode}
            />
          )}
        </section>

        {/* Area C: Controls, 4-Stage Formula Builder & Challenge Mode */}
        <FormulaPanel
          shapeDef={shapeDef}
          params={currentParams}
          mathResult={mathResult}
          triangleType={triangleType}
          polygonType={polygonType}
          sectorEnabled={sectorEnabled}
          onChangeParam={handleParamChange}
          onChangeTriangleType={setTriangleType}
          onChangePolygonType={setPolygonType}
          onToggleSector={setSectorEnabled}
          activeChallenge={activeChallenge}
          challengeEval={challengeEval}
          onNewChallenge={handleStartChallenge}
          onExitChallenge={() => setActiveChallenge(null)}
          onJumpToChallengeShape={() => {
            if (activeChallenge) handleSelectShape(activeChallenge.shapeId);
          }}
        />
      </main>
    </div>
  );
}
