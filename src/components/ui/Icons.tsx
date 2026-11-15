export const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const External = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const Mail = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1.5" y="3" width="13" height="10" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/** Globaz brand mark (from the company logo) with a typeset wordmark. */
export const Brand = () => (
  <span className="brand">
    <img src="/media/brand/globaz-mark.png" width={44} height={45} alt="" className="brand__mark" />
    <span className="brand__word">
      Globaz<span> Technologies</span>
    </span>
  </span>
);
