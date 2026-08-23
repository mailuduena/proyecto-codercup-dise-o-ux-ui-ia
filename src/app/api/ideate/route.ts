import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { DesignProblem, ImpactEffortLevel } from "@/lib/types";

const ideateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      description:
        "Entre 3 y 5 ideas o alternativas de solución fundamentadas estrictamente en los problemas de diseño y preguntas How Might We validados.",
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: {
            type: Type.STRING,
            description: "Título conciso y conceptual de la alternativa de solución.",
          },
          descripcion: {
            type: Type.STRING,
            description:
              "Descripción clara del enfoque de la solución (cómo aborda la necesidad y reduce la fricción).",
          },
          problemaOrigen: {
            type: Type.STRING,
            description: "Título o declaración del problema validado al que responde esta idea.",
          },
          howMightWeOrigen: {
            type: Type.STRING,
            description: "La pregunta How Might We exacta a la que busca dar respuesta.",
          },
          porQuePodriaAyudar: {
            type: Type.STRING,
            description:
              "Justificación metodológica de cómo esta idea mitiga el dolor o satisface la necesidad del usuario.",
          },
          impactoEstimado: {
            type: Type.STRING,
            enum: ["Alto", "Medio", "Bajo"],
            description: "Estimación del impacto potencial en la experiencia del usuario.",
          },
          esfuerzoEstimado: {
            type: Type.STRING,
            enum: ["Alto", "Medio", "Bajo"],
            description: "Estimación del esfuerzo relativo de implementación/diseño.",
          },
        },
        required: [
          "titulo",
          "descripcion",
          "problemaOrigen",
          "howMightWeOrigen",
          "porQuePodriaAyudar",
          "impactoEstimado",
          "esfuerzoEstimado",
        ],
      },
    },
  },
  required: ["ideas"],
};

function buildFallbackIdeate(problemasValidados: DesignProblem[]) {
  const generatedIdeas = [];

  for (let i = 0; i < problemasValidados.length; i++) {
    const prob = problemasValidados[i];
    
    // Generar 2 o 3 alternativas de solución complementarias por problema
    generatedIdeas.push({
      titulo: `Guía visual progresiva para ${prob.titulo.toLowerCase()}`,
      descripcion: `Diseñar un componente contextual que anticipe los pasos y reduzca la carga cognitiva del usuario en los puntos críticos señalados.`,
      problemaOrigen: prob.titulo,
      howMightWeOrigen: prob.howMightWe,
      porQuePodriaAyudar: `Aborda directamente la necesidad de "${prob.necesidadUsuario}" otorgando visibilidad y control sobre la interacción.`,
      impactoEstimado: "Alto" as ImpactEffortLevel,
      esfuerzoEstimado: "Medio" as ImpactEffortLevel,
    });

    generatedIdeas.push({
      titulo: `Retroalimentación inmediata y clara sobre ${prob.patronOrigen}`,
      descripcion: `Incorporar estados interactivos explícitos y mensajes de confirmación sin fricción que confirmen el avance en tiempo real.`,
      problemaOrigen: prob.titulo,
      howMightWeOrigen: prob.howMightWe,
      porQuePodriaAyudar: `Elimina la incertidumbre documentada en las evidencias al dar certidumbre instantánea.`,
      impactoEstimado: "Medio" as ImpactEffortLevel,
      esfuerzoEstimado: "Bajo" as ImpactEffortLevel,
    });

    if (generatedIdeas.length < 5) {
      generatedIdeas.push({
        titulo: `Simplificación del flujo enfocado en ${prob.necesidadUsuario.toLowerCase()}`,
        descripcion: `Reestructurar la jerarquía de información para que los elementos esenciales sean inmediatamente accesibles sin pasos redundantes.`,
        problemaOrigen: prob.titulo,
        howMightWeOrigen: prob.howMightWe,
        porQuePodriaAyudar: `Reduce el dolor documentado permitiendo al usuario completar su objetivo con menor esfuerzo.`,
        impactoEstimado: "Alto" as ImpactEffortLevel,
        esfuerzoEstimado: "Alto" as ImpactEffortLevel,
      });
    }
  }

  return { ideas: generatedIdeas.slice(0, 5) };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      problemasValidados,
      feedbackProfesional,
    } = body as {
      problemasValidados: DesignProblem[];
      feedbackProfesional?: string;
    };

    if (!problemasValidados || !Array.isArray(problemasValidados) || problemasValidados.length === 0) {
      return NextResponse.json(
        { error: "Se requieren problemas validados de la etapa Definir para generar ideas de diseño." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY no configurada. Usando fallback metodológico para Idear.");
      return NextResponse.json(buildFallbackIdeate(problemasValidados));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
Eres TraceUX, el módulo de IA especializado en Design Thinking y UX Research riguroso para la etapa IDEAR.
Tu rol es asistir al profesional de UX proponiendo ALTERNATIVAS DE SOLUCIÓN y conceptos de diseño que respondan estrictamente a los problemas de diseño y preguntas How Might We validados en la etapa Definir.

PRINCIPIOS METODOLÓGICOS INQUEBRANTABLES:
1. TRAZABILIDAD ABSOLUTA: Toda idea DEBE originarse explícitamente en uno de los problemas validados y su respectivo How Might We.
2. DIVERSIDAD DE ENFOQUES: Propón entre 3 y 5 ideas variadas (estructurales, de interacción, de retroalimentación, de simplificación o de orientación), sin sesgar hacia una única solución definitiva.
3. LA IA PROPONE, EL PROFESIONAL DECIDE: No declares ninguna idea como "ganadora" o "definitiva".
4. ESTIMACIÓN REALISTA: Asigna de forma fundamentada el impacto estimado (Alto/Medio/Bajo) y esfuerzo estimado (Alto/Medio/Bajo) para facilitar la posterior priorización del equipo.
5. CLARIDAD CONCEPTUAL: Explica con precisión qué hace la idea y POR QUÉ podría mitigar el dolor detectado.
`.trim();

    const problemsSummary = problemasValidados
      .map((p, idx) => {
        const evs = p.evidenciasOrigen?.map((e) => `    - "${e}"`).join("\n") || "    - Sin evidencias";
        return `[Problema ${idx + 1}]: "${p.titulo}"
  - Declaración del problema: ${p.problema}
  - Necesidad del usuario: ${p.necesidadUsuario}
  - Patrón de origen: ${p.patronOrigen}
  - Nivel de Respaldo: ${p.nivelRespaldo}
  - How Might We: "${p.howMightWe}"
  - Evidencias de origen:
${evs}`;
      })
      .join("\n\n");

    const userPrompt = `
PROBLEMAS DE DISEÑO VALIDADOS EN DEFINIR:
${problemsSummary}

${
  feedbackProfesional
    ? `INDICACIÓN / FEEDBACK DEL PROFESIONAL:\n"${feedbackProfesional}"\nPor favor ajusta la propuesta de ideas considerando esta indicación.`
    : ""
}

Genera entre 3 y 5 alternativas de solución / ideas de diseño que respondan a estos problemas y preguntas How Might We.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ideateSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Error en API /api/ideate:", err);
    try {
      const body = await req.json().catch(() => ({}));
      if (body.problemasValidados && Array.isArray(body.problemasValidados)) {
        return NextResponse.json(buildFallbackIdeate(body.problemasValidados));
      }
    } catch {
      // Ignorar
    }
    return NextResponse.json(
      { error: "No se pudo procesar la etapa Idear.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
