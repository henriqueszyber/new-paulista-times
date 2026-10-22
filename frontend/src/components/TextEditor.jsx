import React, { useEffect, useRef, useState } from 'react';
import { documentToHtml, readEditorDocument, safeUrl } from '../richText.js';
import {
  Redo2,
  Undo2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Unlink,
} from 'lucide-react';

export default function TextEditor({ initialContent, onChange }) {
  const editor = useRef(null);
  const selectedRange = useRef(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (editor.current) editor.current.innerHTML = documentToHtml(initialContent);
  }, [initialContent]);

  function sync() {
    if (editor.current) onChange(readEditorDocument(editor.current));
  }

  function command(name, value) {
    editor.current?.focus();
    document.execCommand(name, false, value);
    sync();
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.current?.contains(selection.anchorNode)) {
      selectedRange.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function addLink(event) {
    event.preventDefault();
    const href = safeUrl(linkUrl);
    if (!href) { setLinkError('Use um endereço começando com https:// ou http://.'); return; }
    const selection = window.getSelection();
    if (!selectedRange.current || selectedRange.current.collapsed) {
      setLinkError('Selecione primeiro o texto que será o link.');
      return;
    }
    editor.current.focus();
    selection.removeAllRanges();
    selection.addRange(selectedRange.current);
    document.execCommand('createLink', false, href);
    setLinkOpen(false);
    setLinkUrl('');
    setLinkError('');
    sync();
  }

  return (
    <div className="rich-editor">
      <div className="editor-toolbar" role="toolbar" aria-label="Formatação do texto">
        <button type="button" title="Negrito (Ctrl+B)" aria-label="Negrito" onMouseDown={event => event.preventDefault()} onClick={() => command('bold')}><Bold size={18} /></button>
        <button type="button" title="Itálico (Ctrl+I)" aria-label="Itálico" onMouseDown={event => event.preventDefault()} onClick={() => command('italic')}><Italic size={18} /></button>
        <span className="toolbar-divider" />
        <button type="button" title="Parágrafo" onMouseDown={event => event.preventDefault()} onClick={() => command('formatBlock', 'p')}>Texto</button>
        <button type="button" title="Título da seção" onMouseDown={event => event.preventDefault()} onClick={() => command('formatBlock', 'h2')}>Título</button>
        <button type="button" title="Subtítulo" onMouseDown={event => event.preventDefault()} onClick={() => command('formatBlock', 'h3')}>Subtítulo</button>
        <span className="toolbar-divider" />
        <button type="button" title="Lista com marcadores" aria-label="Lista com marcadores" onMouseDown={event => event.preventDefault()} onClick={() => command('insertUnorderedList')}><List size={18} /></button>
        <button type="button" title="Lista numerada" aria-label="Lista numerada" onMouseDown={event => event.preventDefault()} onClick={() => command('insertOrderedList')}><ListOrdered size={18} /></button>
        <button type="button" title="Inserir link" aria-label="Inserir link" onMouseDown={event => { event.preventDefault(); saveSelection(); }} onClick={() => setLinkOpen(true)}><Link size={18} /></button>
        <button type="button" title="Remover link" aria-label="Remover link" onMouseDown={event => event.preventDefault()} onClick={() => command('unlink')}><Unlink size={18} /></button>
        <span className="toolbar-divider" />
        <button type="button" title="Desfazer" aria-label="Desfazer" onMouseDown={event => event.preventDefault()} onClick={() => command('undo')}><Undo2 size={18} /></button>
        <button type="button" title="Refazer" aria-label="Refazer" onMouseDown={event => event.preventDefault()} onClick={() => command('redo')}><Redo2 size={18} /></button>
      </div>
      {linkOpen && (
        <div className="link-panel">
          <label htmlFor="link-url">Endereço do link</label>
          <input id="link-url" type="url" placeholder="https://exemplo.com" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} />
          <button type="button" onClick={addLink}>Aplicar</button>
          <button type="button" onClick={() => { setLinkOpen(false); setLinkError(''); }}>Cancelar</button>
          {linkError && <small role="alert">{linkError}</small>}
        </div>
      )}
      <div ref={editor} className="editable-content" contentEditable role="textbox" aria-label="Conteúdo da notícia" aria-multiline="true"
        suppressContentEditableWarning onInput={sync} onBlur={sync}
        onPaste={event => {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          if (!document.execCommand('insertText', false, text)) {
            const selection = window.getSelection();
            if (selection?.rangeCount) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const node = document.createTextNode(text);
              range.insertNode(node);
              range.setStartAfter(node);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
          sync();
        }} />
      <small>Selecione o texto para formatar. Cole conteúdo como texto simples.</small>
    </div>
  );
}
