"use client";

import { useSyncExternalStore } from "react";
import { localTestRepository, subscribeTestResults } from "./test";
import type { TestResult, ValidationStatus } from "@/lib/types";

export function useTest(projectId: string) {
  const allResults = useSyncExternalStore(
    subscribeTestResults,
    () => localTestRepository.listAll(),
    () => [] as TestResult[]
  );

  const testResult = allResults.find((r) => r.projectId === projectId) || null;
  const isTestValidated = testResult?.estadoValidacion === "validado";

  function saveTestResult(result: TestResult) {
    localTestRepository.save(result);
  }

  function setTestStatus(status: ValidationStatus) {
    return localTestRepository.updateStatus(projectId, status);
  }

  return {
    testResult,
    isTestValidated,
    saveTestResult,
    setTestStatus,
  };
}
