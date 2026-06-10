// CONFIGURAÇÃO DO GOOGLE SHEETS
// URL correta utilizando a sua planilha publicada em modo CSV público
const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e/pubhtml';

// Função principal que busca e processa as informações da cooperativa
async function atualizarDashboard() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na comunicação com o Google Sheets');
    
    const csvText = await response.text();
    const dados = extrairLinhasCsv(csvText);

    if (dados.length > 0) {
      // Pega estritamente a primeira linha de registros (Linha 2 da planilha)
      renderizarDadosNoHTML(dados[0]);
    }
  } catch (error) {
    console.error('Erro ao buscar dados agrícolas:', error);
  }
}

// Converte a string CSV em um array de objetos usando a primeira linha como chave
function extrairLinhasCsv(textoCsv) {
  const linhas = textoCsv.split('\n').map(linha => 
    linha.replace(/\r/g, '').split(',').map(celula => celula.replace(/^"|"$/g, '').trim())
  );
  
  const cabecalhos = linhas[0]; 
  const registros = [];

  for (let i = 1; i < linhas.length; i++) {
    if (linhas[i].length === cabecalhos.length && linhas[i].join('').trim() !== '') {
      const obj = {};
      cabecalhos.forEach((cabecalho, index) => {
        obj[cabecalho] = linhas[i][index];
      });
      registros.push(obj);
    }
  }
  return registros;
}

// Alimenta a interface com os dados dinâmicos mapeados por ID
function renderizarDadosNoHTML(dadosAtualizados)
