import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  // starts false on server and client alike (prerendered HTML hydrates cleanly), then syncs
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
