import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function useMercado(path) {
  const [state, setState] = useState({ path, loading: true, data: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ path, loading: true, data: null, error: '' });
    api(path).then((data) => { if (active) setState({ path, loading: false, data, error: '' }); })
      .catch((error) => { if (active) setState({ path, loading: false, data: null, error: error.message }); });
    return () => { active = false; };
  }, [path, attempt]);
  return { ...(state.path === path ? state : { loading: true, data: null, error: '' }), retry: () => setAttempt((value) => value + 1) };
}
