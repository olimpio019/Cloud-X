const {
  SESSION_MAX_AGE_SECONDS,
  normalizeEmail,
  verifyPassword,
  newSessionToken,
  parseJsonBody,
  makeSessionCookie,
  sendJson,
  methodNotAllowed,
} = require("../_lib/auth");
const { getUser, putSession } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const body = parseJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    const user = await getUser(email);
    if (!user) {
      return sendJson(res, 401, { error: "Credenciais invalidas." });
    }

    const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!valid) {
      return sendJson(res, 401, { error: "Credenciais invalidas." });
    }

    const sessionToken = newSessionToken();
    await putSession(sessionToken, email, SESSION_MAX_AGE_SECONDS);
    res.setHeader("Set-Cookie", makeSessionCookie(sessionToken, req));

    return sendJson(res, 200, { ok: true, user: { email } });
  } catch (err) {
    console.error("login failed", err);
    return sendJson(res, 500, { error: err.message || "Erro interno no login." });
  }
};
