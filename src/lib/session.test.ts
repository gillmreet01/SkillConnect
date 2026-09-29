import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "@/lib/session";

const inAnHour = () => new Date(Date.now() + 60 * 60 * 1000);

describe("session tokens", () => {
  it("round-trips the user id and role", async () => {
    const token = await encrypt({ userId: "user_1", role: "FREELANCER", expiresAt: inAnHour() });
    expect(await decrypt(token)).toEqual({ userId: "user_1", role: "FREELANCER" });
  });

  it("rejects missing, malformed and tampered tokens", async () => {
    const token = await encrypt({ userId: "user_1", role: "CLIENT", expiresAt: inAnHour() });
    const [header, , signature] = token.split(".");
    const forgedBody = Buffer.from(JSON.stringify({ userId: "user_2", role: "CLIENT" })).toString("base64url");

    expect(await decrypt(undefined)).toBeNull();
    expect(await decrypt("not-a-jwt")).toBeNull();
    expect(await decrypt(`${header}.${forgedBody}.${signature}`)).toBeNull();
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await new SignJWT({ userId: "user_1", role: "CLIENT" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(inAnHour())
      .sign(new TextEncoder().encode("some-other-secret-value-0000000000"));
    expect(await decrypt(token)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await encrypt({ userId: "user_1", role: "CLIENT", expiresAt: new Date(Date.now() - 1000) });
    expect(await decrypt(token)).toBeNull();
  });
});
