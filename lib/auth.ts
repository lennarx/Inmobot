// Shared by proxy.ts (edge-ish runtime) and server actions: Web Crypto only.
export const AUTH_COOKIE = "inmobot_auth";

export async function pinToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`inmobot:v1:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  const pin = process.env.APP_PIN;
  if (!pin || !token) return false;
  return token === (await pinToken(pin));
}
