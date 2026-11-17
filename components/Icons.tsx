type P = { className?: string };
const base = "h-5 w-5";
const S = ({ className, children }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className ?? base} aria-hidden="true">
    {children}
  </svg>
);
export const Sun = (p: P) => (<S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></S>);
export const Moon = (p: P) => (<S {...p}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></S>);
export const Menu = (p: P) => (<S {...p}><path d="M4 7h16M4 12h16M4 17h16" /></S>);
export const Close = (p: P) => (<S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>);
export const ChevL = (p: P) => (<S {...p}><path d="M15 6l-6 6 6 6" /></S>);
export const ChevR = (p: P) => (<S {...p}><path d="M9 6l6 6-6 6" /></S>);
export const ToStart = (p: P) => (<S {...p}><path d="M17 6l-6 6 6 6M7 6v12" /></S>);
export const ToEnd = (p: P) => (<S {...p}><path d="M7 6l6 6-6 6M17 6v12" /></S>);
export const Play = (p: P) => (<S {...p}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" /></S>);
export const Pause = (p: P) => (<S {...p}><path d="M8 5v14M16 5v14" strokeWidth={3} /></S>);
export const Search = (p: P) => (<S {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></S>);
export const Check = (p: P) => (<S {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></S>);
export const Cross = (p: P) => (<S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>);
export const Refresh = (p: P) => (<S {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" /></S>);
export const Plus = (p: P) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const Minus = (p: P) => (<S {...p}><path d="M5 12h14" /></S>);
export const Barrier = (p: P) => (<S {...p}><rect x="3" y="8" width="18" height="6" rx="1" /><path d="M7 8l-2 6M12 8l-2 6M17 8l-2 6M6 14v5M18 14v5" /></S>);
export const Print = (p: P) => (<S {...p}><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="7" y="14" width="10" height="7" /></S>);
export const External = (p: P) => (<S {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></S>);
