import {
  ChallengeEvaluation,
  MakerChallenge,
  PolygonSubtype,
  ShapeMathResult,
  TriangleSubtype,
} from '../types/geometry';
import { fmtNum } from './shapesCatalog';

const CHALLENGE_TEMPLATES: Array<() => MakerChallenge> = [
  () => {
    const hChoices = [4, 5, 6];
    const h = hChoices[Math.floor(Math.random() * hChoices.length)];
    const c = [4, 5, 6, 8][Math.floor(Math.random() * 4)];
    const l = [3, 4, 5][Math.floor(Math.random() * 3)];
    const vol = c * l * h;
    return {
      id: `box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Caixa de Papelão Sob Medida',
      prompt: `Construa um paralelepípedo com volume de ${fmtNum(vol)} cm³ e altura fixa de ${fmtNum(h)} cm.`,
      shapeId: 'paralelepipedo',
      targetMetric: 'primary',
      targetMetricLabel: 'Volume',
      targetValue: vol,
      targetUnit: 'cm³',
      tolerance: 0.5,
      constraints: [
        { paramKey: 'h', label: 'Altura (h)', targetValue: h, unit: 'cm' },
      ],
      hint: `Como V = Ab × h e a altura deve ser ${fmtNum(h)} cm, procure comprimento (c) e largura (l) cuja multiplicação dê ${fmtNum(vol / h)} cm² na base.`,
    };
  },
  () => {
    const a = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
    const totalArea = 6 * a * a;
    return {
      id: `cube-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Dado Maker de Papel Cartão',
      prompt: `Configure um cubo cuja planificação utilize exatamente ${fmtNum(totalArea)} cm² de papel cartão (Área Total).`,
      shapeId: 'cubo',
      targetMetric: 'secondary',
      targetMetricLabel: 'Área Total',
      targetValue: totalArea,
      targetUnit: 'cm²',
      tolerance: 0.5,
      constraints: [],
      hint: `Um cubo tem 6 faces quadradas iguais (At = 6 × a²). Divida ${fmtNum(totalArea)} por 6 para descobrir a área de uma face.`,
    };
  },
  () => {
    const b = [6, 8, 10][Math.floor(Math.random() * 3)];
    const h = [4, 5, 6][Math.floor(Math.random() * 3)];
    const area = (b * h) / 2;
    return {
      id: `tri-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Bandeirola Triangular do Laboratório',
      prompt: `Recorte um triângulo com área de ${fmtNum(area)} cm² mantendo a base em ${fmtNum(b)} cm.`,
      shapeId: 'triangulo',
      subtypeKey: 'triangleType',
      subtypeValue: 'isosceles',
      targetMetric: 'primary',
      targetMetricLabel: 'Área',
      targetValue: area,
      targetUnit: 'cm²',
      tolerance: 0.3,
      constraints: [
        { paramKey: 'b', label: 'Base (b)', targetValue: b, unit: 'cm' },
      ],
      hint: `Lembre que A = (b × h) / 2. Se o retângulo circunscrito tem o dobro da área (${fmtNum(area * 2)} cm²), qual altura h fecha a conta?`,
    };
  },
  () => {
    const B = [8, 10][Math.floor(Math.random() * 2)];
    const b = [4, 6][Math.floor(Math.random() * 2)];
    const h = [3, 4, 5][Math.floor(Math.random() * 3)];
    const area = ((B + b) * h) / 2;
    return {
      id: `trap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Suporte Trapezoidal de Bancada',
      prompt: `Modele um trapézio de área ${fmtNum(area)} cm² com Base Maior de ${fmtNum(B)} cm e altura de ${fmtNum(h)} cm.`,
      shapeId: 'trapezio',
      targetMetric: 'primary',
      targetMetricLabel: 'Área',
      targetValue: area,
      targetUnit: 'cm²',
      tolerance: 0.4,
      constraints: [
        { paramKey: 'B', label: 'Base Maior (B)', targetValue: B, unit: 'cm' },
        { paramKey: 'h', label: 'Altura (h)', targetValue: h, unit: 'cm' },
      ],
      hint: `Ajuste a Base Menor (b) até que a soma (B + b) multiplicada por ${fmtNum(h)} e dividida por 2 resulte em ${fmtNum(area)} cm².`,
    };
  },
  () => {
    const r = [2, 2.5, 3, 4][Math.floor(Math.random() * 4)];
    const h = [4, 5, 6, 8][Math.floor(Math.random() * 4)];
    const vol = Math.round(3.14 * r * r * h * 100) / 100;
    return {
      id: `cyl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Porta-Lápis Cilíndrico',
      prompt: `Construa um cilindro com raio de ${fmtNum(r)} cm e volume aproximado de ${fmtNum(vol)} cm³.`,
      shapeId: 'cilindro',
      targetMetric: 'primary',
      targetMetricLabel: 'Volume',
      targetValue: vol,
      targetUnit: 'cm³',
      tolerance: Math.max(1.5, vol * 0.02),
      constraints: [
        { paramKey: 'r', label: 'Raio (r)', targetValue: r, unit: 'cm' },
      ],
      hint: `Considerando π ≈ 3,14 e r = ${fmtNum(r)} cm, a área da base circular é 3,14 × (${fmtNum(r)} × ${fmtNum(r)}) = ${fmtNum(3.14 * r * r)} cm². Ajuste a altura h até atingir ${fmtNum(vol)} cm³.`,
    };
  },
  () => {
    const l = [3, 4, 6][Math.floor(Math.random() * 3)];
    const h = [4, 6, 9][Math.floor(Math.random() * 3)];
    const vol = (l * l * h) / 3;
    return {
      id: `pyr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Molde de Pirâmide Quadrada',
      prompt: `Projete uma pirâmide de base quadrada com aresta da base de ${fmtNum(l)} cm e volume de ${fmtNum(vol)} cm³.`,
      shapeId: 'piramide_quadrada',
      targetMetric: 'primary',
      targetMetricLabel: 'Volume',
      targetValue: vol,
      targetUnit: 'cm³',
      tolerance: 0.5,
      constraints: [
        { paramKey: 'l', label: 'Aresta da Base (l)', targetValue: l, unit: 'cm' },
      ],
      hint: `A pirâmide tem 1/3 do volume do prisma (V = Ab × h / 3). Com base ${fmtNum(l * l)} cm², o prisma envolvente precisaria ter ${fmtNum(vol * 3)} cm³.`,
    };
  },
  () => {
    const b = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
    const h = [3, 4, 5][Math.floor(Math.random() * 3)];
    const area = b * h;
    return {
      id: `rect-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Placa Retangular para Corte a Laser',
      prompt: `Ajuste um retângulo com área de ${fmtNum(area)} cm² e perímetro de ${fmtNum(2 * (b + h))} cm.`,
      shapeId: 'retangulo',
      targetMetric: 'primary',
      targetMetricLabel: 'Área',
      targetValue: area,
      targetUnit: 'cm²',
      tolerance: 0.2,
      constraints: [],
      hint: `Observe a soma b + h: metade do perímetro vale ${fmtNum(b + h)} cm, enquanto o produto b × h deve valer ${fmtNum(area)} cm².`,
    };
  },
  () => {
    const r = [3, 4, 5][Math.floor(Math.random() * 3)];
    const theta = [90, 120, 180][Math.floor(Math.random() * 3)];
    const area = Math.round((theta / 360) * 3.14 * r * r * 100) / 100;
    return {
      id: `sector-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: 'Fatia de Setor Circular',
      prompt: `Configure um setor circular de raio ${fmtNum(r)} cm e área aproximada de ${fmtNum(area)} cm².`,
      shapeId: 'circulo',
      sectorEnabled: true,
      targetMetric: 'primary',
      targetMetricLabel: 'Área do Setor',
      targetValue: area,
      targetUnit: 'cm²',
      tolerance: Math.max(0.8, area * 0.03),
      constraints: [
        { paramKey: 'r', label: 'Raio (r)', targetValue: r, unit: 'cm' },
      ],
      hint: `Considerando π ≈ 3,14 e raio ${fmtNum(r)} cm, o círculo inteiro tem 3,14 × ${fmtNum(r * r)} = ${fmtNum(3.14 * r * r)} cm². Ajuste o ângulo θ para pegar a fração desejada.`,
    };
  },
];

export function generateRandomChallenge(excludeShapeId?: string): MakerChallenge {
  const pool =
    excludeShapeId && CHALLENGE_TEMPLATES.length > 1
      ? CHALLENGE_TEMPLATES
      : CHALLENGE_TEMPLATES;
  for (let i = 0; i < 6; i++) {
    const candidate = pool[Math.floor(Math.random() * pool.length)]();
    if (candidate.shapeId !== excludeShapeId) return candidate;
  }
  return pool[Math.floor(Math.random() * pool.length)]();
}

export function evaluateChallenge(
  challenge: MakerChallenge,
  params: Record<string, number>,
  mathResult: ShapeMathResult,
  activeState: {
    shapeId: string;
    triangleType: TriangleSubtype;
    polygonType: PolygonSubtype;
    sectorEnabled: boolean;
  }
): ChallengeEvaluation {
  if (activeState.shapeId !== challenge.shapeId) {
    return {
      solved: false,
      status: 'constraint_mismatch',
      currentValue: 0,
      difference: 0,
      feedbackTitle: 'Figura diferente da proposta',
      feedbackMessage: 'Selecione a figura pedida no desafio ou clique em "Ir para a figura do desafio".',
    };
  }

  // Check fixed constraints first
  for (const c of challenge.constraints) {
    const actual = params[c.paramKey] ?? 0;
    if (Math.abs(actual - c.targetValue) > 0.05) {
      const dir = actual < c.targetValue ? 'abaixo' : 'acima';
      return {
        solved: false,
        status: 'constraint_mismatch',
        currentValue:
          challenge.targetMetric === 'primary'
            ? mathResult.primaryMetricValue
            : mathResult.secondaryMetricValue,
        difference: actual - c.targetValue,
        feedbackTitle: `Restrição pendente em ${c.label}`,
        feedbackMessage: `O valor atual de ${c.label} (${fmtNum(actual)} ${c.unit}) está ${dir} do pedido no desafio (${fmtNum(c.targetValue)} ${c.unit}). Ajuste essa medida primeiro.`,
      };
    }
  }

  // Check special case for rectangle challenge that also specifies perimeter
  const currentValue =
    challenge.targetMetric === 'primary'
      ? mathResult.primaryMetricValue
      : mathResult.secondaryMetricValue;
  const diff = currentValue - challenge.targetValue;

  if (Math.abs(diff) <= challenge.tolerance) {
    // For rectangle dual-target check
    if (challenge.id.startsWith('rect-')) {
      const matchPerim = challenge.prompt.match(/perímetro de ([\d,.]+) cm/);
      if (matchPerim) {
        const expectedPerim = parseFloat(matchPerim[1].replace(',', '.'));
        if (Math.abs(mathResult.secondaryMetricValue - expectedPerim) > 0.3) {
          const pDir =
            mathResult.secondaryMetricValue < expectedPerim ? 'abaixo' : 'acima';
          return {
            solved: false,
            status: mathResult.secondaryMetricValue < expectedPerim ? 'below' : 'above',
            currentValue,
            difference: mathResult.secondaryMetricValue - expectedPerim,
            feedbackTitle: 'Área correta, ajuste o perímetro',
            feedbackMessage: `A área já está em ${fmtNum(currentValue)} cm², mas o perímetro atual (${fmtNum(mathResult.secondaryMetricValue)} cm) está ${pDir} da meta (${fmtNum(expectedPerim)} cm). Troque a combinação de base e altura.`,
          };
        }
      }
    }

    return {
      solved: true,
      status: 'solved',
      currentValue,
      difference: diff,
      feedbackTitle: 'Meta da Bancada Alcançada!',
      feedbackMessage: `Excelente! Você construiu o modelo com ${challenge.targetMetricLabel} de ${fmtNum(currentValue)} ${challenge.targetUnit}, pronto para prototipagem.`,
    };
  }

  if (diff < 0) {
    return {
      solved: false,
      status: 'below',
      currentValue,
      difference: diff,
      feedbackTitle: `${challenge.targetMetricLabel} abaixo da meta`,
      feedbackMessage: `Seu modelo está com ${fmtNum(currentValue)} ${challenge.targetUnit} — faltam cerca de ${fmtNum(Math.abs(diff))} ${challenge.targetUnit} para atingir ${fmtNum(challenge.targetValue)} ${challenge.targetUnit}. Aumente uma dimensão livre.`,
    };
  }

  return {
    solved: false,
    status: 'above',
    currentValue,
    difference: diff,
    feedbackTitle: `${challenge.targetMetricLabel} acima da meta`,
    feedbackMessage: `Seu modelo passou para ${fmtNum(currentValue)} ${challenge.targetUnit} — está ${fmtNum(diff)} ${challenge.targetUnit} acima de ${fmtNum(challenge.targetValue)} ${challenge.targetUnit}. Reduza uma dimensão livre.`,
  };
}
