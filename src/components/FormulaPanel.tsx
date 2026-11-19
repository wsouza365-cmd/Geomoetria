import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Compass,
  HelpCircle,
  RefreshCw,
  Target,
  X,
} from 'lucide-react';
import {
  ChallengeEvaluation,
  MakerChallenge,
  PolygonSubtype,
  ShapeDefinition,
  ShapeMathResult,
  TriangleSubtype,
} from '../types/geometry';
import { fmtNum } from '../data/shapesCatalog';

interface FormulaPanelProps {
  shapeDef: ShapeDefinition;
  params: Record<string, number>;
  mathResult: ShapeMathResult;
  triangleType: TriangleSubtype;
  polygonType: PolygonSubtype;
  sectorEnabled: boolean;
  onChangeParam: (key: string, value: number) => void;
  onChangeTriangleType: (t: TriangleSubtype) => void;
  onChangePolygonType: (p: PolygonSubtype) => void;
  onToggleSector: (enabled: boolean) => void;
  activeChallenge: MakerChallenge | null;
  challengeEval: ChallengeEvaluation | null;
  onNewChallenge: () => void;
  onExitChallenge: () => void;
  onJumpToChallengeShape: () => void;
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({
  shapeDef,
  params,
  mathResult,
  triangleType,
  polygonType,
  sectorEnabled,
  onChangeParam,
  onChangeTriangleType,
  onChangePolygonType,
  onToggleSector,
  activeChallenge,
  challengeEval,
  onNewChallenge,
  onExitChallenge,
  onJumpToChallengeShape,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [activeCalcTab, setActiveCalcTab] = useState<'primary' | 'secondary'>('primary');

  // Filter visible params based on sub-modes
  const visibleParams = shapeDef.params.filter((p) => {
    if (shapeDef.id === 'triangulo' && triangleType === 'equilatero' && p.key === 'h') {
      return false;
    }
    if (shapeDef.id === 'circulo' && !sectorEnabled && p.key === 'theta') {
      return false;
    }
    return true;
  });

  const activeSection =
    activeCalcTab === 'primary'
      ? mathResult.primarySection
      : mathResult.secondarySection;

  return (
    <section
      aria-label="Painel de Controles e Construção da Fórmula"
      className="flex flex-col gap-4"
    >
      {/* Active Challenge Panel */}
      {activeChallenge && challengeEval && (
        <div
          role="region"
          aria-label="Desafio de Bancada"
          className={`rounded-xl border p-4 space-y-3 ${
            challengeEval.solved
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-white border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-900">
                Desafio: {activeChallenge.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowHint(false);
                  onNewChallenge();
                }}
                title="Gerar outro desafio"
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>Outro</span>
              </button>
              <button
                type="button"
                onClick={onExitChallenge}
                aria-label="Sair do modo desafio"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {activeChallenge.prompt}
          </p>

          {/* Formative Feedback Box (Icon + Text, never color only) */}
          <div
            aria-live="polite"
            className={`rounded-lg border p-3 flex items-start gap-2.5 text-xs ${
              challengeEval.status === 'solved'
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                : challengeEval.status === 'constraint_mismatch'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-sky-50 border-sky-200 text-sky-950'
            }`}
          >
            {challengeEval.status === 'solved' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {challengeEval.status === 'below' && (
              <ArrowDownCircle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {challengeEval.status === 'above' && (
              <ArrowUpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {challengeEval.status === 'constraint_mismatch' && (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{challengeEval.feedbackTitle}</p>
              <p className="leading-relaxed">{challengeEval.feedbackMessage}</p>
              {shapeDef.id !== activeChallenge.shapeId && (
                <button
                  type="button"
                  onClick={onJumpToChallengeShape}
                  className="mt-1 inline-flex items-center gap-1 font-semibold underline text-sky-900 hover:text-sky-700"
                >
                  Ir para a figura do desafio
                </button>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showHint ? 'Ocultar dica' : 'Ver dica geométrica'}</span>
            </button>
            {showHint && (
              <p className="mt-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2.5 leading-relaxed">
                {activeChallenge.hint}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dimension Controls Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900">{shapeDef.name}</h2>
            <span className="text-xs font-mono text-slate-500">
              {shapeDef.category === '2D' ? 'Geometria Plana' : 'Geometria Espacial'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {shapeDef.shortDesc}
          </p>
        </div>

        {/* Subtype Selectors */}
        {shapeDef.id === 'triangulo' && shapeDef.subtypes && (
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">
              {shapeDef.subtypes.label}
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {shapeDef.subtypes.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTriangleType(opt.id as TriangleSubtype)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    triangleType === opt.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {shapeDef.id === 'poligono' && shapeDef.subtypes && (
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">
              {shapeDef.subtypes.label}
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              {shapeDef.subtypes.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangePolygonType(opt.id as PolygonSubtype)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    polygonType === opt.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {shapeDef.supportsSectorToggle && (
          <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-800">
                Modo Setor Circular (fatia θ)
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sectorEnabled}
              onClick={() => onToggleSector(!sectorEnabled)}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                sectorEnabled
                  ? 'bg-sky-700 border-sky-700 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sectorEnabled ? 'Ativo' : 'Círculo Inteiro'}
            </button>
          </div>
        )}

        {/* Numeric Inputs & Sliders */}
        <div className="space-y-3.5 pt-1">
          {visibleParams.map((p) => {
            const val = params[p.key] ?? p.defaultValue;
            const displayLabel =
              shapeDef.id === 'triangulo' &&
              triangleType === 'equilatero' &&
              p.key === 'b'
                ? 'Lado'
                : p.label;
            const displaySymbol =
              shapeDef.id === 'triangulo' &&
              triangleType === 'equilatero' &&
              p.key === 'b'
                ? 'l'
                : p.symbol;
            return (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`input-${shapeDef.id}-${p.key}`}
                    className="text-xs font-semibold text-slate-800"
                  >
                    {displayLabel} ({displaySymbol})
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id={`input-${shapeDef.id}-${p.key}`}
                      type="number"
                      min={p.min}
                      max={p.max}
                      step={0.1}
                      value={val}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value);
                        if (!Number.isNaN(num) && num > 0) {
                          onChangeParam(
                            p.key,
                            Math.min(Math.max(num, 0.5), p.max * 1.5)
                          );
                        }
                      }}
                      className="w-20 px-2 py-1 text-right font-mono text-xs font-semibold tabular-nums bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-2 focus:outline-sky-600"
                    />
                    <span className="text-xs font-mono text-slate-500 w-6">
                      {p.unit}
                    </span>
                  </div>
                </div>
                <input
                  aria-label={`Controle deslizante de ${displayLabel}`}
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={Math.min(Math.max(val, p.min), p.max)}
                  onChange={(e) => onChangeParam(p.key, Number(e.target.value))}
                  className="maker-slider w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Highlighted Final Metrics Summary */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
            <span className="block text-[11px] font-semibold text-sky-900">
              {mathResult.primaryMetricLabel}
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-slate-950 tabular-nums">
              {fmtNum(mathResult.primaryMetricValue)}{' '}
              <span className="text-xs font-semibold text-sky-800">
                {mathResult.primaryMetricUnit}
              </span>
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="block text-[11px] font-semibold text-slate-700">
              {mathResult.secondaryMetricLabel}
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-slate-950 tabular-nums">
              {fmtNum(mathResult.secondaryMetricValue)}{' '}
              <span className="text-xs font-semibold text-slate-600">
                {mathResult.secondaryMetricUnit}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 4-Stage Synchronized Formula Construction */}
      <div
        aria-label="Desenvolvimento da Fórmula em 4 Etapas"
        className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden"
      >
        {/* Stage 1: Intuição Geométrica */}
        <div className="p-4 space-y-1.5">
          <h3 className="text-xs font-bold text-slate-900">
            01. Intuição Geométrica
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {mathResult.stage1Intuition}
          </p>
        </div>

        {/* Stage 2: Fórmula Geral Literal */}
        <div className="p-4 space-y-2 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-900">
            02. Fórmula Geral Literal
          </h3>
          <div className="font-mono text-sm font-semibold text-sky-900 bg-white border border-slate-200 rounded-lg px-3 py-2">
            {activeCalcTab === 'primary'
              ? mathResult.stage2GeneralFormula
              : mathResult.stage2SecondaryFormula}
          </div>
          <div className="font-mono text-xs text-slate-600">
            {activeCalcTab === 'primary'
              ? `${mathResult.secondaryMetricLabel}: ${mathResult.stage2SecondaryFormula}`
              : `${mathResult.primaryMetricLabel}: ${mathResult.stage2GeneralFormula}`}
          </div>
        </div>

        {/* Stage 3: Substituição Guiada */}
        <div className="p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900">
            03. Substituição Guiada
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {mathResult.stage3Substitutions.map((item) => (
              <div key={item.symbol} className="text-slate-700">
                <span className="font-semibold text-slate-900">
                  {item.label} ({item.symbol}):
                </span>{' '}
                <span className="font-mono font-semibold text-sky-800 tabular-nums">
                  {item.valueText}
                </span>
              </div>
            ))}
          </div>
          <div className="font-mono text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 tabular-nums">
            {mathResult.stage3FormulaWithNumbers}
          </div>
        </div>

        {/* Stage 4: Zero-Jump Step-by-Step Calculation with Clear Separation */}
        <div className="p-4 space-y-3 bg-slate-50/40">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900">
              04. Cálculo Passo a Passo e Resultado
            </h3>

            {/* Clear Two-Tab Separation (Volume vs Área Total in 3D, Área vs Perímetro in 2D) */}
            <div
              role="tablist"
              aria-label="Escolha o cálculo passo a passo"
              className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1 bg-slate-200/75 rounded-lg"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCalcTab === 'primary'}
                onClick={() => setActiveCalcTab('primary')}
                className={`px-2.5 py-2 text-[11.5px] font-semibold rounded-md transition-colors text-center focus-visible:outline-2 focus-visible:outline-sky-600 ${
                  activeCalcTab === 'primary'
                    ? 'bg-white text-sky-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mathResult.primarySection.tabLabel}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCalcTab === 'secondary'}
                onClick={() => setActiveCalcTab('secondary')}
                className={`px-2.5 py-2 text-[11.5px] font-semibold rounded-md transition-colors text-center focus-visible:outline-2 focus-visible:outline-sky-600 ${
                  activeCalcTab === 'secondary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mathResult.secondarySection.tabLabel}
              </button>
            </div>
          </div>

          {/* Constant Declaration Note (when π, √3, tg are used) */}
          {activeSection.constantNote && (
            <div className="text-xs font-semibold text-amber-950 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {activeSection.constantNote}
            </div>
          )}

          {/* Derived Measures Sub-blocks (computed BEFORE main formula) */}
          {activeSection.derivedBlocks && activeSection.derivedBlocks.length > 0 && (
            <div className="space-y-2.5">
              {activeSection.derivedBlocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-[11.5px] font-bold text-slate-900">
                      {block.title}
                    </span>
                    <span className="font-mono text-[11.5px] font-bold text-sky-800 tabular-nums">
                      {block.resultText}
                    </span>
                  </div>
                  <ol className="space-y-2">
                    {block.steps.map((st, sIdx) => (
                      <li key={sIdx} className="space-y-0.5">
                        <span className="block text-[11px] font-medium text-slate-600">
                          {st.stepTag}
                        </span>
                        <div className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-100 rounded px-2.5 py-1.5 tabular-nums">
                          {st.expression}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* Main Formula Step-by-Step Execution */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
            <h4 className="text-[11.5px] font-bold text-slate-900 border-b border-slate-100 pb-1.5">
              {activeSection.title}
            </h4>
            <ol className="space-y-2">
              {activeSection.steps.map((st, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span className="block text-[11px] font-medium text-slate-600">
                    {st.stepTag}
                  </span>
                  <div className="font-mono text-xs sm:text-[12.5px] font-semibold text-slate-950 bg-slate-50 border border-slate-100 rounded px-2.5 py-1.5 tabular-nums">
                    {st.expression}
                  </div>
                </li>
              ))}
            </ol>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Resultado final:
              </span>
              <span className="font-mono text-sm font-bold text-sky-900 tabular-nums">
                {activeSection.finalResult}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
