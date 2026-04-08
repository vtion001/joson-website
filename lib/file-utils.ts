import { writeFile, readFile, mkdir, unlink } from "fs/promises"
import path from "path"

/**
 * Atomic file write with simple locking mechanism.
 * Prevents race conditions when multiple requests write to the same JSON file.
 */
export async function atomicWrite(filePath: string, data: unknown): Promise<void> {
  const lockDir = path.join(process.cwd(), "data", ".locks")
  await mkdir(lockDir, { recursive: true })
  const lockFile = path.join(lockDir, path.basename(filePath) + ".lock")

  // Wait for lock (max 5 seconds)
  let waited = 0
  let lockAcquired = false
  while (waited < 5000) {
    try {
      await writeFile(lockFile, String(Date.now()), { flag: "wx" })
      lockAcquired = true
      break
    } catch {
      await new Promise((r) => setTimeout(r, 50))
      waited += 50
    }
  }

  if (!lockAcquired) {
    throw new Error(`Could not acquire lock for ${filePath} after ${waited}ms`)
  }

  try {
    await writeFile(filePath, JSON.stringify(data, null, 2))
  } finally {
    try {
      await unlink(lockFile)
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Safe JSON read with fallback to empty array/object.
 */
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}