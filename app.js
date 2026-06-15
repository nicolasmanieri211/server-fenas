// =========================================
// GOOGLE SHEETS
// =========================================

const SHEET_ID = '14PcJnhdht8cT9zRv4hubWl_0gHXp__VVBMmu6f9nuCU';

const GID = '0';

const URL =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

const INTERVALO = 300000; // 5 minutos


// =========================================
// BUSCAR DADOS
// =========================================

async function atualizarDashboard() {

  try {

    const resposta = await fetch(URL);

    if (!resposta.ok) {

      throw new Error('Não foi possível acessar a planilha.');

    }

    const csv = await resposta.text();

    const dados = converterCSV(csv);

    if (!dados.length) return;

    atualizarTela(dados[0]);

    console.log('Dados atualizados.');

  }

  catch (erro) {

    console.error('Erro:', erro);

  }

}


// =========================================
// CONVERTER CSV
// =========================================

function converterCSV(csv) {

  const linhas = csv.trim().split(/\r?\n/);

  const cabecalhos = linhas[0]
    .split(',')
    .map(c => c.replace(/"/g,'').trim());

  const registros = [];

  for(let i=1;i<linhas.length;i++){

    const valores = linhas[i]
      .split(',')
      .map(c => c.replace(/"/g,'').trim());

    const obj = {};

    cabecalhos.forEach((campo,index)=>{

      obj[campo] = valores[index];

    });

    registros.push(obj);

  }

  return registros;

}


// =========================================
// ATUALIZAR ELEMENTO
// =========================================

function atualizar(id, valor){

  const elemento = document.getElementById(id);

  if(elemento){

    elemento.innerText = valor;

  }

}


// =========================================
// ATUALIZAR DASHBOARD
// =========================================

function atualizarTela(d){

  atualizar('val-temp',`${d.temperatura}°C`);

  atualizar('val-temp-min',`${d.temp_min}°C`);

  atualizar('val-temp-max',`${d.temp_max}°C`);

  atualizar('val-hum',`${d.umidade}%`);

  atualizar('val-wind',d.vento);

  atualizar('val-rain-week',`${d.chuva_semana} mm`);

  atualizar('val-disease',d.risco_doenca);


  // Umidade do solo

  const solo = Number(d.agua_solo);

  atualizar('val-soil',`${solo}%`);

  atualizar('val-water-pct',`${solo}%`);


  // Barra verde

  const barra = document.getElementById('bar-water');

  if(barra){

    barra.style.width = `${solo}%`;

  }


  // Gauge circular

  const gauge = document.getElementById('gauge-circle');

  if(gauge){

    const raio = gauge.r.baseVal.value;

    const circ = 2 * Math.PI * raio;

    gauge.style.strokeDasharray = circ;

    gauge.style.strokeDashoffset =
      circ - (solo / 100) * circ;

  }

}


// =========================================
// BOTÃO SINCRONIZAR
// =========================================

const botao = document.getElementById('btn-sync');

if(botao){

  botao.addEventListener('click',()=>{

    botao.classList.add('spinning');

    atualizarDashboard();

    setTimeout(()=>{

      botao.classList.remove('spinning');

    },800);

  });

}


// =========================================
// INICIAR
// =========================================

window.addEventListener('DOMContentLoaded',()=>{

  atualizarDashboard();

});


// =========================================
// ATUALIZAÇÃO AUTOMÁTICA
// =========================================

setInterval(atualizarDashboard, INTERVALO);
