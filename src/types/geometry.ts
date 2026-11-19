export type GeometryCategory = '2D' | '3D';

export type Shape2DId =
  | 'quadrado'
  | 'retangulo'
  | 'paralelogramo'
  | 'losango'
  | 'triangulo'
  | 'trapezio'
  | 'poligono'
  | 'circulo';

export type Shape3DId =
  | 'cubo'
  | 'paralelepipedo'
  | 'prisma_triangular'
  | 'prisma_hexagonal'
  | 'piramide_quadrada'
  | 'piramide_triangular'
  | 'cilindro'
  | 'cone'
  | 'esfera';

export type AnyShapeId = Shape2DId | Shape3DId;

export type TriangleSubtype = 'retangulo' | 'isosceles' | 'equilatero';
export type PolygonSubtype = 'pentagono' | 'hexagono';

export type View3DMode = 'solido' | 'camadas' | 'planificacao';

export interface DimensionParam {
  key: string;
  label: string;
  symbol: string;
  unit: 'cm' | '°';
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
}

export interface SubtypeOption {
  id: string;
  label: string;
}

export interface ShapeDefinition {
  id: AnyShapeId;
  name: string;
  category: GeometryCategory;
  shortDesc: string;
  params: DimensionParam[];
  subtypes?: {
    key: string;
    label: string;
    defaultValue: string;
    options: SubtypeOption[];
  };
  /** Optional toggle inside the shape (e.g. Setor Circular in Círculo) */
  supportsSectorToggle?: boolean;
}

export interface SubstitutionItem {
  label: string;
  symbol: string;
  valueText: string;
}

export interface CalculationStep {
  stepTag: string;
  expression: string;
}

export interface DerivedMeasureBlock {
  title: string;
  constantNote?: string;
  steps: CalculationStep[];
  resultText: string;
}

export interface CalculationSection {
  tabLabel: string;
  title: string;
  constantNote?: string;
  derivedBlocks?: DerivedMeasureBlock[];
  steps: CalculationStep[];
  finalResult: string;
}

export interface ShapeMathResult {
  primaryMetricLabel: string;
  primaryMetricValue: number;
  primaryMetricUnit: 'cm²' | 'cm³';
  secondaryMetricLabel: string;
  secondaryMetricValue: number;
  secondaryMetricUnit: 'cm' | 'cm²';
  extraDerivedValues?: Array<{
    label: string;
    symbol: string;
    value: number;
    unit: string;
  }>;
  /** 4 pedagogical stages */
  stage1Intuition: string;
  stage2GeneralFormula: string;
  stage2SecondaryFormula: string;
  stage3Substitutions: SubstitutionItem[];
  stage3FormulaWithNumbers: string;
  primarySection: CalculationSection;
  secondarySection: CalculationSection;
}

export interface ChallengeConstraint {
  paramKey: string;
  label: string;
  targetValue: number;
  unit: string;
}

export interface MakerChallenge {
  id: string;
  title: string;
  prompt: string;
  shapeId: AnyShapeId;
  subtypeKey?: string;
  subtypeValue?: string;
  sectorEnabled?: boolean;
  targetMetric: 'primary' | 'secondary';
  targetMetricLabel: string;
  targetValue: number;
  targetUnit: string;
  tolerance: number;
  constraints: ChallengeConstraint[];
  hint: string;
}

export interface ChallengeEvaluation {
  solved: boolean;
  status: 'solved' | 'above' | 'below' | 'constraint_mismatch';
  currentValue: number;
  difference: number;
  feedbackTitle: string;
  feedbackMessage: string;
}
