import { generateId } from "@/lib/id";
import type { AnalysisResult, EvidenceReference, Pattern, ValidationStatus } from "@/lib/types";

export interface RawApiAnalysisResponse {
  resumen_investigacion: string;
  patrones: {
    nombre: string;
    descripcion: string;
    evidencias:
      | { texto: string; sourceId: string }[]
      | string[];
    cantidad_evidencias: number;
    necesidad_relacionada: string;
    pain_point: string;
    nivel_respaldo: "Alto" | "Medio" | "Bajo";
  }[];
  observaciones_aisladas: string[];
  contradicciones: string[];
  preguntas_abiertas: string[];
  advertencias_metodologicas: string[];
  estado_validacion: string;
}

/**
 * Transforma el formato raw retornado por la API / Gemini al modelo de datos interno AnalysisResult.
 * Realiza la conversión segura del estado "Pendiente de validación profesional" a "pendiente",
 * y normaliza las evidencias a EvidenceReference[] (con texto y sourceId).
 */
export function mapApiAnalysisToResult(
  raw: RawApiAnalysisResponse,
  projectId: string,
  sourceIds: string[],
  version: number = 1,
  previousVersionId: string | null = null,
  correccionProfesional: string | null = null
): AnalysisResult {
  const fallbackSourceId = sourceIds[0] || "src_default";

  const mappedPatrones: Pattern[] = (raw.patrones || []).map((p) => {
    const normalizedEvidencias: EvidenceReference[] = (p.evidencias || []).map((ev) => {
      if (typeof ev === "string") {
        return {
          texto: ev,
          sourceId: fallbackSourceId,
        };
      }
      return {
        texto: ev.texto || "",
        sourceId: ev.sourceId || fallbackSourceId,
      };
    });

    return {
      id: generateId("pat"),
      nombre: p.nombre || "Patrón sin nombre",
      descripcion: p.descripcion || "",
      evidencias: normalizedEvidencias,
      cantidadEvidencias: normalizedEvidencias.length,
      necesidadRelacionada: p.necesidad_relacionada || "",
      painPoint: p.pain_point || "",
      nivelRespaldo: p.nivel_respaldo || "Medio",
    };
  });

  // Mapeo seguro de estado_validacion externo a ValidationStatus interno
  let estadoValidacion: ValidationStatus = "pendiente";
  const rawStatus = (raw.estado_validacion || "").toLowerCase();
  if (rawStatus.includes("validado")) {
    estadoValidacion = "validado";
  } else if (rawStatus.includes("descartado")) {
    estadoValidacion = "descartado";
  } else {
    estadoValidacion = "pendiente";
  }

  return {
    id: generateId("ana"),
    projectId,
    sourceIds,
    version,
    previousVersionId,
    resumenInvestigacion: raw.resumen_investigacion || "",
    patrones: mappedPatrones,
    observacionesAisladas: raw.observaciones_aisladas || [],
    contradicciones: raw.contradicciones || [],
    preguntasAbiertas: raw.preguntas_abiertas || [],
    advertenciasMetodologicas: raw.advertencias_metodologicas || [],
    estadoValidacion,
    correccionProfesional,
    createdAt: new Date().toISOString(),
  };
}
