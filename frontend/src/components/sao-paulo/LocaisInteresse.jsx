import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { api } from '../../api.js';
import FiltrosLocais from './FiltrosLocais.jsx';
import BuscaLocal from './BuscaLocal.jsx';
import { categoriasLocais, filtrarLocais } from './filtrarLocais.js';
import MapaLocais from './MapaLocais.jsx';

const vazio = { name: '', description: '', category: 'Outros', address: '', latitude: '', longitude: '', googlePlaceId: '' };
export default function LocaisInteresse() {
  const [locais, setLocais] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [trocarLocal, setTrocarLocal] = useState(false);
  const nomeInput = useRef(null);
  const form = useRef(null);
  const retorno = useRef(null);
  const [dados, setDados] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');
  const button = useRef(null);
  useEffect(() => {
    let ativo = true;
    setCarregando(true); setErro('');
    api('/places').then(items => { if (ativo) setLocais(items); })
      .catch(error => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);
  useEffect(() => {
    if (aberto) {
      form.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (editando) nomeInput.current?.focus();
    }
  }, [aberto, editando]);
  function abrirEdicao(local, trigger) {
    retorno.current = trigger; setEditando(local.id); setDados({ ...vazio, ...local });
    setTrocarLocal(false); setErroForm(''); setSucesso(''); setAberto(true); setSelecionado(local.id);
  }
  function fechar() { setAberto(false); setEditando(null); setTrocarLocal(false); setDados(vazio); setErroForm('');
    if (retorno.current?.isConnected) retorno.current.focus(); else button.current?.focus();
  }
  function atualizar(event) { setDados(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function salvar(event) {
    event.preventDefault();
    if (!dados.googlePlaceId && (!editando || trocarLocal)) { setErroForm('Busque e selecione um local nas sugestões do Google.'); return; }
    setSalvando(true); setErroForm('');
    try {
      const local = await api(editando ? `/places/${encodeURIComponent(editando)}` : '/places', { method: editando ? 'PUT' : 'POST',
        body: { ...dados, latitude: Number(dados.latitude), longitude: Number(dados.longitude) } });
      setLocais(current => editando ? current.map(item => item.id === local.id ? local : item) : [local, ...current]); setSelecionado(local.id);
      setBusca(''); setCategoria('');
      setSucesso(`${local.name} foi ${editando ? 'atualizado' : 'adicionado'}.`); fechar();
    } catch (error) { setErroForm(error.message); }
    finally { setSalvando(false); }
  }
  const categorias = useMemo(() => [...new Set([...categoriasLocais, ...locais.map(local => local.category || 'Outros')])], [locais]);
  const filtrados = useMemo(() => filtrarLocais(locais, busca, categoria), [locais, busca, categoria]);
  const selecionadoVisivel = filtrados.some(local => local.id === selecionado) ? selecionado : null;
  const lat = Number(dados.latitude); const lng = Number(dados.longitude);
  const posicao = useMemo(() => dados.latitude !== '' && dados.longitude !== '' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null, [dados.latitude, dados.longitude, lat, lng]);
  return <section className="sp-places" aria-labelledby="sp-places-title">
    <div className="section-heading">
      <h2 id="sp-places-title">Explore São Paulo</h2>
      <button ref={button} type="button" className="sp-add-place" aria-expanded={aberto} aria-controls="sp-place-form" disabled={salvando} onClick={() => { retorno.current = button.current; setEditando(null); setTrocarLocal(false); setDados(vazio); setErroForm(''); setAberto(true); setSucesso(''); }}>Adicionar novo local</button>
    </div>
    <div className="sp-places-grid">
      <MapaLocais locais={filtrados} selecionado={selecionadoVisivel} onSelecionar={setSelecionado} cadastrando={aberto} posicao={posicao} />
      <div className="sp-places-sidebar">
        <FiltrosLocais busca={busca} categoria={categoria} categorias={categorias}
          onBusca={value => { setBusca(value); setSelecionado(null); }}
          onCategoria={value => { setCategoria(value); setSelecionado(null); }}
          onLimpar={() => { setBusca(''); setCategoria(''); setSelecionado(null); }} />
        {aberto && <form ref={form} key={editando || 'novo'} id="sp-place-form" className="sp-place-form" onSubmit={salvar}>
          <fieldset disabled={salvando}><legend>{editando ? 'Editar local' : 'Novo local em São Paulo'}</legend>
            {editando && !trocarLocal && <><p>{dados.address}</p><button type="button" className="text-button" onClick={() => setTrocarLocal(true)}>Alterar lugar no mapa</button></>}
            {(!editando || trocarLocal) && <BuscaLocal disabled={salvando} onSelecionar={local => {
              setErroForm('');
              setDados(current => local ? { ...current, ...local } : { ...current, googlePlaceId: '', latitude: '', longitude: '', address: '' });
            }} />}
            <label htmlFor="place-name">Nome</label><input ref={nomeInput} id="place-name" name="name" required maxLength={120} value={dados.name} onChange={atualizar} />
            <label htmlFor="place-category">Categoria</label>
            <select id="place-category" name="category" required value={dados.category} onChange={atualizar}>
              {categorias.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <label htmlFor="place-description">Descrição curta</label><textarea id="place-description" name="description" required maxLength={500} value={dados.description} onChange={atualizar} />
            <label htmlFor="place-maps-link">Link do Google Maps</label>
            <input id="place-maps-link" type="url" readOnly value={dados.googlePlaceId ? `https://www.google.com/maps/search/?api=1&query=${dados.latitude},${dados.longitude}&query_place_id=${encodeURIComponent(dados.googlePlaceId)}` : ''} placeholder="Preenchido ao selecionar um local" />
            {dados.googlePlaceId && <><p>{dados.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${dados.latitude},${dados.longitude}&query_place_id=${encodeURIComponent(dados.googlePlaceId)}`} target="_blank" rel="noreferrer">Abrir local no Google Maps ↗</a></>}
            {erroForm && <p role="alert" className="notice">{erroForm}</p>}
            <div className="sp-form-actions"><button className="button" type="submit" disabled={(!dados.googlePlaceId && (!editando || trocarLocal)) || salvando}>{salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Salvar local'}</button><button className="secondary-button" type="button" onClick={fechar}>Cancelar</button></div>
          </fieldset>
        </form>}

        {!carregando && !erro && locais.length > 0 && <p className="sp-filter-count" role="status">{filtrados.length} de {locais.length} locais</p>}
        {sucesso && <p role="status">{sucesso}</p>}
        {carregando && <p role="status">Carregando locais…</p>}
        {erro && <div role="alert"><p>{erro}</p><button className="secondary-button" onClick={() => setTentativa(value => value + 1)}>Tentar novamente</button></div>}
        {!carregando && !erro && !locais.length && <p>Ainda não há locais cadastrados. Em breve, novos lugares para explorar.</p>}
        {!carregando && !erro && locais.length > 0 && !filtrados.length && <p>Nenhum local encontrado. Tente outra busca ou categoria.</p>}
        <ul className="sp-places-list" tabIndex={0} aria-label="Locais de interesse — lista com rolagem">{filtrados.map(local => <li key={local.id}>
          <button className="sp-place-card" aria-pressed={selecionado === local.id} onClick={() => setSelecionado(local.id)}>
            <span className="eyebrow">{local.category || 'Outros'}</span><strong>{local.name}</strong><span>{local.description}</span><small>{local.address}</small>
          </button>
          <div className="sp-place-actions"><a className="sp-map-link" href={`https://www.google.com/maps/search/?api=1&query=${local.latitude},${local.longitude}${local.googlePlaceId ? `&query_place_id=${encodeURIComponent(local.googlePlaceId)}` : ''}`} target="_blank" rel="noreferrer">Abrir no Google Maps ↗</a>
          <button className="sp-edit-place" type="button" disabled={salvando} aria-label={`Editar ${local.name}`} title="Editar local" onClick={event => abrirEdicao(local, event.currentTarget)}><Pencil size={14} aria-hidden="true" /><span>Editar</span></button></div>
        </li>)}</ul>
      </div>
    </div>
  </section>;
}
