"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ResearchSource } from "@/lib/types";
import { localResearchSourceRepository, subscribeToSources } from "./sources";

function getSnapshot(): ResearchSource[] {
  return localResearchSourceRepository.listAll();
}

function getServerSnapshot(): ResearchSource[] {
  return localResearchSourceRepository.listAll();
}

export function useResearchSources(projectId: string) {
  const allSources = useSyncExternalStore(subscribeToSources, getSnapshot, getServerSnapshot);

  const sources = useMemo(
    () => allSources.filter((source) => source.projectId === projectId),
    [allSources, projectId],
  );

  const addSource = useCallback(
    (content: string) => localResearchSourceRepository.add(projectId, content),
    [projectId],
  );

  const removeSource = useCallback((sourceId: string) => {
    localResearchSourceRepository.remove(sourceId);
  }, []);

  return { sources, addSource, removeSource };
}
