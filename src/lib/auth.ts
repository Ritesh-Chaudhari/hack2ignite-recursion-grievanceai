import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getUserByEmail, saveUser } from "@/lib/store";
import type { PublicUser, Role } from "@/lib/types";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = await scrypt(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: Role,
): Promise<PublicUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await hashPassword(password);
  const user = await saveUser({
    name: name.trim(),
    email: normalizedEmail,
    role,
    passwordHash,
  });
  return user;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<PublicUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const record = await getUserByEmail(normalizedEmail);
  if (!record || !(await verifyPassword(password, record.passwordHash))) {
    throw new Error("Invalid email or password.");
  }
  return record;
}
