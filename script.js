const form = document.getElementById("unlockForm");
const operatorIdInput = document.getElementById("operatorId");
const masterKeyInput = document.getElementById("masterKey");
const toggleKeyBtn = document.getElementById("toggleKey");
const unlockBtn = document.getElementById("unlockBtn");
const btnText = unlockBtn.querySelector(".cx-btn-text");
const progressBar = document.getElementById("progressBar").querySelector(".cx-progress-inner");
const consoleLog = document.getElementById("consoleLog");
const statusText = document.getElementById("statusText");
const nodesValue = document.getElementById("nodesValue");
const latencyValue = document.getElementById("latencyValue");
const cipherValue = document.getElementById("cipherValue");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authTabLogin = document.getElementById("authTabLogin");
const authTabRegister = document.getElementById("authTabRegister");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const sessionInfo = document.getElementById("sessionInfo");
const sessionEmail = document.getElementById("sessionEmail");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// cria wrapper interno para scroll do console
const consoleInner = document.createElement("div");
consoleInner.className = "cx-console-body-inner";
consoleLog.appendChild(consoleInner);

function nowTime() {
  const d = new Date();
  return d.toISOString().split("T")[1].split(".")[0];
}

function pushLog(message, type = "info") {
  const line = document.createElement("div");
  line.className = "cx-log-line";

  const prefix = document.createElement("span");
  prefix.className = "cx-log-prefix";
  prefix.textContent = `[${nowTime()}]`;

  const content = document.createElement("span");
  content.className = "cx-log-content";

  if (type === "tag") {
    content.innerHTML = `<span class="cx-log-tag">${message}</span>`;
  } else if (type === "success") {
    content.innerHTML = `<span class="cx-log-success">${message}</span>`;
  } else if (type === "error") {
    content.innerHTML = `<span class="cx-log-error">${message}</span>`;
  } else {
    content.textContent = message;
  }

  line.appendChild(prefix);
  line.appendChild(content);
  consoleInner.appendChild(line);
  consoleInner.scrollTop = consoleInner.scrollHeight;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_err) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error || "Falha na comunicacao com o servidor.";
    throw new Error(message);
  }

  return payload;
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  authTabLogin.classList.toggle("is-active", isLogin);
  authTabRegister.classList.toggle("is-active", !isLogin);
  loginForm.classList.toggle("is-hidden", !isLogin);
  registerForm.classList.toggle("is-hidden", isLogin);
}

function setButtonState(state) {
  const isAuthenticated = Boolean(currentUser);
  const defaultLabel = btnText.dataset.default;
  const workingLabel = btnText.dataset.working;
  const successLabel = btnText.dataset.success;

  if (state === "idle") {
    unlockBtn.disabled = !isAuthenticated;
    btnText.textContent = defaultLabel;
  } else if (state === "working") {
    unlockBtn.disabled = true;
    btnText.textContent = workingLabel;
  } else if (state === "success") {
    unlockBtn.disabled = true;
    btnText.textContent = successLabel;
  } else if (state === "error") {
    unlockBtn.disabled = !isAuthenticated;
    btnText.textContent = defaultLabel;
  }
}

function updateAuthUI() {
  const authenticated = Boolean(currentUser);
  unlockBtn.disabled = !authenticated;
  masterKeyInput.disabled = !authenticated;
  operatorIdInput.disabled = !authenticated;

  if (authenticated) {
    sessionInfo.classList.remove("is-hidden");
    sessionEmail.textContent = currentUser.email;
    loginForm.classList.add("is-hidden");
    registerForm.classList.add("is-hidden");
    authTabLogin.classList.add("is-hidden");
    authTabRegister.classList.add("is-hidden");
    statusText.textContent = "AUTENTICADO. PRONTO PARA DESBLOQUEIO";
  } else {
    sessionInfo.classList.add("is-hidden");
    authTabLogin.classList.remove("is-hidden");
    authTabRegister.classList.remove("is-hidden");
    setAuthMode("login");
    statusText.textContent = "AGUARDANDO AUTENTICACAO";
    setButtonState("idle");
  }
}

let metricsInterval;

function startMetrics() {
  if (metricsInterval) clearInterval(metricsInterval);

  metricsInterval = setInterval(() => {
    const nodes = 16 + Math.floor(Math.random() * 64);
    const latency = 2 + Math.floor(Math.random() * 18);
    const ciphers = ["AES-X // CH4-9", "NEBULA-LOCK v3", "Q-RAND STREAM", "PHOTON-SEAL 7"];
    const cipher = ciphers[Math.floor(Math.random() * ciphers.length)];

    nodesValue.textContent = nodes.toString();
    latencyValue.textContent = `${latency} ms`;
    cipherValue.textContent = cipher;
  }, 700);
}

startMetrics();

toggleKeyBtn.addEventListener("click", () => {
  const isPassword = masterKeyInput.type === "password";
  masterKeyInput.type = isPassword ? "text" : "password";
});

function simulateUnlock(operatorId, masterKey) {
  let progress = 0;
  let step = 0;

  setButtonState("working");
  statusText.textContent = "INICIANDO PROTOCOLO DE DESBLOQUEIO";
  pushLog(`OPERADOR @${operatorId} conectado ao cluster CLOUD X.`);
  pushLog("Carregando modulos de seguranca...", "tag");

  const sequence = [
    () => {
      pushLog("Handshake quantico estabelecido com no primario.");
      statusText.textContent = "VALIDANDO ASSINATURA DIGITAL";
    },
    () => {
      pushLog(`Hash da chave mestra: ${fakeHash(masterKey)}`);
      pushLog("Executando varredura anti-tamper no canal.");
      statusText.textContent = "VERIFICANDO INTEGRIDADE DO CANAL";
    },
    () => {
      pushLog("Derivando chaves de sessao multi-nivel...");
      pushLog("Aplicando blindagem de ruido em camadas RGB.");
      statusText.textContent = "DERIVANDO CHAVES DE SESSAO";
    },
    () => {
      pushLog("Sincronizando relogios atomicos distribuidos...");
      pushLog("NOS ONLINE confirmados. Latencia dentro do limite.");
      statusText.textContent = "SINCRONIZANDO CLUSTER CLOUD X";
    },
    () => {
      pushLog("Desbloqueando matrizes de dados protegidas...", "tag");
      pushLog("Criando tunel seguro entre paineis de controle.");
      statusText.textContent = "DESBLOQUEANDO CLOUD X";
    },
    () => {
      pushLog("Todos os checkpoints concluidos.");
      pushLog("CLOUD X pronto para comandos avancados.", "success");
      statusText.textContent = "CLOUD X DESBLOQUEADO";
      setButtonState("success");
    },
  ];

  const timer = setInterval(() => {
    progress += Math.random() * 8;
    if (progress > 100) progress = 100;
    progressBar.style.width = `${progress}%`;

    const stepThreshold = (step + 1) * (100 / sequence.length);
    if (progress >= stepThreshold && step < sequence.length) {
      sequence[step]();
      step++;
    }

    if (progress >= 100 && step >= sequence.length) {
      clearInterval(timer);
      setTimeout(() => {
        window.location.href = "iphone.html";
      }, 900);
    }
  }, 260);
}

function fakeHash(input) {
  const chars = "ABCDEF0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `0x${out}::${input.length.toString(16).padStart(2, "0")}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    pushLog("Usuario nao autenticado. Faca login para continuar.", "error");
    statusText.textContent = "LOGIN OBRIGATORIO";
    setButtonState("error");
    return;
  }

  const operatorId = operatorIdInput.value.trim() || "N3ON-OPS";
  const masterKey = masterKeyInput.value.trim();

  if (!masterKey) {
    pushLog("Chave mestra vazia. Acesso bloqueado.", "error");
    statusText.textContent = "CHAVE INVALIDA";
    setButtonState("error");
    return;
  }

  try {
    const verify = await apiRequest("/api/auth/verify-master-key", {
      method: "POST",
      body: JSON.stringify({ password: masterKey }),
    });

    if (!verify.valid) {
      pushLog("Chave mestra invalida para este usuario.", "error");
      statusText.textContent = "CHAVE INVALIDA";
      setButtonState("error");
      return;
    }
  } catch (err) {
    pushLog(err.message, "error");
    statusText.textContent = "FALHA DE VALIDACAO";
    setButtonState("error");
    return;
  }

  // Em vez de executar o simulador de desbloqueio aqui, redirecionamos o usuário para a
  // página de pagamento local. A página de pagamento irá coletar dados e então
  // redirecionar para o gateway externo.
  const params = new URLSearchParams({ operator: operatorId, email: currentUser?.email || "" });
  window.location.href = `payment.html?${params.toString()}`;
});

authTabLogin.addEventListener("click", () => setAuthMode("login"));
authTabRegister.addEventListener("click", () => setAuthMode("register"));

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = registerEmailInput.value.trim().toLowerCase();
  const password = registerPasswordInput.value.trim();

  if (!email || !password) {
    pushLog("Preencha e-mail e chave mestra para cadastro.", "error");
    return;
  }

  if (password.length < 6) {
    pushLog("A chave mestra deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  try {
    const payload = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    currentUser = payload.user;
    pushLog(`Cadastro concluido para ${payload.user.email}.`, "success");
    registerForm.reset();
    updateAuthUI();
  } catch (err) {
    pushLog(err.message, "error");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginEmailInput.value.trim().toLowerCase();
  const password = loginPasswordInput.value.trim();

  try {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    currentUser = payload.user;
    pushLog(`Login autorizado para ${payload.user.email}.`, "success");
    loginForm.reset();
    updateAuthUI();
  } catch (err) {
    pushLog(err.message, "error");
    statusText.textContent = "FALHA NA AUTENTICACAO";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
  } catch (_err) {
    // Mantem fluxo de logout no cliente mesmo se endpoint falhar.
  }
  currentUser = null;
  pushLog("Sessao encerrada.", "tag");
  updateAuthUI();
});

async function bootstrapSession() {
  statusText.textContent = "VERIFICANDO SESSAO";
  setButtonState("idle");
  try {
    const payload = await apiRequest("/api/auth/me", { method: "GET" });
    currentUser = payload.user || null;
    if (currentUser) {
      pushLog(`Sessao ativa para ${currentUser.email}.`, "tag");
    }
  } catch (_err) {
    currentUser = null;
  }
  updateAuthUI();
}

bootstrapSession();
