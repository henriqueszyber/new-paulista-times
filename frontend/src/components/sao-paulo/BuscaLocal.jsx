import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from './googleMaps.js';

export default function BuscaLocal({ disabled, onSelecionar }) {
  const container = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onSelecionar);
  callback.current = onSelecionar;
  const [status, setStatus] = useState('Carregando busca de locais…');
  const [erro, setErro] = useState('');
  useEffect(() => { if (widget.current) widget.current.disabled = disabled; }, [disabled]);
  useEffect(() => {
    let ativo = true;
    let sequence = 0;
    let autocomplete;
    const invalidar = () => { sequence++; callback.current(null); setStatus('Selecione um lugar nas sugestões do Google.'); };
    const failure = () => { invalidar(); setErro('A busca do Google está indisponível. Confira a chave e o acesso à Places API (New) e tente novamente.'); };
    const selecionar = async ({ placePrediction }) => {
      const request = ++sequence;
      callback.current(null); setErro(''); setStatus('Buscando detalhes do local…');
      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location'] });
        if (!ativo || request !== sequence) return;
        if (!place.location || !place.id) throw new Error('Local sem posição disponível.');
        const { lat, lng } = place.location.toJSON();
        callback.current({ name: (place.displayName || '').slice(0, 120), address: (place.formattedAddress || place.displayName || '').slice(0, 250),
          latitude: lat, longitude: lng, googlePlaceId: place.id });
        setStatus('Local selecionado. Você pode ajustar o nome e escrever a descrição.');
      } catch {
        if (ativo && request === sequence) { setErro('Não foi possível obter os detalhes. Selecione o local novamente.'); setStatus(''); }
      }
    };
    loadGoogleMaps().then(maps => maps.importLibrary('places')).then(({ PlaceAutocompleteElement }) => {
      if (!ativo) return;
      autocomplete = new PlaceAutocompleteElement({ includedRegionCodes: ['br'],
        locationBias: { center: { lat: -23.55052, lng: -46.633308 }, radius: 35000 } });
      autocomplete.id = 'place-search';
      autocomplete.setAttribute('aria-label', 'Buscar local no Google Maps');
      autocomplete.setAttribute('placeholder', 'Ex.: MASP, Ibirapuera, restaurante…');
      autocomplete.addEventListener('gmp-select', selecionar);
      autocomplete.addEventListener('gmp-error', failure);
      autocomplete.addEventListener('input', invalidar);
      // Enter selects a suggestion without submitting the surrounding form.
      autocomplete.addEventListener('keydown', event => { if (event.key === 'Enter') event.preventDefault(); });
      container.current.append(autocomplete);
      widget.current = autocomplete;
      setStatus('Digite e selecione um lugar nas sugestões do Google.');
      autocomplete.focus();
    }).catch(() => { if (ativo) failure(); });
    window.addEventListener('maps-auth-error', failure);
    return () => { ativo = false; sequence++; window.removeEventListener('maps-auth-error', failure); autocomplete?.remove(); widget.current = null; };
  }, []);
  return <div className="sp-place-search">
    <label htmlFor="place-search">Buscar local</label><div ref={container} />
    {status && <p role="status">{status}</p>}{erro && <p className="notice" role="alert">{erro}</p>}
  </div>;
}
