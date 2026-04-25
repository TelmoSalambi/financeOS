import { useState, useEffect } from 'react';

// FIX #1: Verificação segura de window para evitar crash em SSR/testes.
// FIX #2: Substituído window.addEventListener('resize') por matchMedia.
//   - resize disparava centenas de vezes por segundo (sem debounce)
//   - matchMedia só dispara quando o breakpoint é ultrapassado de facto
//   - É também consistente com os breakpoints reais do CSS/Tailwind

export const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => {
    // FIX #1: window pode não existir em SSR ou ambientes de teste
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    // FIX #1: Guarda adicional dentro do effect
    if (typeof window === 'undefined') return;

    // FIX #2: matchMedia é preciso, eficiente e só dispara na mudança real
    // do breakpoint — não a cada pixel de redimensionamento
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const handler = (e) => setIsMobile(e.matches);

    // Sincroniza estado imediatamente com o valor atual do media query
    setIsMobile(mql.matches);

    // API moderna (suportada em todos os browsers relevantes)
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
};
