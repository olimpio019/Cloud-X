const {
  SESSION_COOKIE_NAME,
  parseCookies,
  parseJsonBody,
  verifyPassword,
  sendJson,
  methodNotAllowed,
} = require("../_lib/auth");
const { getSessionEmail, getUser } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return sendJson(res, 401, { error: "Sessao invalida.", valid: false });
    }

    const email = await getSessionEmail(token);
    if (!email) {
      return sendJson(res, 401, { error: "Sessao invalida.", valid: false });
    }

    const user = await getUser(email);
    if (!user) {
      return sendJson(res, 401, { error: "Usuario nao encontrado.", valid: false });
    }

    const body = parseJsonBody(req);
    const password = String(body.password || "");
    if (!password) {
      return sendJson(res, 400, { error: "Chave mestra obrigatoria.", valid: false });
    }

    const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    return sendJson(res, 200, { ok: true, valid });
  } catch (err) {
    console.error("master key verification failed", err);
    return sendJson(res, 500, { error: err.message || "Erro interno na verificacao.", valid: false });
  }
};
