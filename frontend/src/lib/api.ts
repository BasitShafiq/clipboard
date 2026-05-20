const getApiUrl = () => {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};
const API_URL = getApiUrl();

export async function createSession(): Promise<string> {
  const res = await fetch(`${API_URL}/session`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create session");
  const data = await res.json();
  return data.sessionId;
}

export async function getSessionData(sessionId: string) {
  const res = await fetch(`${API_URL}/session/${sessionId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function uploadImage(sessionId: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("sessionId", sessionId);

  const res = await fetch(`${API_URL}/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
}
