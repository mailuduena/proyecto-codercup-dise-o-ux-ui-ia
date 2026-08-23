"use client";

import { useSyncExternalStore } from "react";
import {
  localIdeateRepository,
  subscribeIdeateResults,
} from "./ideate";
import type { IdeateResult, ValidationStatus } from "@/lib/types";

export function useIdeate(projectId: string) {
  const allResults = useSyncExternalStore(
    subscribeIdeateResults,
    () => localIdeateRepository.listAll(),
    () => [] as IdeateResult[]
  );

  const ideateResult = allResults.find((r) => r.projectId === projectId) || null;
  const isIdeateValidated = ideateResult?.estadoValidacion === "validado";

  function saveIdeateResult(result: IdeateResult) {
    localIdeateRepository.save(result);
  }

  function setIdeateStatus(status: ValidationStatus) {
    return localIdeateRepository.updateStatus(projectId, status);
  }

  return {
    ideateResult,
    isIdeateValidated,
    saveIdeateResult,
    setIdeateStatus,
  };
}
