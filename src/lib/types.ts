/**
 * Modelo de datos conceptual de TraceUX (sección 18 del brief).
 * Estos tipos son el contrato compartido entre las 5 etapas. Por ahora
 * solo Project se persiste (bloque 3); ResearchSource y AnalysisResult
 * quedan definidos para que el bloque de Empatizar los use sin fricción.
 */

export type StageId = "empatizar" | "definir" | "idear" | "prototipar" | "testear";

export interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  currentStage: StageId;
}

export type ValidationStatus = "pendiente" | "validado" | "descartado";

export type SupportLevel = "Alto" | "Medio" | "Bajo";

export interface ResearchSource {
  id: string;
  projectId: string;
  content: string;
  sourceType: "texto";
  createdAt: string;
}

export interface EvidenceReference {
  texto: string;
  sourceId: string;
}

export interface Pattern {
  id: string;
  nombre: string;
  descripcion: string;
  evidencias: EvidenceReference[];
  cantidadEvidencias: number;
  necesidadRelacionada: string;
  painPoint: string;
  nivelRespaldo: SupportLevel;
}

/**
 * Resultado de un análisis de IA sobre una o más fuentes de investigación.
 * Cada corrección profesional en el ciclo "Editar" genera una nueva
 * AnalysisResult con version incrementada y previousVersionId apuntando
 * a la anterior, para no perder trazabilidad.
 */
export interface AnalysisResult {
  id: string;
  projectId: string;
  sourceIds: string[];
  version: number;
  previousVersionId: string | null;
  resumenInvestigacion: string;
  patrones: Pattern[];
  observacionesAisladas: string[];
  contradicciones: string[];
  preguntasAbiertas: string[];
  advertenciasMetodologicas: string[];
  estadoValidacion: ValidationStatus;
  correccionProfesional: string | null;
  createdAt: string;
}
