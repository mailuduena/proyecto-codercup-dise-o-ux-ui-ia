"use client";

import { useSyncExternalStore, useMemo } from "react";
import {
  localAnalysisRepository,
  subscribeToAnalyses,
} from "@/lib/storage/analysis";
import type { AnalysisResult, ValidationStatus } from "@/lib/types";

function getSnapshot(): AnalysisResult[] {
  return localAnalysisRepository.listAll();
}

function getServerSnapshot(): AnalysisResult[] {
  return localAnalysisRepository.listAll();
}

export function useAnalysis(projectId: string) {
  const allAnalyses = useSyncExternalStore(
    subscribeToAnalyses,
    getSnapshot,
    getServerSnapshot
  );

  const projectAnalyses = useMemo(() => {
    return allAnalyses
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => a.version - b.version);
  }, [allAnalyses, projectId]);

  const latestAnalysis = useMemo(() => {
    if (projectAnalyses.length === 0) return null;
    return projectAnalyses[projectAnalyses.length - 1];
  }, [projectAnalyses]);

  const isValidated = useMemo(() => {
    return latestAnalysis?.estadoValidacion === "validado";
  }, [latestAnalysis]);

  function saveAnalysis(analysis: AnalysisResult) {
    localAnalysisRepository.save(analysis);
  }

  function setStatus(analysisId: string, status: ValidationStatus) {
    return localAnalysisRepository.updateStatus(analysisId, status);
  }

  function createNextVersion(
    previousAnalysis: AnalysisResult,
    newResultData: Omit<
      AnalysisResult,
      "id" | "projectId" | "version" | "previousVersionId" | "estadoValidacion" | "createdAt"
    >
  ) {
    return localAnalysisRepository.createNextVersion(
      projectId,
      previousAnalysis,
      newResultData
    );
  }

  function clearAnalyses() {
    localAnalysisRepository.removeByProject(projectId);
  }

  return {
    analyses: projectAnalyses,
    latestAnalysis,
    isValidated,
    saveAnalysis,
    setStatus,
    createNextVersion,
    clearAnalyses,
  };
}
