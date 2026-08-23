import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { Pattern, SupportLevel } from "@/lib/types";

const defineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    problemas: {
      type: Type.ARRAY,
      description:
        "Entre 1 y 3 problemas de diseño derivados estrictamente de los patrones validados. NUNCA proponer soluciones técnicas ni funcionalidades.",
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: {
            type: Type.STRING,
            description: "Título conciso y claro del problema de diseño.",
          },
          problema: {
            type: Type.STRING,
            description:
              "Declaración clara del problema centrado en el usuario (ej: 'Los usuarios experimentan... porque...').",
          },
          necesidadUsuario: {
            type: Type.STRING,
            description: "Necesidad humana subyacente que no está siendo satisfecha.",
          },
          patronOrigen: {
            type: Type.STRING,
            description: "Nombre exacto del patrón validado del cual se deriva este problema.",
          },
          evidenciasOrigen: {
            type: Type.ARRAY,
            description: "Citas o referencias directas extraídas de los patrones validados.",
            items: {
              type: Type.STRING,
            },
          },
          nivelRespaldo: {
            type: Type.STRING,
            enum: ["Alto", "Medio", "Bajo"],
            description: "Nivel de respaldo metodológico derivado del patrón de origen.",
          },
          howMightWe: {
            type: Type.STRING,
            description:
              "Pregunta '¿Cómo podríamos...?' enfocada en el problema y la necesidad, SIN proponer soluciones ni funcionalidades concretas.",
          },
        },
        required: [
          "titulo",
          "problema",
          "necesidadUsuario",
          "patronOrigen",
          "evidenciasOrigen",
          "nivelRespaldo",
          "howMightWe",
        ],
      },
    },
  },
  required: ["problemas"],
};

function buildFallbackDefine(patronesValidados: Pattern[]) {
  const problems = patronesValidados.slice(0, 3).map((patron) => {
    const evidencias = patron.evidencias?.map((e) => e.texto) || [];
    const necesidad =
      patron.necesidadRelacionada ||
      "Contar con claridad y previsibilidad en su interacción.";
    const dolor =
      patron.painPoint ||
      patron.descripcion ||
      "Fricción recurrente durante el proceso.";

    return {
      titulo: `Fricción crítica en ${patron.nombre}`,
      problema: `Los usuarios enfrentan dificultades debido a que ${dolor.toLowerCase()}, impidiendo satisfacer su necesidad de ${necesidad.toLowerCase()}.`,
      necesidadUsuario: necesidad,
      patronOrigen: patron.nombre,
      evidenciasOrigen: evidencias.length > 0 ? evidencias : [patron.descripcion],
      nivelRespaldo: patron.nivelRespaldo || ("Alto" as SupportLevel),
      howMightWe: `¿Cómo podríamos facilitar que los usuarios alcancen ${necesidad.toLowerCase()} sin experimentar ${dolor.toLowerCase()}?`,
    };
  });

  return { problemas: problems };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumenInvestigacion,
      patronesValidados,
      observacionesAisladas,
      feedbackProfesional,
    } = body as {
      resumenInvestigacion: string;
      patronesValidados: Pattern[];
      observacionesAisladas?: string[];
      feedbackProfesional?: string;
    };

    if (!patronesValidados || !Array.isArray(patronesValidados) || patronesValidados.length === 0) {
      return NextResponse.json(
        { error: "Se requieren patrones validados de la etapa Empatizar para formular problemas de diseño." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY no configurada. Usando fallback metodológico para Definir.");
      return NextResponse.json(buildFallbackDefine(patronesValidados));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
Eres TraceUX, el módulo de IA especializado en Design Thinking y UX Research riguroso para la etapa DEFINIR.
Tu rol es asistir al profesional de UX formulando PROBLEMAS DE DISEÑO y preguntas 'HOW MIGHT WE' (¿Cómo podríamos...?) estrictamente fundamentados en los hallazgos validados de Empatizar.

PRINCIPIOS METODOLÓGICOS INQUEBRANTABLES:
1. TRAZABILIDAD ABSOLUTA: Todo problema de diseño DEBE originarse explícitamente en al menos un patrón validado provisto. No inventes usuarios, necesidades ni fricciones que no figuren en los datos.
2. NO PROPONER SOLUCIONES: La etapa Definir define el QUÉ y el POR QUÉ, nunca el CÓMO. Está ESTRICTAMENTE PROHIBIDO sugerir funcionalidades técnicas, botones, barras de progreso, alertas SMS, rediseños específicos o soluciones (eso pertenece a la etapa Idear).
3. ESTRUCTURA DE PROBLEMA: Cada problema debe articular claramente el usuario/contexto, la necesidad no resuelta y la causa raíz o fricción real.
4. HOW MIGHT WE: Formular preguntas abiertas, optimistas pero acotadas al dolor real detectado, invitando a la ideación sin sesgar hacia una solución particular.
5. CONCISIÓN Y RIGOR: Genera entre 1 y 3 problemas de diseño prioritarios basados en los patrones con mayor respaldo.
`.trim();

    const patternsSummary = patronesValidados
      .map((p, idx) => {
        const evs = p.evidencias?.map((e) => `    - "${e.texto}"`).join("\n") || "    - Sin citas";
        return `[Patrón ${idx + 1}]: "${p.nombre}"
  - Descripción: ${p.descripcion}
  - Dolor / Pain Point: ${p.painPoint}
  - Necesidad Relacionada: ${p.necesidadRelacionada}
  - Nivel de Respaldo: ${p.nivelRespaldo} (${p.cantidadEvidencias} evidencias)
  - Evidencias directas:
${evs}`;
      })
      .join("\n\n");

    const userPrompt = `
SÍNTESIS VALIDADA DE EMPATIZAR:
${resumenInvestigacion || "Sin síntesis previa"}

PATRONES VALIDADOS:
${patternsSummary}

${
  observacionesAisladas && observacionesAisladas.length > 0
    ? `OBSERVACIONES AISLADAS CONTEXTUALES:\n${observacionesAisladas.map((o) => `- ${o}`).join("\n")}\n`
    : ""
}

${
  feedbackProfesional
    ? `AJUSTE / FEEDBACK DEL PROFESIONAL:\n"${feedbackProfesional}"\nPor favor ajusta la formulación de los problemas según esta indicación.`
    : ""
}

Genera entre 1 y 3 problemas de diseño estructurados con su respectivo 'How Might We'. Recuerda: CERO soluciones, 100% foco en el problema y la necesidad.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: defineSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Error en API /api/define:", err);
    try {
      const body = await req.json().catch(() => ({}));
      if (body.patronesValidados && Array.isArray(body.patronesValidados)) {
        return NextResponse.json(buildFallbackDefine(body.patronesValidados));
      }
    } catch {
      // Ignorar
    }
    return NextResponse.json(
      { error: "No se pudo procesar la etapa Definir.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
