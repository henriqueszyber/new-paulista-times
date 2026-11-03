import MaioresAltas from '../components/economia/MaioresAltas.jsx';
import CotacaoDolar from '../components/economia/CotacaoDolar.jsx';
import Criptomoedas from '../components/economia/Criptomoedas.jsx';
import HistoricoDolar from '../components/economia/HistoricoDolar.jsx';
import React, { useLayoutEffect } from 'react';
import Layout from '../components/Layout.jsx';
import NoticiasPrincipaisEconomia from '../components/economia/NoticiasPrincipaisEconomia.jsx';
import UltimasNoticiasEconomia from '../components/economia/UltimasNoticiasEconomia.jsx';

export default function Economia() {
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return <Layout>
    <div className="economy-page">
      <NoticiasPrincipaisEconomia />
      <div className="market-cards">
        <MaioresAltas />
        <CotacaoDolar />
        <Criptomoedas />
      </div>
      <UltimasNoticiasEconomia />
      <section className="market-panel" aria-labelledby="mercado-titulo">
        <div className="section-heading">
          <div><p className="eyebrow">ECONOMIA EM NÚMEROS</p><h2 id="mercado-titulo">Panorama do mercado</h2></div>
          <span>Cotações reais · Horários de Brasília</span>
        </div>
        <HistoricoDolar />
        <p className="market-source">Atualização por consulta com cache: bolsa até 30 min, dólar até 5 min, criptos até 10 min e histórico até 6 h. Recarregue a página para consultar novamente.</p>
      </section>
    </div>
  </Layout>;
}
