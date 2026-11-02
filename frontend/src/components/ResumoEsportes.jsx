import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function Clube({ team }) {
  return <span className="sports-club">
    {team.crest && <img className="sports-crest" src={team.crest} alt="" width="28" height="28" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
    <span>{team.name}</span>
  </span>;
}

function useSportsData(path) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    api(path).then((data) => { if (active) setState({ loading: false, data, error: '' }); })
      .catch((error) => { if (active) setState({ loading: false, data: null, error: error.message }); });
    return () => { active = false; };
  }, [path]);
  return state;
}

export default function ResumoEsportes() {
  const standings = useSportsData('/sports/brasileirao');
  const upcoming = useSportsData('/sports/brasileirao/proximo-jogo');
  const teams = [...(standings.data?.teams || [])].sort((a, b) => a.position - b.position).slice(0, 5);
  const match = upcoming.data?.match;
  return <>
    <div className="sports-summary">
      <section aria-labelledby="top-cinco">
        <h3 id="top-cinco">Brasileirão · Top 5</h3>
        {standings.loading && <p role="status">Carregando classificação…</p>}
        {standings.error && <p className="notice" role="alert">{standings.error}</p>}
        {standings.data && (teams.length ? <table className="sports-top-five">
          <thead><tr><th scope="col">Pos.</th><th scope="col">Clube</th><th scope="col">Pontos</th></tr></thead>
          <tbody>{teams.map((team) => <tr key={team.id}><td>{team.position}</td><th scope="row"><Clube team={team} /></th><td className="sports-points">{team.points}</td></tr>)}</tbody>
        </table> : <p>A classificação ainda não está disponível.</p>)}
      </section>
      <section className="sports-next-match" aria-labelledby="proximo-jogo">
        <h3 id="proximo-jogo">Próximo jogo agendado</h3>
        {upcoming.loading && <p role="status">Carregando próximo jogo…</p>}
        {upcoming.error && <p className="notice" role="alert">{upcoming.error}</p>}
        {upcoming.data && (match ? <div className="match-card">
          <p className="eyebrow">BRASILEIRÃO{match.matchday ? ` · RODADA ${match.matchday}` : ''}</p>
          <p className="sports-next-date">{new Date(match.utcDate).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long' })}</p>
          <div className="sports-next-teams"><Clube team={match.homeTeam} /><span className="sports-versus">×</span><Clube team={match.awayTeam} /></div>
          <p className="match-time">{match.status === 'TIMED' ? <><time dateTime={match.utcDate}>{new Date(match.utcDate).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</time> · Horário de Brasília</> : 'Horário a confirmar'}</p>
        </div> : <p>Nenhum próximo jogo agendado disponível nesta temporada.</p>)}
      </section>
    </div>
    <p className="sports-note">Dados de <a href="https://www.football-data.org/" target="_blank" rel="noreferrer">football-data.org</a> · Atualizações podem apresentar atraso.</p>
    <div className="news-load-more"><Link className="button" to="/esportes#brasileirao" aria-label="Exibir mais esportes">Exibir mais</Link></div>
  </>;
}
