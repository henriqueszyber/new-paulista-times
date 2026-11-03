import React, { useEffect, useLayoutEffect, useState } from 'react';
import NoticiasPrincipais from '../components/noticias-principais.jsx';
import LocaisInteresse from '../components/sao-paulo/LocaisInteresse.jsx';
import Layout from '../components/Layout.jsx';
import CardNoticia from '../components/CardNoticia.jsx';
import { api } from '../api.js';

const ehSaoPaulo = noticia => noticia.category?.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === 'sao paulo';

export default function SaoPaulo() {
  const porPagina = 7;
  const [noticias, setNoticias] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [limite, setLimite] = useState(porPagina);

  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    api('/news').then((dados) => {
      if (ativo) setNoticias(dados.filter((noticia) => ehSaoPaulo(noticia)));
    }).catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  return <Layout>
    <div aria-busy={carregando}>
      {carregando && <p role="status">Carregando notícias…</p>}
      {erro && <div className="notice" role="alert"><p>{erro}</p><button className="secondary-button" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button></div>}
      {!carregando && !erro && <>
        <NoticiasPrincipais noticias={noticias} titulo="Notícias de São Paulo" />
        {!noticias.length && <p>Ainda não há notícias publicadas de São Paulo.</p>}
      </>}
    </div>
    <LocaisInteresse />
    {!carregando && !erro && noticias.length > 4 && <section aria-labelledby="editoria-noticias">
      <div className="section-heading"><h2 id="editoria-noticias">Mais notícias da cidade</h2><span>Da nossa redação para você</span></div>
      <div className="news-list" id="lista-editoria">{noticias.slice(4, 4 + limite).map(noticia => <CardNoticia key={noticia.id} noticia={noticia} />)}</div>
      {noticias.length > 4 + limite && <div className="news-load-more"><button className="button" aria-controls="lista-editoria" onClick={() => setLimite(valor => valor + porPagina)}>Exibir mais</button></div>}
    </section>}
  </Layout>;
}
