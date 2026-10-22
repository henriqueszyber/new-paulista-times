import React from 'react';
import { safeUrl } from '../richText.js';

function Spans({ spans }) {
  return (spans || []).map((span, index) => {
    let node = span.text;
    if (span.bold) node = <strong>{node}</strong>;
    if (span.italic) node = <em>{node}</em>;
    const href = span.href && safeUrl(span.href);
    if (href) node = <a href={href} rel="noopener noreferrer">{node}</a>;
    return <React.Fragment key={index}>{node}</React.Fragment>;
  });
}

export default function TextView({ content }) {
  if (typeof content === 'string') return <div className="article-content legacy-content">{content}</div>;
  const blocks = content?.blocks || [];
  const nodes = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === 'bulletItem' || block.type === 'orderedItem') {
      const items = [];
      const type = block.type;
      const start = i;
      while (i < blocks.length && blocks[i].type === type) {
        items.push(<li key={i}><Spans spans={blocks[i].spans} /></li>);
        i++;
      }
      nodes.push(type === 'bulletItem' ? <ul key={'list-' + start}>{items}</ul> : <ol key={'list-' + start}>{items}</ol>);
      i--;
    } else if (block.type === 'heading2') {
      nodes.push(<h2 key={i}><Spans spans={block.spans} /></h2>);
    } else if (block.type === 'heading3') {
      nodes.push(<h3 key={i}><Spans spans={block.spans} /></h3>);
    } else {
      nodes.push(<p key={i}><Spans spans={block.spans} /></p>);
    }
  }
  return <div className="article-content">{nodes}</div>;
}
