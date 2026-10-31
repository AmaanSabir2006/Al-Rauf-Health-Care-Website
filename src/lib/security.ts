import crypto from "crypto";
import fs from "fs";
import path from "path";
import { CLINIC_DOCTORS, OPERATING_SLOTS, getDoctorOperatingSlots } from "./constants";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabaseClient";

// Server-side secret key for signing reception tokens (stored in memory or environment)
const SERVER_SECRET = process.env.RECEPTION_SECRET_KEY || "al-rauf-reception-sec-key-2026-secure-token-salt-!@#";

// In-memory rate limiting cache for IP / Action (e.g., login attempts, booking floods)
interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks and updates rate limits for a given client identifier and action.
 * Returns { allowed: boolean, remainingAttempts: number, retryAfterSec?: number }
 */
export function checkRateLimit(
  identifier: string,
  action: "login" | "booking" | "api" | "error_log",
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes window
): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const key = `${action}:${identifier}`;
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  // Reset window if expired
  if (now - record.lastAttempt > windowMs) {
    record.attempts = 1;
    record.lastAttempt = now;
    record.blockedUntil = undefined;
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts > maxAttempts) {
    // Block for the remainder of the window (or at least 5 minutes)
    record.blockedUntil = now + Math.max(windowMs, 5 * 60 * 1000);
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  return { allowed: true, remainingAttempts: maxAttempts - record.attempts };
}

/**
 * Resets rate limit for a successful action (e.g. valid login)
 */
export function resetRateLimit(identifier: string, action: string) {
  rateLimitMap.delete(`${action}:${identifier}`);
}

/**
 * Generates a tamper-proof cryptographically signed session token for Reception staff.
 * Valid for 24 hours.
 */
export function generateReceptionToken(): string {
  const timestamp = Date.now();
  const expiresAt = timestamp + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `reception:${expiresAt}:${crypto.randomBytes(8).toString("hex")}`;
  const hmac = crypto.createHmac("sha256", SERVER_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}.${hmac}`).toString("base64url");
  return token;
}

/**
 * Verifies if an incoming token is a valid, unexpired, authentic Reception token.
 */
export function verifyReceptionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SERVER_SECRET).update(payload).digest("hex");

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))) {
      return false;
    }

    const payloadParts = payload.split(":");
    if (payloadParts.length < 3 || payloadParts[0] !== "reception") return false;

    const expiresAt = Number(payloadParts[1]);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Helper to extract Bearer token from Authorization header or cookie
 */
export function extractAuthToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // Also check x-reception-token header
  const customHeader = request.headers.get("x-reception-token");
  if (customHeader) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Sanitizes input text: strips HTML tags, escapes dangerous characters, limits max length.
 */
export function sanitizeInput(input: any, maxLength: number = 200): string {
  if (input === null || input === undefined) return "";
  let str = String(input).trim();

  // Strip HTML script/tag injections
  str = str.replace(/<[^>]*>/g, "");

  // Escape special HTML characters to prevent XSS
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Enforce max length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str.trim();
}

/**
 * Validates and normalizes Pakistani phone numbers (e.g. 0300-1234567, 03001234567, +923001234567)
 */
export function validateAndNormalizePhone(phone: string): { valid: boolean; normalized: string; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, normalized: "", error: "Phone number is required." };
  }

  let clean = phone.replace(/[\s\-\(\)]/g, "");

  // Convert +923XXXXXXXXX or 923XXXXXXXXX to 03XXXXXXXXX
  if (clean.startsWith("+92")) {
    clean = "0" + clean.substring(3);
  } else if (clean.startsWith("92") && clean.length === 12) {
    clean = "0" + clean.substring(2);
  }

  // Pakistani mobile: 11 digits starting with 03
  const regex = /^03\d{9}$/;
  if (!regex.test(clean)) {
    return {
      valid: false,
      normalized: clean,
      error: "Invalid phone number. Please enter an 11-digit Pakistani mobile number (e.g. 0300-1234567).",
    };
  }

  // Return formatted as 03XX-XXXXXXX
  const formatted = `${clean.substring(0, 4)}-${clean.substring(4)}`;
  return { valid: true, normalized: formatted };
}

/**
 * Validates booking date: must be YYYY-MM-DD, must not be in past, must be within max 60 days
 */
export function validateBookingDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr || typeof dateStr !== "string") {
    return { valid: false, error: "Date is required." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format." };
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0);

  if (
    targetDate.getFullYear() !== year ||
    targetDate.getMonth() !== month - 1 ||
    targetDate.getDate() !== day
  ) {
    return { valid: false, error: "Invalid calendar date." };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  if (targetDate.getTime() < today.getTime()) {
    return { valid: false, error: "Consultation date cannot be in the past." };
  }

  const maxAllowed = new Date(today);
  maxAllowed.setDate(today.getDate() + 60); // Max 60 days ahead

  if (targetDate.getTime() > maxAllowed.getTime()) {
    return { valid: false, error: "Appointments can only be scheduled up to 60 days in advance." };
  }

  return { valid: true };
}

/**
/**
 * Validates an uploaded payment screenshot (MIME type, size, magic bytes) in memory.
 */
export function validateReceiptImage(
  receiptDataUrlOrPath: string
): {
  valid: boolean;
  buffer?: Buffer;
  mimeType?: string;
  extension?: string;
  existingPath?: string;
  error?: string;
} {
  if (!receiptDataUrlOrPath || typeof receiptDataUrlOrPath !== "string") {
    return { valid: false, error: "Payment screenshot is strictly required." };
  }

  const trimmed = receiptDataUrlOrPath.trim();

  // If it's already an existing relative path or URL (e.g. demo sample receipt or Supabase public URL)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/uploads/")
  ) {
    // Sanitize path traversal attempts
    const safePath = path.normalize(trimmed).replace(/\\/g, "/");
    if (safePath.includes("..")) {
      return { valid: false, error: "Invalid image path reference." };
    }
    return { valid: true, existingPath: trimmed };
  }

  // Otherwise, validate Base64 Data URL: "data:image/jpeg;base64,..."
  const match = trimmed.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/i);
  if (!match) {
    return {
      valid: false,
      error: "Invalid image format. Supported formats are JPG, PNG, and WEBP.",
    };
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[3];

  // Restrict Base64 buffer size to 3.5 MB
  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > 3.5 * 1024 * 1024) {
    return {
      valid: false,
      error: "Screenshot exceeds maximum file size limit (3.5 MB).",
    };
  }

  if (buffer.length < 100) {
    return {
      valid: false,
      error: "Uploaded image file is empty or corrupted.",
    };
  }

  // Validate Magic Bytes
  // JPEG: FF D8 FF
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  // WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  let extension = "jpg";
  if (mimeType === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    extension = "jpg";
  } else if (
    mimeType === "image/png" &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    extension = "png";
  } else if (
    mimeType === "image/webp" &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    extension = "webp";
  } else {
    return {
      valid: false,
      error: "File content does not match genuine image header signatures.",
    };
  }

  return { valid: true, buffer, mimeType, extension };
}

/**
 * Validates and saves an uploaded payment transaction screenshot safely to disk.
 * Returns public relative web path e.g. "/uploads/receipts/rcpt-1234.jpg".
 */
export function savePaymentReceipt(
  receiptDataUrlOrPath: string
): { success: boolean; filePath?: string; error?: string } {
  const validated = validateReceiptImage(receiptDataUrlOrPath);
  if (!validated.valid) {
    return { success: false, error: validated.error };
  }

  if (validated.existingPath) {
    return { success: true, filePath: validated.existingPath };
  }

  const { buffer, extension } = validated;
  if (!buffer || !extension) {
    return { success: false, error: "Invalid image data." };
  }

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueId = `rcpt-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `${uniqueId}.${extension}`;
    const absolutePath = path.join(uploadDir, filename);

    fs.writeFileSync(absolutePath, buffer);

    const publicUrl = `/uploads/receipts/${filename}`;
    return { success: true, filePath: publicUrl };
  } catch (err) {
    console.error("Local filesystem write failed (read-only environment):", err);
    // In serverless read-only environment, fallback to returning the validated data URL if small
    if (buffer.length <= 500 * 1024 && receiptDataUrlOrPath.startsWith("data:image")) {
      return { success: true, filePath: receiptDataUrlOrPath };
    }
    return { success: false, error: "Failed to persist receipt image to disk." };
  }
}

/**
 * Validates and saves an uploaded payment transaction screenshot.
 * Automatically uploads to Supabase Storage if configured, or falls back to local disk / cloud URL.
 */
export async function savePaymentReceiptAsync(
  receiptDataUrlOrPath: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const validated = validateReceiptImage(receiptDataUrlOrPath);
  if (!validated.valid) {
    return { success: false, error: validated.error };
  }

  if (validated.existingPath) {
    return { success: true, filePath: validated.existingPath };
  }

  const { buffer, mimeType, extension } = validated;
  if (!buffer || !mimeType || !extension) {
    return { success: false, error: "Invalid image data." };
  }

  // 1. If Supabase is configured, upload directly to Supabase Storage bucket 'clinic-receipts'
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const fileName = `rcpt-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;

        let uploadRes = await supabase.storage
          .from("clinic-receipts")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        // Auto-create bucket if missing and retry
        if (uploadRes.error && uploadRes.error.message?.toLowerCase().includes("bucket not found")) {
          await supabase.storage.createBucket("clinic-receipts", { public: true });
          uploadRes = await supabase.storage
            .from("clinic-receipts")
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: false,
            });
        }

        if (!uploadRes.error && uploadRes.data) {
          const { data: pubData } = supabase.storage
            .from("clinic-receipts")
            .getPublicUrl(fileName);
          if (pubData && pubData.publicUrl) {
            return { success: true, filePath: pubData.publicUrl };
          }
        } else {
          console.warn("Supabase Storage upload warning:", uploadRes.error);
        }
      } catch (err) {
        console.warn("Supabase Storage upload error:", err);
      }
    }
  }

  // 2. Fall back to local disk (for localhost offline development)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueId = `rcpt-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `${uniqueId}.${extension}`;
    const absolutePath = path.join(uploadDir, filename);

    fs.writeFileSync(absolutePath, buffer);

    const publicUrl = `/uploads/receipts/${filename}`;
    return { success: true, filePath: publicUrl };
  } catch (err) {
    console.warn("Local disk write unavailable (expected on serverless platforms):", err);
  }

  // 3. Fallback: If on serverless where filesystem is read-only and Supabase storage was unreachable,
  // return the validated base64 data URL so patient booking is preserved without rejection
  if (receiptDataUrlOrPath.startsWith("data:image")) {
    return { success: true, filePath: receiptDataUrlOrPath };
  }

  return { success: false, error: "Failed to persist receipt image." };
}

