import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v1";

function signParts(parts: string[], secret: string): string {
  return createHmac("sha256", secret).update(parts.join(".")).digest("base64url");
}

export function createUnsubscribeToken(userId: string, secret: string, expiresInSeconds = 60 * 60 * 24 * 30): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt }), "utf8").toString("base64url");
  const signature = signParts([TOKEN_VERSION, payload], secret);
  return `${TOKEN_VERSION}.${payload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string, secret: string): { userId: string } | null {
  const [version, payload, signature] = token.split(".");
  if (!version || !payload || !signature || version !== TOKEN_VERSION) {
    return null;
  }

  const expectedSignature = signParts([version, payload], secret);
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
      expiresAt?: number;
    };
    if (!parsed.userId || !parsed.expiresAt) {
      return null;
    }
    if (parsed.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}
