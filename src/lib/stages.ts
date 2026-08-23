import type { LucideIcon } from "lucide-react";
import {
  HeartHandshake,
  Target,
  Lightbulb,
  Boxes,
  FlaskConical,
} from "lucide-react";
import type { StageId } from "./types";

export interface StageDefinition {
  id: StageId;
  order: number;
  label: string;
  shortDescription: string;
  unlockHint?: string;
  icon: LucideIcon;
}

export const STAGES: readonly StageDefinition[] = [
  {
    id: "empatizar",
    order: 1,
    label: "Empatizar",
    shortDescription:
      "Cargar investigación real, analizarla con IA y validar la evidencia.",
    icon: HeartHandshake,
  },
  {
    id: "definir",
    order: 2,
    label: "Definir",
    shortDescription:
      "Sintetizar hallazgos, crear Personas, Journeys y formular el problema.",
    unlockHint:
      "Se desbloquea al validar el análisis de la investigación en Empatizar.",
    icon: Target,
  },
  {
    id: "idear",
    order: 3,
    label: "Idear",
    shortDescription:
      "Brainstorming guiado por IA con foco en los dolores reales encontrados.",
    unlockHint: "Disponible en la siguiente etapa del Design Thinking.",
    icon: Lightbulb,
  },
  {
    id: "prototipar",
    order: 4,
    label: "Prototipar",
    shortDescription:
      "Generar flujos, wireframes y especificaciones para las ideas seleccionadas.",
    unlockHint: "Disponible en la siguiente etapa del Design Thinking.",
    icon: Boxes,
  },
  {
    id: "testear",
    order: 5,
    label: "Testear",
    shortDescription:
      "Diseñar planes de prueba, guías de test y contrastar resultados con las fuentes.",
    unlockHint: "Disponible en la siguiente etapa del Design Thinking.",
    icon: FlaskConical,
  },
] as const;

export function getStage(id: StageId): StageDefinition {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) {
    throw new Error(`Etapa desconocida: ${id}`);
  }
  return stage;
}
