async function atualizarDados() {

  const resposta = await fetch('./dados.json');

  const dados = await resposta.json();

  document.getElementById('val-temp').textContent =
    dados.temperatura + '°C';

  document.getElementById('val-hum').textContent =
    dados.umidade + '%';

  document.getElementById('val-wind').textContent =
    dados.vento;

  document.getElementById('val-radiation').textContent =
    dados.radiacao + ' W/m²';
}

atualizarDados();

setInterval(atualizarDados, 60000);
