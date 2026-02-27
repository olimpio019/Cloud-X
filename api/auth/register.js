const {
  SESSION_MAX_AGE_SECONDS,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  newSessionToken,
  parseJsonBody,
  makeSessionCookie,
  sendJson,
  methodNotAllowed,
} = require("../_lib/auth");
const { getUser, putUser, putSession } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const body = parseJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { error: "E-mail invalido." });
    }

    if (password.length < 6) {
      return sendJson(res, 400, { error: "A chave mestra deve ter ao menos 6 caracteres." });
    }

    const existing = await getUser(email);
    if (existing) {
      return sendJson(res, 409, { error: "Este e-mail ja esta cadastrado." });
    }

    const { salt, hash } = hashPassword(password);
    const user = {
      email,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };
    await putUser(email, user);

    const sessionToken = newSessionToken();
    await putSession(sessionToken, email, SESSION_MAX_AGE_SECONDS);
    res.setHeader("Set-Cookie", makeSessionCookie(sessionToken, req));

    return sendJson(res, 201, { ok: true, user: { email } });
  } catch (err) {
    return sendJson(res, 500, { error: err.message || "Erro interno no cadastro." });
  }
};
