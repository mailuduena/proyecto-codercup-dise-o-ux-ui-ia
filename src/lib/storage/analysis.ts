import { generateId } from "@/lib/id";
import type { AnalysisResult, ValidationStatus } from "@/lib/types";

const STORAGE_KEY = "codercup:analyses";

export interface AnalysisRepository {
  listAll(): AnalysisResult[];
  listByProject(projectId: string): AnalysisResult[];
  getLatestByProject(projectId: string): AnalysisResult | null;
  getById(analysisId: string): AnalysisResult | null;
  save(analysis: AnalysisResult): void;
  updateStatus(analysisId: string, status: ValidationStatus): AnalysisResult | null;
  createNextVersion(
    projectId: string,
    previousAnalysis: AnalysisResult,
    newResultData: Omit<
      AnalysisResult,
      "id" | "projectId" | "version" | "previousVersionId" | "estadoValidacion" | "createdAt"
    >
  ): AnalysisResult;
  removeByProject(projectId: string): void;
}

const EMPTY_ANALYSES: AnalysisResult[] = [];
let cache: AnalysisResult[] = EMPTY_ANALYSES;
let hasLoadedFromStorage = false;
const listeners = new Set<() => void>();

function sortByVersion(analyses: AnalysisResult[]): AnalysisResult[] {
  return [...analyses].sort((a, b) => a.version - b.version);
}

function ensureLoaded(): void {
  if (hasLoadedFromStorage) return;
  hasLoadedFromStorage = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cache = parsed as AnalysisResult[];
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para analysis:", err);
  }
}

function getCache(): AnalysisResult[] {
  return cache;
}

function setCache(analyses: AnalysisResult[]): void {
  hasLoadedFromStorage = true;
  cache = analyses;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para analysis:", err);
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de analysis:", err);
    }
  });
}

export const localAnalysisRepository: AnalysisRepository = {
  listAll() {
    return getCache();
  },

  listByProject(projectId: string) {
    return sortByVersion(getCache().filter((a) => a.projectId === projectId));
  },

  getLatestByProject(projectId: string) {
    const projectAnalyses = this.listByProject(projectId);
    if (projectAnalyses.length === 0) return null;
    return projectAnalyses[projectAnalyses.length - 1];
  },

  getById(analysisId: string) {
    return getCache().find((a) => a.id === analysisId) || null;
  },

  save(analysis: AnalysisResult) {
    const current = getCache();
    const existingIndex = current.findIndex((a) => a.id === analysis.id);
    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = analysis;
      setCache(updated);
    } else {
      setCache([...current, analysis]);
    }
  },

  updateStatus(analysisId: string, status: ValidationStatus) {
    const current = getCache();
    const target = current.find((a) => a.id === analysisId);
    if (!target) return null;

    const updated: AnalysisResult = {
      ...target,
      estadoValidacion: status,
    };
    this.save(updated);
    return updated;
  },

  createNextVersion(projectId, previousAnalysis, newResultData) {
    const newAnalysis: AnalysisResult = {
      ...newResultData,
      id: generateId("ana"),
      projectId,
      version: previousAnalysis.version + 1,
      previousVersionId: previousAnalysis.id,
      estadoValidacion: "pendiente",
      createdAt: new Date().toISOString(),
    };
    this.save(newAnalysis);
    return newAnalysis;
  },

  removeByProject(projectId: string) {
    setCache(getCache().filter((a) => a.projectId !== projectId));
  },
};

export function subscribeToAnalyses(listener: () => void): () => void {
  listeners.add(listener);
  if (!hasLoadedFromStorage && typeof window !== "undefined") {
    ensureLoaded();
    if (cache.length > 0) {
      listener();
    }
  }
  return () => listeners.delete(listener);
}
