/**
 * Aritmetika simbolik untuk biaya Big-M.
 * Setiap nilai disimpan sebagai  m·M + c  dengan M dianggap "sangat besar".
 * Perbandingan bersifat leksikografis: koefisien M dibandingkan dulu, lalu konstanta.
 */
export type MV = { m: number; c: number };
export type Cost = number | "M";

const EPS = 1e-9;
const clean = (x: number) => (Math.abs(x) < EPS ? 0 : Math.round(x * 1e6) / 1e6);

export const mv = (c: number, m = 0): MV => ({ m: clean(m), c: clean(c) });
export const ZERO: MV = { m: 0, c: 0 };
export const BIG_M: MV = { m: 1, c: 0 };

export const fromCost = (x: Cost): MV => (x === "M" ? { m: 1, c: 0 } : mv(x));
export const add = (a: MV, b: MV): MV => mv(a.c + b.c, a.m + b.m);
export const sub = (a: MV, b: MV): MV => mv(a.c - b.c, a.m - b.m);
export const neg = (a: MV): MV => mv(-a.c, -a.m);
export const scale = (a: MV, k: number): MV => mv(a.c * k, a.m * k);

/** -1 bila a < b, 0 bila sama, 1 bila a > b */
export const cmp = (a: MV, b: MV): number => {
  if (Math.abs(a.m - b.m) > EPS) return a.m < b.m ? -1 : 1;
  if (Math.abs(a.c - b.c) > EPS) return a.c < b.c ? -1 : 1;
  return 0;
};
export const isNeg = (a: MV) => cmp(a, ZERO) < 0;
export const isZero = (a: MV) => cmp(a, ZERO) === 0;
export const hasM = (a: MV) => Math.abs(a.m) > EPS;
export const isBigM = (a: MV) => a.m > EPS;

const minus = "\u2212";
const num = (x: number) => {
  const r = Math.round(x * 1000) / 1000;
  const s = Number.isInteger(r) ? String(Math.abs(r)) : String(Math.abs(r));
  return s;
};

/** Format manusiawi: "M − 5", "−M + 2", "2M", "14", "−3" */
export function fmt(a: MV): string {
  if (!hasM(a)) return (a.c < 0 ? minus : "") + num(a.c);
  const mAbs = Math.abs(a.m);
  const mTerm = mAbs === 1 ? "M" : `${num(mAbs)}M`;
  if (a.m < 0 && a.c > EPS) return `${num(a.c)} ${minus} ${mTerm}`;
  let s = (a.m < 0 ? minus : "") + mTerm;
  if (a.c > EPS) s += ` + ${num(a.c)}`;
  else if (a.c < -EPS) s += ` ${minus} ${num(Math.abs(a.c))}`;
  return s;
}

/** Bungkus dengan kurung bila nilai berupa ekspresi atau negatif, untuk dipakai di tengah rumus */
export function fmtP(a: MV): string {
  const s = fmt(a);
  if (hasM(a) && (Math.abs(a.c) > EPS || a.m < 0)) return `(${s})`;
  if (!hasM(a) && a.c < 0) return `(${s})`;
  return s;
}

export function fmtCost(x: Cost): string {
  return x === "M" ? "M" : num(x);
}

/** Tanda nilai untuk penjelasan: negatif / nol / positif */
export function signWord(a: MV): "neg" | "zero" | "pos" {
  const k = cmp(a, ZERO);
  return k < 0 ? "neg" : k === 0 ? "zero" : "pos";
}
