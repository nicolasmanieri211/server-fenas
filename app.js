// =====================================
// CONFIGURAÇÃO DA PLANILHA GOOGLE SHEETS
// =====================================

// ID da PUBLICAÇÃO WEB da planilha (o trecho que começa com 2PACX...)
// Você encontra isso em: Arquivo > Compartilhar > Publicar na web > CSV
const SHEET_ID = "2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e";

// Nome da aba que contém os dados GERAIS
const SHEET_NAME = "Página1";

// Nome da aba que contém os dados dos PONTOS DE COLETA
const SHEET_PONTOS = "Pontos";

// URL pública do CSV do Google Sheets
// O parâmetro "t=" evita que o navegador fique com cache dos dados antigos
function buildSheetURL(sheetName) {
  const nome = sheetName || SHEET_NAME;
  const cacheBuster = Date.now();
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&sheet=${encodeURIComponent(nome)}&t=${cacheBuster}`;
}

// =====================================
// MAPEAMENTO DAS COLUNAS DA PLANILHA GERAL
// =====================================
const COLUNAS = {
  temperatura:          "temperatura",
  temp_min:             "temp_min",
  temp_max:             "temp_max",
  umidade:              "umidade",
  vento:                "vento",
  chuva_semana:         "chuva_semana",
  risco_doenca:         "risco_doenca",
  radiacao:             "radiacao",
  agua_solo:            "agua_solo",
  disponibilidade_agua: "disponibilidade_agua",
  deficit:              "deficit",
  excesso:              "excesso",
  condicao_solo:        "condicao_solo",
  vento_info:           "vento_info",
  status_solo:          "status_solo"
};

// =====================================
// MAPEAMENTO DAS COLUNAS DA ABA PONTOS
// =====================================
const COLUNAS_PONTOS = {
  id:                   "id",
  temperatura:          "temperatura",
  temp_min:             "temp_min",
  temp_max:             "temp_max",
  umidade:              "umidade",
  vento:                "vento",
  chuva_semana:         "chuva_semana",
  risco_doenca:         "risco_doenca",
  radiacao:             "radiacao",
  agua_solo:            "agua_solo",
  disponibilidade_agua: "disponibilidade_agua",
  deficit:              "deficit",
  excesso:              "excesso",
  condicao_solo:        "condicao_solo",
  status_solo:          "status_solo"
};

// =====================================
// PONTOS DE COLETA
// =====================================
// Aqui ficam apenas nome, local e coordenadas (x/y) sobre o mapa.
// Os dados meteorológicos de cada ponto são carregados da aba "Pontos".
const PONTOS_COLETA = [
  { id: 1,  nome: "Ponto 01", local: "Centro",           x: 37, y: 28 },
  { id: 2,  nome: "Ponto 02", local: "Zona Norte",       x: 53, y: 32 },
  { id: 3,  nome: "Ponto 03", local: "Zona Sul",         x: 67, y: 38 },
  { id: 4,  nome: "Ponto 04", local: "Leste",            x: 79, y: 42 },
  { id: 5,  nome: "Ponto 05", local: "Oeste",            x: 94, y: 49 },
  { id: 6,  nome: "Ponto 06", local: "Noroeste",         x: 20, y: 37 },
  { id: 7,  nome: "Ponto 07", local: "Sudoeste",         x: 39, y: 41 },
  { id: 8,  nome: "Ponto 08", local: "Nordeste",         x: 59, y: 48 },
  { id: 9,  nome: "Ponto 09", local: "Sudeste",          x: 73, y: 53 },
  { id: 10, nome: "Ponto 10", local: "Distrito A",       x: 85, y: 59 },
  { id: 11, nome: "Ponto 11", local: "Distrito B",       x: 15, y: 51 },
  { id: 12, nome: "Ponto 12", local: "Distrito C",       x: 39, y: 52 },
  { id: 13, nome: "Ponto 13", local: "Rio do Norte",     x: 56, y: 60 },
  { id: 14, nome: "Ponto 14", local: "Rio do Sul",       x: 70, y: 68 },
  { id: 15, nome: "Ponto 15", local: "Área Rural Leste", x: 25, y: 60 },
  { id: 16, nome: "Ponto 16", local: "Área Rural Oeste", x: 44, y: 68 }
];

// Cache dos dados dos pontos vindos da planilha
let dadosPontos = {};
let pontoSelecionado = null;

// =====================================
// RENDERIZAR PONTOS NO MAPA
// =====================================
function renderizarPontosNoMapa() {
  const overlay = document.getElementById("map-points-overlay");
  if (!overlay) return;

  overlay.innerHTML = "";

  PONTOS_COLETA.forEach(ponto => {
    const el = document.createElement("div");
    el.className = "map-point";
    el.dataset.id = ponto.id;
    el.style.left = `${ponto.x}%`;
    el.style.top = `${ponto.y}%`;
    el.title = `${ponto.nome} - ${ponto.local}`;

    const label = document.createElement("span");
    label.className = "map-point-label";
    label.innerText = ponto.id;
    el.appendChild(label);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModalPonto(ponto);
    });

    overlay.appendChild(el);
  });
}

function marcarPontoAtivo(id) {
  document.querySelectorAll(".map-point").forEach(p => {
    p.classList.toggle("active", Number(p.dataset.id) === id);
  });
}

// =====================================
// MONTAR DADOS COMPLETOS DO PONTO
// =====================================
function montarDadosPonto(pontoBase) {
  const dadosPlanilha = dadosPontos[pontoBase.id] || {};

  return {
    id: pontoBase.id,
    nome: pontoBase.nome,
    local: pontoBase.local,
    x: pontoBase.x,
    y: pontoBase.y,
    temperatura:          lerNumero(dadosPlanilha, COLUNAS_PONTOS.temperatura, 24.8),
    temp_min:             lerNumero(dadosPlanilha, COLUNAS_PONTOS.temp_min, 18.2),
    temp_max:             lerNumero(dadosPlanilha, COLUNAS_PONTOS.temp_max, 30.5),
    umidade:              lerNumero(dadosPlanilha, COLUNAS_PONTOS.umidade, 68),
    vento:                lerTexto(dadosPlanilha, COLUNAS_PONTOS.vento, "13 km/h NO"),
    chuva_semana:         lerNumero(dadosPlanilha, COLUNAS_PONTOS.chuva_semana, 12.4),
    radiacao:             lerNumero(dadosPlanilha, COLUNAS_PONTOS.radiacao, 850),
    agua_solo:            lerNumero(dadosPlanilha, COLUNAS_PONTOS.agua_solo, 92),
    disponibilidade_agua: lerNumero(dadosPlanilha, COLUNAS_PONTOS.disponibilidade_agua, 80),
    deficit:              lerNumero(dadosPlanilha, COLUNAS_PONTOS.deficit, 0),
    excesso:              lerNumero(dadosPlanilha, COLUNAS_PONTOS.excesso, 15),
    risco_doenca:         lerTexto(dadosPlanilha, COLUNAS_PONTOS.risco_doenca, "Ferrugem: Alta"),
    condicao_solo:        lerTexto(dadosPlanilha, COLUNAS_PONTOS.condicao_solo, "Adequada"),
    status_solo:          lerTexto(dadosPlanilha, COLUNAS_PONTOS.status_solo, "Condição: Adequada")
  };
}

// =====================================
// MODAL DO PONTO DE COLETA
// =====================================
function abrirModalPonto(pontoBase) {
  const ponto = montarDadosPonto(pontoBase);
  pontoSelecionado = ponto;

  atualizarTexto("modal-point-name", ponto.nome);
  atualizarTexto("modal-point-location", ponto.local);
  atualizarTexto("modal-temp",       `${ponto.temperatura}°C`);
  atualizarTexto("modal-hum",        `${ponto.umidade}%`);
  atualizarTexto("modal-wind",       ponto.vento);
  atualizarTexto("modal-rain",       `${ponto.chuva_semana} mm`);
  atualizarTexto("modal-radiation",  `${ponto.radiacao} W/m²`);
  atualizarTexto("modal-soil",       `${ponto.agua_solo}%`);
  atualizarTexto("modal-disease",    ponto.risco_doenca);
  atualizarTexto("modal-status",     ponto.status_solo || ponto.condicao_solo);

  const modal = document.getElementById("point-modal");
  if (modal) modal.classList.add("open");
}

function fecharModalPonto() {
  const modal = document.getElementById("point-modal");
  if (modal) modal.classList.remove("open");
}

function usarDadosDoPonto() {
  if (!pontoSelecionado) return;
  aplicarDadosPonto(pontoSelecionado);
  fecharModalPonto();
  marcarPontoAtivo(pontoSelecionado.id);
}

// =====================================
// APLICAR DADOS DO PONTO AO DASHBOARD
// =====================================
function aplicarDadosPonto(ponto) {
  atualizarTexto("val-temp",        `${ponto.temperatura}°C`);
  atualizarTexto("val-temp-min",    `${ponto.temp_min}°C`);
  atualizarTexto("val-temp-max",    `${ponto.temp_max}°C`);
  atualizarTexto("val-hum",         `${ponto.umidade}%`);
  atualizarTexto("val-wind",        ponto.vento);
  atualizarTexto("val-rain-week",   `${ponto.chuva_semana} mm`);
  atualizarTexto("val-disease",     ponto.risco_doenca);
  atualizarTexto("val-radiation",   `${ponto.radiacao} W/m²`);

  const solo = Math.max(0, Math.min(100, ponto.agua_solo || 0));
  const disponibilidade = Math.max(0, Math.min(100, ponto.disponibilidade_agua || solo));

  atualizarTexto("val-soil",        `${solo}%`);
  atualizarTexto("val-water-pct",   `${disponibilidade}%`);
  atualizarBarra("bar-water",       disponibilidade);
  atualizarGauge(solo);

  atualizarTexto("soil-status",     ponto.status_solo || ponto.condicao_solo || "Condição: --");
  atualizarTexto("val-deficit",     `${ponto.deficit || 0} mm`);
  atualizarTexto("val-excess",      `${ponto.excesso || 0} mm`);
  atualizarTexto("val-wind-info",   `Dados do ${ponto.nome} - ${ponto.local}.`);
}

// =====================================
// BUSCAR DADOS DA PLANILHA
// =====================================
async function atualizarDashboard() {
  setStatus("sync", "Lendo planilha...");

  try {
    // Lê os dados gerais e os dados dos pontos em paralelo
    const [dadosGerais, dadosDosPontos] = await Promise.all([
      buscarCSV(SHEET_NAME),
      buscarCSV(SHEET_PONTOS)
    ]);

    // Se nenhum ponto foi selecionado, usa os dados gerais da planilha
    if (dadosGerais.length && !pontoSelecionado) {
      atualizarTela(dadosGerais[0]);
    }

    // Atualiza o cache dos pontos
    if (dadosDosPontos.length) {
      dadosPontos = {};
      dadosDosPontos.forEach(linha => {
        const id = Number(linha.id || linha[COLUNAS_PONTOS.id]);
        if (id) dadosPontos[id] = linha;
      });
    }

    setStatus("ok", `Atualizado ${formatarHora(new Date())}`);

  } catch (erro) {
    console.error("Erro ao atualizar dashboard:", erro);
    setStatus("error", "Planilha indisponível");
  }
}

async function buscarCSV(sheetName) {
  const url = buildSheetURL(sheetName);
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: não foi possível acessar a aba ${sheetName}.`);
  }

  const csv = await response.text();
  return converterCSV(csv);
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
// ATUALIZAR HTML (DADOS GERAIS DA PLANILHA)
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

  // Água do solo (gauge circular)
  const solo = Math.max(0, Math.min(100, lerNumero(d, COLUNAS.agua_solo, 0)));
  atualizarTexto("val-soil",        `${solo}%`);
  atualizarGauge(solo);

  // Disponibilidade de água (barra do balanço hídrico)
  const disponibilidade = Math.max(0, Math.min(100, lerNumero(d, COLUNAS.disponibilidade_agua, solo)));
  atualizarTexto("val-water-pct",   `${disponibilidade}%`);
  atualizarBarra("bar-water",       disponibilidade);

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
// EVENTOS DO MODAL
// =====================================
const modalClose = document.getElementById("point-modal-close");
if (modalClose) {
  modalClose.addEventListener("click", fecharModalPonto);
}

const modalBackdrop = document.querySelector(".point-modal-backdrop");
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", fecharModalPonto);
}

const modalUseData = document.getElementById("modal-use-data");
if (modalUseData) {
  modalUseData.addEventListener("click", usarDadosDoPonto);
}

// =====================================
// INICIALIZAÇÃO
// =====================================
window.addEventListener("DOMContentLoaded", () => {
  renderizarPontosNoMapa();
  atualizarDashboard();
});

// =====================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================
// Atualiza a cada 60 segundos. A planilha do Google Sheets pode demorar
// alguns minutos para refletir alterações quando publicada na web.
setInterval(atualizarDashboard, 60000);
