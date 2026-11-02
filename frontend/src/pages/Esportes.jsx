import JogosSemana from '../components/JogosSemana.jsx';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import TabelaBrasileirao from '../components/TabelaBrasileirao.jsx';
import CardNoticia from '../components/CardNoticia.jsx';
import { api } from '../api.js';

export default function Esportes() {
  const tabelaRef = useRef(null);
  const noticiasRef = useRef(null);
  const jogosRef = useRef(null);
  const { hash, key } = useLocation();
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [limite, setLimite] = useState(5);
  const [tabelaPronta, setTabelaPronta] = useState(false);
  const [jogosProntos, setJogosProntos] = useState(false);
  const tabelaCarregada = useCallback(() => setTabelaPronta(true), []);
  const jogosCarregados = useCallback(() => setJogosProntos(true), []);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    api('/news').then((dados) => {
      if (ativo) setNoticias(dados.filter((noticia) => noticia.category?.trim().toLocaleLowerCase('pt-BR') === 'esportes'));
    }).catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [hash, key]);

  // Aguarda os blocos assíncronos para a âncora não mudar de posição.
  useLayoutEffect(() => {
    if (carregando || !tabelaPronta || !jogosProntos) return;
    const destino = { '#noticias': noticiasRef, '#brasileirao': tabelaRef, '#jogos': jogosRef }[hash];
    destino?.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [hash, key, carregando, tabelaPronta, jogosProntos]);

  const [principal, ...secundarias] = noticias.slice(0, 3);
  const demais = noticias.slice(3);

  return <Layout>
    <section className="intro">
      <p className="eyebrow">ESPORTES</p>
      <h1>O campeonato,<br /><em>ponto a ponto.</em></h1>
      <p>As notícias do esporte, a classificação do Brasileirão e os jogos da semana em um só lugar.</p>
    </section>
    <nav className="sports-section-nav" aria-label="Seções de esportes">
      <Link to="#noticias">Notícias</Link>
      <Link to="#brasileirao">Classificação</Link>
      <Link to="#jogos">Jogos</Link>
    </nav>
    <section id="noticias" ref={noticiasRef} className="sports-news noticias-principais" aria-labelledby="noticias-esportes-titulo" aria-busy={carregando}>
      <div className="section-heading">
        <h2 id="noticias-esportes-titulo">Notícias de esportes</h2>
        <span>Em destaque na redação</span>
      </div>
      {carregando && <p role="status">Carregando notícias de esportes…</p>}
      {erro && <div className="notice" role="alert"><p>{erro}</p><button className="secondary-button" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button></div>}
      {!carregando && !erro && <>
        {!principal && <p>Ainda não há notícias de esportes publicadas.</p>}
        {principal && <div className={`noticias-principais-grid${secundarias.length ? '' : ' sports-single-highlight'}`}>
          <div className="noticia-principal"><CardNoticia noticia={principal} destaque /></div>
          {secundarias.length > 0 && <div className="noticias-principais-lateral">
            {secundarias.map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} destaque />)}
          </div>}
        </div>}
        <div className="news-list sports-more-news" id="mais-noticias-esportes">
          {demais.slice(0, limite).map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} />)}
        </div>
        {demais.length > limite && <div className="news-load-more"><button className="button" aria-controls="mais-noticias-esportes" onClick={() => setLimite((valor) => valor + 5)}>Mais notícias de esportes</button></div>}
      </>}
    </section>
    <div id="brasileirao" ref={tabelaRef} className="brasileirao-anchor">
      <TabelaBrasileirao onReady={tabelaCarregada} />
    </div>
    <div id="jogos" ref={jogosRef} className="sports-games-anchor">
      <JogosSemana onReady={jogosCarregados} />
    </div>
  </Layout>;
}
