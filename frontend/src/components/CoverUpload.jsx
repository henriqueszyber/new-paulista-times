import React, { useState } from 'react';
import { api } from '../api.js';
import { sessao } from '../session.js';

// A capa não mexe no editor: ela envia um arquivo e retorna dois dados.
export default function CoverUpload({ imageUrl, onUploaded, onRemove, onPendingChange, disabled }) {
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [selecao, setSelecao] = useState(0);

  function selecionar(event) {
    const file = event.target.files[0];
    setErro('');
    setMensagem('');
    setArquivo(null);
    onPendingChange(false);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErro('Selecione JPEG, PNG ou WebP.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5 MB.');
      event.target.value = '';
      return;
    }
    setArquivo(file);
    onPendingChange(true);
  }

  async function enviar() {
    if (!arquivo || enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const form = new FormData();
      form.append('image', arquivo);
      const dados = await api('/images', { method: 'POST', token: sessao.token, body: form });
      onUploaded(dados);
      setArquivo(null);
      setSelecao(selecao + 1);
      onPendingChange(false);
      setMensagem('Imagem enviada. Salve o rascunho ou publique para associá-la à notícia.');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function cancelar() {
    setArquivo(null);
    setSelecao(selecao + 1);
    setErro('');
    onPendingChange(false);
  }

  return (
    <div>
      {imageUrl && <img className="cover-preview" src={imageUrl} alt="Prévia da capa" />}
      <label htmlFor="capa">Escolher imagem</label>
      <input key={selecao} id="capa" type="file" accept="image/jpeg,image/png,image/webp"
        onChange={selecionar} disabled={disabled || enviando} />
      <small>Uma capa JPEG, PNG ou WebP de até 5 MB. Depois de escolher, clique em Enviar imagem.</small>
      <div className="cover-actions">
        <button type="button" className="secondary-button" onClick={enviar} disabled={!arquivo || enviando || disabled}>
          {enviando ? 'Enviando imagem…' : 'Enviar imagem'}
        </button>
        {arquivo && <button type="button" onClick={cancelar} disabled={enviando || disabled}>Cancelar seleção</button>}
        {imageUrl && <button type="button" disabled={enviando || disabled || Boolean(arquivo)} onClick={() => { onRemove(); setMensagem('Capa removida da notícia. Salve a alteração.'); }}>Remover capa</button>}
      </div>
      {arquivo && <small>Envie ou cancele a seleção antes de salvar a notícia.</small>}
      {erro && <p className="notice" role="alert">{erro}</p>}
      {mensagem && <p role="status">{mensagem}</p>}
    </div>
  );
}
