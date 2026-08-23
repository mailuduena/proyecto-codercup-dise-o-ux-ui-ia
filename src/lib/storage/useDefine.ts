"use client";

import { useSyncExternalStore } from "react";
import {
  localDefineRepository,
  subscribeDefineResults,
} from "./define";
import type { DefineResult, ValidationStatus } from "@/lib/types";

export function useDefine(projectId: string) {
  const allResults = useSyncExternalStore(
    subscribeDefineResults,
    () => localDefineRepository.listAll(),
    () => [] as DefineResult[]
  );

  const defineResult = allResults.find((r) => r.projectId === projectId) || null;
  const isDefineValidated = defineResult?.estadoValidacion === "validado";

  function saveDefineResult(result: DefineResult) {
    localDefineRepository.save(result);
  }

  function setDefineStatus(status: ValidationStatus) {
    return localDefineRepository.updateStatus(projectId, status);
  }

  return {
    defineResult,
    isDefineValidated,
    saveDefineResult,
    setDefineStatus,
  };
}
