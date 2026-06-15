// =====================================
// CONFIGURAÇÃO DA PLANILHA
// =====================================

// COLE AQUI O ID DA SUA PLANILHA
const SHEET_ID = "2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e";

// Nome da aba
const SHEET_NAME = "Página1";

// URL CSV
const URL =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// =====================================
// BUSCAR DADOS
// =====================================

async function atualizarDashboard() {

  try {

    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Não foi possível acessar a planilha.");
    }

    const csv = await response.text();

    const dados = converterCSV(csv);

    if (!dados.length) return;

    atualizarTela(dados[0]);

  }

  catch (erro) {

    console.error("Erro:", erro);

  }

}


// =====================================
// CONVERTER CSV
// =====================================

function converterCSV(csv) {

  const linhas = csv.trim().split("\n");

  const cabecalho = linhas[0]
  .split(",")
  .map(c => c.replace(/"/g,"").trim());

  const registros = [];

  for(let i=1;i<linhas.length;i++){

    const valores = linhas[i]
    .split(",")
    .map(c => c.replace(/"/g,"").trim());

    const obj = {};

    cabecalho.forEach((campo,index)=>{

      obj[campo]=valores[index];

    });

    registros.push(obj);

  }

  return registros;

}


// =====================================
// ATUALIZAR HTML
// =====================================

function atualizarTela(d){

  atualizar("val-temp",`${d.temperatura || "--"}°C`);

  atualizar("val-temp-min",`${d.temp_min || "--"}°C`);

  atualizar("val-temp-max",`${d.temp_max || "--"}°C`);

  atualizar("val-hum",`${d.umidade || "--"}%`);

  atualizar("val-wind",d.vento || "--");

  atualizar("val-rain-week",`${d.chuva_semana || "--"} mm`);

  atualizar("val-disease",d.risco_doenca || "--");



  // Água do solo

  const solo = Number(d.agua_solo || 0);

  atualizar("val-soil",`${solo}%`);



  // Gauge circular

  const gauge = document.getElementById("gauge-circle");

  if(gauge){

    const raio = gauge.r.baseVal.value;

    const circ = 2 * Math.PI * raio;

    gauge.style.strokeDasharray = circ;

    gauge.style.strokeDashoffset = circ - (solo/100)*circ;

  }



  // Barra de água

  atualizar("val-water-pct",`${solo}%`);



  const barra = document.getElementById("bar-water");

  if(barra){

    barra.style.width=`${solo}%`;

  }

}


// =====================================
// FUNÇÃO AUXILIAR
// =====================================

function atualizar(id,valor){

  const el = document.getElementById(id);

  if(el){

    el.innerText=valor;

  }

}


// =====================================
// BOTÃO SINCRONIZAR
// =====================================

const btn = document.getElementById("btn-sync");

if(btn){

  btn.addEventListener("click",()=>{

    btn.classList.add("spinning");

    atualizarDashboard();

    setTimeout(()=>{

      btn.classList.remove("spinning");

    },800);

  });

}


// =====================================
// INICIALIZAÇÃO
// =====================================

window.addEventListener("DOMContentLoaded",()=>{

  atualizarDashboard();

});


// =====================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================

// 5 minutos

setInterval(atualizarDashboard,300000);
