import crypto from "crypto"

// Generate a random salt
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash password with salt
export function hashPassword(password: string, salt: string): string {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Verify password against stored hash
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":")
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return hash === calculatedHash
}
