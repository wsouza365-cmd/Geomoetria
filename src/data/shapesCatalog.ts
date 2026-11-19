import {
  AnyShapeId,
  CalculationStep,
  PolygonSubtype,
  ShapeDefinition,
  ShapeMathResult,
  TriangleSubtype,
} from '../types/geometry';

export const fmtNum = (n: number, decimals = 2): string => {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return rounded.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
    maximumFractionDigits: decimals,
  });
};

export const SHAPES_CATALOG: ShapeDefinition[] = [
  // ===================== CATEGORIA 2D =====================
  {
    id: 'quadrado',
    name: 'Quadrado',
    category: '2D',
    shortDesc: '4 lados iguais e 4 ângulos retos (90°).',
    params: [
      {
        key: 'l',
        label: 'Lado',
        symbol: 'l',
        unit: 'cm',
        min: 1,
        max: 12,
        step: 0.5,
        defaultValue: 5,
        description: 'Comprimento de cada um dos quatro lados iguais.',
      },
    ],
  },
  {
    id: 'retangulo',
    name: 'Retângulo',
    category: '2D',
    shortDesc: 'Lados opostos paralelos e iguais com ângulos de 90°.',
    params: [
      {
        key: 'b',
        label: 'Base',
        symbol: 'b',
        unit: 'cm',
        min: 1,
        max: 14,
        step: 0.5,
        defaultValue: 7,
        description: 'Comprimento horizontal da base.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 4,
        description: 'Altura perpendicular à base.',
      },
    ],
  },
  {
    id: 'paralelogramo',
    name: 'Paralelogramo',
    category: '2D',
    shortDesc: 'Lados opostos paralelos; equivale a um retângulo de mesma base e altura.',
    params: [
      {
        key: 'b',
        label: 'Base',
        symbol: 'b',
        unit: 'cm',
        min: 2,
        max: 12,
        step: 0.5,
        defaultValue: 6,
        description: 'Comprimento da base horizontal.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 1,
        max: 9,
        step: 0.5,
        defaultValue: 4,
        description: 'Distância perpendicular entre as bases.',
      },
      {
        key: 'd',
        label: 'Deslocamento lateral',
        symbol: 'd',
        unit: 'cm',
        min: 0.5,
        max: 5,
        step: 0.5,
        defaultValue: 2,
        description: 'Avanço horizontal da inclinação do lado oblíquo.',
      },
    ],
  },
  {
    id: 'losango',
    name: 'Losango',
    category: '2D',
    shortDesc: '4 lados iguais e diagonais perpendiculares que se cruzam no centro.',
    params: [
      {
        key: 'D',
        label: 'Diagonal Maior',
        symbol: 'D',
        unit: 'cm',
        min: 2,
        max: 14,
        step: 0.5,
        defaultValue: 8,
        description: 'Segmento que liga os dois vértices mais distantes.',
      },
      {
        key: 'd',
        label: 'Diagonal Menor',
        symbol: 'd',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 5,
        description: 'Segmento perpendicular que liga os outros dois vértices.',
      },
    ],
  },
  {
    id: 'triangulo',
    name: 'Triângulo',
    category: '2D',
    shortDesc: 'Polígono de 3 lados; metade da área de um retângulo de mesma base e altura.',
    subtypes: {
      key: 'triangleType',
      label: 'Tipo de Triângulo',
      defaultValue: 'retangulo',
      options: [
        { id: 'retangulo', label: 'Retângulo' },
        { id: 'isosceles', label: 'Isósceles' },
        { id: 'equilatero', label: 'Equilátero' },
      ],
    },
    params: [
      {
        key: 'b',
        label: 'Base',
        symbol: 'b',
        unit: 'cm',
        min: 2,
        max: 12,
        step: 0.5,
        defaultValue: 6,
        description: 'Comprimento do lado apoiado na horizontal.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 1.5,
        max: 10,
        step: 0.5,
        defaultValue: 4,
        description: 'Distância perpendicular da base até o vértice oposto.',
      },
    ],
  },
  {
    id: 'trapezio',
    name: 'Trapézio',
    category: '2D',
    shortDesc: 'Possui um par de bases paralelas (maior e menor).',
    params: [
      {
        key: 'B',
        label: 'Base Maior',
        symbol: 'B',
        unit: 'cm',
        min: 4,
        max: 14,
        step: 0.5,
        defaultValue: 8,
        description: 'Base paralela de maior comprimento.',
      },
      {
        key: 'b',
        label: 'Base Menor',
        symbol: 'b',
        unit: 'cm',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 4,
        description: 'Base paralela superior de menor comprimento.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 1.5,
        max: 9,
        step: 0.5,
        defaultValue: 4,
        description: 'Distância perpendicular entre a Base Maior e a Base Menor.',
      },
    ],
  },
  {
    id: 'poligono',
    name: 'Polígonos Regulares',
    category: '2D',
    shortDesc: 'Todos os lados e ângulos iguais, formados por triângulos com altura igual ao apótema.',
    subtypes: {
      key: 'polygonType',
      label: 'Número de Lados',
      defaultValue: 'hexagono',
      options: [
        { id: 'pentagono', label: 'Pentágono (5)' },
        { id: 'hexagono', label: 'Hexágono (6)' },
      ],
    },
    params: [
      {
        key: 'l',
        label: 'Lado',
        symbol: 'l',
        unit: 'cm',
        min: 1.5,
        max: 7,
        step: 0.5,
        defaultValue: 4,
        description: 'Medida de cada aresta externa do polígono regular.',
      },
    ],
  },
  {
    id: 'circulo',
    name: 'Círculo e Setor',
    category: '2D',
    shortDesc: 'Conjunto de pontos à mesma distância (raio) do centro, ou uma fração angular dele.',
    supportsSectorToggle: true,
    params: [
      {
        key: 'r',
        label: 'Raio',
        symbol: 'r',
        unit: 'cm',
        min: 1,
        max: 6.5,
        step: 0.5,
        defaultValue: 4,
        description: 'Distância do centro até a borda da circunferência.',
      },
      {
        key: 'theta',
        label: 'Ângulo do Setor',
        symbol: 'θ',
        unit: '°',
        min: 30,
        max: 360,
        step: 15,
        defaultValue: 90,
        description: 'Abertura angular da fatia quando o modo Setor Circular está ativo.',
      },
    ],
  },

  // ===================== CATEGORIA 3D =====================
  {
    id: 'cubo',
    name: 'Cubo',
    category: '3D',
    shortDesc: '6 faces quadradas idênticas; caso especial de prisma reto.',
    params: [
      {
        key: 'a',
        label: 'Aresta',
        symbol: 'a',
        unit: 'cm',
        min: 1.5,
        max: 8,
        step: 0.5,
        defaultValue: 4,
        description: 'Comprimento igual da largura, profundidade e altura.',
      },
    ],
  },
  {
    id: 'paralelepipedo',
    name: 'Paralelepípedo',
    category: '3D',
    shortDesc: 'Bloco retangular reto com 6 faces retangulares em pares opostos.',
    params: [
      {
        key: 'c',
        label: 'Comprimento',
        symbol: 'c',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Medida frontal da base.',
      },
      {
        key: 'l',
        label: 'Largura',
        symbol: 'l',
        unit: 'cm',
        min: 1.5,
        max: 8,
        step: 0.5,
        defaultValue: 4,
        description: 'Profundidade da base.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 1.5,
        max: 9,
        step: 0.5,
        defaultValue: 5,
        description: 'Altura vertical do sólido.',
      },
    ],
  },
  {
    id: 'prisma_triangular',
    name: 'Prisma Triangular',
    category: '3D',
    shortDesc: 'Duas bases triangulares paralelas ligadas por 3 faces retangulares.',
    params: [
      {
        key: 'b',
        label: 'Base do Triângulo',
        symbol: 'b',
        unit: 'cm',
        min: 2,
        max: 8,
        step: 0.5,
        defaultValue: 5,
        description: 'Lado inferior do triângulo da base.',
      },
      {
        key: 'ht',
        label: 'Altura do Triângulo',
        symbol: 'ht',
        unit: 'cm',
        min: 2,
        max: 8,
        step: 0.5,
        defaultValue: 4,
        description: 'Altura interna do triângulo da base.',
      },
      {
        key: 'H',
        label: 'Altura do Prisma',
        symbol: 'H',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Distância perpendicular entre as duas bases triangulares.',
      },
    ],
  },
  {
    id: 'prisma_hexagonal',
    name: 'Prisma Hexagonal',
    category: '3D',
    shortDesc: 'Duas bases hexagonais regulares e 6 faces laterais retangulares.',
    params: [
      {
        key: 'l',
        label: 'Aresta da Base',
        symbol: 'l',
        unit: 'cm',
        min: 1.5,
        max: 5,
        step: 0.5,
        defaultValue: 3,
        description: 'Lado do hexágono regular da base.',
      },
      {
        key: 'H',
        label: 'Altura do Prisma',
        symbol: 'H',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 5,
        description: 'Altura vertical entre as bases hexagonais.',
      },
    ],
  },
  {
    id: 'piramide_quadrada',
    name: 'Pirâmide Quadrada',
    category: '3D',
    shortDesc: 'Base quadrada e 4 faces triangulares que convergem para o ápice.',
    params: [
      {
        key: 'l',
        label: 'Aresta da Base',
        symbol: 'l',
        unit: 'cm',
        min: 2,
        max: 8,
        step: 0.5,
        defaultValue: 5,
        description: 'Lado do quadrado da base.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Distância vertical do centro da base até o vértice superior.',
      },
    ],
  },
  {
    id: 'piramide_triangular',
    name: 'Pirâmide Triangular',
    category: '3D',
    shortDesc: 'Tetraedro de base triangular equilátera e 3 faces laterais triangulares.',
    params: [
      {
        key: 'l',
        label: 'Aresta da Base',
        symbol: 'l',
        unit: 'cm',
        min: 2,
        max: 8,
        step: 0.5,
        defaultValue: 5,
        description: 'Lado do triângulo equilátero da base.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Altura perpendicular da base até o ápice.',
      },
    ],
  },
  {
    id: 'cilindro',
    name: 'Cilindro',
    category: '3D',
    shortDesc: 'Duas bases circulares paralelas ligadas por uma superfície curva contínua.',
    params: [
      {
        key: 'r',
        label: 'Raio',
        symbol: 'r',
        unit: 'cm',
        min: 1,
        max: 5.5,
        step: 0.5,
        defaultValue: 3,
        description: 'Raio do círculo da base e do topo.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Distância perpendicular entre as duas bases circulares.',
      },
    ],
  },
  {
    id: 'cone',
    name: 'Cone',
    category: '3D',
    shortDesc: 'Base circular afilando até um vértice; ocupa 1/3 do cilindro correspondente.',
    params: [
      {
        key: 'r',
        label: 'Raio da Base',
        symbol: 'r',
        unit: 'cm',
        min: 1.5,
        max: 5.5,
        step: 0.5,
        defaultValue: 3,
        description: 'Raio do círculo da base.',
      },
      {
        key: 'h',
        label: 'Altura',
        symbol: 'h',
        unit: 'cm',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 6,
        description: 'Altura perpendicular do centro da base ao vértice.',
      },
    ],
  },
  {
    id: 'esfera',
    name: 'Esfera',
    category: '3D',
    shortDesc: 'Sólido perfeitamente simétrico; planificado em gomos/meridianos.',
    params: [
      {
        key: 'r',
        label: 'Raio',
        symbol: 'r',
        unit: 'cm',
        min: 1.5,
        max: 5.5,
        step: 0.5,
        defaultValue: 3.5,
        description: 'Distância do centro até qualquer ponto da superfície.',
      },
    ],
  },
];

export function getShapeDefinition(id: AnyShapeId): ShapeDefinition {
  return SHAPES_CATALOG.find((s) => s.id === id) ?? SHAPES_CATALOG[0];
}

export function getDefaultParamsForShape(id: AnyShapeId): Record<string, number> {
  const def = getShapeDefinition(id);
  const out: Record<string, number> = {};
  for (const p of def.params) {
    out[p.key] = p.defaultValue;
  }
  return out;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function computeShapeMath(
  id: AnyShapeId,
  params: Record<string, number>,
  options?: {
    triangleType?: TriangleSubtype;
    polygonType?: PolygonSubtype;
    sectorEnabled?: boolean;
  }
): ShapeMathResult {
  const PI = 3.14;
  const SQRT3 = 1.73;
  const TAN36 = 0.73;

  switch (id) {
    case 'quadrado': {
      const l = params.l ?? 5;
      const area = round2(l * l);
      const perim = round2(4 * l);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        stage1Intuition: `Na malha quadriculada, formamos ${fmtNum(l)} fileiras com ${fmtNum(l)} quadrados de 1 cm² cada. Multiplicar o lado por ele mesmo conta todas as unidades internas.`,
        stage2GeneralFormula: 'A = l × l  (ou A = l²)',
        stage2SecondaryFormula: 'P = l + l + l + l  (ou 4 × l)',
        stage3Substitutions: [
          { label: 'Lado', symbol: 'l', valueText: `${fmtNum(l)} cm` },
        ],
        stage3FormulaWithNumbers: `A = ${fmtNum(l)} × ${fmtNum(l)}`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          steps: [
            {
              stepTag: '1º Abrir a potência do lado (lado × lado)',
              expression: `${fmtNum(l)}² = ${fmtNum(l)} × ${fmtNum(l)}`,
            },
            {
              stepTag: '2º Resultado final da área',
              expression: `A = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          steps: [
            {
              stepTag: '1º Somar os 4 lados iguais do quadrado',
              expression: `P = ${fmtNum(l)} + ${fmtNum(l)} + ${fmtNum(l)} + ${fmtNum(l)}`,
            },
            {
              stepTag: '2º Conferir multiplicando por 4',
              expression: `P = 4 × ${fmtNum(l)} = ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P = ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'retangulo': {
      const b = params.b ?? 7;
      const h = params.h ?? 4;
      const area = round2(b * h);
      const somaBH = round2(b + h);
      const perim = round2(2 * somaBH);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        stage1Intuition: `Cada fileira horizontal comporta ${fmtNum(b)} quadrados de 1 cm², repetidos em ${fmtNum(h)} andares de altura.`,
        stage2GeneralFormula: 'A = b × h',
        stage2SecondaryFormula: 'P = 2 × (b + h)',
        stage3Substitutions: [
          { label: 'Base', symbol: 'b', valueText: `${fmtNum(b)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
        ],
        stage3FormulaWithNumbers: `A = ${fmtNum(b)} × ${fmtNum(h)}`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          steps: [
            {
              stepTag: '1º Multiplicar a base pela altura',
              expression: `A = ${fmtNum(b)} × ${fmtNum(h)}`,
            },
            {
              stepTag: '2º Resultado final da área',
              expression: `A = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          steps: [
            {
              stepTag: '1º Somar uma base e uma altura (dentro dos parênteses)',
              expression: `b + h = ${fmtNum(b)} + ${fmtNum(h)} = ${fmtNum(somaBH)} cm`,
            },
            {
              stepTag: '2º Multiplicar por 2 (há 2 bases e 2 alturas)',
              expression: `P = 2 × ${fmtNum(somaBH)} = ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P = ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'paralelogramo': {
      const b = params.b ?? 6;
      const h = params.h ?? 4;
      const d = params.d ?? 2;
      const h2 = round2(h * h);
      const d2 = round2(d * d);
      const sumSq = round2(h2 + d2);
      const slant = round2(Math.sqrt(sumSq));
      const area = round2(b * h);
      const somaBL = round2(b + slant);
      const perim = round2(2 * somaBL);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues: [
          { label: 'Lado inclinado', symbol: 'l', value: slant, unit: 'cm' },
        ],
        stage1Intuition: `Ao recortar o triângulo da extremidade esquerda e encaixá-lo na direita (linhas tracejadas), o paralelogramo transforma-se em um retângulo perfeito de base ${fmtNum(b)} cm e altura ${fmtNum(h)} cm.`,
        stage2GeneralFormula: 'A = b × h',
        stage2SecondaryFormula: 'P = 2 × (b + l)',
        stage3Substitutions: [
          { label: 'Base', symbol: 'b', valueText: `${fmtNum(b)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
          { label: 'Deslocamento', symbol: 'd', valueText: `${fmtNum(d)} cm` },
        ],
        stage3FormulaWithNumbers: `A = ${fmtNum(b)} × ${fmtNum(h)}`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          steps: [
            {
              stepTag: '1º Multiplicar a base pela altura perpendicular (não pelo lado inclinado)',
              expression: `A = ${fmtNum(b)} × ${fmtNum(h)}`,
            },
            {
              stepTag: '2º Resultado final da área',
              expression: `A = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Lado inclinado (l) por Pitágoras',
              steps: [
                {
                  stepTag: '1º Abrir as potências da altura e do deslocamento',
                  expression: `${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}  |  ${fmtNum(d)}² = ${fmtNum(d)} × ${fmtNum(d)} = ${fmtNum(d2)}`,
                },
                {
                  stepTag: '2º Somar os dois quadrados',
                  expression: `${fmtNum(h2)} + ${fmtNum(d2)} = ${fmtNum(sumSq)}`,
                },
                {
                  stepTag: '3º Extrair a raiz quadrada para achar o lado',
                  expression: `l = √${fmtNum(sumSq)} ≈ ${fmtNum(slant)} cm`,
                },
              ],
              resultText: `l ≈ ${fmtNum(slant)} cm`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar a base e o lado inclinado encontrado',
              expression: `b + l = ${fmtNum(b)} + ${fmtNum(slant)} = ${fmtNum(somaBL)} cm`,
            },
            {
              stepTag: '2º Multiplicar por 2 (lados opostos iguais)',
              expression: `P = 2 × ${fmtNum(somaBL)} ≈ ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P ≈ ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'losango': {
      const D = params.D ?? 8;
      const d = params.d ?? 5;
      const halfD = round2(D / 2);
      const halfd = round2(d / 2);
      const halfD2 = round2(halfD * halfD);
      const halfd2 = round2(halfd * halfd);
      const sumSq = round2(halfD2 + halfd2);
      const side = round2(Math.sqrt(sumSq));
      const rectArea = round2(D * d);
      const area = round2(rectArea / 2);
      const perim = round2(4 * side);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues: [
          { label: 'Lado do losango', symbol: 'l', value: side, unit: 'cm' },
        ],
        stage1Intuition: `O retângulo tracejado em volta tem área D × d e é dividido em 8 triângulos iguais: 4 ficam dentro do losango e 4 ficam fora. Logo, o losango ocupa exatamente metade do retângulo.`,
        stage2GeneralFormula: 'A = (D × d) / 2',
        stage2SecondaryFormula: 'P = 4 × l',
        stage3Substitutions: [
          { label: 'Diagonal Maior', symbol: 'D', valueText: `${fmtNum(D)} cm` },
          { label: 'Diagonal Menor', symbol: 'd', valueText: `${fmtNum(d)} cm` },
        ],
        stage3FormulaWithNumbers: `A = (${fmtNum(D)} × ${fmtNum(d)}) / 2`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          steps: [
            {
              stepTag: '1º Multiplicar as duas diagonais (área do retângulo envolvente)',
              expression: `D × d = ${fmtNum(D)} × ${fmtNum(d)} = ${fmtNum(rectArea)} cm²`,
            },
            {
              stepTag: '2º Dividir por 2 (o losango ocupa metade desse retângulo)',
              expression: `A = ${fmtNum(rectArea)} ÷ 2 = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Lado (l) pelas metades das diagonais',
              steps: [
                {
                  stepTag: '1º Dividir cada diagonal ao meio para formar o triângulo retângulo interno',
                  expression: `D ÷ 2 = ${fmtNum(D)} ÷ 2 = ${fmtNum(halfD)} cm  |  d ÷ 2 = ${fmtNum(d)} ÷ 2 = ${fmtNum(halfd)} cm`,
                },
                {
                  stepTag: '2º Abrir as potências das duas metades',
                  expression: `${fmtNum(halfD)}² = ${fmtNum(halfD)} × ${fmtNum(halfD)} = ${fmtNum(halfD2)}  |  ${fmtNum(halfd)}² = ${fmtNum(halfd)} × ${fmtNum(halfd)} = ${fmtNum(halfd2)}`,
                },
                {
                  stepTag: '3º Somar os quadrados e extrair a raiz',
                  expression: `l = √(${fmtNum(halfD2)} + ${fmtNum(halfd2)}) = √${fmtNum(sumSq)} ≈ ${fmtNum(side)} cm`,
                },
              ],
              resultText: `l ≈ ${fmtNum(side)} cm`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar o lado encontrado por 4 lados iguais',
              expression: `P = 4 × ${fmtNum(side)} ≈ ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P ≈ ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'triangulo': {
      const tType = options?.triangleType ?? 'retangulo';
      const b = params.b ?? 6;
      const h =
        tType === 'equilatero' ? round2((b * SQRT3) / 2) : (params.h ?? 4);
      const rectArea = round2(b * h);
      const area = round2(rectArea / 2);

      let perim = 0;
      const perimDerived: NonNullable<ShapeMathResult['secondarySection']['derivedBlocks']> = [];
      const perimSteps: ShapeMathResult['secondarySection']['steps'] = [];

      if (tType === 'retangulo') {
        const b2 = round2(b * b);
        const h2 = round2(h * h);
        const sumSq = round2(b2 + h2);
        const hip = round2(Math.sqrt(sumSq));
        const bPlusH = round2(b + h);
        perim = round2(bPlusH + hip);
        perimDerived.push({
          title: 'Medida derivada: Hipotenusa (c) por Pitágoras',
          steps: [
            {
              stepTag: '1º Abrir as potências dos catetos (base e altura)',
              expression: `${fmtNum(b)}² = ${fmtNum(b)} × ${fmtNum(b)} = ${fmtNum(b2)}  |  ${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}`,
            },
            {
              stepTag: '2º Somar os dois quadrados',
              expression: `${fmtNum(b2)} + ${fmtNum(h2)} = ${fmtNum(sumSq)}`,
            },
            {
              stepTag: '3º Extrair a raiz quadrada',
              expression: `c = √${fmtNum(sumSq)} ≈ ${fmtNum(hip)} cm`,
            },
          ],
          resultText: `c ≈ ${fmtNum(hip)} cm`,
        });
        perimSteps.push(
          {
            stepTag: '1º Somar os dois catetos (base + altura)',
            expression: `${fmtNum(b)} + ${fmtNum(h)} = ${fmtNum(bPlusH)} cm`,
          },
          {
            stepTag: '2º Somar com a hipotenusa encontrada',
            expression: `P = ${fmtNum(bPlusH)} + ${fmtNum(hip)} ≈ ${fmtNum(perim)} cm`,
          }
        );
      } else if (tType === 'isosceles') {
        const halfB = round2(b / 2);
        const halfB2 = round2(halfB * halfB);
        const h2 = round2(h * h);
        const sumSq = round2(halfB2 + h2);
        const lado = round2(Math.sqrt(sumSq));
        const twoLados = round2(2 * lado);
        perim = round2(b + twoLados);
        perimDerived.push({
          title: 'Medida derivada: Lado inclinado igual (l) por Pitágoras',
          steps: [
            {
              stepTag: '1º Dividir a base ao meio (a altura divide o triângulo isósceles ao meio)',
              expression: `b ÷ 2 = ${fmtNum(b)} ÷ 2 = ${fmtNum(halfB)} cm`,
            },
            {
              stepTag: '2º Abrir as potências da metade da base e da altura',
              expression: `${fmtNum(halfB)}² = ${fmtNum(halfB)} × ${fmtNum(halfB)} = ${fmtNum(halfB2)}  |  ${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}`,
            },
            {
              stepTag: '3º Somar os quadrados e extrair a raiz',
              expression: `l = √(${fmtNum(halfB2)} + ${fmtNum(h2)}) = √${fmtNum(sumSq)} ≈ ${fmtNum(lado)} cm`,
            },
          ],
          resultText: `l ≈ ${fmtNum(lado)} cm`,
        });
        perimSteps.push(
          {
            stepTag: '1º Multiplicar o lado inclinado por 2 (dois lados iguais)',
            expression: `2 × ${fmtNum(lado)} = ${fmtNum(twoLados)} cm`,
          },
          {
            stepTag: '2º Somar a base com os dois lados iguais',
            expression: `P = ${fmtNum(b)} + ${fmtNum(twoLados)} ≈ ${fmtNum(perim)} cm`,
          }
        );
      } else {
        perim = round2(3 * b);
        perimSteps.push(
          {
            stepTag: '1º Somar os 3 lados iguais',
            expression: `P = ${fmtNum(b)} + ${fmtNum(b)} + ${fmtNum(b)}`,
          },
          {
            stepTag: '2º Resultado final do perímetro',
            expression: `P = 3 × ${fmtNum(b)} = ${fmtNum(perim)} cm`,
          }
        );
      }

      const eqHeightNum = round2(b * SQRT3);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues:
          tType === 'equilatero'
            ? [{ label: 'Altura calculada', symbol: 'h', value: h, unit: 'cm' }]
            : undefined,
        stage1Intuition: `O retângulo tracejado em volta do triângulo possui área b × h. Os recortes externos dobram exatamente sobre o triângulo interno, provando que sua área é a metade.`,
        stage2GeneralFormula:
          tType === 'equilatero'
            ? 'A = (b × h) / 2  (com h = l·√3 / 2)'
            : 'A = (b × h) / 2',
        stage2SecondaryFormula:
          tType === 'equilatero' ? 'P = 3 × l' : 'P = soma dos 3 lados',
        stage3Substitutions: [
          {
            label: tType === 'equilatero' ? 'Lado / Base' : 'Base',
            symbol: 'b',
            valueText: `${fmtNum(b)} cm`,
          },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
        ],
        stage3FormulaWithNumbers: `A = (${fmtNum(b)} × ${fmtNum(h)}) / 2`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          constantNote:
            tType === 'equilatero' ? 'Considerando √3 ≈ 1,73' : undefined,
          derivedBlocks:
            tType === 'equilatero'
              ? [
                  {
                    title: 'Medida derivada: Altura do triângulo equilátero (h)',
                    steps: [
                      {
                        stepTag: '1º Multiplicar o lado pela constante √3 (≈ 1,73)',
                        expression: `${fmtNum(b)} × 1,73 = ${fmtNum(eqHeightNum)}`,
                      },
                      {
                        stepTag: '2º Dividir por 2 para obter a altura',
                        expression: `h = ${fmtNum(eqHeightNum)} ÷ 2 ≈ ${fmtNum(h)} cm`,
                      },
                    ],
                    resultText: `h ≈ ${fmtNum(h)} cm`,
                  },
                ]
              : undefined,
          steps: [
            {
              stepTag: '1º Multiplicar base pela altura (área do retângulo envolvente)',
              expression: `b × h = ${fmtNum(b)} × ${fmtNum(h)} = ${fmtNum(rectArea)} cm²`,
            },
            {
              stepTag: '2º Dividir por 2 (o triângulo é metade do retângulo)',
              expression: `A = ${fmtNum(rectArea)} ÷ 2 = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          derivedBlocks: perimDerived.length > 0 ? perimDerived : undefined,
          steps: perimSteps,
          finalResult:
            tType === 'equilatero'
              ? `P = ${fmtNum(perim)} cm`
              : `P ≈ ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'trapezio': {
      const B = Math.max(params.B ?? 8, (params.b ?? 4) + 0.5);
      const b = Math.min(params.b ?? 4, B - 0.5);
      const h = params.h ?? 4;
      const sumBases = round2(B + b);
      const doubleTrap = round2(sumBases * h);
      const area = round2(doubleTrap / 2);

      const diffBases = round2(B - b);
      const ponta = round2(diffBases / 2);
      const ponta2 = round2(ponta * ponta);
      const h2 = round2(h * h);
      const sumSq = round2(ponta2 + h2);
      const lateral = round2(Math.sqrt(sumSq));
      const twoLat = round2(2 * lateral);
      const perim = round2(sumBases + twoLat);
      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues: [
          { label: 'Lado oblíquo (isósceles)', symbol: 'l', value: lateral, unit: 'cm' },
        ],
        stage1Intuition: `Duplicando o trapézio de cabeça para baixo (linha tracejada à direita), formamos um paralelogramo de base (B + b) e altura h. Como usamos dois trapézios iguais, dividimos por 2.`,
        stage2GeneralFormula: 'A = ((B + b) × h) / 2',
        stage2SecondaryFormula: 'P = B + b + 2 × l',
        stage3Substitutions: [
          { label: 'Base Maior', symbol: 'B', valueText: `${fmtNum(B)} cm` },
          { label: 'Base Menor', symbol: 'b', valueText: `${fmtNum(b)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
        ],
        stage3FormulaWithNumbers: `A = ((${fmtNum(B)} + ${fmtNum(b)}) × ${fmtNum(h)}) / 2`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          steps: [
            {
              stepTag: '1º Somar a Base Maior e a Base Menor (dentro dos parênteses)',
              expression: `B + b = ${fmtNum(B)} + ${fmtNum(b)} = ${fmtNum(sumBases)} cm`,
            },
            {
              stepTag: '2º Multiplicar pela altura (área dos 2 trapézios juntos)',
              expression: `${fmtNum(sumBases)} × ${fmtNum(h)} = ${fmtNum(doubleTrap)} cm²`,
            },
            {
              stepTag: '3º Dividir por 2 para obter a área de apenas 1 trapézio',
              expression: `A = ${fmtNum(doubleTrap)} ÷ 2 = ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A = ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Lado oblíquo (l) por Pitágoras',
              steps: [
                {
                  stepTag: '1º Achar a diferença entre as duas bases e dividir para os 2 lados',
                  expression: `(${fmtNum(B)} − ${fmtNum(b)}) ÷ 2 = ${fmtNum(diffBases)} ÷ 2 = ${fmtNum(ponta)} cm`,
                },
                {
                  stepTag: '2º Abrir as potências da ponta lateral e da altura',
                  expression: `${fmtNum(ponta)}² = ${fmtNum(ponta)} × ${fmtNum(ponta)} = ${fmtNum(ponta2)}  |  ${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}`,
                },
                {
                  stepTag: '3º Somar os quadrados e extrair a raiz',
                  expression: `l = √(${fmtNum(ponta2)} + ${fmtNum(h2)}) = √${fmtNum(sumSq)} ≈ ${fmtNum(lateral)} cm`,
                },
              ],
              resultText: `l ≈ ${fmtNum(lateral)} cm`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar as duas bases paralelas',
              expression: `B + b = ${fmtNum(B)} + ${fmtNum(b)} = ${fmtNum(sumBases)} cm`,
            },
            {
              stepTag: '2º Multiplicar o lado oblíquo por 2',
              expression: `2 × ${fmtNum(lateral)} = ${fmtNum(twoLat)} cm`,
            },
            {
              stepTag: '3º Somar tudo para fechar o contorno',
              expression: `P = ${fmtNum(sumBases)} + ${fmtNum(twoLat)} ≈ ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P ≈ ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'poligono': {
      const pType: PolygonSubtype = options?.polygonType ?? 'hexagono';
      const n = pType === 'pentagono' ? 5 : 6;
      const l = params.l ?? 4;
      const perim = round2(n * l);

      let apotema = 0;
      const derivedApotemaSteps: CalculationStep[] = [];
      let constNote = '';

      if (pType === 'hexagono') {
        constNote = 'Considerando √3 ≈ 1,73';
        const prod = round2(l * SQRT3);
        apotema = round2(prod / 2);
        derivedApotemaSteps.push(
          {
            stepTag: '1º Multiplicar o lado por √3 (≈ 1,73)',
            expression: `${fmtNum(l)} × 1,73 = ${fmtNum(prod)}`,
          },
          {
            stepTag: '2º Dividir por 2 para obter o apótema do hexágono',
            expression: `a = ${fmtNum(prod)} ÷ 2 ≈ ${fmtNum(apotema)} cm`,
          }
        );
      } else {
        constNote = 'Considerando tg(36°) ≈ 0,73';
        const denom = round2(2 * TAN36);
        apotema = round2(l / denom);
        derivedApotemaSteps.push(
          {
            stepTag: '1º Multiplicar 2 pela tangente de 36° (≈ 0,73)',
            expression: `2 × 0,73 = ${fmtNum(denom)}`,
          },
          {
            stepTag: '2º Dividir o lado por 1,46 para achar o apótema',
            expression: `a = ${fmtNum(l)} ÷ ${fmtNum(denom)} ≈ ${fmtNum(apotema)} cm`,
          }
        );
      }

      const prodPA = round2(perim * apotema);
      const area = round2(prodPA / 2);
      const triArea = round2((l * apotema) / 2);

      return {
        primaryMetricLabel: 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: 'Perímetro',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues: [
          { label: 'Apótema', symbol: 'a', value: apotema, unit: 'cm' },
          { label: 'Área de 1 triângulo interno', symbol: 'At', value: triArea, unit: 'cm²' },
        ],
        stage1Intuition: `Ligando os vértices ao centro, dividimos o ${pType === 'pentagono' ? 'pentágono' : 'hexágono'} em ${n} triângulos iguais de base l e altura igual ao apótema (a). Somar todos equivale a (Perímetro × Apótema) / 2.`,
        stage2GeneralFormula: `A = (P × a) / 2  (ou ${n} × (l × a) / 2)`,
        stage2SecondaryFormula: `P = ${n} × l`,
        stage3Substitutions: [
          { label: 'Número de lados', symbol: 'n', valueText: `${n}` },
          { label: 'Lado', symbol: 'l', valueText: `${fmtNum(l)} cm` },
          { label: 'Apótema', symbol: 'a', valueText: `${fmtNum(apotema)} cm` },
        ],
        stage3FormulaWithNumbers: `A = (${fmtNum(perim)} × ${fmtNum(apotema)}) / 2`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: 'Área da Superfície (cm²)',
          constantNote: constNote,
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Perímetro (P)',
              steps: [
                {
                  stepTag: `1º Multiplicar os ${n} lados iguais pela medida do lado`,
                  expression: `P = ${n} × ${fmtNum(l)} = ${fmtNum(perim)} cm`,
                },
              ],
              resultText: `P = ${fmtNum(perim)} cm`,
            },
            {
              title: 'Medida derivada 2: Apótema (a)',
              steps: derivedApotemaSteps,
              resultText: `a ≈ ${fmtNum(apotema)} cm`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar o Perímetro pelo Apótema',
              expression: `P × a = ${fmtNum(perim)} × ${fmtNum(apotema)} = ${fmtNum(prodPA)}`,
            },
            {
              stepTag: '2º Dividir por 2 (fórmula da área dos triângulos somados)',
              expression: `A = ${fmtNum(prodPA)} ÷ 2 ≈ ${fmtNum(area)} cm²`,
            },
          ],
          finalResult: `A ≈ ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: 'Cálculo do Perímetro',
          title: 'Perímetro / Contorno (cm)',
          steps: [
            {
              stepTag: `1º Multiplicar o número de lados (${n}) pela medida de cada lado`,
              expression: `P = ${n} × ${fmtNum(l)}`,
            },
            {
              stepTag: '2º Resultado final do perímetro',
              expression: `P = ${fmtNum(perim)} cm`,
            },
          ],
          finalResult: `P = ${fmtNum(perim)} cm`,
        },
      };
    }

    case 'circulo': {
      const r = params.r ?? 4;
      const sectorEnabled = options?.sectorEnabled ?? false;
      const theta = sectorEnabled ? (params.theta ?? 90) : 360;
      const r2 = round2(r * r);
      const fullArea = round2(PI * r2);
      const frac = round2(theta / 360);
      const area = sectorEnabled ? round2(fullArea * frac) : fullArea;

      const twoPi = round2(2 * PI); // 6.28
      const fullCirc = round2(twoPi * r);
      const arc = round2(fullCirc * frac);
      const twoR = round2(2 * r);
      const perim = sectorEnabled && theta < 360 ? round2(arc + twoR) : fullCirc;

      return {
        primaryMetricLabel: sectorEnabled ? 'Área do Setor' : 'Área',
        primaryMetricValue: area,
        primaryMetricUnit: 'cm²',
        secondaryMetricLabel: sectorEnabled ? 'Perímetro do Setor' : 'Circunferência',
        secondaryMetricValue: perim,
        secondaryMetricUnit: 'cm',
        extraDerivedValues: [
          { label: 'Diâmetro', symbol: 'd', value: twoR, unit: 'cm' },
          ...(sectorEnabled
            ? [{ label: 'Comprimento do arco', symbol: 'L', value: arc, unit: 'cm' }]
            : []),
        ],
        stage1Intuition: sectorEnabled
          ? `O setor circular de ${fmtNum(theta)}° é uma fatia proporcional a ${fmtNum(theta)}/360 do círculo completo (π × r²). Seu contorno soma o arco curvo mais dois raios.`
          : `Se fatiarmos o círculo em setores bem finos e os intercalarmos, formamos um retângulo aproximado de base π×r (metade da circunferência) e altura r, resultando em π × r².`,
        stage2GeneralFormula: sectorEnabled
          ? 'A = (θ / 360°) × π × r²'
          : 'A = π × r²',
        stage2SecondaryFormula: sectorEnabled
          ? 'P = (θ / 360°) × 2πr + 2r'
          : 'C = 2 × π × r',
        stage3Substitutions: [
          { label: 'Raio', symbol: 'r', valueText: `${fmtNum(r)} cm` },
          ...(sectorEnabled
            ? [{ label: 'Ângulo', symbol: 'θ', valueText: `${fmtNum(theta)}°` }]
            : []),
          { label: 'Constante Pi', symbol: 'π', valueText: '≈ 3,14' },
        ],
        stage3FormulaWithNumbers: sectorEnabled
          ? `A = (${fmtNum(theta)} / 360) × 3,14 × ${fmtNum(r)}²`
          : `A = 3,14 × ${fmtNum(r)}²`,
        primarySection: {
          tabLabel: 'Cálculo da Área',
          title: sectorEnabled ? 'Área do Setor Circular (cm²)' : 'Área do Círculo (cm²)',
          constantNote: 'Considerando π ≈ 3,14',
          steps: [
            {
              stepTag: '1º Resolver a potência do raio (r × r)',
              expression: `${fmtNum(r)}² = ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)}`,
            },
            {
              stepTag: '2º Multiplicar por π (≈ 3,14) para achar o círculo inteiro',
              expression: `3,14 × ${fmtNum(r2)} = ${fmtNum(fullArea)} cm²`,
            },
            ...(sectorEnabled
              ? [
                  {
                    stepTag: '3º Calcular a fração da fatia no círculo de 360°',
                    expression: `${fmtNum(theta)} ÷ 360 ≈ ${fmtNum(frac)}`,
                  },
                  {
                    stepTag: '4º Multiplicar a fração pela área total do círculo',
                    expression: `A = ${fmtNum(frac)} × ${fmtNum(fullArea)} ≈ ${fmtNum(area)} cm²`,
                  },
                ]
              : []),
          ],
          finalResult: `A ≈ ${fmtNum(area)} cm²`,
        },
        secondarySection: {
          tabLabel: sectorEnabled ? 'Cálculo do Perímetro' : 'Cálculo da Circunferência',
          title: sectorEnabled ? 'Perímetro do Setor (cm)' : 'Comprimento da Circunferência (cm)',
          constantNote: 'Considerando π ≈ 3,14',
          steps:
            sectorEnabled && theta < 360
              ? [
                  {
                    stepTag: '1º Multiplicar 2 por π (≈ 3,14)',
                    expression: `2 × 3,14 = 6,28`,
                  },
                  {
                    stepTag: '2º Multiplicar pelo raio para achar a volta completa',
                    expression: `C = 6,28 × ${fmtNum(r)} = ${fmtNum(fullCirc)} cm`,
                  },
                  {
                    stepTag: '3º Pegar apenas a fração do arco (θ ÷ 360)',
                    expression: `Arco = ${fmtNum(frac)} × ${fmtNum(fullCirc)} ≈ ${fmtNum(arc)} cm`,
                  },
                  {
                    stepTag: '4º Calcular o comprimento dos 2 raios retos da fatia',
                    expression: `2 × r = 2 × ${fmtNum(r)} = ${fmtNum(twoR)} cm`,
                  },
                  {
                    stepTag: '5º Somar o arco curvo com os 2 raios',
                    expression: `P = ${fmtNum(arc)} + ${fmtNum(twoR)} ≈ ${fmtNum(perim)} cm`,
                  },
                ]
              : [
                  {
                    stepTag: '1º Multiplicar 2 por π (≈ 3,14)',
                    expression: `2 × 3,14 = 6,28`,
                  },
                  {
                    stepTag: '2º Multiplicar pelo raio para obter o contorno completo',
                    expression: `C = 6,28 × ${fmtNum(r)} ≈ ${fmtNum(perim)} cm`,
                  },
                ],
          finalResult: `${sectorEnabled ? 'P' : 'C'} ≈ ${fmtNum(perim)} cm`,
        },
      };
    }

    // ===================== CATEGORIA 3D =====================
    case 'cubo': {
      const a = params.a ?? 4;
      const baseArea = round2(a * a);
      const vol = round2(baseArea * a);
      const totalArea = round2(6 * baseArea);
      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
        ],
        stage1Intuition: `A base quadrada comporta ${fmtNum(baseArea)} cubinhos de 1 cm³ no primeiro andar. Empilhando ${fmtNum(a)} camadas iguais de 1 cm de altura, preenchemos todo o cubo.`,
        stage2GeneralFormula: 'V = Ab × a = a³',
        stage2SecondaryFormula: 'At = 6 × a²',
        stage3Substitutions: [
          { label: 'Aresta', symbol: 'a', valueText: `${fmtNum(a)} cm` },
          { label: 'Área da base', symbol: 'Ab', valueText: `${fmtNum(baseArea)} cm²` },
        ],
        stage3FormulaWithNumbers: `V = ${fmtNum(a)} × ${fmtNum(a)} × ${fmtNum(a)}`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Quadrada (Ab)',
              steps: [
                {
                  stepTag: '1º Abrir a potência do quadrado da base (aresta × aresta)',
                  expression: `Ab = ${fmtNum(a)}² = ${fmtNum(a)} × ${fmtNum(a)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar a Área da Base pela altura (aresta a)',
              expression: `V = ${fmtNum(baseArea)} × ${fmtNum(a)}`,
            },
            {
              stepTag: '2º Resultado final do volume',
              expression: `V = ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V = ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área de 1 face quadrada (Af)',
              steps: [
                {
                  stepTag: '1º Abrir a potência da aresta para calcular 1 quadrado',
                  expression: `Af = ${fmtNum(a)}² = ${fmtNum(a)} × ${fmtNum(a)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Af = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar a área de 1 face por 6 (o cubo tem 6 faces iguais)',
              expression: `At = 6 × ${fmtNum(baseArea)}`,
            },
            {
              stepTag: '2º Resultado final da área total do molde',
              expression: `At = ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At = ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'paralelepipedo': {
      const c = params.c ?? 6;
      const l = params.l ?? 4;
      const h = params.h ?? 5;
      const baseArea = round2(c * l);
      const vol = round2(baseArea * h);
      const faceBase = round2(c * l);
      const faceFront = round2(c * h);
      const faceSide = round2(l * h);
      const sum3Faces = round2(faceBase + faceFront + faceSide);
      const totalArea = round2(2 * sum3Faces);
      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
        ],
        stage1Intuition: `Na base retangular cabem ${fmtNum(c)} × ${fmtNum(l)} = ${fmtNum(baseArea)} cubinhos de 1 cm³. Ao empilhar ${fmtNum(h)} camadas dessa base, obtemos o volume total.`,
        stage2GeneralFormula: 'V = Ab × h = c × l × h',
        stage2SecondaryFormula: 'At = 2 × (c·l + c·h + l·h)',
        stage3Substitutions: [
          { label: 'Comprimento', symbol: 'c', valueText: `${fmtNum(c)} cm` },
          { label: 'Largura', symbol: 'l', valueText: `${fmtNum(l)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
        ],
        stage3FormulaWithNumbers: `V = (${fmtNum(c)} × ${fmtNum(l)}) × ${fmtNum(h)}`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Retangular (Ab)',
              steps: [
                {
                  stepTag: '1º Multiplicar comprimento pela largura (1ª camada)',
                  expression: `Ab = ${fmtNum(c)} × ${fmtNum(l)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar a Área da Base pela altura do bloco',
              expression: `V = ${fmtNum(baseArea)} × ${fmtNum(h)}`,
            },
            {
              stepTag: '2º Resultado final do volume',
              expression: `V = ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V = ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          derivedBlocks: [
            {
              title: 'Medidas derivadas: Área de cada face diferente',
              steps: [
                {
                  stepTag: '1º Calcular a face da base/tampo (comprimento × largura)',
                  expression: `c × l = ${fmtNum(c)} × ${fmtNum(l)} = ${fmtNum(faceBase)} cm²`,
                },
                {
                  stepTag: '2º Calcular a face frontal/traseira (comprimento × altura)',
                  expression: `c × h = ${fmtNum(c)} × ${fmtNum(h)} = ${fmtNum(faceFront)} cm²`,
                },
                {
                  stepTag: '3º Calcular a face lateral direita/esquerda (largura × altura)',
                  expression: `l × h = ${fmtNum(l)} × ${fmtNum(h)} = ${fmtNum(faceSide)} cm²`,
                },
              ],
              resultText: `${fmtNum(faceBase)}, ${fmtNum(faceFront)} e ${fmtNum(faceSide)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar os 3 tipos diferentes de faces',
              expression: `${fmtNum(faceBase)} + ${fmtNum(faceFront)} + ${fmtNum(faceSide)} = ${fmtNum(sum3Faces)} cm²`,
            },
            {
              stepTag: '2º Multiplicar por 2 (cada face possui uma oposta idêntica)',
              expression: `At = 2 × ${fmtNum(sum3Faces)} = ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At = ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'prisma_triangular': {
      const b = params.b ?? 5;
      const ht = params.ht ?? 4;
      const H = params.H ?? 6;
      const prodBH = round2(b * ht);
      const baseArea = round2(prodBH / 2);
      const vol = round2(baseArea * H);

      const halfB = round2(b / 2);
      const halfB2 = round2(halfB * halfB);
      const ht2 = round2(ht * ht);
      const sumSq = round2(halfB2 + ht2);
      const slantSide = round2(Math.sqrt(sumSq));
      const perimBase = round2(b + slantSide + slantSide);
      const twoBases = round2(2 * baseArea);
      const lateralArea = round2(perimBase * H);
      const totalArea = round2(twoBases + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base triangular', symbol: 'Ab', value: baseArea, unit: 'cm²' },
        ],
        stage1Intuition: `Todo prisma reto mantém a mesma seção transversal da base ao topo: calculamos a área do triângulo da base (Ab) e a empilhamos ao longo da altura do prisma (H).`,
        stage2GeneralFormula: 'V = Ab × H = ((b × ht) / 2) × H',
        stage2SecondaryFormula: 'At = 2·Ab + (Pb × H)',
        stage3Substitutions: [
          { label: 'Base do triângulo', symbol: 'b', valueText: `${fmtNum(b)} cm` },
          { label: 'Altura do triângulo', symbol: 'ht', valueText: `${fmtNum(ht)} cm` },
          { label: 'Altura do prisma', symbol: 'H', valueText: `${fmtNum(H)} cm` },
        ],
        stage3FormulaWithNumbers: `V = ((${fmtNum(b)} × ${fmtNum(ht)}) / 2) × ${fmtNum(H)}`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Triangular (Ab)',
              steps: [
                {
                  stepTag: '1º Multiplicar base pela altura do triângulo',
                  expression: `${fmtNum(b)} × ${fmtNum(ht)} = ${fmtNum(prodBH)} cm²`,
                },
                {
                  stepTag: '2º Dividir por 2 (área do triângulo)',
                  expression: `Ab = ${fmtNum(prodBH)} ÷ 2 = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Empilhar a área da base ao longo da altura do prisma (H)',
              expression: `V = ${fmtNum(baseArea)} × ${fmtNum(H)}`,
            },
            {
              stepTag: '2º Resultado final do volume',
              expression: `V = ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V = ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Lado inclinado do triângulo (l) e Perímetro da base (Pb)',
              steps: [
                {
                  stepTag: '1º Dividir a base do triângulo ao meio',
                  expression: `b ÷ 2 = ${fmtNum(b)} ÷ 2 = ${fmtNum(halfB)} cm`,
                },
                {
                  stepTag: '2º Abrir as potências da metade da base e da altura ht',
                  expression: `${fmtNum(halfB)}² = ${fmtNum(halfB)} × ${fmtNum(halfB)} = ${fmtNum(halfB2)}  |  ${fmtNum(ht)}² = ${fmtNum(ht)} × ${fmtNum(ht)} = ${fmtNum(ht2)}`,
                },
                {
                  stepTag: '3º Somar os quadrados e extrair a raiz (Pitágoras)',
                  expression: `l = √(${fmtNum(halfB2)} + ${fmtNum(ht2)}) = √${fmtNum(sumSq)} ≈ ${fmtNum(slantSide)} cm`,
                },
                {
                  stepTag: '4º Somar os 3 lados do triângulo para achar o perímetro da base',
                  expression: `Pb = ${fmtNum(b)} + ${fmtNum(slantSide)} + ${fmtNum(slantSide)} ≈ ${fmtNum(perimBase)} cm`,
                },
              ],
              resultText: `Pb ≈ ${fmtNum(perimBase)} cm`,
            },
            {
              title: 'Medida derivada 2: Soma das 2 bases + Área Lateral',
              steps: [
                {
                  stepTag: '1º Multiplicar a área da base (Ab) por 2 (base + tampa)',
                  expression: `2 × ${fmtNum(baseArea)} = ${fmtNum(twoBases)} cm²`,
                },
                {
                  stepTag: '2º Multiplicar o perímetro da base pela altura H (3 retângulos laterais)',
                  expression: `Alat = ${fmtNum(perimBase)} × ${fmtNum(H)} ≈ ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `2·Ab = ${fmtNum(twoBases)} cm² | Alat ≈ ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar as 2 bases com a área lateral',
              expression: `At = ${fmtNum(twoBases)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'prisma_hexagonal': {
      const l = params.l ?? 3;
      const H = params.H ?? 5;
      const perimBase = round2(6 * l);
      const lSqrt3 = round2(l * SQRT3);
      const apotema = round2(lSqrt3 / 2);
      const prodPA = round2(perimBase * apotema);
      const baseArea = round2(prodPA / 2);
      const vol = round2(baseArea * H);

      const twoBases = round2(2 * baseArea);
      const oneFace = round2(l * H);
      const lateralArea = round2(6 * oneFace);
      const totalArea = round2(twoBases + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Apótema da base', symbol: 'a', value: apotema, unit: 'cm' },
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
        ],
        stage1Intuition: `O hexágono da base é formado por 6 triângulos equiláteros (Ab = P × a / 2). Empilhando essa base por H centímetros de altura, obtemos V = Ab × H.`,
        stage2GeneralFormula: 'V = Ab × H',
        stage2SecondaryFormula: 'At = 2·Ab + 6·(l × H)',
        stage3Substitutions: [
          { label: 'Aresta da base', symbol: 'l', valueText: `${fmtNum(l)} cm` },
          { label: 'Apótema (calculado)', symbol: 'a', valueText: `${fmtNum(apotema)} cm` },
          { label: 'Altura do prisma', symbol: 'H', valueText: `${fmtNum(H)} cm` },
        ],
        stage3FormulaWithNumbers: `V = ${fmtNum(baseArea)} × ${fmtNum(H)}`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          constantNote: 'Considerando √3 ≈ 1,73',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Apótema (a) e Perímetro da Base (Pb)',
              steps: [
                {
                  stepTag: '1º Calcular o perímetro do hexágono (6 lados iguais)',
                  expression: `Pb = 6 × ${fmtNum(l)} = ${fmtNum(perimBase)} cm`,
                },
                {
                  stepTag: '2º Multiplicar o lado por √3 (≈ 1,73)',
                  expression: `${fmtNum(l)} × 1,73 = ${fmtNum(lSqrt3)}`,
                },
                {
                  stepTag: '3º Dividir por 2 para obter o apótema do hexágono',
                  expression: `a = ${fmtNum(lSqrt3)} ÷ 2 ≈ ${fmtNum(apotema)} cm`,
                },
              ],
              resultText: `Pb = ${fmtNum(perimBase)} cm | a ≈ ${fmtNum(apotema)} cm`,
            },
            {
              title: 'Medida derivada 2: Área da Base Hexagonal (Ab)',
              steps: [
                {
                  stepTag: '1º Multiplicar o perímetro da base pelo apótema',
                  expression: `${fmtNum(perimBase)} × ${fmtNum(apotema)} = ${fmtNum(prodPA)}`,
                },
                {
                  stepTag: '2º Dividir por 2 para achar a área do hexágono',
                  expression: `Ab = ${fmtNum(prodPA)} ÷ 2 ≈ ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab ≈ ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar a Área da Base pela altura do prisma (H)',
              expression: `V = ${fmtNum(baseArea)} × ${fmtNum(H)} ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          constantNote: 'Considerando √3 ≈ 1,73',
          derivedBlocks: [
            {
              title: 'Medidas derivadas: As 2 bases + 6 retângulos laterais',
              steps: [
                {
                  stepTag: '1º Dobrar a Área da Base (base inferior + tampa superior)',
                  expression: `2 × Ab = 2 × ${fmtNum(baseArea)} ≈ ${fmtNum(twoBases)} cm²`,
                },
                {
                  stepTag: '2º Calcular a área de 1 retângulo lateral (aresta × altura H)',
                  expression: `Aface = ${fmtNum(l)} × ${fmtNum(H)} = ${fmtNum(oneFace)} cm²`,
                },
                {
                  stepTag: '3º Multiplicar por 6 faces laterais',
                  expression: `Alat = 6 × ${fmtNum(oneFace)} = ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `2·Ab ≈ ${fmtNum(twoBases)} cm² | Alat = ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar as 2 bases com as 6 faces laterais',
              expression: `At = ${fmtNum(twoBases)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'piramide_quadrada': {
      const l = params.l ?? 5;
      const h = params.h ?? 6;
      const baseArea = round2(l * l);
      const prismVol = round2(baseArea * h);
      const vol = round2(prismVol / 3);

      const halfL = round2(l / 2);
      const h2 = round2(h * h);
      const halfL2 = round2(halfL * halfL);
      const sumSq = round2(h2 + halfL2);
      const apotemaPir = round2(Math.sqrt(sumSq));
      const prodTri = round2(l * apotemaPir);
      const oneTri = round2(prodTri / 2);
      const lateralArea = round2(4 * oneTri);
      const totalArea = round2(baseArea + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
          { label: 'Apótema da pirâmide', symbol: 'ap', value: apotemaPir, unit: 'cm' },
        ],
        stage1Intuition: `Três pirâmides idênticas de base quadrada preenchem exatamente 1 prisma (paralelepípedo) de mesma base e mesma altura. Por isso o volume é 1/3 de Ab × h.`,
        stage2GeneralFormula: 'V = (Ab × h) / 3',
        stage2SecondaryFormula: 'At = Ab + 4 × ((l × ap) / 2)',
        stage3Substitutions: [
          { label: 'Aresta da base', symbol: 'l', valueText: `${fmtNum(l)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
          { label: 'Apótema lateral', symbol: 'ap', valueText: `${fmtNum(apotemaPir)} cm` },
        ],
        stage3FormulaWithNumbers: `V = (${fmtNum(baseArea)} × ${fmtNum(h)}) / 3`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Quadrada (Ab)',
              steps: [
                {
                  stepTag: '1º Abrir a potência da aresta da base (l × l)',
                  expression: `Ab = ${fmtNum(l)}² = ${fmtNum(l)} × ${fmtNum(l)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar Ab pela altura (volume do prisma envolvente)',
              expression: `Ab × h = ${fmtNum(baseArea)} × ${fmtNum(h)} = ${fmtNum(prismVol)} cm³`,
            },
            {
              stepTag: '2º Dividir por 3 (cabem 3 pirâmides dentro do prisma de mesma base e altura)',
              expression: `V = ${fmtNum(prismVol)} ÷ 3 ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Apótema da Pirâmide (ap — altura do triângulo lateral)',
              steps: [
                {
                  stepTag: '1º Calcular metade da aresta da base (cateto horizontal)',
                  expression: `l ÷ 2 = ${fmtNum(l)} ÷ 2 = ${fmtNum(halfL)} cm`,
                },
                {
                  stepTag: '2º Abrir as potências da altura e da metade da aresta',
                  expression: `${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}  |  ${fmtNum(halfL)}² = ${fmtNum(halfL)} × ${fmtNum(halfL)} = ${fmtNum(halfL2)}`,
                },
                {
                  stepTag: '3º Somar os quadrados',
                  expression: `${fmtNum(h2)} + ${fmtNum(halfL2)} = ${fmtNum(sumSq)}`,
                },
                {
                  stepTag: '4º Extrair a raiz quadrada para obter o apótema lateral',
                  expression: `ap = √${fmtNum(sumSq)} ≈ ${fmtNum(apotemaPir)} cm`,
                },
              ],
              resultText: `ap ≈ ${fmtNum(apotemaPir)} cm`,
            },
            {
              title: 'Medida derivada 2: Área Lateral (4 triângulos iguais)',
              steps: [
                {
                  stepTag: '1º Multiplicar a aresta da base pelo apótema lateral',
                  expression: `l × ap = ${fmtNum(l)} × ${fmtNum(apotemaPir)} = ${fmtNum(prodTri)}`,
                },
                {
                  stepTag: '2º Dividir por 2 para achar 1 triângulo lateral',
                  expression: `Atri = ${fmtNum(prodTri)} ÷ 2 ≈ ${fmtNum(oneTri)} cm²`,
                },
                {
                  stepTag: '3º Multiplicar por 4 faces triangulares',
                  expression: `Alat = 4 × ${fmtNum(oneTri)} ≈ ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `Alat ≈ ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar a Área da Base Quadrada com a Área Lateral',
              expression: `At = ${fmtNum(baseArea)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'piramide_triangular': {
      const l = params.l ?? 5;
      const h = params.h ?? 6;
      const l2 = round2(l * l);
      const l2Sqrt3 = round2(l2 * SQRT3);
      const baseArea = round2(l2Sqrt3 / 4);
      const prismVol = round2(baseArea * h);
      const vol = round2(prismVol / 3);

      const twoSqrt3 = round2(2 * SQRT3); // 3.46
      const inradius = round2(l / twoSqrt3);
      const h2 = round2(h * h);
      const in2 = round2(inradius * inradius);
      const sumSq = round2(h2 + in2);
      const apotemaPir = round2(Math.sqrt(sumSq));
      const prodTri = round2(l * apotemaPir);
      const oneTri = round2(prodTri / 2);
      const lateralArea = round2(3 * oneTri);
      const totalArea = round2(baseArea + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
          { label: 'Apótema da face', symbol: 'ap', value: apotemaPir, unit: 'cm' },
        ],
        stage1Intuition: `Assim como qualquer pirâmide, seu volume equivale exatamente a 1/3 do volume de um prisma triangular com a mesma base Ab e a mesma altura h.`,
        stage2GeneralFormula: 'V = (Ab × h) / 3',
        stage2SecondaryFormula: 'At = Ab + 3 × ((l × ap) / 2)',
        stage3Substitutions: [
          { label: 'Aresta da base', symbol: 'l', valueText: `${fmtNum(l)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
          { label: 'Área da base', symbol: 'Ab', valueText: `${fmtNum(baseArea)} cm²` },
        ],
        stage3FormulaWithNumbers: `V = (${fmtNum(baseArea)} × ${fmtNum(h)}) / 3`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          constantNote: 'Considerando √3 ≈ 1,73',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Triangular Equilátera (Ab)',
              steps: [
                {
                  stepTag: '1º Abrir a potência da aresta da base',
                  expression: `${fmtNum(l)}² = ${fmtNum(l)} × ${fmtNum(l)} = ${fmtNum(l2)}`,
                },
                {
                  stepTag: '2º Multiplicar por √3 (≈ 1,73)',
                  expression: `${fmtNum(l2)} × 1,73 = ${fmtNum(l2Sqrt3)}`,
                },
                {
                  stepTag: '3º Dividir por 4 (fórmula do triângulo equilátero)',
                  expression: `Ab = ${fmtNum(l2Sqrt3)} ÷ 4 ≈ ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab ≈ ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar Ab pela altura (prisma triangular equivalente)',
              expression: `Ab × h = ${fmtNum(baseArea)} × ${fmtNum(h)} = ${fmtNum(prismVol)} cm³`,
            },
            {
              stepTag: '2º Dividir por 3 (cabem 3 pirâmides no prisma correspondente)',
              expression: `V = ${fmtNum(prismVol)} ÷ 3 ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          constantNote: 'Considerando √3 ≈ 1,73',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Apótema da base (r_in) e Apótema da face (ap)',
              steps: [
                {
                  stepTag: '1º Multiplicar 2 por √3 (≈ 1,73) para achar o apótema da base',
                  expression: `2 × 1,73 = ${fmtNum(twoSqrt3)}  →  r_in = ${fmtNum(l)} ÷ ${fmtNum(twoSqrt3)} ≈ ${fmtNum(inradius)} cm`,
                },
                {
                  stepTag: '2º Abrir as potências da altura h e de r_in',
                  expression: `${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}  |  ${fmtNum(inradius)}² = ${fmtNum(inradius)} × ${fmtNum(inradius)} ≈ ${fmtNum(in2)}`,
                },
                {
                  stepTag: '3º Somar os quadrados e extrair a raiz (Pitágoras)',
                  expression: `ap = √(${fmtNum(h2)} + ${fmtNum(in2)}) = √${fmtNum(sumSq)} ≈ ${fmtNum(apotemaPir)} cm`,
                },
              ],
              resultText: `ap ≈ ${fmtNum(apotemaPir)} cm`,
            },
            {
              title: 'Medida derivada 2: Área Lateral (3 triângulos iguais)',
              steps: [
                {
                  stepTag: '1º Multiplicar aresta pelo apótema e dividir por 2 (1 triângulo)',
                  expression: `Atri = (${fmtNum(l)} × ${fmtNum(apotemaPir)}) ÷ 2 = ${fmtNum(prodTri)} ÷ 2 ≈ ${fmtNum(oneTri)} cm²`,
                },
                {
                  stepTag: '2º Multiplicar por 3 faces laterais',
                  expression: `Alat = 3 × ${fmtNum(oneTri)} ≈ ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `Alat ≈ ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar a Área da Base com a Área Lateral',
              expression: `At = ${fmtNum(baseArea)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'cilindro': {
      const r = params.r ?? 3;
      const h = params.h ?? 6;
      const r2 = round2(r * r);
      const baseArea = round2(PI * r2);
      const vol = round2(baseArea * h);

      const twoBases = round2(2 * baseArea);
      const circBase = round2(2 * PI * r);
      const lateralArea = round2(circBase * h);
      const totalArea = round2(twoBases + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
          { label: 'Comprimento do rótulo (2πr)', symbol: 'C', value: circBase, unit: 'cm' },
        ],
        stage1Intuition: `Imagine discos circulares de 1 cm de espessura e área π×r² empilhados uns sobre os outros até atingir a altura h. Na planificação, o corpo vira um retângulo de largura 2πr.`,
        stage2GeneralFormula: 'V = Ab × h = π × r² × h',
        stage2SecondaryFormula: 'At = 2·πr² + 2·πr·h',
        stage3Substitutions: [
          { label: 'Raio', symbol: 'r', valueText: `${fmtNum(r)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
          { label: 'Constante Pi', symbol: 'π', valueText: '≈ 3,14' },
        ],
        stage3FormulaWithNumbers: `V = 3,14 × ${fmtNum(r)}² × ${fmtNum(h)}`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          constantNote: 'Considerando π ≈ 3,14',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Circular (Ab)',
              steps: [
                {
                  stepTag: '1º Resolver a potência do raio (r × r)',
                  expression: `${fmtNum(r)}² = ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)}`,
                },
                {
                  stepTag: '2º Multiplicar por π (≈ 3,14)',
                  expression: `Ab = 3,14 × ${fmtNum(r2)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Empilhar a área da base circular ao longo da altura h',
              expression: `V = ${fmtNum(baseArea)} × ${fmtNum(h)}`,
            },
            {
              stepTag: '2º Resultado final do volume',
              expression: `V ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          constantNote: 'Considerando π ≈ 3,14',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: As 2 bases circulares (fundo + tampa)',
              steps: [
                {
                  stepTag: '1º Abrir a potência e multiplicar por π para 1 círculo',
                  expression: `Ab = 3,14 × (${fmtNum(r)} × ${fmtNum(r)}) = 3,14 × ${fmtNum(r2)} = ${fmtNum(baseArea)} cm²`,
                },
                {
                  stepTag: '2º Multiplicar por 2 bases iguais',
                  expression: `2 × Ab = 2 × ${fmtNum(baseArea)} = ${fmtNum(twoBases)} cm²`,
                },
              ],
              resultText: `2·Ab = ${fmtNum(twoBases)} cm²`,
            },
            {
              title: 'Medida derivada 2: Área Lateral (retângulo desenrolado)',
              steps: [
                {
                  stepTag: '1º Calcular a largura do retângulo (borda do círculo = 2 × π × r)',
                  expression: `C = 2 × 3,14 × ${fmtNum(r)} = 6,28 × ${fmtNum(r)} = ${fmtNum(circBase)} cm`,
                },
                {
                  stepTag: '2º Multiplicar a largura pela altura h do cilindro',
                  expression: `Alat = ${fmtNum(circBase)} × ${fmtNum(h)} = ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `Alat = ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar as 2 bases com a área lateral',
              expression: `At = ${fmtNum(twoBases)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'cone': {
      const r = params.r ?? 3;
      const h = params.h ?? 6;
      const r2 = round2(r * r);
      const h2 = round2(h * h);
      const sumSq = round2(r2 + h2);
      const geratriz = round2(Math.sqrt(sumSq));

      const baseArea = round2(PI * r2);
      const cylVol = round2(baseArea * h);
      const vol = round2(cylVol / 3);

      const piR = round2(PI * r);
      const lateralArea = round2(piR * geratriz);
      const totalArea = round2(baseArea + lateralArea);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Total',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Área da base', symbol: 'Ab', value: baseArea, unit: 'cm²' },
          { label: 'Geratriz', symbol: 'g', value: geratriz, unit: 'cm' },
        ],
        stage1Intuition: `Um cone tem exatamente 1/3 do volume de um cilindro de mesmo raio r e mesma altura h. Na planificação, sua superfície lateral abre em um setor circular de raio igual à geratriz (g).`,
        stage2GeneralFormula: 'V = (π × r² × h) / 3',
        stage2SecondaryFormula: 'At = π·r² + π·r·g',
        stage3Substitutions: [
          { label: 'Raio', symbol: 'r', valueText: `${fmtNum(r)} cm` },
          { label: 'Altura', symbol: 'h', valueText: `${fmtNum(h)} cm` },
          { label: 'Constante Pi', symbol: 'π', valueText: '≈ 3,14' },
        ],
        stage3FormulaWithNumbers: `V = (3,14 × ${fmtNum(r)}² × ${fmtNum(h)}) / 3`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          constantNote: 'Considerando π ≈ 3,14',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área da Base Circular (Ab)',
              steps: [
                {
                  stepTag: '1º Resolver a potência do raio (r × r)',
                  expression: `${fmtNum(r)}² = ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)}`,
                },
                {
                  stepTag: '2º Multiplicar por π (≈ 3,14)',
                  expression: `Ab = 3,14 × ${fmtNum(r2)} = ${fmtNum(baseArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar a área da base pela altura (cilindro envolvente)',
              expression: `Ab × h = ${fmtNum(baseArea)} × ${fmtNum(h)} = ${fmtNum(cylVol)} cm³`,
            },
            {
              stepTag: '2º Dividir por 3 (porque cabem 3 cones dentro do cilindro)',
              expression: `V = ${fmtNum(cylVol)} ÷ 3 ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Total — Papel Cartão do Molde (cm²)',
          constantNote: 'Considerando π ≈ 3,14',
          derivedBlocks: [
            {
              title: 'Medida derivada 1: Geratriz (g) pelo Teorema de Pitágoras',
              steps: [
                {
                  stepTag: '1º Abrir as potências do raio e da altura',
                  expression: `${fmtNum(r)}² = ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)}  |  ${fmtNum(h)}² = ${fmtNum(h)} × ${fmtNum(h)} = ${fmtNum(h2)}`,
                },
                {
                  stepTag: '2º Somar os dois quadrados',
                  expression: `${fmtNum(r2)} + ${fmtNum(h2)} = ${fmtNum(sumSq)}`,
                },
                {
                  stepTag: '3º Extrair a raiz quadrada para obter a geratriz',
                  expression: `g = √${fmtNum(sumSq)} ≈ ${fmtNum(geratriz)} cm`,
                },
              ],
              resultText: `g ≈ ${fmtNum(geratriz)} cm`,
            },
            {
              title: 'Medida derivada 2: Área da Base (Ab) e Área Lateral (Alat)',
              steps: [
                {
                  stepTag: '1º Calcular a Área da Base (π × r²)',
                  expression: `Ab = 3,14 × (${fmtNum(r)} × ${fmtNum(r)}) = 3,14 × ${fmtNum(r2)} = ${fmtNum(baseArea)} cm²`,
                },
                {
                  stepTag: '2º Multiplicar π × raio antes de multiplicar pela geratriz',
                  expression: `3,14 × ${fmtNum(r)} = ${fmtNum(piR)}`,
                },
                {
                  stepTag: '3º Multiplicar pela geratriz (Área Lateral = π × r × g)',
                  expression: `Alat = ${fmtNum(piR)} × ${fmtNum(geratriz)} ≈ ${fmtNum(lateralArea)} cm²`,
                },
              ],
              resultText: `Ab = ${fmtNum(baseArea)} cm² | Alat ≈ ${fmtNum(lateralArea)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Somar a Área da Base com a Área Lateral',
              expression: `At = ${fmtNum(baseArea)} + ${fmtNum(lateralArea)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `At ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }

    case 'esfera': {
      const r = params.r ?? 3.5;
      const r2 = round2(r * r);
      const r3 = round2(r2 * r);
      const piR3 = round2(PI * r3);
      const fourPiR3 = round2(4 * piR3);
      const vol = round2(fourPiR3 / 3);

      const maxCircle = round2(PI * r2);
      const totalArea = round2(4 * maxCircle);

      return {
        primaryMetricLabel: 'Volume',
        primaryMetricValue: vol,
        primaryMetricUnit: 'cm³',
        secondaryMetricLabel: 'Área Superficial',
        secondaryMetricValue: totalArea,
        secondaryMetricUnit: 'cm²',
        extraDerivedValues: [
          { label: 'Diâmetro', symbol: 'd', value: round2(2 * r), unit: 'cm' },
          { label: 'Área do círculo máximo', symbol: 'Ac', value: maxCircle, unit: 'cm²' },
        ],
        stage1Intuition: `Pelo Princípio de Cavalieri, a esfera ocupa 2/3 do cilindro circunscrito (altura 2r), resultando em (4/3)·π·r³. Sua casca equivale exatamente à área de 4 círculos máximos (4·π·r²) e pode ser montada em gomos meridianos.`,
        stage2GeneralFormula: 'V = (4 × π × r³) / 3',
        stage2SecondaryFormula: 'Asup = 4 × π × r²',
        stage3Substitutions: [
          { label: 'Raio', symbol: 'r', valueText: `${fmtNum(r)} cm` },
          { label: 'Constante Pi', symbol: 'π', valueText: '≈ 3,14' },
        ],
        stage3FormulaWithNumbers: `V = (4 × 3,14 × ${fmtNum(r)}³) / 3`,
        primarySection: {
          tabLabel: 'Cálculo do Volume (Capacidade)',
          title: 'Volume — Capacidade Interna (cm³)',
          constantNote: 'Considerando π ≈ 3,14',
          steps: [
            {
              stepTag: '1º Abrir a potência do raio ao cubo (r × r × r)',
              expression: `${fmtNum(r)}³ = ${fmtNum(r)} × ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)} × ${fmtNum(r)} = ${fmtNum(r3)}`,
            },
            {
              stepTag: '2º Multiplicar por π (≈ 3,14)',
              expression: `3,14 × ${fmtNum(r3)} = ${fmtNum(piR3)}`,
            },
            {
              stepTag: '3º Multiplicar o resultado por 4 (numerador da fração 4/3)',
              expression: `4 × ${fmtNum(piR3)} = ${fmtNum(fourPiR3)}`,
            },
            {
              stepTag: '4º Dividir por 3 para concluir o volume da esfera',
              expression: `V = ${fmtNum(fourPiR3)} ÷ 3 ≈ ${fmtNum(vol)} cm³`,
            },
          ],
          finalResult: `V ≈ ${fmtNum(vol)} cm³`,
        },
        secondarySection: {
          tabLabel: 'Cálculo da Área Total (Material do Molde)',
          title: 'Área Superficial — Gomos do Molde (cm²)',
          constantNote: 'Considerando π ≈ 3,14',
          derivedBlocks: [
            {
              title: 'Medida derivada: Área de 1 círculo máximo (Ac)',
              steps: [
                {
                  stepTag: '1º Resolver a potência do raio (r × r)',
                  expression: `${fmtNum(r)}² = ${fmtNum(r)} × ${fmtNum(r)} = ${fmtNum(r2)}`,
                },
                {
                  stepTag: '2º Multiplicar por π (≈ 3,14)',
                  expression: `Ac = 3,14 × ${fmtNum(r2)} = ${fmtNum(maxCircle)} cm²`,
                },
              ],
              resultText: `Ac = ${fmtNum(maxCircle)} cm²`,
            },
          ],
          steps: [
            {
              stepTag: '1º Multiplicar por 4 (a casca da esfera equivale a 4 círculos máximos)',
              expression: `Asup = 4 × ${fmtNum(maxCircle)} ≈ ${fmtNum(totalArea)} cm²`,
            },
          ],
          finalResult: `Asup ≈ ${fmtNum(totalArea)} cm²`,
        },
      };
    }
  }
}
