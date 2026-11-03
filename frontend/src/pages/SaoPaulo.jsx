import React, { useEffect, useLayoutEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import CardNoticia from '../components/CardNoticia.jsx';
import { api } from '../api.js';

const categorias = ['são paulo', 'sao paulo', 'cidade'];

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
      if (ativo) setNoticias(dados.filter((noticia) => categorias.includes(noticia.category?.trim().toLocaleLowerCase('pt-BR'))));
    }).catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  return <Layout>
    <section className="intro">
      <p className="eyebrow">São Paulo</p>
      <h1>A cidade que a gente vive.</h1>
      <p>Os bairros, as pessoas e as transformações de São Paulo.</p>
    </section>
    <section aria-labelledby="editoria-noticias" aria-busy={carregando}>
      <div className="section-heading"><h2 id="editoria-noticias">Notícias de São Paulo</h2><span>Da nossa redação para você</span></div>
      {carregando && <p role="status">Carregando notícias…</p>}
      {erro && <div className="notice" role="alert"><p>{erro}</p><button className="secondary-button" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button></div>}
      {!carregando && !erro && <>
        <div className="news-list" id="lista-editoria">{noticias.slice(0, limite).map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} />)}</div>
        {!noticias.length && <p>Ainda não há notícias publicadas nesta seção.</p>}
        {noticias.length > limite && <div className="news-load-more"><button className="button" aria-controls="lista-editoria" onClick={() => setLimite((valor) => valor + porPagina)}>Exibir mais</button></div>}
      </>}
    </section>
  </Layout>;
}
