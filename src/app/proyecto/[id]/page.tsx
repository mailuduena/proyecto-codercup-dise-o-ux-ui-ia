import { ProjectShell } from "@/components/ProjectShell";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  return <ProjectShell projectId={id} />;
}

