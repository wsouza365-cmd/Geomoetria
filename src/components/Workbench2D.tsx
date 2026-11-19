import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Grid3X3 } from 'lucide-react';
import { PolygonSubtype, Shape2DId, TriangleSubtype } from '../types/geometry';
import { fmtNum } from '../data/shapesCatalog';

interface Workbench2DProps {
  shapeId: Shape2DId;
  params: Record<string, number>;
  triangleType: TriangleSubtype;
  polygonType: PolygonSubtype;
  sectorEnabled: boolean;
}

const SVG_W = 720;
const SVG_H = 480;
const PAD_L = 58;
const PAD_R = 46;
const PAD_T = 44;
const PAD_B = 54;

export const Workbench2D: React.FC<Workbench2DProps> = ({
  shapeId,
  params,
  triangleType,
  polygonType,
  sectorEnabled,
}) => {
  const [showProof, setShowProof] = useState(true);
  const [showUnitGrid, setShowUnitGrid] = useState(true);
  const [proofSlide, setProofSlide] = useState(100); // 0..100 for parallelogram translation / trapezoid duplication

  // Compute physical bounding box in cm for optimal auto-scaling on the cm grid
  const layout = useMemo(() => {
    let minX = 0;
    let maxX = 8;
    let minY = 0;
    let maxY = 6;

    switch (shapeId) {
      case 'quadrado': {
        const l = params.l ?? 5;
        maxX = l;
        maxY = l;
        break;
      }
      case 'retangulo': {
        maxX = params.b ?? 7;
        maxY = params.h ?? 4;
        break;
      }
      case 'paralelogramo': {
        const b = params.b ?? 6;
        const h = params.h ?? 4;
        const d = params.d ?? 2;
        maxX = b + d;
        maxY = h;
        break;
      }
      case 'losango': {
        maxX = params.D ?? 8;
        maxY = params.d ?? 5;
        break;
      }
      case 'triangulo': {
        const b = params.b ?? 6;
        const h =
          triangleType === 'equilatero'
            ? (b * Math.sqrt(3)) / 2
            : (params.h ?? 4);
        maxX = b;
        maxY = h;
        break;
      }
      case 'trapezio': {
        const B = Math.max(params.B ?? 8, (params.b ?? 4) + 0.5);
        const b = Math.min(params.b ?? 4, B - 0.5);
        const h = params.h ?? 4;
        // Room for duplicate trapezoid proof on right
        maxX = showProof ? B + b + 0.8 : B;
        maxY = h;
        break;
      }
      case 'poligono': {
        const n = polygonType === 'pentagono' ? 5 : 6;
        const l = params.l ?? 4;
        const R = l / (2 * Math.sin(Math.PI / n));
        minX = -R;
        maxX = R;
        minY = -R;
        maxY = R;
        break;
      }
      case 'circulo': {
        const r = params.r ?? 4;
        minX = -r;
        maxX = r;
        minY = -r;
        maxY = r;
        break;
      }
    }

    const spanX = Math.max(maxX - minX, 3);
    const spanY = Math.max(maxY - minY, 3);
    const availW = SVG_W - PAD_L - PAD_R;
    const availH = SVG_H - PAD_T - PAD_B;
    // Scale px per cm (leave margin of ~1.2 cm around shape)
    const pxPerCm = Math.min(availW / (spanX + 1.8), availH / (spanY + 1.6), 56);

    const centerCmX = (minX + maxX) / 2;
    const centerCmY = (minY + maxY) / 2;
    const originPxX = PAD_L + availW / 2 - centerCmX * pxPerCm;
    // Y-up mathematical coordinate system -> SVG Y-down
    const originPxY = PAD_T + availH / 2 + centerCmY * pxPerCm;

    const toPxX = (cmX: number) => originPxX + cmX * pxPerCm;
    const toPxY = (cmY: number) => originPxY - cmY * pxPerCm;

    return { pxPerCm, toPxX, toPxY, minX, maxX, minY, maxY, originPxX, originPxY };
  }, [shapeId, params, triangleType, polygonType, showProof]);

  const { pxPerCm, toPxX, toPxY } = layout;

  // Build visible cm grid lines covering the whole SVG plotting area
  const gridLines = useMemo(() => {
    const xStartCm = Math.floor((PAD_L - layout.originPxX) / pxPerCm);
    const xEndCm = Math.ceil((SVG_W - PAD_R - layout.originPxX) / pxPerCm);
    const yStartCm = Math.floor((layout.originPxY - (SVG_H - PAD_B)) / pxPerCm);
    const yEndCm = Math.ceil((layout.originPxY - PAD_T) / pxPerCm);

    const xs: number[] = [];
    for (let x = xStartCm; x <= xEndCm; x++) xs.push(x);
    const ys: number[] = [];
    for (let y = yStartCm; y <= yEndCm; y++) ys.push(y);

    return { xs, ys, xStartCm, xEndCm, yStartCm, yEndCm };
  }, [layout, pxPerCm]);

  // Build primary polygon path or circle geometry + proof overlay
  const shapeScene = useMemo(() => {
    const clipId = `shape-clip-${shapeId}`;

    // Helper for SVG polygon points string
    const ptsStr = (pts: Array<[number, number]>) =>
      pts.map(([x, y]) => `${toPxX(x).toFixed(2)},${toPxY(y).toFixed(2)}`).join(' ');

    // Helper for dimension label pill-free crisp tag
    const DimTag = (
      key: string,
      xPx: number,
      yPx: number,
      text: string,
      tone: 'primary' | 'proof' | 'height' = 'primary'
    ) => {
      const bg =
        tone === 'proof'
          ? '#fffbeb'
          : tone === 'height'
          ? '#ecfdf5'
          : '#ffffff';
      const border =
        tone === 'proof'
          ? '#d97706'
          : tone === 'height'
          ? '#059669'
          : '#0284c7';
      const color =
        tone === 'proof'
          ? '#92400e'
          : tone === 'height'
          ? '#065f46'
          : '#0c4a6e';
      const approxW = Math.max(text.length * 7.2 + 16, 62);
      return (
        <g key={key} transform={`translate(${xPx}, ${yPx})`}>
          <rect
            x={-approxW / 2}
            y={-12}
            width={approxW}
            height={24}
            rx={4}
            fill={bg}
            stroke={border}
            strokeWidth={1.25}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="font-mono text-[11.5px] font-semibold"
            fill={color}
          >
            {text}
          </text>
        </g>
      );
    };

    if (shapeId === 'quadrado') {
      const l = params.l ?? 5;
      const pts: Array<[number, number]> = [
        [0, 0],
        [l, 0],
        [l, l],
        [0, l],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.14)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Right-angle marker */}
            <polyline
              points={`${toPxX(0.35)},${toPxY(0)} ${toPxX(0.35)},${toPxY(0.35)} ${toPxX(0)},${toPxY(0.35)}`}
              fill="none"
              stroke="#059669"
              strokeWidth={1.5}
            />
            <text x={toPxX(0.5)} y={toPxY(0.45)} className="font-mono text-[10px] font-semibold" fill="#065f46">
              90°
            </text>
          </g>
        ),
        labels: [
          DimTag('l-bot', toPxX(l / 2), toPxY(0) + 22, `Lado (l) = ${fmtNum(l)} cm`),
          DimTag('l-left', toPxX(0) - 56, toPxY(l / 2), `l = ${fmtNum(l)} cm`),
        ],
        unitHint: `${fmtNum(l)} × ${fmtNum(l)} = ${fmtNum(l * l)} quadrados de 1 cm²`,
      };
    }

    if (shapeId === 'retangulo') {
      const b = params.b ?? 7;
      const h = params.h ?? 4;
      const pts: Array<[number, number]> = [
        [0, 0],
        [b, 0],
        [b, h],
        [0, h],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.14)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <polyline
            points={`${toPxX(0.35)},${toPxY(0)} ${toPxX(0.35)},${toPxY(0.35)} ${toPxX(0)},${toPxY(0.35)}`}
            fill="none"
            stroke="#059669"
            strokeWidth={1.5}
          />
        ),
        labels: [
          DimTag('b', toPxX(b / 2), toPxY(0) + 22, `Base (b) = ${fmtNum(b)} cm`),
          DimTag('h', toPxX(b) + 58, toPxY(h / 2), `Altura (h) = ${fmtNum(h)} cm`, 'height'),
        ],
        unitHint: `${fmtNum(b)} colunas × ${fmtNum(h)} linhas = ${fmtNum(b * h)} cm²`,
      };
    }

    if (shapeId === 'paralelogramo') {
      const b = params.b ?? 6;
      const h = params.h ?? 4;
      const d = params.d ?? 2;
      const t = proofSlide / 100;
      const pts: Array<[number, number]> = [
        [0, 0],
        [b, 0],
        [b + d, h],
        [d, h],
      ];
      // Left triangle [0,0], [d,0], [d,h] translates by (+b * t, 0)
      const cutTri: Array<[number, number]> = [
        [0, 0],
        [d, 0],
        [d, h],
      ];
      const movedTri: Array<[number, number]> = [
        [b * t, 0],
        [b * t + d, 0],
        [b * t + d, h],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.14)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Altitude dashed line */}
            <line
              x1={toPxX(d)}
              y1={toPxY(h)}
              x2={toPxX(d)}
              y2={toPxY(0)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <polyline
              points={`${toPxX(d - 0.3)},${toPxY(0)} ${toPxX(d - 0.3)},${toPxY(0.3)} ${toPxX(d)},${toPxY(0.3)}`}
              fill="none"
              stroke="#059669"
              strokeWidth={1.5}
            />
            {/* Translated triangle showing equivalence to b × h rectangle */}
            <polygon
              points={ptsStr(cutTri)}
              fill="rgba(217, 119, 6, 0.14)"
              stroke="#d97706"
              strokeWidth={1.6}
              strokeDasharray="4 3"
            />
            {t > 0.02 && (
              <g>
                <polygon
                  points={ptsStr(movedTri)}
                  fill="rgba(217, 119, 6, 0.22)"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                />
                {/* Equivalent rectangle dashed outline at right */}
                <rect
                  x={toPxX(d)}
                  y={toPxY(h)}
                  width={b * pxPerCm}
                  height={h * pxPerCm}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={1.5}
                  strokeDasharray="3 4"
                />
              </g>
            )}
          </g>
        ),
        labels: [
          DimTag('b', toPxX(b / 2), toPxY(0) + 22, `Base (b) = ${fmtNum(b)} cm`),
          DimTag('h', toPxX(d) - 4, toPxY(h / 2), `Altura (h) = ${fmtNum(h)} cm`, 'height'),
          ...(showProof
            ? [DimTag('eq', toPxX(d + b / 2), toPxY(h) - 20, `Retângulo equivalente: ${fmtNum(b)} × ${fmtNum(h)}`, 'proof')]
            : []),
        ],
        unitHint: `Mesma área do retângulo ${fmtNum(b)} cm × ${fmtNum(h)} cm = ${fmtNum(b * h)} cm²`,
      };
    }

    if (shapeId === 'losango') {
      const D = params.D ?? 8;
      const d = params.d ?? 5;
      const pts: Array<[number, number]> = [
        [D / 2, 0],
        [D, d / 2],
        [D / 2, d],
        [0, d / 2],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.15)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Circumscribed rectangle D × d */}
            <rect
              x={toPxX(0)}
              y={toPxY(d)}
              width={D * pxPerCm}
              height={d * pxPerCm}
              fill="rgba(217, 119, 6, 0.06)"
              stroke="#d97706"
              strokeWidth={1.8}
              strokeDasharray="6 4"
            />
            {/* Diagonals */}
            <line
              x1={toPxX(0)}
              y1={toPxY(d / 2)}
              x2={toPxX(D)}
              y2={toPxY(d / 2)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <line
              x1={toPxX(D / 2)}
              y1={toPxY(0)}
              x2={toPxX(D / 2)}
              y2={toPxY(d)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          </g>
        ),
        labels: [
          DimTag('D', toPxX(D / 2), toPxY(0) + 22, `Diagonal Maior (D) = ${fmtNum(D)} cm`),
          DimTag('d', toPxX(D) + 64, toPxY(d / 2), `Diag. Menor (d) = ${fmtNum(d)} cm`, 'height'),
          ...(showProof
            ? [DimTag('rect', toPxX(D / 2), toPxY(d) - 20, `Retângulo externo: 8 triângulos (4 dentro, 4 fora)`, 'proof')]
            : []),
        ],
        unitHint: `Metade do retângulo ${fmtNum(D)} × ${fmtNum(d)} = ${fmtNum((D * d) / 2)} cm²`,
      };
    }

    if (shapeId === 'triangulo') {
      const b = params.b ?? 6;
      const h =
        triangleType === 'equilatero' ? (b * Math.sqrt(3)) / 2 : (params.h ?? 4);
      const apexX =
        triangleType === 'retangulo' ? 0 : b / 2;
      const pts: Array<[number, number]> = [
        [0, 0],
        [b, 0],
        [apexX, h],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.15)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Circumscribed rectangle showing triangle is half */}
            <rect
              x={toPxX(0)}
              y={toPxY(h)}
              width={b * pxPerCm}
              height={h * pxPerCm}
              fill="rgba(217, 119, 6, 0.06)"
              stroke="#d97706"
              strokeWidth={1.8}
              strokeDasharray="6 4"
            />
            {/* Altitude line */}
            <line
              x1={toPxX(apexX)}
              y1={toPxY(h)}
              x2={toPxX(apexX)}
              y2={toPxY(0)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <polyline
              points={`${toPxX(apexX + 0.3)},${toPxY(0)} ${toPxX(apexX + 0.3)},${toPxY(0.3)} ${toPxX(apexX)},${toPxY(0.3)}`}
              fill="none"
              stroke="#059669"
              strokeWidth={1.5}
            />
          </g>
        ),
        labels: [
          DimTag('b', toPxX(b / 2), toPxY(0) + 22, `Base (b) = ${fmtNum(b)} cm`),
          DimTag('h', toPxX(apexX) + (apexX === 0 ? -56 : 56), toPxY(h / 2), `Altura (h) = ${fmtNum(h)} cm`, 'height'),
          ...(showProof
            ? [DimTag('rect', toPxX(b / 2), toPxY(h) - 20, `Metade do retângulo (${fmtNum(b)} × ${fmtNum(h)})`, 'proof')]
            : []),
        ],
        unitHint: `Metade de ${fmtNum(b * h)} cm² = ${fmtNum((b * h) / 2)} cm²`,
      };
    }

    if (shapeId === 'trapezio') {
      const B = Math.max(params.B ?? 8, (params.b ?? 4) + 0.5);
      const b = Math.min(params.b ?? 4, B - 0.5);
      const h = params.h ?? 4;
      const offset = (B - b) / 2;
      const pts: Array<[number, number]> = [
        [0, 0],
        [B, 0],
        [B - offset, h],
        [offset, h],
      ];
      // Duplicated inverted trapezoid shifted right to form parallelogram of base B + b
      const dupPts: Array<[number, number]> = [
        [B, 0],
        [B + b, 0],
        [B + offset + b, h],
        [B - offset, h],
      ];
      return {
        clipId,
        clipElement: <polygon points={ptsStr(pts)} />,
        mainElement: (
          <polygon
            points={ptsStr(pts)}
            fill="rgba(2, 132, 199, 0.15)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Inverted duplicate trapezoid */}
            <polygon
              points={ptsStr(dupPts)}
              fill="rgba(217, 119, 6, 0.12)"
              stroke="#d97706"
              strokeWidth={1.8}
              strokeDasharray="6 4"
            />
            {/* Altitude line */}
            <line
              x1={toPxX(offset)}
              y1={toPxY(h)}
              x2={toPxX(offset)}
              y2={toPxY(0)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          </g>
        ),
        labels: [
          DimTag('B', toPxX(B / 2), toPxY(0) + 22, `Base Maior (B) = ${fmtNum(B)} cm`),
          DimTag('b', toPxX(B / 2), toPxY(h) - 20, `Base Menor (b) = ${fmtNum(b)} cm`),
          DimTag('h', toPxX(offset) - 48, toPxY(h / 2), `h = ${fmtNum(h)} cm`, 'height'),
          ...(showProof
            ? [DimTag('dup', toPxX(B + b / 2), toPxY(0) + 22, `Cópia invertida (+b = ${fmtNum(b)} cm)`, 'proof')]
            : []),
        ],
        unitHint: `Metade do paralelogramo (${fmtNum(B)}+${fmtNum(b)}) × ${fmtNum(h)} = ${fmtNum(((B + b) * h) / 2)} cm²`,
      };
    }

    if (shapeId === 'poligono') {
      const n = polygonType === 'pentagono' ? 5 : 6;
      const l = params.l ?? 4;
      const R = l / (2 * Math.sin(Math.PI / n));
      const apotema = l / (2 * Math.tan(Math.PI / n));
      const verts: Array<[number, number]> = [];
      // Orient flat base at bottom
      const startAngle = -Math.PI / 2 - Math.PI / n;
      for (let i = 0; i < n; i++) {
        const ang = startAngle + (i * 2 * Math.PI) / n;
        verts.push([R * Math.cos(ang), R * Math.sin(ang)]);
      }
      const baseMidX = (verts[0][0] + verts[1][0]) / 2;
      const baseMidY = (verts[0][1] + verts[1][1]) / 2;
      return {
        clipId,
        clipElement: <polygon points={ptsStr(verts)} />,
        mainElement: (
          <polygon
            points={ptsStr(verts)}
            fill="rgba(2, 132, 199, 0.14)"
            stroke="#0284c7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ),
        proofElements: (
          <g>
            {/* Highlight one bottom triangle */}
            <polygon
              points={ptsStr([[0, 0], verts[0], verts[1]])}
              fill="rgba(217, 119, 6, 0.16)"
              stroke="#d97706"
              strokeWidth={1.5}
            />
            {/* Radial lines from center to all vertices */}
            {verts.map((v, idx) => (
              <line
                key={idx}
                x1={toPxX(0)}
                y1={toPxY(0)}
                x2={toPxX(v[0])}
                y2={toPxY(v[1])}
                stroke="#d97706"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ))}
            {/* Apothem perpendicular line */}
            <line
              x1={toPxX(0)}
              y1={toPxY(0)}
              x2={toPxX(baseMidX)}
              y2={toPxY(baseMidY)}
              stroke="#059669"
              strokeWidth={2.2}
              strokeDasharray="5 3"
            />
            <circle cx={toPxX(0)} cy={toPxY(0)} r={3.5} fill="#0f172a" />
          </g>
        ),
        labels: [
          DimTag('l', toPxX(baseMidX), toPxY(baseMidY) + 22, `Lado (l) = ${fmtNum(l)} cm`),
          DimTag('a', toPxX(0) + 54, toPxY(baseMidY / 2), `Apótema (a) ≈ ${fmtNum(apotema)} cm`, 'height'),
        ],
        unitHint: `${n} triângulos iguais de área (${fmtNum(l)} × ${fmtNum(apotema)}) / 2`,
      };
    }

    // Círculo ou Setor Circular
    const r = params.r ?? 4;
    const theta = sectorEnabled ? (params.theta ?? 90) : 360;
    const rad = (theta * Math.PI) / 180;
    const endX = r * Math.cos(rad);
    const endY = r * Math.sin(rad);
    const largeArc = theta > 180 ? 1 : 0;
    const cxPx = toPxX(0);
    const cyPx = toPxY(0);
    const rPx = r * pxPerCm;

    const sectorPath =
      theta >= 360
        ? ''
        : `M ${cxPx} ${cyPx} L ${toPxX(r)} ${cyPx} A ${rPx} ${rPx} 0 ${largeArc} 0 ${toPxX(endX)} ${toPxY(endY)} Z`;

    return {
      clipId,
      clipElement:
        theta >= 360 ? (
          <circle cx={cxPx} cy={cyPx} r={rPx} />
        ) : (
          <path d={sectorPath} />
        ),
      mainElement:
        theta >= 360 ? (
          <circle
            cx={cxPx}
            cy={cyPx}
            r={rPx}
            fill="rgba(2, 132, 199, 0.14)"
            stroke="#0284c7"
            strokeWidth={2.5}
          />
        ) : (
          <g>
            {/* Ghost full circle */}
            <circle
              cx={cxPx}
              cy={cyPx}
              r={rPx}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={1.6}
              strokeDasharray="5 4"
            />
            <path
              d={sectorPath}
              fill="rgba(2, 132, 199, 0.18)"
              stroke="#0284c7"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </g>
        ),
      proofElements: (
        <g>
          {/* Radius line */}
          <line
            x1={cxPx}
            y1={cyPx}
            x2={toPxX(r)}
            y2={cyPx}
            stroke="#059669"
            strokeWidth={2.2}
          />
          {!sectorEnabled && (
            <line
              x1={toPxX(-r)}
              y1={cyPx}
              x2={cxPx}
              y2={cyPx}
              stroke="#d97706"
              strokeWidth={1.8}
              strokeDasharray="5 4"
            />
          )}
          <circle cx={cxPx} cy={cyPx} r={4} fill="#0f172a" />
        </g>
      ),
      labels: [
        DimTag('r', toPxX(r / 2), cyPx - 18, `Raio (r) = ${fmtNum(r)} cm`, 'height'),
        ...(sectorEnabled
          ? [DimTag('theta', cxPx + 42, cyPx + 22, `Ângulo θ = ${fmtNum(theta)}°`, 'proof')]
          : [DimTag('d', cxPx, toPxY(-r) + 22, `Diâmetro (d) = ${fmtNum(2 * r)} cm`, 'proof')]),
      ],
      unitHint: sectorEnabled
        ? `Fração ${fmtNum(theta)}° / 360° da área circular`
        : `≈ ${fmtNum(3.14 * r * r)} quadrados de 1 cm²`,
    };
  }, [shapeId, params, triangleType, polygonType, sectorEnabled, pxPerCm, toPxX, toPxY, showProof, proofSlide]);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Bancada 2D · Malha 1 cm</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{shapeScene.unitHint}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowUnitGrid((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-600 ${
              showUnitGrid
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Quadrados 1 cm²</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProof((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-sky-600 ${
              showProof
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showProof ? (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Linhas Auxiliares</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Blueprint */}
      <div className="relative flex-1 min-h-[340px] flex items-center justify-center p-2 bg-white">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full max-h-[520px] select-none"
          role="img"
          aria-label={`Representação geométrica 2D em escala de 1 centímetro para ${shapeId}`}
        >
          <defs>
            <clipPath id={shapeScene.clipId}>{shapeScene.clipElement}</clipPath>
          </defs>

          {/* Background millimeter / centimeter drafting grid */}
          <g aria-hidden="true">
            {gridLines.xs.map((x) => {
              const px = toPxX(x);
              const isAxis = x === 0;
              return (
                <g key={`gx-${x}`}>
                  <line
                    x1={px}
                    y1={PAD_T - 10}
                    x2={px}
                    y2={SVG_H - PAD_B + 10}
                    stroke={isAxis ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={isAxis ? 1.5 : 1}
                  />
                  {x >= 0 && (
                    <text
                      x={px}
                      y={SVG_H - PAD_B + 26}
                      textAnchor="middle"
                      className="font-mono text-[10px]"
                      fill="#64748b"
                    >
                      {x}
                    </text>
                  )}
                </g>
              );
            })}
            {gridLines.ys.map((y) => {
              const py = toPxY(y);
              const isAxis = y === 0;
              return (
                <g key={`gy-${y}`}>
                  <line
                    x1={PAD_L - 10}
                    y1={py}
                    x2={SVG_W - PAD_R + 10}
                    y2={py}
                    stroke={isAxis ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={isAxis ? 1.5 : 1}
                  />
                  {y >= 0 && (
                    <text
                      x={PAD_L - 18}
                      y={py + 3}
                      textAnchor="end"
                      className="font-mono text-[10px]"
                      fill="#64748b"
                    >
                      {y}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              x={SVG_W - PAD_R}
              y={SVG_H - 12}
              textAnchor="end"
              className="font-mono text-[10.5px]"
              fill="#64748b"
            >
              Escala: 1 divisão = 1 cm
            </text>
          </g>

          {/* Unit 1 cm² interior tiles clipped strictly inside the shape */}
          {showUnitGrid && (
            <g clipPath={`url(#${shapeScene.clipId})`} aria-hidden="true">
              {gridLines.xs.map((x) =>
                gridLines.ys.map((y) => (
                  <rect
                    key={`tile-${x}-${y}`}
                    x={toPxX(x)}
                    y={toPxY(y + 1)}
                    width={pxPerCm}
                    height={pxPerCm}
                    fill={(x + y) % 2 === 0 ? 'rgba(14, 165, 233, 0.14)' : 'rgba(14, 165, 233, 0.05)'}
                    stroke="rgba(2, 132, 199, 0.35)"
                    strokeWidth={0.9}
                  />
                ))
              )}
            </g>
          )}

          {/* Main geometric figure */}
          {shapeScene.mainElement}

          {/* Auxiliary proof construction lines */}
          {showProof && shapeScene.proofElements}

          {/* Explicit textual dimension labels */}
          {shapeScene.labels}
        </svg>
      </div>

      {/* Interactive proof animation slider for Parallelogram */}
      {shapeId === 'paralelogramo' && showProof && (
        <div className="px-4 py-2.5 border-t border-slate-200 bg-amber-50/60 flex flex-wrap items-center gap-4">
          <label
            htmlFor="parallelogram-slide"
            className="text-xs font-semibold text-amber-950 whitespace-nowrap"
          >
            Prova visual (translação do triângulo): {proofSlide}%
          </label>
          <input
            id="parallelogram-slide"
            type="range"
            min={0}
            max={100}
            step={5}
            value={proofSlide}
            onChange={(e) => setProofSlide(Number(e.target.value))}
            className="maker-slider flex-1 min-w-[160px]"
          />
        </div>
      )}
    </div>
  );
};
