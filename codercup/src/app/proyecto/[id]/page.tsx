import { EmpathizeWorkspace } from "@/components/EmpathizeWorkspace";

export default async function EmpathizeStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmpathizeWorkspace projectId={id} />;
}
