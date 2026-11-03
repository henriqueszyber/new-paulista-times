import React from 'react';
import { dateTime } from './formatters.js';

export default function FonteMercado({ href, children, fetchedAt }) {
  return <p className="market-source"><a href={href} target="_blank" rel="noreferrer">{children}</a>{fetchedAt && <> · Consultado em {dateTime(fetchedAt)}</>}</p>;
}
