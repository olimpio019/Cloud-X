const {
  SESSION_COOKIE_NAME,
  parseCookies,
  makeClearSessionCookie,
  sendJson,
  methodNotAllowed,
} = require("../_lib/auth");
const { deleteSession } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
      await deleteSession(token);
    }

    res.setHeader("Set-Cookie", makeClearSessionCookie(req));
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    return sendJson(res, 500, { error: err.message || "Erro interno no logout." });
  }
};
