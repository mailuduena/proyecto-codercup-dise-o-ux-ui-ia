import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { DesignIdea } from "@/lib/types";

const prototypeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    concepto: {
      type: Type.STRING,
      description: "Concepto general del prototipo interactivo derivado de las ideas validadas.",
    },
    objetivo: {
      type: Type.STRING,
      description: "Objetivo central de experiencia que busca materializar y verificar este prototipo.",
    },
    flujoPrincipal: {
      type: Type.STRING,
      description: "Descripción sintética del recorrido paso a paso que realiza el usuario en el prototipo.",
    },
    pantallas: {
      type: Type.ARRAY,
      description: "De 3 a 6 pantallas o estados clave del prototipo.",
      items: {
        type: Type.OBJECT,
        properties: {
          orden: {
            type: Type.INTEGER,
            description: "Número de orden dentro del flujo (1, 2, 3...).",
          },
          nombre: {
            type: Type.STRING,
            description: "Nombre descriptivo de la pantalla o estado (ej. 'Dashboard de Resumen', 'Modal de Confirmación Contextual').",
          },
          descripcionEstado: {
            type: Type.STRING,
            description: "Propósito y contexto de esta pantalla en el recorrido del usuario.",
          },
          elementosClave: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Componentes, datos y elementos visuales críticos presentes en la pantalla.",
          },
          interaccionesCriticas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Acciones, disparadores o transiciones que el usuario puede ejecutar aquí.",
          },
        },
        required: ["orden", "nombre", "descripcionEstado", "elementosClave", "interaccionesCriticas"],
      },
    },
    hipotesis: {
      type: Type.ARRAY,
      description: "De 1 a 3 hipótesis de diseño medibles que este prototipo someterá a prueba.",
      items: {
        type: Type.OBJECT,
        properties: {
          enunciado: {
            type: Type.STRING,
            description: "Enunciado de la hipótesis (ej. 'Si proporcionamos indicadores de progreso claros, los usuarios completarán la tarea con menor fricción percibida').",
          },
          criterioValidacion: {
            type: Type.STRING,
            description: "Qué comportamiento o métrica cualitativa confirmará o refutará la hipótesis en la etapa de Testeo.",
          },
        },
        required: ["enunciado", "criterioValidacion"],
      },
    },
  },
  required: ["concepto", "objetivo", "flujoPrincipal", "pantallas", "hipotesis"],
};

function buildFallbackPrototype(ideasValidadas: DesignIdea[]) {
  const ideaPrincipal = ideasValidadas[0] || {
    titulo: "Solución de Interacción Directa",
    descripcion: "Interfaz optimizada y asistida para el usuario.",
    problemaOrigen: "Fricción en el flujo principal",
    howMightWeOrigen: "¿Cómo podríamos reducir la carga del usuario?",
  };

  return {
    concepto: `Prototipo interactivo centrado en: ${ideaPrincipal.titulo}`,
    objetivo: `Materializar las alternativas de solución validadas para evaluar su claridad, usabilidad y valor percibido antes del desarrollo final.`,
    flujoPrincipal: `Inicio guiado → Selección y configuración sin fricción → Retroalimentación en tiempo real → Confirmación con estado claro`,
    pantallas: [
      {
        orden: 1,
        nombre: "Pantalla de Inicio y Orientación",
        descripcionEstado: "Punto de entrada donde el usuario visualiza el estado actual y las opciones prioritarias sin sobrecarga.",
        elementosClave: [
          "Encabezado con estado sintetizado",
          "Accesos directos a tareas frecuentes",
          "Indicador visual de avance",
        ],
        interaccionesCriticas: [
          "Selección de acción primaria con feedback inmediato",
          "Acceso a la guía de ayuda contextual",
        ],
      },
      {
        orden: 2,
        nombre: "Flujo de Configuración / Ejecución",
        descripcionEstado: "Espacio de trabajo donde se implementa la solución propuesta para mitigar la fricción detectada.",
        elementosClave: [
          "Formulario progresivo con validación instantánea",
          "Panel de vista previa de cambios",
          "Botones de control con jerarquía visual explícita",
        ],
        interaccionesCriticas: [
          "Completar inputs con autoguardado preventivo",
          "Visualizar advertencias antes de confirmar",
        ],
      },
      {
        orden: 3,
        nombre: "Estado de Confirmación y Cierre",
        descripcionEstado: "Pantalla de cierre que otorga certidumbre absoluta sobre el éxito de la interacción.",
        elementosClave: [
          "Mensaje de éxito contextualizado con resumen de cambios",
          "Siguientes pasos recomendados",
          "Acceso rápido al historial",
        ],
        interaccionesCriticas: [
          "Finalizar flujo y retornar a la vista principal",
          "Descargar o compartir comprobante",
        ],
      },
    ],
    hipotesis: [
      {
        enunciado: `Si implementamos ${ideaPrincipal.titulo.toLowerCase()}, los usuarios completarán el flujo con menor tiempo y sin errores de navegación.`,
        criterioValidacion: `Más del 80% de los usuarios de prueba completan la tarea sin solicitar asistencia y manifiestan alta confianza.`,
      },
      {
        enunciado: `La retroalimentación visual inmediata reduce la incertidumbre en los puntos críticos de decisión.`,
        criterioValidacion: `Los participantes no dudan ni retroceden en la pantalla de confirmación durante las pruebas de usabilidad.`,
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ideasValidadas,
      feedbackProfesional,
    } = body as {
      ideasValidadas: DesignIdea[];
      feedbackProfesional?: string;
    };

    if (!ideasValidadas || !Array.isArray(ideasValidadas) || ideasValidadas.length === 0) {
      return NextResponse.json(
        { error: "Se requieren ideas validadas de la etapa Idear para estructurar el prototipo." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY no configurada. Usando fallback metodológico para Prototipar.");
      return NextResponse.json(buildFallbackPrototype(ideasValidadas));
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
Eres TraceUX, el módulo de IA especializado en Design Thinking y UX Research riguroso para la etapa PROTOTIPAR.
Tu rol es asistir al profesional de UX traduciendo las IDEAS DE DISEÑO VALIDADAS en una propuesta de PROTOTIPO INTERACTIVO estructurado (flujo, pantallas/estados clave e hipótesis a validar).

PRINCIPIOS METODOLÓGICOS INQUEBRANTABLES:
1. TRAZABILIDAD ABSOLUTA: El concepto y pantallas deben responder directamente a las ideas validadas y sus problemas de origen.
2. ENFOQUE EN HIPÓTESIS: El prototipo es un instrumento para aprender y validar con usuarios, NO un producto final terminado.
3. NO AFIRMAR QUE EL PROBLEMA ESTÁ RESUELTO: Prohíbe declarar certezas absolutas; el diseño propone artefactos para testear.
4. NO INVENTAR RESULTADOS DE TESTS: No simules métricas finales ni afirmes que "los usuarios amaron la solución". Define hipótesis y criterios para la etapa de Testeo.
5. PANTALLAS CONCRETAS: Genera entre 3 y 6 pantallas/estados del flujo con elementos clave e interacciones críticas bien detalladas.
`.trim();

    const ideasSummary = ideasValidadas
      .map((idea, idx) => {
        return `[Idea ${idx + 1}]: "${idea.titulo}"
  - Descripción: ${idea.descripcion}
  - Problema de origen: ${idea.problemaOrigen}
  - How Might We: "${idea.howMightWeOrigen}"
  - Por qué podría ayudar: ${idea.porQuePodriaAyudar}
  - Impacto estimado: ${idea.impactoEstimado} | Esfuerzo estimado: ${idea.esfuerzoEstimado}`;
      })
      .join("\n\n");

    const userPrompt = `
IDEAS DE DISEÑO VALIDADAS EN IDEAR:
${ideasSummary}

${
  feedbackProfesional
    ? `INDICACIÓN / FEEDBACK DEL PROFESIONAL:\n"${feedbackProfesional}"\nPor favor ajusta la propuesta del prototipo considerando esta indicación.`
    : ""
}

Estructura una propuesta de prototipo (concepto, objetivo, flujo, entre 3 y 6 pantallas/estados detallados y de 1 a 3 hipótesis a validar en la posterior etapa de Testeo).
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: prototypeSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Error en API /api/prototype:", err);
    try {
      const body = await req.json().catch(() => ({}));
      if (body.ideasValidadas && Array.isArray(body.ideasValidadas)) {
        return NextResponse.json(buildFallbackPrototype(body.ideasValidadas));
      }
    } catch {
      // Ignorar
    }
    return NextResponse.json(
      { error: "No se pudo procesar la etapa Prototipar.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
