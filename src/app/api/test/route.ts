import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { PrototypeResult } from "@/lib/types";

const testPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    objetivo: {
      type: Type.STRING,
      description: "Objetivo del test: qué se busca aprender observando la interacción real con el prototipo.",
    },
    perfilParticipantes: {
      type: Type.STRING,
      description: "Descripción cualitativa y neutral de las características necesarias del participante. No inventar nombres, edades, cantidad ni datos demográficos no provistos.",
    },
    escenario: {
      type: Type.STRING,
      description: "Contexto neutral de partida presentado al participante sin inducir la solución ni revelar la ruta óptima.",
    },
    tareas: {
      type: Type.ARRAY,
      description: "De 3 a 5 tareas estructuradas con instrucciones neutrales.",
      items: {
        type: Type.OBJECT,
        properties: {
          orden: {
            type: Type.INTEGER,
            description: "Número de orden de la tarea (1, 2, 3...).",
          },
          objetivo: {
            type: Type.STRING,
            description: "Qué se evalúa en esta tarea.",
          },
          instruccionNeutral: {
            type: Type.STRING,
            description: "Consigna neutral entregada al participante. No debe revelar dónde hacer clic ni el camino esperado.",
          },
          hipotesisRelacionada: {
            type: Type.STRING,
            description: "Enunciado de la hipótesis del prototipo vinculada a esta tarea.",
          },
        },
        required: ["orden", "objetivo", "instruccionNeutral", "hipotesisRelacionada"],
      },
    },
    preguntasPosteriores: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "De 3 a 6 preguntas abiertas y neutrales posteriores a la interacción (sin sesgos ni preguntas dirigidas como '¿te resultó fácil?').",
    },
    queObservar: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Comportamientos y momentos críticos a registrar durante la sesión (dudas, pausas, retrocesos, verbalizaciones, interpretación del estado).",
    },
    criteriosEvaluacion: {
      type: Type.ARRAY,
      description: "Criterios cualitativos para evaluar cada hipótesis utilizando formulaciones explícitamente condicionales sobre qué evidencia futura apoyaría o cuestionaría la hipótesis (sin inventar porcentajes ni métricas cuantitativas arbitrarias).",
      items: {
        type: Type.OBJECT,
        properties: {
          hipotesis: {
            type: Type.STRING,
            description: "Enunciado de la hipótesis analizada.",
          },
          evidenciaApoyaria: {
            type: Type.STRING,
            description: "Redacción explícitamente condicional de evidencia futura de apoyo. Ejemplo: 'Apoyaría la hipótesis observar que...' o 'Sería evidencia de apoyo que durante el test...'. Prohibido afirmar resultados anticipados o términos absolutos.",
          },
          evidenciaCuestionaria: {
            type: Type.STRING,
            description: "Redacción explícitamente condicional de evidencia futura que cuestionaría la hipótesis. Ejemplo: 'Cuestionaría la hipótesis observar que...' o 'Sería evidencia que cuestiona la hipótesis que durante el test...'. Prohibido afirmar resultados anticipados o términos absolutos.",
          },
        },
        required: ["hipotesis", "evidenciaApoyaria", "evidenciaCuestionaria"],
      },
    },
  },
  required: [
    "objetivo",
    "perfilParticipantes",
    "escenario",
    "tareas",
    "preguntasPosteriores",
    "queObservar",
    "criteriosEvaluacion",
  ],
};

function buildFallbackTestPlan(prototipo: PrototypeResult) {
  const hipotesisList = prototipo.hipotesis && prototipo.hipotesis.length > 0
    ? prototipo.hipotesis
    : [
        {
          id: "hyp-default-1",
          enunciado: `La estructura propuesta en "${prototipo.concepto}" permite al usuario completar el flujo principal sin desorientación.`,
          criterioValidacion: "El usuario identifica con claridad los pasos requeridos y el estado del proceso.",
        },
      ];

  return {
    objetivo: `Evaluar cualitativamente si la arquitectura de información, el flujo propuesto y los componentes de "${prototipo.concepto}" permiten a los usuarios comprender su estado y tomar decisiones con autonomía y claridad.`,
    perfilParticipantes: `Personas que hayan interactuado previamente con servicios digitales similares y que necesiten resolver la necesidad abordada en el flujo principal del prototipo.`,
    escenario: `Imaginá que necesitás gestionar esta tarea en la plataforma. Te encontrás en la pantalla inicial y contás con este prototipo para completar tu objetivo. Exploralo a tu propio ritmo tal como lo harías habitualmente.`,
    tareas: [
      {
        orden: 1,
        objetivo: "Evaluar la primera impresión y la comprensión del punto de partida.",
        instruccionNeutral: "Observá la pantalla inicial e indicá qué creés que podés hacer desde aquí antes de interactuar.",
        hipotesisRelacionada: hipotesisList[0]?.enunciado || "Comprensión inicial de la interfaz",
      },
      {
        orden: 2,
        objetivo: "Evaluar la ejecución de la acción central del flujo sin asistencia.",
        instruccionNeutral: "Procedé a realizar la acción principal que consideres necesaria para avanzar en el proceso.",
        hipotesisRelacionada: hipotesisList[0]?.enunciado || "Navegación del flujo principal",
      },
      {
        orden: 3,
        objetivo: "Evaluar la comprensión de la confirmación y el estado final del sistema.",
        instruccionNeutral: "Revisá el estado resultante y decinos qué entendés que ocurrió con la información procesada.",
        hipotesisRelacionada: hipotesisList[1]?.enunciado || hipotesisList[0]?.enunciado || "Claridad del cierre del flujo",
      },
    ],
    preguntasPosteriores: [
      "¿Cómo describirías el recorrido que acabás de realizar con tus propias palabras?",
      "¿Hubo algún momento durante la interacción en el que no estuvieras seguro de qué estaba sucediendo?",
      "¿Qué información o elemento te resultó más claro y cuál te generó dudas?",
      "Si tuvieras que volver a realizar esta tarea, ¿qué esperarías encontrar de forma diferente?",
    ],
    queObservar: [
      "Pausas prolongadas o vacilaciones antes de hacer clic en un elemento interactivo.",
      "Intentos de clic en áreas no interactivas o interpretaciones erróneas de la jerarquía visual.",
      "Retrocesos o navegación en bucle buscando una confirmación no visible.",
      "Verbalizaciones espontáneas sobre expectativas no cumplidas o falta de claridad del estado.",
      "Comprensión real de los términos y etiquetas presentados en cada pantalla.",
    ],
    criteriosEvaluacion: hipotesisList.map((h) => ({
      hipotesis: h.enunciado,
      evidenciaApoyaria: "Apoyaría la hipótesis observar que la persona interactúa de manera autónoma con las secciones clave, verbaliza comprensión del estado en cada paso y completa el recorrido sin solicitar aclaraciones sobre el significado de las opciones.",
      evidenciaCuestionaria: "Cuestionaría la hipótesis observar que la persona manifiesta dudas reiteradas sobre el siguiente paso, se detiene por falta de referencias visuales claras o interpreta de forma errónea la confirmación final del flujo.",
    })),
  };
}

export async function POST(req: NextRequest) {
  let requestData: { prototipoValidado?: PrototypeResult; feedbackProfesional?: string } = {};
  try {
    requestData = await req.json();
    const { prototipoValidado, feedbackProfesional } = requestData;

    if (!prototipoValidado || !prototipoValidado.pantallas || prototipoValidado.pantallas.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un prototipo validado de la etapa Prototipar para estructurar el plan de test." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY no configurada. Usando fallback metodológico para Testear.");
      return NextResponse.json(buildFallbackTestPlan(prototipoValidado));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
Eres TraceUX, el módulo de IA especializado en Design Thinking y UX Research riguroso para la etapa TESTEAR (Pruebas de Usabilidad Cualitativas).
Tu rol es asistir al profesional de UX traduciendo el PROTOTIPO VALIDADO en un PLAN ESTRUCTURADO DE TEST DE USABILIDAD.

REGLAS METODOLÓGICAS INQUEBRANTABLES:
1. TRABAJAR EXCLUSIVAMENTE CON LA INFORMACIÓN HEREDADA: El prototipo validado, sus pantallas y sus hipótesis son la única fuente de verdad.
2. REUTILIZAR HIPÓTESIS: No inventes hipótesis desconectadas. Usa las hipótesis reales definidas en Prototipar.
3. PERFIL DE PARTICIPANTES CUALITATIVO: Describe características de experiencia relevantes. NO inventes nombres, edades, géneros, cantidad de usuarios ni demografía no aportada.
4. ESCENARIO Y TAREAS NEUTRALES: Las consignas para el participante NO deben revelar la solución, ni decir dónde hacer clic ni guiar hacia el camino óptimo.
5. PREGUNTAS POSTERIORES ABIERTAS: Preguntas neutras (ej. "¿Cómo describirías el proceso?"), prohibido usar preguntas sesgadas como "¿Te pareció fácil?".
6. QUÉ OBSERVAR: Enumera comportamientos a observar (dudas, pausas, retrocesos, errores, verbalizaciones, comprensión del estado).
7. CRITERIOS DE EVALUACIÓN EXPLÍCITAMENTE CONDICIONALES:
   - Estamos definiendo QUÉ evidencia futura apoyaría o cuestionaría una hipótesis, NO afirmando que esa evidencia ya existe.
   - PROHIBIDO usar redacciones como resultados anticipados (ej. 'Los participantes identifican...', 'Los usuarios declaran...').
   - Usar fórmulas condicionales para describir evidencia futura:
     * Para evidencia que apoyaría: formular como "Apoyaría la hipótesis observar que durante el test..." o "Sería evidencia de apoyo que durante el test...".
     * Para evidencia que cuestionaría: formular como "Cuestionaría la hipótesis observar que durante el test..." o "Sería evidencia que cuestiona la hipótesis que durante el test...".
   - PROHIBIDO usar formulaciones absolutas como "certeza absoluta", "total tranquilidad", "sin ningún tipo de duda".
   - PROHIBIDO inventar porcentajes, tasas, métricas cuantitativas o umbrales temporales (ej. NO usar "80% de usuarios", "menos de 30 segundos").
8. NO INVENTAR RESULTADOS NI AFIRMAR QUE EL TEST FUE EJECUTADO: El test todavía NO ha ocurrido. Esto es un plan de preparación para la prueba con usuarios.
`.trim();

    const screensSummary = prototipoValidado.pantallas
      .map(
        (s) => `[Pantalla ${s.orden}: ${s.nombre}]
- Propósito: ${s.descripcionEstado}
- Elementos clave: ${s.elementosClave.join(", ")}
- Interacciones críticas: ${s.interaccionesCriticas.join(", ")}`
      )
      .join("\n\n");

    const hypothesesSummary = (prototipoValidado.hipotesis || [])
      .map((h, idx) => `[Hipótesis ${idx + 1}]: "${h.enunciado}" (Criterio inicial: ${h.criterioValidacion})`)
      .join("\n");

    const userPrompt = `
PROTOTIPO VALIDADO HEREDADO DE PROTOTIPAR:
- Concepto: ${prototipoValidado.concepto}
- Objetivo de validación: ${prototipoValidado.objetivo}
- Flujo principal: ${prototipoValidado.flujoPrincipal}

PANTALLAS / ESTADOS DEL PROTOTIPO:
${screensSummary}

HIPÓTESIS DE DISEÑO A EVALUAR:
${hypothesesSummary}

${
  feedbackProfesional
    ? `INDICACIÓN / FEEDBACK DEL PROFESIONAL:\n"${feedbackProfesional}"\nAjusta el plan de test considerando esta indicación.`
    : ""
}

Genera el plan estructurado de test de usabilidad (objetivo del test, perfil cualitativo de participantes, escenario neutral, entre 3 y 5 tareas con consignas neutrales, de 3 a 6 preguntas abiertas, aspectos a observar y criterios cualitativos condicionales para cada hipótesis).
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: testPlanSchema,
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const parsed = JSON.parse(response.text);

    // Validación y normalización defensiva de criterios cualitativos
    if (parsed.criteriosEvaluacion && Array.isArray(parsed.criteriosEvaluacion)) {
      parsed.criteriosEvaluacion = parsed.criteriosEvaluacion.map(
        (crit: { hipotesis: string; evidenciaApoyaria?: string; evidenciaCuestionaria?: string }) => ({
          hipotesis: crit.hipotesis,
          evidenciaApoyaria: crit.evidenciaApoyaria || "Apoyaría la hipótesis observar que durante el test los usuarios completan el recorrido de manera autónoma y comprensible.",
          evidenciaCuestionaria: crit.evidenciaCuestionaria || "Cuestionaría la hipótesis observar que durante el test surgen bloqueos o interpretaciones erróneas del flujo.",
        })
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Error en API /api/test:", err);
    if (requestData.prototipoValidado) {
      console.warn("Utilizando plan de test metodológico estructurado como fallback seguro.");
      return NextResponse.json(buildFallbackTestPlan(requestData.prototipoValidado));
    }
    return NextResponse.json(
      { error: "No se pudo procesar la etapa Testear.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
