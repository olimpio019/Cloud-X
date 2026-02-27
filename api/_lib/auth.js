const crypto = require("crypto");

const SESSION_COOKIE_NAME = "cloudx_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function safeEqualHex(aHex, bHex) {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyPassword(password, saltHex, expectedHashHex) {
  const { hash } = hashPassword(password, saltHex);
  return safeEqualHex(hash, expectedHashHex);
}

function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function parseJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch (_err) {
    return {};
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName) return;
    out[rawName] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

function isSecureRequest(req) {
  const proto = req.headers["x-forwarded-proto"];
  return proto === "https" || process.env.VERCEL === "1";
}

function makeSessionCookie(token, req) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

function makeClearSessionCookie(req) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function methodNotAllowed(res) {
  sendJson(res, 405, { error: "Metodo nao permitido." });
}

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  verifyPassword,
  newSessionToken,
  parseJsonBody,
  parseCookies,
  makeSessionCookie,
  makeClearSessionCookie,
  sendJson,
  methodNotAllowed,
};
