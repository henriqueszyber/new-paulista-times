import React, { useEffect, useLayoutEffect, useState } from 'react';
import { api } from '../api.js';

export default function TabelaBrasileirao({ headingLevel = 2, onReady }) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    api('/sports/brasileirao')
      .then((resultado) => { if (ativo) setDados(resultado); })
      .catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  // Só avisa após o DOM conter a tabela (ou a mensagem de erro).
  useLayoutEffect(() => {
    if (!carregando) onReady?.();
  }, [carregando, onReady]);

  return (
    <section className="sports-table" aria-labelledby="titulo-brasileirao" aria-busy={carregando}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">FUTEBOL · SÉRIE A</p>
          <Heading id="titulo-brasileirao">Brasileirão {dados?.season}</Heading>
        </div>
        <span>Classificação geral</span>
      </div>
      {carregando && <p role="status">Carregando classificação…</p>}
      {erro && <div className="notice" role="alert"><p>{erro}</p><button className="secondary-button" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</button></div>}
      {!carregando && !erro && dados && (dados.teams.length ? <>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Classificação do Brasileirão; role horizontalmente para ver todas as estatísticas">
          <table>
            <caption>Campeonato Brasileiro Série A — temporada {dados.season}</caption>
            <thead><tr>
              <th scope="col">Pos.</th><th scope="col">Clube</th>
              {['Pts', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((label) => <th scope="col" key={label}>{label}</th>)}
            </tr></thead>
            <tbody>{dados.teams.map((time) => <tr key={time.id}>
              <td>{time.position}</td><th scope="row"><span className="sports-club">
                {time.crest && <img key={time.crest} className="sports-crest" src={time.crest} alt="" width="28" height="28" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
                <span>{time.name}</span>
              </span></th>
              <td className="sports-points">{time.points}</td><td>{time.playedGames}</td><td>{time.won}</td><td>{time.draw}</td><td>{time.lost}</td><td>{time.goalsFor}</td><td>{time.goalsAgainst}</td><td>{time.goalDifference}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="sports-note">Pts: pontos · J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols pró · GC: gols contra · SG: saldo de gols.</p>
        <p className="sports-note">Consultado em {new Date(dados.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Brasília). Cache de 15 minutos; os dados podem apresentar atraso.</p>
      </> : <p role="status">A classificação desta temporada ainda não está disponível.</p>)}
      <p className="sports-note">Dados reais fornecidos por <a href="https://www.football-data.org/" target="_blank" rel="noreferrer">football-data.org ↗</a>.</p>
    </section>
  );
}
