const memory = {
  users: new Map(),
  sessions: new Map(),
};

function kvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (process.env.VERCEL === "1") {
      throw new Error("KV nao configurado. Defina KV_REST_API_URL e KV_REST_API_TOKEN.");
    }
    return null;
  }
  return { url: url.replace(/\/+$/, ""), token };
}

async function kvRequest(command, parts = [], query = "") {
  const cfg = kvConfig();
  if (!cfg) return null;

  const encoded = parts.map((part) => encodeURIComponent(String(part)));
  const endpoint = `${cfg.url}/${command}${encoded.length ? `/${encoded.join("/")}` : ""}${query}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
  });

  let data = null;
  let rawBody = "";

  try {
    rawBody = await response.text();
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch (_err) {
    data = null;
  }

  if (!response.ok) {
    const details =
      data?.error ||
      data?.message ||
      rawBody ||
      `status ${response.status}`;
    throw new Error(`Falha ao acessar o armazenamento KV: ${details}`);
  }

  if (!data || typeof data !== "object" || !("result" in data)) {
    throw new Error("Resposta invalida do armazenamento KV.");
  }

  return data.result;
}

function parseStoredJson(result, entityName) {
  if (!result) return null;
  if (typeof result === "object") return result;

  try {
    return JSON.parse(result);
  } catch (_err) {
    throw new Error(`Registro ${entityName} invalido no armazenamento.`);
  }
}

function userKey(email) {
  return `user:${email}`;
}

function sessionKey(token) {
  return `session:${token}`;
}

async function getUser(email) {
  const cfg = kvConfig();
  if (!cfg) {
    return memory.users.get(userKey(email)) || null;
  }

  const result = await kvRequest("get", [userKey(email)]);
  return parseStoredJson(result, "de usuario");
}

async function putUser(email, user) {
  const cfg = kvConfig();
  if (!cfg) {
    memory.users.set(userKey(email), user);
    return;
  }

  await kvRequest("set", [userKey(email), JSON.stringify(user)]);
}

async function putSession(token, email, ttlSeconds) {
  const cfg = kvConfig();
  if (!cfg) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memory.sessions.set(sessionKey(token), { email, expiresAt });
    return;
  }

  await kvRequest("set", [sessionKey(token), email], `?EX=${ttlSeconds}`);
}

async function getSessionEmail(token) {
  const cfg = kvConfig();
  if (!cfg) {
    const session = memory.sessions.get(sessionKey(token));
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      memory.sessions.delete(sessionKey(token));
      return null;
    }
    return session.email;
  }

  const result = await kvRequest("get", [sessionKey(token)]);
  return result || null;
}

async function deleteSession(token) {
  const cfg = kvConfig();
  if (!cfg) {
    memory.sessions.delete(sessionKey(token));
    return;
  }
  await kvRequest("del", [sessionKey(token)]);
}

module.exports = {
  getUser,
  putUser,
  putSession,
  getSessionEmail,
  deleteSession,
};
