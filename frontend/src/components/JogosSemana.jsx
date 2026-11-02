import React, { useEffect, useLayoutEffect, useState } from 'react';
import { api } from '../api.js';

const statusLabels = { SCHEDULED: 'Horário a confirmar', TIMED: 'Agendado', IN_PLAY: 'Em andamento', PAUSED: 'Intervalo', FINISHED: 'Encerrado', POSTPONED: 'Adiado', SUSPENDED: 'Suspenso', CANCELLED: 'Cancelado', AWARDED: 'Resultado administrativo' };
const formatDate = (date) => new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
function Clube({ team }) {
  return <span className="sports-club">
    {team.crest && <img className="sports-crest" src={team.crest} alt="" width="28" height="28" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
    <span>{team.name}</span>
  </span>;
}

export default function JogosSemana({ onReady }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api('/sports/brasileirao/jogos')
      .then((value) => { if (active) setData(value); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  useLayoutEffect(() => {
    if (!loading) onReady?.();
  }, [loading, onReady]);

  const days = Object.groupBy(data?.matches || [], (match) => match.date);
  return <section className="weekly-matches" aria-labelledby="jogos-semana" aria-busy={loading}>
    <div className="section-heading">
      <div><p className="eyebrow">BRASILEIRÃO · SÉRIE A</p><h2 id="jogos-semana">Jogos da semana</h2></div>
      {data && <span>{formatDate(data.week.start)} a {formatDate(data.week.end)} · {data.week.end.slice(0, 4)}</span>}
    </div>
    <p className="sports-note">De segunda a domingo · Horários de Brasília</p>
    {loading && <p role="status">Carregando jogos da semana…</p>}
    {error && <div className="notice" role="alert"><p>{error}</p><button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button></div>}
    {!loading && !error && data && <>
      {!data.matches.length && <p>Nenhum jogo do Brasileirão previsto para esta semana.</p>}
      {data.matches.length > 0 && <>
      <p className="sports-note" id="kanban-help">Role para os lados para ver os outros dias.</p>
      <div className="matches-board" tabIndex={0} role="region" aria-label="Jogos da semana por dia" aria-describedby="kanban-help">
      {Object.entries(days).map(([date, matches]) => <div className="match-day" key={date}>
        <h3>{new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: 'long' })}</h3>
        <ul className="match-grid">{matches.map((match) => <li className="match-card" key={match.id}>
          <div className="match-meta"><span>{match.matchday ? `Rodada ${match.matchday}` : 'Série A'}</span><span>{statusLabels[match.status] || 'A confirmar'}</span></div>
          <div className="match-teams"><Clube team={match.homeTeam} /><strong>{Number.isInteger(match.score.home) ? match.score.home : '–'}</strong></div>
          <div className="match-teams"><Clube team={match.awayTeam} /><strong>{Number.isInteger(match.score.away) ? match.score.away : '–'}</strong></div>
          <p className="match-time">{['TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED'].includes(match.status) ? <time dateTime={match.utcDate}>{new Date(match.utcDate).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</time> : 'Horário a confirmar'}</p>
        </li>)}</ul>
      </div>)}
      </div>
      </>}
      <p className="sports-note">Consultado em {new Date(data.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (Brasília). Cache de 15 minutos; horários e resultados podem apresentar atraso. Recarregue a página para atualizar.</p>
    </>}
    <p className="sports-note">Dados de <a href="https://www.football-data.org/" target="_blank" rel="noreferrer">football-data.org ↗</a>.</p>
  </section>;
}
