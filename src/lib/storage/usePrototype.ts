"use client";

import { useSyncExternalStore } from "react";
import {
  localPrototypeRepository,
  subscribePrototypeResults,
} from "./prototype";
import type { PrototypeResult, ValidationStatus } from "@/lib/types";

export function usePrototype(projectId: string) {
  const allResults = useSyncExternalStore(
    subscribePrototypeResults,
    () => localPrototypeRepository.listAll(),
    () => [] as PrototypeResult[]
  );

  const prototypeResult = allResults.find((r) => r.projectId === projectId) || null;
  const isPrototypeValidated = prototypeResult?.estadoValidacion === "validado";

  function savePrototypeResult(result: PrototypeResult) {
    localPrototypeRepository.save(result);
  }

  function setPrototypeStatus(status: ValidationStatus) {
    return localPrototypeRepository.updateStatus(projectId, status);
  }

  return {
    prototypeResult,
    isPrototypeValidated,
    savePrototypeResult,
    setPrototypeStatus,
  };
}
