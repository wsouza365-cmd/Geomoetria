import React from 'react';
import { AnyShapeId, GeometryCategory, ShapeDefinition } from '../types/geometry';
import { SHAPES_CATALOG } from '../data/shapesCatalog';

interface ShapeMenuProps {
  selectedShapeId: AnyShapeId;
  activeCategory: GeometryCategory;
  onSelectCategory: (cat: GeometryCategory) => void;
  onSelectShape: (id: AnyShapeId) => void;
}

function ShapeGlyph({ id, active }: { id: AnyShapeId; active: boolean }) {
  const stroke = active ? '#0284c7' : '#475569';
  const fill = active ? 'rgba(2, 132, 199, 0.12)' : 'rgba(148, 163, 184, 0.1)';

  switch (id) {
    case 'quadrado':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" fill={fill} stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case 'retangulo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" fill={fill} stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case 'paralelogramo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="7,6 21,6 17,18 3,18" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'losango':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,3 21,12 12,21 3,12" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'triangulo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,4 21,19 3,19" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'trapezio':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="7,6 17,6 21,18 3,18" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'poligono':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" fill={fill} stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'circulo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill={fill} stroke={stroke} strokeWidth="1.75" />
          <line x1="12" y1="12" x2="20.5" y2="12" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'cubo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
          <polyline points="4,7.5 12,12 20,7.5" fill="none" stroke={stroke} strokeWidth="1.5" />
          <line x1="12" y1="12" x2="12" y2="21" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'paralelepipedo':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="3,9 14,5 21,8 21,16 10,20 3,17" fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
          <polyline points="3,9 10,12 21,8" fill="none" stroke={stroke} strokeWidth="1.4" />
          <line x1="10" y1="12" x2="10" y2="20" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case 'prisma_triangular':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="4,17 9,6 15,17" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <polyline points="9,6 17,5 21,15 15,17" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'prisma_hexagonal':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="8,4 16,4 20,7 16,10 8,10 4,7" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M4,7 V17 L8,20 H16 L20,17 V7" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="8" y1="10" x2="8" y2="20" stroke={stroke} strokeWidth="1.3" />
          <line x1="16" y1="10" x2="16" y2="20" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
    case 'piramide_quadrada':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,3 20,16 12,20 4,16" fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="20" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'piramide_triangular':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <polygon points="12,3 20,18 4,16" fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="11" y2="19" stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="16" x2="11" y2="19" stroke={stroke} strokeWidth="1.4" />
          <line x1="20" y1="18" x2="11" y2="19" stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case 'cilindro':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill={fill} stroke={stroke} strokeWidth="1.7" />
          <path d="M5,6.5 V17.5 C5,19 8.1,20.3 12,20.3 C15.9,20.3 19,19 19,17.5 V6.5" fill="none" stroke={stroke} strokeWidth="1.7" />
        </svg>
      );
    case 'cone':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <path d="M12,3 L19,18 C19,19.6 15.9,20.6 12,20.6 C8.1,20.6 5,19.6 5,18 Z" fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
          <ellipse cx="12" cy="18" rx="7" ry="2.5" fill="none" stroke={stroke} strokeWidth="1.4" strokeDasharray="2 2" />
        </svg>
      );
    case 'esfera':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill={fill} stroke={stroke} strokeWidth="1.7" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3.2" fill="none" stroke={stroke} strokeWidth="1.3" strokeDasharray="2 2" />
        </svg>
      );
  }
}

export const ShapeMenu: React.FC<ShapeMenuProps> = ({
  selectedShapeId,
  activeCategory,
  onSelectCategory,
  onSelectShape,
}) => {
  const shapes2D = SHAPES_CATALOG.filter((s) => s.category === '2D');
  const shapes3D = SHAPES_CATALOG.filter((s) => s.category === '3D');
  const currentList: ShapeDefinition[] = activeCategory === '2D' ? shapes2D : shapes3D;

  return (
    <aside
      aria-label="Menu de Seleção de Figuras Geométricas"
      className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Catálogo de Figuras
        </h2>
        <div
          role="tablist"
          aria-label="Categoria de Geometria"
          className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === '2D'}
            onClick={() => onSelectCategory('2D')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              activeCategory === '2D'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D · Planas ({shapes2D.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === '3D'}
            onClick={() => onSelectCategory('3D')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              activeCategory === '3D'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3D · Sólidos ({shapes3D.length})
          </button>
        </div>
        <p className="mt-2.5 text-xs text-slate-500">
          {activeCategory === '2D'
            ? 'Área, perímetro e prova visual em malha'
            : 'Volume, camadas e planificação dobrável'}
        </p>
      </div>

      <nav
        aria-label={activeCategory === '2D' ? 'Figuras Planas 2D' : 'Sólidos Geométricos 3D'}
        className="p-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1 overflow-y-auto max-h-[260px] lg:max-h-[calc(100vh-270px)]"
      >
        {currentList.map((shape) => {
          const isSelected = shape.id === selectedShapeId;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelectShape(shape.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 ${
                isSelected
                  ? 'bg-sky-50 text-sky-900 border border-sky-200 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 border border-transparent font-medium'
              }`}
            >
              <ShapeGlyph id={shape.id} active={isSelected} />
              <span className="text-sm truncate">{shape.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
