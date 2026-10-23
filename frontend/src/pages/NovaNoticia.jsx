import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import TextEditor from '../components/TextEditor.jsx';
import { emptyDocument } from '../richText.js';
import { api } from '../api.js';
import { sessao } from '../session.js';

export default function NovaNoticia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [categoria, setCategoria] = useState('Cidade');
  const [conteudoInicial, setConteudoInicial] = useState(emptyDocument);
  const [conteudo, setConteudo] = useState(emptyDocument);
  const [status, setStatus] = useState('draft');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const [revisao, setRevisao] = useState(0);
  const [salvamentoAutomatico, setSalvamentoAutomatico] = useState('');
  const revisaoAtual = useRef(0);
  const revisaoSalva = useRef(0);
  const filaDeSalvamento = useRef(Promise.resolve());

  function marcarAlteracao() {
    revisaoAtual.current++;
    setRevisao(revisaoAtual.current);
    setSalvamentoAutomatico('Alterações ainda não salvas');
  }

  function enviarEmOrdem(caminho, method, body) {
    const tarefa = filaDeSalvamento.current.then(() => api(caminho, { method, token: sessao.token, body }));
    filaDeSalvamento.current = tarefa.catch(() => {});
    return tarefa;
  }

  useEffect(() => {
    if (!id || !sessao.token) return;
    let active = true;
    async function carregar() {
      setCarregando(true);
      setFalhaCarregamento(false);
      try {
        const noticia = await api('/news/manage/' + encodeURIComponent(id), { token: sessao.token });
        if (!active) return;
        setTitulo(noticia.title);
        setResumo(noticia.summary);
        setCategoria(noticia.category);
        setConteudoInicial(noticia.content);
        setConteudo(noticia.content);
        setStatus(noticia.status);
        revisaoSalva.current = revisaoAtual.current;
        setSalvamentoAutomatico('');
      } catch (error) {
        if (active) { setErro(error.message); setFalhaCarregamento(true); }
      } finally {
        if (active) setCarregando(false);
      }
    }
    carregar();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!id || status !== 'draft' || carregando || enviando || revisao === revisaoSalva.current) return;
    let active = true;
    const timer = setTimeout(async () => {
      const snapshot = revisaoAtual.current;
      setSalvamentoAutomatico('Salvando rascunho…');
      try {
        await enviarEmOrdem('/news/' + encodeURIComponent(id), 'PUT', {
          title: titulo, summary: resumo, category: categoria, content: conteudo, status: 'draft',
        });
        if (active && revisaoAtual.current === snapshot) {
          revisaoSalva.current = snapshot;
          setSalvamentoAutomatico('Rascunho salvo automaticamente');
        }
      } catch (error) {
        if (active) setSalvamentoAutomatico('Falha ao salvar: ' + error.message);
      }
    }, 1800);
    return () => { active = false; clearTimeout(timer); };
  }, [id, status, carregando, enviando, revisao, titulo, resumo, categoria, conteudo]);

  async function salvar(novoStatus) {
    setErro('');
    setMensagem('');
    setEnviando(true);
    const snapshot = revisaoAtual.current;
    try {
      const noticia = await enviarEmOrdem(id ? '/news/' + encodeURIComponent(id) : '/news', id ? 'PUT' : 'POST',
        { title: titulo, summary: resumo, category: categoria, content: conteudo, status: novoStatus });
      setStatus(noticia.status);
      if (revisaoAtual.current === snapshot) revisaoSalva.current = snapshot;
      setSalvamentoAutomatico('');
      if (novoStatus === 'published') navigate('/noticia/' + noticia.id);
      else if (!id) {
        setMensagem('Rascunho salvo no banco de dados.');
        navigate('/admin/editar/' + noticia.id, { replace: true });
      }
      else setMensagem('Rascunho salvo no banco de dados.');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout editorial>
      <section className="panel editor">
        <p className="eyebrow">{id ? 'EDITAR PUBLICAÇÃO' : 'NOVA PUBLICAÇÃO'}</p>
        <h1>{id ? 'Edite sua história.' : 'Conte uma nova história.'}</h1>
        <p>Formate o texto, salve um rascunho ou publique quando estiver pronto.</p>
        {carregando ? <p role="status">Carregando notícia…</p> : falhaCarregamento ? (
          <><p className="notice" role="alert">{erro}</p><Link to="/admin">Voltar ao painel</Link></>
        ) : (
          <form onSubmit={event => { event.preventDefault(); salvar('published'); }}>
            <label htmlFor="titulo">Título da notícia</label>
            <input id="titulo" required maxLength={160} placeholder="O que aconteceu?"
              value={titulo} onChange={event => { setTitulo(event.target.value); marcarAlteracao(); }} />

            <label htmlFor="resumo">Resumo</label>
            <textarea id="resumo" maxLength={300} rows={3} placeholder="O essencial em poucas palavras."
              value={resumo} onChange={event => { setResumo(event.target.value); marcarAlteracao(); }} />

            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={categoria} onChange={event => { setCategoria(event.target.value); marcarAlteracao(); }}>
              <option>Cidade</option><option>Tecnologia</option><option>Cultura</option>
              <option>Educação</option><option>Esportes</option>
            </select>

            <label id="conteudo-label">Conteúdo</label>
            <TextEditor initialContent={conteudoInicial} onChange={documento => { setConteudo(documento); marcarAlteracao(); }} />

            {id && status === 'draft' && salvamentoAutomatico && <small role="status">{salvamentoAutomatico}</small>}

            {erro && <p className="notice" role="alert">{erro}</p>}
            {mensagem && <p className="success-message" role="status">{mensagem}</p>}
            <div className="form-actions">
              <button className="button" type="submit" disabled={enviando}>
                {enviando ? 'Salvando…' : status === 'published' ? 'Salvar publicação →' : 'Publicar notícia →'}
              </button>
              <button className="secondary-button" type="button" disabled={enviando} onClick={() => salvar('draft')}>Salvar rascunho</button>
              <Link to="/admin">Voltar ao painel</Link>
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}
