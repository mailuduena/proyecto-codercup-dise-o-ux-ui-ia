export function generateId(prefix?: string): string {
  let uuid: string;
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      uuid = crypto.randomUUID();
    } else {
      uuid = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
    }
  } catch {
    uuid = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  }

  return prefix ? `${prefix}_${uuid}` : uuid;
}
