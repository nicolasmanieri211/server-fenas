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
// PONTOS DE COLETA
// =====================================
// Cada ponto tem posição x/y em percentual sobre a imagem do mapa
// e seus próprios dados meteorológicos.
// Você pode trocar esses valores ou carregar de uma segunda aba da planilha.
const PONTOS_COLETA = [
  { id: 1,  nome: "Ponto 01", local: "Centro",          x: 37, y: 28, temperatura: 24.8, temp_min: 18.2, temp_max: 30.5, umidade: 68, vento: "13 km/h NO", chuva_semana: 12.4, radiacao: 850, agua_solo: 92, disponibilidade_agua: 80, deficit: 0, excesso: 15, risco_doenca: "Ferrugem: Alta", condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 2,  nome: "Ponto 02", local: "Zona Norte",      x: 53, y: 32, temperatura: 23.5, temp_min: 17.0, temp_max: 29.0, umidade: 72, vento: "10 km/h N",  chuva_semana: 15.2, radiacao: 780, agua_solo: 88, disponibilidade_agua: 85, deficit: 0, excesso: 22, risco_doenca: "Ferrugem: Média", condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 3,  nome: "Ponto 03", local: "Zona Sul",        x: 67, y: 38, temperatura: 25.2, temp_min: 19.5, temp_max: 31.2, umidade: 65, vento: "15 km/h SO", chuva_semana:  8.7, radiacao: 890, agua_solo: 75, disponibilidade_agua: 70, deficit: 3, excesso:  8, risco_doenca: "Ferrugem: Baixa", condicao_solo: "Moderada", status_solo: "Condição: Moderada" },
  { id: 4,  nome: "Ponto 04", local: "Leste",           x: 79, y: 42, temperatura: 26.0, temp_min: 20.1, temp_max: 32.4, umidade: 60, vento: "18 km/h L",  chuva_semana:  5.3, radiacao: 920, agua_solo: 58, disponibilidade_agua: 55, deficit: 8, excesso:  0, risco_doenca: "Mancha: Média",   condicao_solo: "Seca",     status_solo: "Condição: Seca" },
  { id: 5,  nome: "Ponto 05", local: "Oeste",           x: 94, y: 49, temperatura: 24.0, temp_min: 17.8, temp_max: 29.8, umidade: 70, vento: "12 km/h O",  chuva_semana: 14.0, radiacao: 820, agua_solo: 85, disponibilidade_agua: 82, deficit: 0, excesso: 18, risco_doenca: "Ferrugem: Alta",  condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 6,  nome: "Ponto 06", local: "Noroeste",        x: 20, y: 37, temperatura: 22.8, temp_min: 16.5, temp_max: 28.2, umidade: 75, vento: " 8 km/h NO", chuva_semana: 18.5, radiacao: 740, agua_solo: 90, disponibilidade_agua: 88, deficit: 0, excesso: 28, risco_doenca: "Ferrugem: Média", condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 7,  nome: "Ponto 07", local: "Sudoeste",        x: 39, y: 41, temperatura: 25.5, temp_min: 19.8, temp_max: 31.5, umidade: 62, vento: "16 km/h SO", chuva_semana:  6.9, radiacao: 905, agua_solo: 68, disponibilidade_agua: 60, deficit: 5, excesso:  2, risco_doenca: "Mancha: Alta",    condicao_solo: "Moderada", status_solo: "Condição: Moderada" },
  { id: 8,  nome: "Ponto 08", local: "Nordeste",        x: 59, y: 48, temperatura: 23.9, temp_min: 17.2, temp_max: 29.6, umidade: 71, vento: "11 km/h NE", chuva_semana: 13.8, radiacao: 800, agua_solo: 87, disponibilidade_agua: 84, deficit: 0, excesso: 20, risco_doenca: "Ferrugem: Média", condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 9,  nome: "Ponto 09", local: "Sudeste",         x: 73, y: 53, temperatura: 26.4, temp_min: 20.5, temp_max: 33.0, umidade: 58, vento: "19 km/h SE", chuva_semana:  4.2, radiacao: 940, agua_solo: 52, disponibilidade_agua: 48, deficit: 12, excesso: 0, risco_doenca: "Mancha: Alta",    condicao_solo: "Seca",     status_solo: "Condição: Seca" },
  { id: 10, nome: "Ponto 10", local: "Distrito A",      x: 85, y: 59, temperatura: 24.6, temp_min: 18.5, temp_max: 30.2, umidade: 66, vento: "14 km/h SE", chuva_semana: 10.1, radiacao: 865, agua_solo: 78, disponibilidade_agua: 75, deficit: 2, excesso:  6, risco_doenca: "Ferrugem: Baixa", condicao_solo: "Moderada", status_solo: "Condição: Moderada" },
  { id: 11, nome: "Ponto 11", local: "Distrito B",      x: 15, y: 51, temperatura: 25.0, temp_min: 19.0, temp_max: 30.8, umidade: 64, vento: "15 km/h O",  chuva_semana:  9.3, radiacao: 880, agua_solo: 72, disponibilidade_agua: 68, deficit: 4, excesso:  4, risco_doenca: "Mancha: Média",   condicao_solo: "Moderada", status_solo: "Condição: Moderada" },
  { id: 12, nome: "Ponto 12", local: "Distrito C",      x: 39, y: 52, temperatura: 26.8, temp_min: 21.0, temp_max: 33.5, umidade: 55, vento: "20 km/h S",  chuva_semana:  3.5, radiacao: 960, agua_solo: 45, disponibilidade_agua: 40, deficit: 15, excesso: 0, risco_doenca: "Mancha: Alta",    condicao_solo: "Seca",     status_solo: "Condição: Seca" },
  { id: 13, nome: "Ponto 13", local: "Rio do Norte",    x: 56, y: 60, temperatura: 23.2, temp_min: 16.8, temp_max: 28.5, umidade: 74, vento: " 9 km/h N",  chuva_semana: 16.7, radiacao: 760, agua_solo: 89, disponibilidade_agua: 86, deficit: 0, excesso: 25, risco_doenca: "Ferrugem: Média", condicao_solo: "Adequada", status_solo: "Condição: Adequada" },
  { id: 14, nome: "Ponto 14", local: "Rio do Sul",      x: 70, y: 68, temperatura: 25.7, temp_min: 19.6, temp_max: 31.8, umidade: 61, vento: "17 km/h SO", chuva_semana:  7.4, radiacao: 895, agua_solo: 66, disponibilidade_agua: 62, deficit: 6, excesso:  3, risco_doenca: "Mancha: Média",   condicao_solo: "Moderada", status_solo: "Condição: Moderada" },
  { id: 15, nome: "Ponto 15", local: "Área Rural Leste",x: 25, y: 60, temperatura: 27.0, temp_min: 21.5, temp_max: 34.0, umidade: 52, vento: "22 km/h L",  chuva_semana:  2.8, radiacao: 980, agua_solo: 40, disponibilidade_agua: 35, deficit: 18, excesso: 0, risco_doenca: "Mancha: Alta",    condicao_solo: "Seca",     status_solo: "Condição: Seca" },
  { id: 16, nome: "Ponto 16", local: "Área Rural Oeste",x: 44, y: 68, temperatura: 24.3, temp_min: 18.0, temp_max: 30.0, umidade: 69, vento: "13 km/h O",  chuva_semana: 11.5, radiacao: 835, agua_solo: 82, disponibilidade_agua: 78, deficit: 1, excesso: 12, risco_doenca: "Ferrugem: Baixa", condicao_solo: "Adequada", status_solo: "Condição: Adequada" }
];

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
// MODAL DO PONTO DE COLETA
// =====================================
function abrirModalPonto(ponto) {
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

    // Se nenhum ponto foi selecionado, usa os dados gerais da planilha
    if (!pontoSelecionado) {
      atualizarTela(dados[0]);
    }

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
