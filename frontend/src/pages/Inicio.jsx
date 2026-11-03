import { Link } from 'react-router-dom';
import CotacaoDolar from '../components/economia/CotacaoDolar.jsx';
import MaioresAltas from '../components/economia/MaioresAltas.jsx';
import ResumoEsportes from '../components/ResumoEsportes.jsx';
import LocaisInteresse from '../components/sao-paulo/LocaisInteresse.jsx';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import CardNoticia from '../components/CardNoticia.jsx';
import NoticiasPrincipais from '../components/noticias-principais.jsx';
import { api } from '../api.js';

export default function Inicio() {
  const [noticias, setNoticias] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const [limite, setLimite] = useState(5);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarNoticias() {
      try {
        const dados = await api('/news');
        setNoticias(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarNoticias();
  }, []);

  // Listas montadas com for e arrays, como nas aulas de JavaScript.
  const categorias = ['Todas'];
  const cards = [];
  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    let categoriaEncontrada = false;
    for (let j = 0; j < categorias.length; j++) {
      if (categorias[j] === noticia.category) {
        categoriaEncontrada = true;
      }
    }

    if (!categoriaEncontrada) {
      categorias[categorias.length] = noticia.category;
    }

    if (categoria === 'Todas' || noticia.category === categoria) {
      cards[cards.length] = <CardNoticia key={noticia.id} noticia={noticia} />;
    }
  }

  const noticiasEsportes = noticias.filter((noticia) => noticia.category?.trim().toLocaleLowerCase('pt-BR') === 'esportes');
  const noticiasEconomia = noticias.filter((noticia) => noticia.category?.trim().toLocaleLowerCase('pt-BR') === 'economia');

  const botoes = [];
  for (let i = 0; i < categorias.length; i++) {
    const nome = categorias[i];
    botoes[botoes.length] = (
      <button key={nome} aria-pressed={categoria === nome} onClick={() => {
        setCategoria(nome);
        setLimite(7);
      }}>
        {nome}
      </button>
    );
  }

  return (
    <Layout>
      <NoticiasPrincipais noticias={noticias} />
      <section aria-labelledby="ultimas-noticias">
        <div className="section-heading">
          <h2 id="ultimas-noticias">Últimas notícias</h2>
          <span>Da nossa redação para você</span>
        </div>
        <div className="filters" aria-label="Filtrar por categoria">{botoes}</div>
        {erro && <p className="notice" role="alert">{erro}</p>}
        {carregando && <p role="status">Carregando notícias…</p>}
        <div className="news-list" id="lista-ultimas-noticias">{cards.slice(0, limite)}</div>
        {cards.length > limite && (
          <div className="news-load-more">
            <button className="button" aria-controls="lista-ultimas-noticias" onClick={() => setLimite((atual) => atual + 7)}>
              Exibir mais
            </button>
          </div>
        )}
        {!carregando && !erro && cards.length === 0 && <p>Nenhuma notícia nesta categoria.</p>}
      </section>
      <section className="home-section" aria-labelledby="esportes">
        <div className="section-heading">
          <h2 id="esportes">Esportes</h2>
          <span>O futebol dentro e fora de campo</span>
        </div>
        <div className="home-sports-layout">
          <div className="home-sports-news">
            {carregando && <p role="status">Carregando notícias de esportes…</p>}
            {erro && <p className="notice" role="alert">Não foi possível carregar as notícias de esportes.</p>}
            <div className="news-list" id="lista-esportes-inicio">
              {noticiasEsportes.slice(0, 5).map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} />)}
            </div>
            {!carregando && !erro && noticiasEsportes.length === 0 && <p>Ainda não há notícias de esportes publicadas.</p>}
          </div>
          <div className="home-sports-sidebar">
            <ResumoEsportes />
          </div>
        </div>
        <div className="news-load-more">
          <Link className="button" to="/esportes" aria-label="Exibir mais esportes">Exibir mais</Link>
        </div>
      </section>
      <section className="home-section" aria-labelledby="economia">
        <div className="section-heading">
          <h2 id="economia">Economia</h2>
          <span>Negócios, mercados e o seu dia a dia</span>
        </div>
        <div className="home-economy-layout">
          <div className="home-economy-news">
            {carregando && <p role="status">Carregando notícias de economia…</p>}
            {erro && <p className="notice" role="alert">Não foi possível carregar as notícias de economia.</p>}
            <div className="news-list" id="lista-economia-inicio">
              {noticiasEconomia.slice(0, 5).map((noticia) => <CardNoticia key={noticia.id} noticia={noticia} />)}
            </div>
            {!carregando && !erro && noticiasEconomia.length === 0 && <p>Ainda não há notícias de economia publicadas.</p>}
          </div>
          <div className="home-economy-market">
            <MaioresAltas />
            <CotacaoDolar />
          </div>
        </div>
        <div className="news-load-more">
          <Link className="button" to="/economia" aria-label="Exibir mais economia">Exibir mais</Link>
        </div>
      </section>
      <div className="home-section">
        <LocaisInteresse />
        <div className="news-load-more">
          <Link className="button" to="/sao-paulo" aria-label="Exibir mais sobre São Paulo">Exibir mais</Link>
        </div>
      </div>
    </Layout>
  );
}
