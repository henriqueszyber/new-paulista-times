import { useEffect, useState } from 'react';
import { api } from '../../api.js';

// Compartilha apenas uma consulta em andamento. Cada bloco mantém seu próprio estado.
let consultaPendente;
function consultarNoticias() {
  if (!consultaPendente) {
    consultaPendente = api('/news')
      .then((dados) => dados.filter((noticia) => noticia.category?.trim().toLocaleLowerCase('pt-BR') === 'economia'))
      .finally(() => { consultaPendente = undefined; });
  }
  return consultaPendente;
}

export default function useNoticiasEconomia() {
  const [noticias, setNoticias] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    consultarNoticias()
      .then((dados) => { if (ativo) setNoticias(dados); })
      .catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  return { noticias, erro, carregando, tentarNovamente: () => setTentativa((valor) => valor + 1) };
}
