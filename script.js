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

function setButtonState(state) {
  const defaultLabel = btnText.dataset.default;
  const workingLabel = btnText.dataset.working;
  const successLabel = btnText.dataset.success;

  if (state === "idle") {
    unlockBtn.disabled = false;
    btnText.textContent = defaultLabel;
  } else if (state === "working") {
    unlockBtn.disabled = true;
    btnText.textContent = workingLabel;
  } else if (state === "success") {
    unlockBtn.disabled = true;
    btnText.textContent = successLabel;
  } else if (state === "error") {
    unlockBtn.disabled = false;
    btnText.textContent = defaultLabel;
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
  pushLog("Carregando módulos de segurança...", "tag");

  const sequence = [
    () => {
      pushLog("Handshake quântico estabelecido com nó primário.");
      statusText.textContent = "VALIDANDO ASSINATURA DIGITAL";
    },
    () => {
      pushLog(`Hash da chave mestra: ${fakeHash(masterKey)}`);
      pushLog("Executando varredura anti-tamper no canal.");
      statusText.textContent = "VERIFICANDO INTEGRIDADE DO CANAL";
    },
    () => {
      pushLog("Derivando chaves de sessão multi-nível...");
      pushLog("Aplicando blindagem de ruído em camadas RGB.");
      statusText.textContent = "DERIVANDO CHAVES DE SESSÃO";
    },
    () => {
      pushLog("Sincronizando relógios atômicos distribuídos...");
      pushLog("NÓS ONLINE confirmados. Latência dentro do limite.");
      statusText.textContent = "SINCRONIZANDO CLUSTER CLOUD X";
    },
    () => {
      pushLog("Desbloqueando matrizes de dados protegidas...", "tag");
      pushLog("Criando túnel seguro entre painéis de controle.");
      statusText.textContent = "DESBLOQUEANDO CLOUD X";
    },
    () => {
      pushLog("Todos os checkpoints concluídos.");
      pushLog("CLOUD X pronto para comandos avançados.", "success");
      statusText.textContent = "CLOUD X DESBLOQUEADO";
      setButtonState("success");
    },
  ];

  const timer = setInterval(() => {
    progress += Math.random() * 8;
    if (progress > 100) progress = 100;
    progressBar.style.width = `${progress}%`;

    // garante que todos os passos da sequência sejam executados,
    // mesmo quando a barra "pula" direto para 100%
    const stepThreshold = (step + 1) * (100 / sequence.length);
    if (progress >= stepThreshold && step < sequence.length) {
      sequence[step]();
      step++;
    }

    if (progress >= 100 && step >= sequence.length) {
      clearInterval(timer);
      // após concluir o desbloqueio, redireciona para a tela do iPhone
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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const operatorId = operatorIdInput.value.trim() || "N3ON-OPS";
  const masterKey = masterKeyInput.value.trim();

  if (!masterKey) {
    pushLog("Chave mestra vazia. Acesso bloqueado.", "error");
    statusText.textContent = "CHAVE INVÁLIDA";
    setButtonState("error");
    return;
  }

  progressBar.style.width = "0%";
  consoleInner.innerHTML = "";

  simulateUnlock(operatorId, masterKey);
});

