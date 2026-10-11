import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

export default function NaoEncontrada() {
  return (
    <Layout>
      <section className="panel narrow">
        <p className="eyebrow">PÁGINA NÃO ENCONTRADA</p>
        <h1>Essa página saiu de circulação.</h1>
        <p>Confira as últimas publicações na página inicial.</p>
        <Link className="button" to="/">Voltar ao início</Link>
      </section>
    </Layout>
  );
}