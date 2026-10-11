// Objeto compartilhado pelos módulos. Não salva dados no navegador.
// Ao recarregar a página, o objeto volta ao estado inicial e exige novo login.
export const sessao = {
  token: '',
  user: null,
};