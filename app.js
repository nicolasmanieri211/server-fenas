// =====================================
// CONFIGURAÇÃO DA PLANILHA GOOGLE SHEETS
// =====================================

// ID da PUBLICAÇÃO WEB da planilha (o trecho que começa com 2PACX...)
// Você encontra isso em: Arquivo > Compartilhar > Publicar na web > CSV
const SHEET_ID = "2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e";

// Nome da aba que contém os dados
const SHEET_NAME = "Página1";

// URL pública do CSV do Google Sheets
// O parâmetro "t=" evita que o navegador fique com cache dos dados antigos
function buildSheetURL() {
  const cacheBuster = Date.now();
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&sheet=${encodeURIComponent(SHEET_NAME)}&t=${cacheBuster}`;
}

// =====================================
// MAPEAMENTO DAS COLUNAS DA PLANILHA
// =====================================
// A planilha deve ter uma linha de cabeçalho com esses nomes.
// A primeira linha de dados (após o cabeçalho) é lida.
const COLUNAS = {
  temperatura:      "temperatura",
  temp_min:         "temp_min",
  temp_max:         "temp_max",
  umidade:          "umidade",
  vento:            "vento",
  chuva_semana:     "chuva_semana",
  risco_doenca:     "risco_doenca",
  radiacao:         "radiacao",
  agua_solo:        "agua_solo",
  deficit:          "deficit",
  excesso:          "excesso",
  condicao_solo:    "condicao_solo",
  vento_info:       "vento_info",
  status_solo:      "status_solo"
};

// =====================================
// BUSCAR DADOS
// =====================================

async function atualizarDashboard() {
  setStatus("sync", "Lendo planilha...");

  try {
    const url = buildSheetURL();
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: não foi possível acessar a planilha.`);
    }

    const csv = await response.text();
    const dados = converterCSV(csv);

    if (!dados.length) {
      throw new Error("Planilha vazia ou sem dados na primeira linha.");
    }

    atualizarTela(dados[0]);
    setStatus("ok", `Atualizado ${formatarHora(new Date())}`);

  } catch (erro) {
    console.error("Erro ao atualizar dashboard:", erro);
    setStatus("error", "Planilha indisponível");
  }
}

// =====================================
// CONVERTER CSV (robusto, respeita aspas)
// =====================================

function converterCSV(csv) {
  const linhas = csv.trim().split(/\r?\n/);
  if (linhas.length < 2) return [];

  const cabecalho = parsearLinhaCSV(linhas[0]).map(c => normalizarChave(c));
  const registros = [];

  for (let i = 1; i < linhas.length; i++) {
    const valores = parsearLinhaCSV(linhas[i]);
    if (valores.length === 1 && valores[0] === "") continue; // pula linhas vazias

    const obj = {};
    cabecalho.forEach((campo, index) => {
      obj[campo] = (valores[index] || "").trim();
    });
    registros.push(obj);
  }

  return registros;
}

function parsearLinhaCSV(linha) {
  const valores = [];
  let valor = "";
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    const prox = linha[i + 1];

    if (char === '"') {
      if (dentroAspas && prox === '"') {
        valor += '"';
        i++; // pula aspas dupla escapada
      } else {
        dentroAspas = !dentroAspas;
      }
    } else if (char === ',' && !dentroAspas) {
      valores.push(valor);
      valor = "";
    } else {
      valor += char;
    }
  }

  valores.push(valor); // último valor
  return valores;
}

function normalizarChave(texto) {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

// =====================================
// ATUALIZAR HTML
// =====================================

function atualizarTela(d) {
  // Valores principais
  atualizarTexto("val-temp",        `${lerNumero(d, COLUNAS.temperatura, "--")}°C`);
  atualizarTexto("val-temp-min",    `${lerNumero(d, COLUNAS.temp_min, "--")}°C`);
  atualizarTexto("val-temp-max",    `${lerNumero(d, COLUNAS.temp_max, "--")}°C`);
  atualizarTexto("val-hum",         `${lerNumero(d, COLUNAS.umidade, "--")}%`);
  atualizarTexto("val-wind",        lerTexto(d, COLUNAS.vento, "--"));
  atualizarTexto("val-rain-week",   `${lerNumero(d, COLUNAS.chuva_semana, "--")} mm`);
  atualizarTexto("val-disease",     lerTexto(d, COLUNAS.risco_doenca, "--"));
  atualizarTexto("val-radiation",   `${lerNumero(d, COLUNAS.radiacao, "--")} W/m²`);
  atualizarTexto("val-wind-info",   lerTexto(d, COLUNAS.vento_info, "Dados baseados na velocidade do vento atual."));

  // Água do solo (usada no gauge e na barra de disponibilidade)
  const solo = Math.max(0, Math.min(100, lerNumero(d, COLUNAS.agua_solo, 0)));
  atualizarTexto("val-soil",        `${solo}%`);
  atualizarTexto("val-water-pct",   `${solo}%`);
  atualizarBarra("bar-water",       solo);
  atualizarGauge(solo);

  // Status/condição do solo
  const condicao = lerTexto(d, COLUNAS.condicao_solo, "Condição: --");
  const statusSolo = lerTexto(d, COLUNAS.status_solo, condicao);
  atualizarTexto("soil-status", statusSolo || condicao);

  // Balanço hídrico
  atualizarTexto("val-deficit",     `${lerNumero(d, COLUNAS.deficit, "0")} mm`);
  atualizarTexto("val-excess",      `${lerNumero(d, COLUNAS.excesso, "0")} mm`);
}

// =====================================
// FUNÇÕES AUXILIARES DE ATUALIZAÇÃO
// =====================================

function atualizarTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.innerText = valor;
}

function atualizarBarra(id, porcentagem) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${porcentagem}%`;
}

function atualizarGauge(porcentagem) {
  const gauge = document.getElementById("gauge-circle");
  if (!gauge) return;

  const raio = gauge.r.baseVal.value;
  const circ = 2 * Math.PI * raio;

  // Garante que o gauge comece do zero visível
  gauge.style.strokeDasharray = circ;
  gauge.style.strokeDashoffset = circ - (porcentagem / 100) * circ;

  // Cor do gauge muda conforme a umidade
  if (porcentagem < 30) {
    gauge.style.stroke = "var(--error)";
  } else if (porcentagem < 60) {
    gauge.style.stroke = "var(--tertiary)";
  } else {
    gauge.style.stroke = "var(--primary)";
  }
}

function lerTexto(d, chave, padrao) {
  const valor = d && d[chave];
  return (valor !== undefined && valor !== "" && valor !== null) ? valor : padrao;
}

function lerNumero(d, chave, padrao) {
  const valor = d && d[chave];
  if (valor === undefined || valor === "" || valor === null) return padrao;
  const numero = parseFloat(String(valor).replace(",", "."));
  return isNaN(numero) ? padrao : numero;
}

// =====================================
// STATUS DE CONEXÃO NA TOPBAR
// =====================================

function setStatus(tipo, texto) {
  const statusEl = document.getElementById("sheet-status");
  const textoEl = document.getElementById("sheet-status-text");
  if (!statusEl || !textoEl) return;

  statusEl.classList.remove("ok", "error", "sync");
  statusEl.classList.add(tipo);
  textoEl.innerText = texto;
}

function formatarHora(data) {
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// =====================================
// BOTÃO SINCRONIZAR
// =====================================

const btn = document.getElementById("btn-sync");
if (btn) {
  btn.addEventListener("click", () => {
    btn.classList.add("spinning");
    atualizarDashboard().finally(() => {
      setTimeout(() => btn.classList.remove("spinning"), 700);
    });
  });
}

// =====================================
// INICIALIZAÇÃO
// =====================================

window.addEventListener("DOMContentLoaded", () => {
  atualizarDashboard();
});

// =====================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================
// Atualiza a cada 60 segundos. A planilha do Google Sheets pode demorar
// alguns minutos para refletir alterações quando publicada na web.
setInterval(atualizarDashboard, 60000);
