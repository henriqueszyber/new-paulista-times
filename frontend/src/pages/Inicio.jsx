import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import CardNoticia from '../components/CardNoticia.jsx';
import { api } from '../api.js';

export default function Inicio() {
  const [noticias, setNoticias] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
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

  const botoes = [];
  for (let i = 0; i < categorias.length; i++) {
    const nome = categorias[i];
    botoes[botoes.length] = (
      <button key={nome} aria-pressed={categoria === nome} onClick={() => setCategoria(nome)}>
        {nome}
      </button>
    );
  }

  return (
    <Layout>
      <section className="intro">
        <p className="eyebrow">CIDADE, CULTURA E IDEIAS</p>
        <h1>Histórias de perto.<br /><em>Perspectivas que vão longe.</em></h1>
        <p>Um espaço para descobrir a cidade, acompanhar novas ideias e contar o que acontece ao nosso redor.</p>
      </section>

      <section aria-labelledby="ultimas-noticias">
        <div className="section-heading">
          <h2 id="ultimas-noticias">Últimas notícias</h2>
          <span>Da nossa redação para você</span>
        </div>
        <div className="filters" aria-label="Filtrar por categoria">{botoes}</div>
        {erro && <p className="notice" role="alert">{erro}</p>}
        {carregando && <p role="status">Carregando notícias…</p>}
        <div className="news-grid">{cards}</div>
        {!carregando && !erro && cards.length === 0 && <p>Nenhuma notícia nesta categoria.</p>}
      </section>
    </Layout>
  );
}