import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    resumen_investigacion: {
      type: Type.STRING,
      description:
        "Síntesis objetiva y concisa de los hallazgos sin agregar suposiciones ni soluciones.",
    },
    patrones: {
      type: Type.ARRAY,
      description:
        "Patrones recurrentes respaldados por 2 o más evidencias directas. NUNCA agrupar testimonios solo por cantidad ni convertir observaciones únicas en patrones.",
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: {
            type: Type.STRING,
            description: "Nombre claro y conceptual del patrón identificado.",
          },
          descripcion: {
            type: Type.STRING,
            description:
              "Explicación del comportamiento o problemática recurrente comprobada.",
          },
          evidencias: {
            type: Type.ARRAY,
            description:
              "Citas textuales o referencias exactas directas de los usuarios junto con el sourceId de la fuente de donde se extrajo.",
            items: {
              type: Type.OBJECT,
              properties: {
                texto: {
                  type: Type.STRING,
                  description: "Cita o evidencia textual literal.",
                },
                sourceId: {
                  type: Type.STRING,
                  description:
                    "ID exacto de la fuente de donde proviene esta cita.",
                },
              },
              required: ["texto", "sourceId"],
            },
          },
          cantidad_evidencias: {
            type: Type.INTEGER,
            description: "Número exacto de evidencias vinculadas.",
          },
          necesidad_relacionada: {
            type: Type.STRING,
            description: "Necesidad humana subyacente identificada.",
          },
          pain_point: {
            type: Type.STRING,
            description: "Fricción o punto de dolor específico.",
          },
          nivel_respaldo: {
            type: Type.STRING,
            enum: ["Alto", "Medio", "Bajo"],
            description:
              "Alto (3+ evidencias consistentes), Medio (2 evidencias claras), Bajo (2 evidencias limítrofes).",
          },
        },
        required: [
          "nombre",
          "descripcion",
          "evidencias",
          "cantidad_evidencias",
          "necesidad_relacionada",
          "pain_point",
          "nivel_respaldo",
        ],
      },
    },
    observaciones_aisladas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Menciones individuales o testimonios que aparecen solo una vez y no constituyen un patrón recurrente.",
    },
    contradicciones: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Testimonios o comportamientos opuestos entre usuarios dentro de la investigación.",
    },
    preguntas_abiertas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Dudas o vacíos de información que requieren profundizar con más investigación.",
    },
    advertencias_metodologicas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Sesgos de muestra, escasez de datos, o precauciones metodológicas para el equipo UX.",
    },
    estado_validacion: {
      type: Type.STRING,
      enum: ["Pendiente de validación profesional"],
      description: "Estado inicial obligatorio.",
    },
  },
  required: [
    "resumen_investigacion",
    "patrones",
    "observaciones_aisladas",
    "contradicciones",
    "preguntas_abiertas",
    "advertencias_metodologicas",
    "estado_validacion",
  ],
};

const SYSTEM_INSTRUCTION = `Eres el motor de análisis de investigación UX/UI para la etapa de EMPATIZAR en Design Thinking dentro de TraceUX.

PRINCIPIO FUNDAMENTAL:
"LA IA PROPONE. EL PROFESIONAL DECIDE."
"SIN EVIDENCIA, NO HAY INSIGHT."

REGLAS METODOLÓGICAS NO NEGOCIABLES:
1. Utiliza ÚNICAMENTE la evidencia textual literal provista en las fuentes.
2. NUNCA inventes usuarios, citas textuales, números, comportamientos, necesidades ni problemas.
3. REGLA DE PATRÓN RECURRENTE: Dos evidencias solo pueden formar un patrón si respaldan claramente el MISMO comportamiento, problema o necesidad. Nunca agrupes testimonios solo por cantidad. Si no hay recurrencia semántica clara, deben ser 0 patrones.
4. TRAZABILIDAD DE EVIDENCIA: Cada evidencia debe incluir su 'texto' literal exacto y el 'sourceId' correspondiente de la fuente de donde se extrajo.
5. OBSERVACIONES AISLADAS: Si un hallazgo o comentario aparece una sola vez o no tiene suficiente respaldo cruzado de recurrencia, debe colocarse obligatoriamente en 'observaciones_aisladas'. NUNCA lo infles para convertirlo en patrón.
6. CONTRADICCIONES: Si usuarios expresan opiniones o conductas opuestas, identifícalas en 'contradicciones'.
7. PREGUNTAS ABIERTAS: Señala qué dudas quedan sin responder con la información actual.
8. ADVERTENCIAS METODOLÓGICAS: Advierte si el tamaño de muestra es muy pequeño, si faltan perfiles o si los datos son insuficientes.
9. NO soluciones: En Empatizar NO se proponen soluciones, interfaces, features ni ideas de producto. Solo se sintetiza la investigación.
10. En caso de una CORRECCIÓN PROFESIONAL: Ajusta el análisis aplicando la dirección del profesional pero SIEMPRE respetando que cualquier patrón resultante debe contar con evidencias reales comprobables. Si la corrección separa temas y alguno queda con una sola evidencia, muévelo a observaciones aisladas.`;

/**
 * Fallback metodológico estricto en caso de que no haya API key o falle la llamada remota.
 * Respeta exactamente el esquema y las reglas metodológicas de UX:
 * - No inventa citas, patrones ni usuarios.
 * - Conserva las fuentes reales como observaciones aisladas.
 * - No infiere patrones sin análisis semántico.
 */
function generateMethodologicalFallback(
  sources: { id: string; content: string }[]
) {
  const count = sources.length;
  const observations = sources
    .map((s) => s.content.trim())
    .filter((c) => c.length > 0);

  return {
    isFallback: true,
    resumen_investigacion: `Se recibieron ${count} fuente(s) de investigación. No se generaron patrones automáticamente porque no fue posible realizar el análisis semántico con IA.`,
    patrones: [],
    observaciones_aisladas:
      observations.length > 0
        ? observations
        : ["No se ingresaron testimonios o citas en las fuentes provistas."],
    contradicciones: [],
    preguntas_abiertas: [
      "¿Se requiere ampliar el número de participantes o configurar la API de IA para identificar patrones recurrentes verificables?",
    ],
    advertencias_metodologicas: [
      "No fue posible realizar agrupación semántica con IA. Las evidencias se conservan como observaciones aisladas para evitar inferir patrones sin respaldo suficiente.",
    ],
    estado_validacion: "Pendiente de validación profesional",
  };
}

export async function POST(req: NextRequest) {
  let parsedSources: { id: string; content: string }[] = [];

  try {
    const body = await req.json();
    const { sources, previousAnalysis, professionalFeedback } = body as {
      sources: { id: string; content: string }[];
      previousAnalysis?: unknown;
      professionalFeedback?: string;
    };
    parsedSources = sources || [];

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron fuentes de investigación." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key disponible, usar fallback metodológico transparente
    if (!apiKey) {
      const fallbackResult = generateMethodologicalFallback(sources);
      return NextResponse.json({
        data: fallbackResult,
        source: "fallback",
      });
    }

    // Inicializar cliente @google/genai con API key segura en el servidor
    const ai = new GoogleGenAI({ apiKey });

    const formattedSources = sources
      .map((s, idx) => `[Fuente ${idx + 1} (sourceId: "${s.id}")]:\n${s.content}`)
      .join("\n\n---\n\n");

    let prompt = `FUENTES DE INVESTIGACIÓN UX/UI DISPONIBLES:\n\n${formattedSources}\n\n`;

    if (previousAnalysis && professionalFeedback) {
      prompt += `ANÁLISIS ANTERIOR (VERSIÓN PREVIA):\n${JSON.stringify(
        previousAnalysis,
        null,
        2
      )}\n\n`;
      prompt += `DIRECCIÓN / CORRECCIÓN PROFESIONAL:\n"${professionalFeedback}"\n\n`;
      prompt += `INSTRUCCIÓN DE REGENERACIÓN:
Aplica la dirección del profesional sobre el análisis anterior sin inventar ninguna evidencia. Asegúrate de que cada evidencia incluya su 'texto' literal y su 'sourceId'. Si una separación o cambio solicitado deja a un hallazgo con una sola evidencia, colócalo en 'observaciones_aisladas' y no como patrón recurrente. Devuelve el JSON con el nuevo análisis ajustado.`;
    } else {
      prompt += `INSTRUCCIÓN:
Analiza de manera objetiva las fuentes de investigación anteriores aplicando las reglas metodológicas de Empatizar. Extrae patrones recurrentes comprobables (mínimo 2 evidencias con el mismo sentido semántico, incluyendo su 'texto' y su 'sourceId'), observaciones aisladas (1 sola mención), contradicciones, preguntas abiertas y advertencias metodológicas.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Baja temperatura para estricta consistencia metodológica
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Respuesta vacía recibida desde Gemini.");
    }

    const parsedData = JSON.parse(text);
    return NextResponse.json({
      data: parsedData,
      source: "gemini",
    });
  } catch (error) {
    console.error("Error al procesar análisis con Gemini:", error);

    // Fallback defensivo ante errores en tiempo de ejecución
    try {
      const fallbackResult = generateMethodologicalFallback(parsedSources);
      return NextResponse.json({
        data: fallbackResult,
        source: "fallback",
        warning:
          "Se utilizó el motor metodológico local debido a una indisponibilidad temporal del servicio externo.",
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Ocurrió un error al procesar el análisis de la investigación.",
        },
        { status: 500 }
      );
    }
  }
}
