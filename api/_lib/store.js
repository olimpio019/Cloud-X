const memory = {
  users: new Map(),
  sessions: new Map(),
};

function kvConfig() {
  // Primary env names
  let url = process.env.KV_REST_API_URL;
  let token = process.env.KV_REST_API_TOKEN;

  // Try common alternative env var names (helps if variables were set with different names)
  url = url || process.env.KV_URL || process.env.KV_API_URL || process.env.NEXT_PUBLIC_KV_REST_API_URL;
  token = token || process.env.KV_TOKEN || process.env.KV_API_TOKEN;

  if (!url || !token) {
    // Do not throw in production — prefer a clear warning and in-memory fallback so the app remains usable.
    const msg = "KV nao configurado. Variaveis esperadas: KV_REST_API_URL + KV_REST_API_TOKEN. Usando fallback em memoria.";
    if (process.env.VERCEL === "1") {
      console.warn(msg);
    } else {
      console.log(msg);
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
