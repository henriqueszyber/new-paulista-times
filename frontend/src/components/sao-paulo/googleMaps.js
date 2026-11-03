let loading;
export function loadGoogleMaps() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return Promise.reject(new Error('O mapa estará disponível em breve. Você já pode consultar os locais abaixo.'));
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timer);
      reject(new Error('Não foi possível carregar o mapa. A lista de locais continua disponível.'));
    };
    const timer = setTimeout(fail, 20000);
    window.gm_authFailure = () => {
      fail();
      window.dispatchEvent(new Event('maps-auth-error'));
    };
    window.initPaulistaMap = () => { clearTimeout(timer); resolve(window.google.maps); };
    const params = new URLSearchParams({ key, callback: 'initPaulistaMap', loading: 'async', libraries: 'marker', v: 'weekly', language: 'pt-BR', region: 'BR' });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
