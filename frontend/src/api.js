// fetch + async/await, como nos trabalhos API e frontend.
export async function api(caminho, opcoes = {}) {
  const configuracao = {
    method: opcoes.method || 'GET',
    headers: {},
  };

  if (opcoes.token) {
    configuracao.headers.Authorization = 'Bearer ' + opcoes.token;
  }

  if (opcoes.body instanceof FormData) {
    // O navegador define o Content-Type e o separador das partes do arquivo.
    configuracao.body = opcoes.body;
  } else if (opcoes.body) {
    configuracao.headers['Content-Type'] = 'application/json';
    configuracao.body = JSON.stringify(opcoes.body);
  }

  let resposta;
  try {
    resposta = await fetch('/api' + caminho, configuracao);
  } catch {
    throw new Error('Não foi possível conectar. Confira se o backend está ligado.');
  }

  if (resposta.status === 204) {
    return null;
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    throw new Error('Não foi possível ler a resposta. Confira se o backend está ligado.');
  }
  if (!resposta.ok) {
    throw new Error(dados.message || 'Não foi possível concluir a solicitação.');
  }

  return dados;
}
