import React, { useEffect, useRef, useState } from 'react';
import { buscarFotoLocal } from './fotoLocal.js';
import { loadGoogleMaps } from './googleMaps.js';

export default function MapaLocais({ locais, selecionado, onSelecionar, cadastrando, posicao }) {
  const container = useRef(null);
  const [mapa, setMapa] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => {
    let ativo = true;
    let map;
    const authError = () => setErro('O mapa está indisponível. Consulte a lista de locais e tente novamente mais tarde.');
    window.addEventListener('maps-auth-error', authError);
    loadGoogleMaps().then(maps => {
      if (!ativo) return;
      map = new maps.Map(container.current, {
        center: { lat: -23.55052, lng: -46.633308 }, zoom: 12, mapId: 'DEMO_MAP_ID',
        streetViewControl: false, mapTypeControl: false, gestureHandling: 'cooperative',
      });
      setMapa(map);
    }).catch(error => { if (ativo) setErro(error.message); });
    return () => {
      ativo = false;
      window.removeEventListener('maps-auth-error', authError);
      if (map) window.google.maps.event.clearInstanceListeners(map);
    };
  }, []);

  useEffect(() => {
    if (!mapa) return;
    const maps = window.google.maps;
    let ativo = true;
    const info = new maps.InfoWindow({ maxWidth: 300 });
    const markers = locais.map(local => {
      const marker = new maps.marker.AdvancedMarkerElement({ map: mapa,
        position: { lat: local.latitude, lng: local.longitude }, title: local.name });
      marker.addListener('click', () => onSelecionar(local.id));
      if (local.id === selecionado) {
        const content = document.createElement('div');
        content.className = 'sp-map-popup';
        const title = document.createElement('strong');
        title.textContent = local.name;
        const detail = document.createElement('p');
        detail.textContent = `${local.description} — ${local.address}`;
        const photoContainer = document.createElement('div');
        photoContainer.className = 'sp-map-photo';
        photoContainer.textContent = local.googlePlaceId ? 'Carregando foto…' : 'Foto indisponível para este local.';
        content.append(title, photoContainer, detail);
        const mapsLink = document.createElement('a');
        mapsLink.textContent = 'Ver local no Google Maps ↗';
        mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${local.latitude},${local.longitude}${local.googlePlaceId ? `&query_place_id=${encodeURIComponent(local.googlePlaceId)}` : ''}`;
        mapsLink.target = '_blank'; mapsLink.rel = 'noopener noreferrer';
        content.append(mapsLink);
        if (local.googlePlaceId) {
          buscarFotoLocal(maps, local.googlePlaceId).then(photo => {
            if (!ativo) return;
            if (!photo) { photoContainer.textContent = 'Foto indisponível para este local.'; return; }
            const img = document.createElement('img');
            img.alt = `Foto de ${local.name} fornecida pelo Google Maps`;
            img.width = 280; img.height = 180; img.decoding = 'async';
            img.onerror = () => { if (ativo) photoContainer.textContent = 'Não foi possível carregar a foto.'; };
            const credits = document.createElement('div');
            credits.className = 'sp-map-photo-credits';
            credits.append(document.createTextNode('Foto: '));
            if (!photo.autores.length) credits.append(document.createTextNode('Google Maps'));
            photo.autores.forEach((author, index) => {
              if (index) credits.append(document.createTextNode(', '));
              const authorLink = document.createElement('a');
              authorLink.textContent = author.nome || 'Colaborador do Google Maps';
              try {
                const url = new URL(author.url);
                if (url.protocol === 'https:') { authorLink.href = url.href; authorLink.target = '_blank'; authorLink.rel = 'noopener noreferrer'; }
              } catch { /* Mantém o crédito como texto se o perfil não tiver URL. */ }
              credits.append(authorLink);
            });
            photoContainer.replaceChildren(img, credits);
            img.src = photo.url;
          }).catch(() => { if (ativo) photoContainer.textContent = 'Foto indisponível no momento.'; });
        }
        info.setContent(content);
        info.open({ map: mapa, anchor: marker, shouldFocus: false });
        mapa.panTo(marker.position);
        mapa.setZoom(15);
      }
      return marker;
    });
    if (!selecionado && locais.length) {
      const bounds = new maps.LatLngBounds();
      locais.forEach(local => bounds.extend({ lat: local.latitude, lng: local.longitude }));
      mapa.fitBounds(bounds, 50);
      const listener = maps.event.addListenerOnce(mapa, 'idle', () => { if (mapa.getZoom() > 15) mapa.setZoom(15); });
      // The listener is removed with the marker effect below as well.
      markers.listener = listener;
    }
    return () => {
      ativo = false;
      info.close();
      markers.listener?.remove();
      markers.forEach(marker => { maps.event.clearInstanceListeners(marker); marker.map = null; });
    };
  }, [mapa, locais, selecionado, onSelecionar]);

  useEffect(() => {
    if (!mapa || !cadastrando || !posicao) return;
    const marker = new window.google.maps.marker.AdvancedMarkerElement({ map: mapa, position: posicao, title: 'Novo local' });
    mapa.panTo(posicao);
    mapa.setZoom(15);
    return () => { marker.map = null; };
  }, [mapa, cadastrando, posicao]);

  return <div className="sp-map-wrap">
    <div className="sp-map" ref={container} aria-label="Mapa dos locais de interesse em São Paulo" hidden={!!erro} />
    {erro ? <div className="sp-map-message" role="status">{erro}</div> : !mapa && <p role="status">Carregando mapa…</p>}
    {cadastrando && mapa && !erro && <p className="sp-map-hint">Busque um local para visualizar sua posição no mapa.</p>}
  </div>;
}
