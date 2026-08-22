import {
  FlaskConical,
  LayoutTemplate,
  Lightbulb,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { StageId } from "./types";

export interface StageConfig {
  id: StageId;
  order: number;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Solo Empatizar es true en P0. El resto se muestra visible pero bloqueada. */
  isAvailable: boolean;
  /** Explica, en la propia interfaz, qué desbloquea esta etapa. */
  unlockHint?: string;
}

export const STAGES: StageConfig[] = [
  {
    id: "empatizar",
    order: 1,
    label: "Empatizar",
    description: "Analizá investigación cualitativa y encontrá patrones respaldados por evidencia.",
    icon: Users,
    isAvailable: true,
  },
  {
    id: "definir",
    order: 2,
    label: "Definir",
    description: "Convertí los patrones validados en problem statements y How Might We.",
    icon: Target,
    isAvailable: false,
    unlockHint: "Se habilitará cuando valides el análisis de Empatizar.",
  },
  {
    id: "idear",
    order: 3,
    label: "Idear",
    description: "Generá alternativas de solución a partir de los problemas definidos.",
    icon: Lightbulb,
    isAvailable: false,
    unlockHint: "Se habilitará cuando completes Definir.",
  },
  {
    id: "prototipar",
    order: 4,
    label: "Prototipar",
    description: "Organizá alcance, pantallas y links a Figma de la idea seleccionada.",
    icon: LayoutTemplate,
    isAvailable: false,
    unlockHint: "Se habilitará cuando completes Idear.",
  },
  {
    id: "testear",
    order: 5,
    label: "Testear",
    description: "Registrá hallazgos de testing y decidí cómo seguir.",
    icon: FlaskConical,
    isAvailable: false,
    unlockHint: "Se habilitará cuando completes Prototipar.",
  },
];

export function getStage(id: StageId): StageConfig {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) {
    throw new Error(`Etapa desconocida: ${id}`);
  }
  return stage;
}
