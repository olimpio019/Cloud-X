const { SESSION_COOKIE_NAME, parseCookies, sendJson, methodNotAllowed } = require("../_lib/auth");
const { getSessionEmail, getUser } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return sendJson(res, 200, { ok: true, user: null });
    }

    const email = await getSessionEmail(token);
    if (!email) {
      return sendJson(res, 200, { ok: true, user: null });
    }

    const user = await getUser(email);
    if (!user) {
      return sendJson(res, 200, { ok: true, user: null });
    }

    return sendJson(res, 200, { ok: true, user: { email: user.email } });
  } catch (err) {
    console.error("session lookup failed", err);
    return sendJson(res, 500, { error: err.message || "Erro interno ao validar sessao." });
  }
};
