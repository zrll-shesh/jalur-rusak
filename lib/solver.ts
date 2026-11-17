import {
  MV,
  Cost,
  fromCost,
  add,
  sub,
  scale,
  cmp,
  isNeg,
  isZero,
  isBigM,
  fmt,
  fmtP,
  ZERO,
  mv,
} from "./mvalue";

export type Bi = { id: string; en: string };
export type Method = "nwc" | "lcm" | "vam";
export type Optimality = "modi" | "stepping";

export interface ProblemInput {
  costs: Cost[][];
  supply: number[];
  demand: number[];
  rowLabels?: string[];
  colLabels?: string[];
}

export interface Cell {
  r: number;
  c: number;
}
export interface LoopCell extends Cell {
  sign: "+" | "-";
}

export interface Snapshot {
  alloc: (number | null)[][];
  hideDummy?: boolean;
  supplyLeft?: number[];
  demandLeft?: number[];
  rowDone?: boolean[];
  colDone?: boolean[];
  focus?: Cell[];
  focusKind?: "alloc" | "enter" | "leave" | "epsilon" | "warn" | "scan";
  loop?: LoopCell[];
  u?: (MV | null)[];
  v?: (MV | null)[];
  reduced?: (MV | null)[][];
  rowPen?: (MV | null)[];
  colPen?: (MV | null)[];
  penPick?: { kind: "row" | "col"; idx: number };
}

export type Phase =
  | "setup"
  | "balance"
  | "initial"
  | "degenerate"
  | "cost"
  | "uv"
  | "reduced"
  | "loop"
  | "pivot"
  | "optimal"
  | "result";

export interface Step {
  phase: Phase;
  title: Bi;
  body: Bi[];
  calc?: string[];
  snap: Snapshot;
  tie?: boolean;
  iteration?: number;
}

export interface Shipment {
  r: number;
  c: number;
  q: number;
}

export interface Solution {
  costs: MV[][];
  rawCosts: Cost[][];
  supply: number[];
  demand: number[];
  rowLabels: string[];
  colLabels: string[];
  m: number;
  n: number;
  dummyRow: boolean;
  dummyCol: boolean;
  steps: Step[];
  initialAlloc: (number | null)[][];
  initialCost: MV;
  finalAlloc: (number | null)[][];
  totalCost: MV;
  feasible: boolean;
  brokenUsed: Shipment[];
  iterations: number;
  method: Method;
  optimality: Optimality;
  alternateOptima: boolean;
  brokenCells: Cell[];
}

/* ----------------------------- helpers ----------------------------- */

const clone2 = <T,>(a: T[][]): T[][] => a.map((r) => r.slice());
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export const methodName: Record<Method, Bi> = {
  nwc: { id: "Pojok Barat Laut (NWC)", en: "North-West Corner (NWC)" },
  lcm: { id: "Biaya Terkecil (Least Cost)", en: "Least Cost Method" },
  vam: { id: "Aproksimasi Vogel (VAM)", en: "Vogel's Approximation (VAM)" },
};
export const optName: Record<Optimality, Bi> = {
  modi: { id: "MODI (u–v)", en: "MODI (u–v)" },
  stepping: { id: "Stepping Stone", en: "Stepping Stone" },
};

/** Normalisasi masukan menjadi bentuk setimbang beserta metadata */
function prepare(p: ProblemInput) {
  const m0 = p.supply.length;
  const n0 = p.demand.length;
  const rowLabels = (p.rowLabels ?? Array.from({ length: m0 }, (_, i) => `S${i + 1}`)).slice(0, m0);
  const colLabels = (p.colLabels ?? Array.from({ length: n0 }, (_, j) => `D${j + 1}`)).slice(0, n0);
  const rawCosts: Cost[][] = p.costs.map((r) => r.slice(0, n0));
  const supply = p.supply.slice();
  const demand = p.demand.slice();
  const S = sum(supply);
  const D = sum(demand);
  let dummyRow = false;
  let dummyCol = false;
  if (S > D) {
    dummyCol = true;
    rawCosts.forEach((r) => r.push(0));
    demand.push(S - D);
    colLabels.push("Dummy");
  } else if (D > S) {
    dummyRow = true;
    rawCosts.push(Array.from({ length: n0 }, () => 0 as Cost));
    supply.push(D - S);
    rowLabels.push("Dummy");
  }
  const costs = rawCosts.map((r) => r.map(fromCost));
  return { m0, n0, S, D, rowLabels, colLabels, rawCosts, costs, supply, demand, dummyRow, dummyCol };
}

/* ------------------------------ solver ------------------------------ */

export function solve(
  input: ProblemInput,
  method: Method = "vam",
  optimality: Optimality = "modi",
  options: { initialOnly?: boolean } = {}
): Solution {
  const P = prepare(input);
  const { rowLabels: RL, colLabels: CL, costs, rawCosts, supply, demand, dummyRow, dummyCol, m0, n0 } = P;
  const m = supply.length;
  const n = demand.length;
  const short = RL.every((x) => x.length <= 4) && CL.every((x) => x.length <= 6);
  const cn = (r: number, c: number) => (short ? `${RL[r]}${CL[c]}` : `${RL[r]} → ${CL[c]}`);
  const isDummyCell = (r: number, c: number) => (dummyRow && r === m - 1) || (dummyCol && c === n - 1);
  const isBroken = (r: number, c: number) => rawCosts[r][c] === "M";
  const steps: Step[] = [];
  const emptyAlloc = () => Array.from({ length: m }, () => Array<number | null>(n).fill(null));

  const brokenCells: Cell[] = [];
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (isBroken(r, c)) brokenCells.push({ r, c });

  /* ---- Step: setup ---- */
  {
    const list = brokenCells.map((b) => cn(b.r, b.c));
    const body: Bi[] = [
      {
        id: `Tabel berisi ${m0} sumber dan ${n0} tujuan. Angka kecil di pojok kanan atas setiap sel adalah biaya kirim per unit (c_ij).`,
        en: `The table has ${m0} sources and ${n0} destinations. The small number in the top-right corner of each cell is the unit shipping cost (c_ij).`,
      },
    ];
    if (list.length) {
      body.push({
        id: `Jalur rusak: ${list.join(", ")}. Rute ini tidak boleh dipakai, sehingga biayanya diganti dengan M, yaitu bilangan yang jauh lebih besar dari biaya mana pun di tabel. Sel bergaris kuning-hitam menandai jalur rusak.`,
        en: `Broken routes: ${list.join(", ")}. These routes must not be used, so their cost is replaced by M, a number far larger than any other cost in the table. Cells with yellow-black stripes mark the broken routes.`,
      });
    } else {
      body.push({
        id: "Tidak ada jalur rusak pada soal ini, sehingga semua rute boleh dipakai.",
        en: "There are no broken routes in this problem, so every route may be used.",
      });
    }
    steps.push({
      phase: "setup",
      title: { id: "Baca soal dan tandai jalur rusak", en: "Read the problem and mark broken routes" },
      body,
      snap: { alloc: emptyAlloc(), hideDummy: true, focus: brokenCells, focusKind: "warn" },
    });
  }

  /* ---- Step: balance ---- */
  {
    const calc = [
      `Σ supply = ${input.supply.join(" + ")} = ${P.S}`,
      `Σ demand = ${input.demand.join(" + ")} = ${P.D}`,
    ];
    let body: Bi[];
    if (!dummyRow && !dummyCol) {
      body = [
        {
          id: `Total supply sama dengan total demand (${P.S} = ${P.D}). Masalah sudah setimbang, jadi tidak perlu baris atau kolom dummy.`,
          en: `Total supply equals total demand (${P.S} = ${P.D}). The problem is balanced, so no dummy row or column is needed.`,
        },
      ];
    } else if (dummyCol) {
      body = [
        {
          id: `Total supply (${P.S}) lebih besar dari total demand (${P.D}). Tambahkan kolom Dummy dengan demand ${P.S - P.D} dan biaya 0 agar setimbang.`,
          en: `Total supply (${P.S}) exceeds total demand (${P.D}). Add a Dummy column with demand ${P.S - P.D} and cost 0 to balance it.`,
        },
        {
          id: "Barang yang nanti dialokasikan ke kolom Dummy artinya tidak dikirim dan tetap tersimpan di gudang asal.",
          en: "Anything allocated to the Dummy column is not shipped; it stays in the source warehouse.",
        },
      ];
      calc.push(`Dummy = ${P.S} − ${P.D} = ${P.S - P.D}`);
    } else {
      body = [
        {
          id: `Total demand (${P.D}) lebih besar dari total supply (${P.S}). Tambahkan baris Dummy dengan supply ${P.D - P.S} dan biaya 0 agar setimbang.`,
          en: `Total demand (${P.D}) exceeds total supply (${P.S}). Add a Dummy row with supply ${P.D - P.S} and cost 0 to balance it.`,
        },
        {
          id: "Barang yang nanti diterima dari baris Dummy artinya permintaan itu tidak terpenuhi (kekurangan pasokan).",
          en: "Anything received from the Dummy row is unmet demand (a shortage).",
        },
      ];
      calc.push(`Dummy = ${P.D} − ${P.S} = ${P.D - P.S}`);
    }
    steps.push({
      phase: "balance",
      title: { id: "Cek keseimbangan supply dan demand", en: "Check supply–demand balance" },
      body,
      calc,
      snap: { alloc: emptyAlloc(), supplyLeft: supply.slice(), demandLeft: demand.slice() },
    });
  }

  /* ---- Initial solution ---- */
  const alloc = emptyAlloc();
  const sLeft = supply.slice();
  const dLeft = demand.slice();
  const rowDone = Array(m).fill(false);
  const colDone = Array(n).fill(false);

  const markAfter = (r: number, c: number): Bi => {
    const sZero = sLeft[r] === 0;
    const dZero = dLeft[c] === 0;
    const remainingRows = rowDone.filter((x) => !x).length;
    const remainingCols = colDone.filter((x) => !x).length;
    if (sZero && dZero) {
      // Coret keduanya kecuali bila ini sel terakhir
      rowDone[r] = true;
      colDone[c] = true;
      if (remainingRows > 1 && remainingCols > 1) {
        return {
          id: `Supply ${RL[r]} dan demand ${CL[c]} habis bersamaan. Baris dan kolom dicoret sekaligus. Ini tanda akan terjadi kemerosotan (degenerasi), yang nanti ditangani dengan ε.`,
          en: `Supply of ${RL[r]} and demand of ${CL[c]} run out at the same time. Both the row and the column are crossed out. This signals degeneracy, which will be handled later with ε.`,
        };
      }
      return {
        id: `Supply ${RL[r]} dan demand ${CL[c]} sama-sama habis. Semua alokasi sudah lengkap.`,
        en: `Supply of ${RL[r]} and demand of ${CL[c]} are both used up. Every allocation is complete.`,
      };
    }
    if (sZero) {
      rowDone[r] = true;
      return {
        id: `Supply ${RL[r]} habis, baris ${RL[r]} dicoret. Sisa demand ${CL[c]} = ${dLeft[c]}.`,
        en: `Supply of ${RL[r]} is used up, so row ${RL[r]} is crossed out. Remaining demand of ${CL[c]} = ${dLeft[c]}.`,
      };
    }
    colDone[c] = true;
    return {
      id: `Demand ${CL[c]} terpenuhi, kolom ${CL[c]} dicoret. Sisa supply ${RL[r]} = ${sLeft[r]}.`,
      en: `Demand of ${CL[c]} is satisfied, so column ${CL[c]} is crossed out. Remaining supply of ${RL[r]} = ${sLeft[r]}.`,
    };
  };

  const cellNotes = (r: number, c: number): Bi[] => {
    const out: Bi[] = [];
    if (isBroken(r, c))
      out.push({
        id: `Perhatikan: ${cn(r, c)} adalah jalur rusak (biaya M). Alokasi di sel ini membuat total biaya mengandung M. Uji optimalitas nanti akan berusaha mengusirnya keluar dari solusi.`,
        en: `Note: ${cn(r, c)} is a broken route (cost M). Allocating here makes the total cost contain M. The optimality test will later try to push it out of the solution.`,
      });
    if (isDummyCell(r, c))
      out.push({
        id: "Ini sel dummy. Alokasi di sini bukan pengiriman nyata, hanya penyeimbang.",
        en: "This is a dummy cell. An allocation here is not a real shipment, only a balancing entry.",
      });
    return out;
  };

  const snapNow = (extra: Partial<Snapshot> = {}): Snapshot => ({
    alloc: clone2(alloc),
    supplyLeft: sLeft.slice(),
    demandLeft: dLeft.slice(),
    rowDone: rowDone.slice(),
    colDone: colDone.slice(),
    ...extra,
  });

  let stepNo = 0;

  if (method === "nwc") {
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (rowDone[i]) {
        i++;
        continue;
      }
      if (colDone[j]) {
        j++;
        continue;
      }
      stepNo++;
      const q = Math.min(sLeft[i], dLeft[j]);
      const before = { s: sLeft[i], d: dLeft[j] };
      alloc[i][j] = q;
      sLeft[i] -= q;
      dLeft[j] -= q;
      const after = markAfter(i, j);
      steps.push({
        phase: "initial",
        title: { id: `NWC langkah ${stepNo}: isi ${cn(i, j)}`, en: `NWC step ${stepNo}: fill ${cn(i, j)}` },
        body: [
          {
            id: `Sel paling kiri atas yang belum dicoret adalah ${cn(i, j)}. NWC tidak melihat biaya, hanya posisi.`,
            en: `The top-left cell that is not yet crossed out is ${cn(i, j)}. NWC ignores cost and looks only at position.`,
          },
          after,
          ...cellNotes(i, j),
        ],
        calc: [`x(${cn(i, j)}) = min(${before.s}, ${before.d}) = ${q}`],
        snap: snapNow({ focus: [{ r: i, c: j }], focusKind: isBroken(i, j) ? "warn" : "alloc" }),
      });
      if (rowDone[i]) i++;
      if (j < n && colDone[j]) j++;
    }
  } else if (method === "lcm") {
    let dummyNoteShown = false;
    while (rowDone.some((x) => !x) && colDone.some((x) => !x)) {
      stepNo++;
      const cand: Cell[] = [];
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) if (!rowDone[r] && !colDone[c]) cand.push({ r, c });
      const real = cand.filter((x) => !isDummyCell(x.r, x.c));
      const pool = real.length ? real : cand;
      let best = pool[0];
      let tie = false;
      for (const x of pool.slice(1)) {
        const k = cmp(costs[x.r][x.c], costs[best.r][best.c]);
        if (k < 0) {
          best = x;
        } else if (k === 0) {
          const qa = Math.min(sLeft[x.r], dLeft[x.c]);
          const qb = Math.min(sLeft[best.r], dLeft[best.c]);
          if (qa > qb) best = x;
        }
      }
      const ties = pool.filter((x) => cmp(costs[x.r][x.c], costs[best.r][best.c]) === 0);
      tie = ties.length > 1;
      const { r, c } = best;
      const q = Math.min(sLeft[r], dLeft[c]);
      const before = { s: sLeft[r], d: dLeft[c] };
      alloc[r][c] = q;
      sLeft[r] -= q;
      dLeft[c] -= q;
      const after = markAfter(r, c);
      const body: Bi[] = [];
      const onlyBroken = pool.every((x) => isBroken(x.r, x.c));
      if (onlyBroken) {
        body.push({
          id: `Sel yang tersisa hanya jalur rusak, jadi ${cn(r, c)} terpaksa diisi.`,
          en: `Only broken routes are left, so ${cn(r, c)} has to be filled.`,
        });
      } else {
        body.push({
          id: `Di antara sel yang belum dicoret, biaya terkecil adalah ${fmt(costs[r][c])} pada ${cn(r, c)}.`,
          en: `Among the cells not yet crossed out, the smallest cost is ${fmt(costs[r][c])} at ${cn(r, c)}.`,
        });
      }
      if (tie)
        body.push({
          id: `Ada ${ties.length} sel dengan biaya sama (${ties.map((t) => cn(t.r, t.c)).join(", ")}). Dipilih sel yang bisa menampung alokasi terbesar.`,
          en: `${ties.length} cells share this cost (${ties.map((t) => cn(t.r, t.c)).join(", ")}). The one that can take the largest allocation is chosen.`,
        });
      if (!dummyNoteShown && (dummyRow || dummyCol) && real.length && cand.length !== real.length) {
        dummyNoteShown = true;
        body.push({
          id: "Sel dummy (biaya 0) sengaja diisi paling akhir, karena 0 di sana hanya angka bantu dan bukan biaya kirim sungguhan.",
          en: "Dummy cells (cost 0) are deliberately filled last, because that 0 is only a placeholder and not a real shipping cost.",
        });
      }
      body.push(after, ...cellNotes(r, c));
      steps.push({
        phase: "initial",
        title: { id: `Least Cost langkah ${stepNo}: isi ${cn(r, c)}`, en: `Least Cost step ${stepNo}: fill ${cn(r, c)}` },
        body,
        calc: [`x(${cn(r, c)}) = min(${before.s}, ${before.d}) = ${q}`],
        snap: snapNow({ focus: [{ r, c }], focusKind: isBroken(r, c) ? "warn" : "alloc" }),
        tie,
      });
    }
  } else {
    // VAM
    while (rowDone.some((x) => !x) && colDone.some((x) => !x)) {
      stepNo++;
      const activeRows = [...Array(m).keys()].filter((r) => !rowDone[r]);
      const activeCols = [...Array(n).keys()].filter((c) => !colDone[c]);
      if (activeRows.length === 1 || activeCols.length === 1) {
        // Sisa dialokasikan langsung, satu sel per langkah (urut biaya)
        const cells: Cell[] = [];
        for (const r of activeRows) for (const c of activeCols) cells.push({ r, c });
        cells.sort((a, b) => cmp(costs[a.r][a.c], costs[b.r][b.c]));
        const x = cells[0];
        const q = Math.min(sLeft[x.r], dLeft[x.c]);
        const before = { s: sLeft[x.r], d: dLeft[x.c] };
        alloc[x.r][x.c] = q;
        sLeft[x.r] -= q;
        dLeft[x.c] -= q;
        const after = markAfter(x.r, x.c);
        const single = activeRows.length === 1 ? { id: `baris ${RL[activeRows[0]]}`, en: `row ${RL[activeRows[0]]}` } : { id: `kolom ${CL[activeCols[0]]}`, en: `column ${CL[activeCols[0]]}` };
        steps.push({
          phase: "initial",
          title: { id: `VAM langkah ${stepNo}: isi ${cn(x.r, x.c)}`, en: `VAM step ${stepNo}: fill ${cn(x.r, x.c)}` },
          body: [
            {
              id: `Tinggal ${single.id} yang aktif, jadi penalti tidak perlu dihitung lagi. Sisa alokasi diisikan mulai dari sel termurah, yaitu ${cn(x.r, x.c)} (biaya ${fmt(costs[x.r][x.c])}).`,
              en: `Only ${single.en} is still active, so penalties are no longer needed. The remaining amounts go to the cheapest cell first, ${cn(x.r, x.c)} (cost ${fmt(costs[x.r][x.c])}).`,
            },
            after,
            ...cellNotes(x.r, x.c),
          ],
          calc: [`x(${cn(x.r, x.c)}) = min(${before.s}, ${before.d}) = ${q}`],
          snap: snapNow({ focus: [x], focusKind: isBroken(x.r, x.c) ? "warn" : "alloc" }),
        });
        continue;
      }
      // Hitung penalti
      const rowPen: (MV | null)[] = Array(m).fill(null);
      const colPen: (MV | null)[] = Array(n).fill(null);
      const rowMin: (MV | null)[] = Array(m).fill(null);
      const colMin: (MV | null)[] = Array(n).fill(null);
      const calc: string[] = [];
      for (const r of activeRows) {
        const cs = activeCols.map((c) => costs[r][c]).sort(cmp);
        rowPen[r] = sub(cs[1], cs[0]);
        rowMin[r] = cs[0];
        const lhs = `${fmtP(cs[1])} − ${fmtP(cs[0])}`;
        calc.push(lhs === fmt(rowPen[r]!) ? `${RL[r]}: ${lhs}` : `${RL[r]}: ${lhs} = ${fmt(rowPen[r]!)}`);
      }
      for (const c of activeCols) {
        const cs = activeRows.map((r) => costs[r][c]).sort(cmp);
        colPen[c] = sub(cs[1], cs[0]);
        colMin[c] = cs[0];
        const lhs = `${fmtP(cs[1])} − ${fmtP(cs[0])}`;
        calc.push(lhs === fmt(colPen[c]!) ? `${CL[c]}: ${lhs}` : `${CL[c]}: ${lhs} = ${fmt(colPen[c]!)}`);
      }
      type Line = { kind: "row" | "col"; idx: number; pen: MV; min: MV };
      const lines: Line[] = [
        ...activeRows.map((r) => ({ kind: "row" as const, idx: r, pen: rowPen[r]!, min: rowMin[r]! })),
        ...activeCols.map((c) => ({ kind: "col" as const, idx: c, pen: colPen[c]!, min: colMin[c]! })),
      ];
      const lineBestCell = (L: Line): Cell => {
        const cells: Cell[] =
          L.kind === "row" ? activeCols.map((c) => ({ r: L.idx, c })) : activeRows.map((r) => ({ r, c: L.idx }));
        let b = cells[0];
        for (const x of cells.slice(1)) {
          const k = cmp(costs[x.r][x.c], costs[b.r][b.c]);
          if (k < 0 || (k === 0 && Math.min(sLeft[x.r], dLeft[x.c]) > Math.min(sLeft[b.r], dLeft[b.c]))) b = x;
        }
        return b;
      };
      let pick = lines[0];
      for (const L of lines.slice(1)) {
        const k = cmp(L.pen, pick.pen);
        if (k > 0) pick = L;
        else if (k === 0) {
          const k2 = cmp(L.min, pick.min);
          if (k2 < 0) pick = L;
          else if (k2 === 0) {
            const a = lineBestCell(L);
            const b = lineBestCell(pick);
            if (Math.min(sLeft[a.r], dLeft[a.c]) > Math.min(sLeft[b.r], dLeft[b.c])) pick = L;
          }
        }
      }
      const tieCount = lines.filter((L) => cmp(L.pen, pick.pen) === 0).length;
      const { r, c } = lineBestCell(pick);
      const q = Math.min(sLeft[r], dLeft[c]);
      const before = { s: sLeft[r], d: dLeft[c] };
      const lineName = pick.kind === "row" ? { id: `baris ${RL[pick.idx]}`, en: `row ${RL[pick.idx]}` } : { id: `kolom ${CL[pick.idx]}`, en: `column ${CL[pick.idx]}` };
      const body: Bi[] = [
        {
          id: "Hitung penalti setiap baris dan kolom yang masih aktif: selisih antara biaya terkecil kedua dan biaya terkecil.",
          en: "Compute the penalty of each active row and column: the gap between the second-smallest and the smallest cost.",
        },
        {
          id: `Penalti terbesar adalah ${fmt(pick.pen)} pada ${lineName.id}. Biaya terkecil di ${lineName.id} ada di ${cn(r, c)} (${fmt(costs[r][c])}), jadi sel itu diisi.`,
          en: `The largest penalty is ${fmt(pick.pen)} on ${lineName.en}. The cheapest cell on that ${pick.kind === "row" ? "row" : "column"} is ${cn(r, c)} (${fmt(costs[r][c])}), so it gets filled.`,
        },
      ];
      if (isBigM(pick.pen))
        body.push({
          id: `Penalti yang mengandung M berarti: kalau ${lineName.id} tidak segera diisi di sel termurahnya, ia berisiko terpaksa memakai jalur rusak. Itulah sebabnya VAM sangat efektif menghindari sel M.`,
          en: `A penalty containing M means that if ${lineName.en} is not filled at its cheapest cell now, it may later be forced onto a broken route. That is why VAM is so good at avoiding M cells.`,
        });
      if (tieCount > 1)
        body.push({
          id: `Ada ${tieCount} penalti yang sama besar. Dipilih yang biaya terkecilnya paling murah, lalu yang alokasinya paling besar.`,
          en: `${tieCount} penalties are tied. The one with the cheapest minimum cost is chosen, then the one allowing the largest allocation.`,
        });
      alloc[r][c] = q;
      sLeft[r] -= q;
      dLeft[c] -= q;
      const after = markAfter(r, c);
      body.push(after, ...cellNotes(r, c));
      calc.push(`x(${cn(r, c)}) = min(${before.s}, ${before.d}) = ${q}`);
      steps.push({
        phase: "initial",
        title: { id: `VAM langkah ${stepNo}: isi ${cn(r, c)}`, en: `VAM step ${stepNo}: fill ${cn(r, c)}` },
        body,
        calc,
        snap: snapNow({
          focus: [{ r, c }],
          focusKind: isBroken(r, c) ? "warn" : "alloc",
          rowPen,
          colPen,
          penPick: { kind: pick.kind, idx: pick.idx },
        }),
        tie: tieCount > 1,
      });
    }
  }

  /* ---- Degeneracy ---- */
  const basisCount = () => alloc.flat().filter((x) => x !== null).length;
  const need = m + n - 1;
  {
    const parent = [...Array(m + n).keys()];
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const unite = (a: number, b: number) => {
      parent[find(a)] = find(b);
    };
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (alloc[r][c] !== null) unite(r, m + c);
    const have = basisCount();
    if (have < need) {
      const added: Cell[] = [];
      while (basisCount() < need) {
        let best: Cell | null = null;
        for (let r = 0; r < m; r++)
          for (let c = 0; c < n; c++) {
            if (alloc[r][c] !== null) continue;
            if (find(r) === find(m + c)) continue;
            if (!best || cmp(costs[r][c], costs[best.r][best.c]) < 0) best = { r, c };
          }
        if (!best) break;
        alloc[best.r][best.c] = 0;
        unite(best.r, m + best.c);
        added.push(best);
      }
      steps.push({
        phase: "degenerate",
        title: { id: "Atasi kemerosotan dengan ε", en: "Resolve degeneracy with ε" },
        body: [
          {
            id: `Solusi awal hanya punya ${have} sel terisi, padahal syaratnya m + n − 1 = ${m} + ${n} − 1 = ${need}. Kondisi ini disebut kemerosotan (degenerasi), dan uji optimalitas belum bisa dijalankan.`,
            en: `The initial solution has only ${have} filled cells, but the requirement is m + n − 1 = ${m} + ${n} − 1 = ${need}. This is degeneracy, and the optimality test cannot run yet.`,
          },
          {
            id: `Tambahkan ε (alokasi bernilai 0) di ${added.map((a) => cn(a.r, a.c)).join(", ")}. Sel dipilih yang biayanya kecil dan tidak membentuk loop tertutup dengan sel basis lain.`,
            en: `Add ε (an allocation worth 0) at ${added.map((a) => cn(a.r, a.c)).join(", ")}. The cells are cheap ones that do not close a loop with the other basic cells.`,
          },
        ],
        calc: [`${have} + ${added.length} = ${need} = m + n − 1`],
        snap: { alloc: clone2(alloc), focus: added, focusKind: "epsilon" },
      });
    }
  }

  const totalOf = (a: (number | null)[][]) => {
    let z = ZERO;
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (a[r][c]) z = add(z, scale(costs[r][c], a[r][c]!));
    return z;
  };
  const costTerms = (a: (number | null)[][]) => {
    const t: string[] = [];
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) if (a[r][c]) t.push(`${a[r][c]}×${fmtP(costs[r][c])}`);
    return t;
  };

  const initialAlloc = clone2(alloc);
  const initialCost = totalOf(alloc);

  steps.push({
    phase: "cost",
    title: { id: "Hitung biaya solusi awal", en: "Compute the initial solution cost" },
    body: [
      {
        id: `Solusi awal dari metode ${methodName[method].id} sudah lengkap. Jumlah sel basis = ${basisCount()} = m + n − 1, jadi solusi ini layak untuk diuji.`,
        en: `The initial solution from ${methodName[method].en} is complete. Number of basic cells = ${basisCount()} = m + n − 1, so the solution is ready to be tested.`,
      },
      isBigM(initialCost)
        ? {
            id: `Total biaya masih mengandung M. Cara membacanya: koefisien M (${initialCost.m}) adalah jumlah unit yang sedang lewat jalur rusak. Solusi awal ini belum bisa dipakai, tetapi selama masih ada rute lain yang layak, uji optimalitas pasti bisa mengosongkan jalur rusak itu.`,
            en: `The total cost still contains M. Read it this way: the M coefficient (${initialCost.m}) is the number of units currently on broken routes. This starting plan cannot be used yet, but as long as another feasible route exists, the optimality test will empty the broken route.`,
          }
        : {
            id: "Total biaya tidak mengandung M, artinya solusi awal ini sudah menghindari semua jalur rusak.",
            en: "The total cost has no M term, so this initial solution already avoids every broken route.",
          },
    ],
    calc: [`Z₀ = ${costTerms(alloc).join(" + ")}`, `Z₀ = ${fmt(initialCost)}`],
    snap: { alloc: clone2(alloc) },
  });

  /* ---- Tree utilities ---- */
  const basisCells = (): Cell[] => {
    const out: Cell[] = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (alloc[r][c] !== null) out.push({ r, c });
    return out;
  };

  /** Jalur pada pohon basis dari node baris r ke node kolom c */
  const treePath = (r0: number, c0: number): Cell[] => {
    const B = basisCells();
    const adj: { to: number; cell: Cell }[][] = Array.from({ length: m + n }, () => []);
    for (const b of B) {
      adj[b.r].push({ to: m + b.c, cell: b });
      adj[m + b.c].push({ to: b.r, cell: b });
    }
    const prev: ({ from: number; cell: Cell } | null)[] = Array(m + n).fill(null);
    const seen = Array(m + n).fill(false);
    const q = [r0];
    seen[r0] = true;
    while (q.length) {
      const x = q.shift()!;
      if (x === m + c0) break;
      for (const e of adj[x])
        if (!seen[e.to]) {
          seen[e.to] = true;
          prev[e.to] = { from: x, cell: e.cell };
          q.push(e.to);
        }
    }
    const path: Cell[] = [];
    let cur = m + c0;
    while (cur !== r0) {
      const p = prev[cur];
      if (!p) return [];
      path.push(p.cell);
      cur = p.from;
    }
    return path.reverse();
  };

  const loopFor = (r: number, c: number): LoopCell[] => {
    const path = treePath(r, c);
    const loop: LoopCell[] = [{ r, c, sign: "+" }];
    path.forEach((p, k) => loop.push({ r: p.r, c: p.c, sign: k % 2 === 0 ? "-" : "+" }));
    return loop;
  };

  const computeUV = () => {
    const u: (MV | null)[] = Array(m).fill(null);
    const v: (MV | null)[] = Array(n).fill(null);
    const eq: string[] = [];
    u[0] = ZERO;
    eq.push(`u(${RL[0]}) = 0`);
    const B = basisCells();
    let changed = true;
    let guard = 0;
    while (changed && guard++ < 1000) {
      changed = false;
      for (const b of B) {
        const cij = costs[b.r][b.c];
        if (u[b.r] && !v[b.c]) {
          v[b.c] = sub(cij, u[b.r]!);
          eq.push(`${cn(b.r, b.c)}: u(${RL[b.r]}) + v(${CL[b.c]}) = ${fmt(cij)}  ⇒  v(${CL[b.c]}) = ${fmtP(cij)} − ${fmtP(u[b.r]!)} = ${fmt(v[b.c]!)}`);
          changed = true;
        } else if (!u[b.r] && v[b.c]) {
          u[b.r] = sub(cij, v[b.c]!);
          eq.push(`${cn(b.r, b.c)}: u(${RL[b.r]}) + v(${CL[b.c]}) = ${fmt(cij)}  ⇒  u(${RL[b.r]}) = ${fmtP(cij)} − ${fmtP(v[b.c]!)} = ${fmt(u[b.r]!)}`);
          changed = true;
        }
      }
    }
    return { u, v, eq };
  };

  let iterations = 0;
  let alternateOptima = false;

  if (!options.initialOnly) {
    for (let iter = 1; iter <= 60; iter++) {
      // Hitung nilai d_ij
      const reduced: (MV | null)[][] = Array.from({ length: m }, () => Array<MV | null>(n).fill(null));
      let u: (MV | null)[] | undefined;
      let v: (MV | null)[] | undefined;
      const dCalc: string[] = [];
      if (optimality === "modi") {
        const uv = computeUV();
        u = uv.u;
        v = uv.v;
        steps.push({
          phase: "uv",
          iteration: iter,
          title: { id: `Iterasi ${iter}: hitung u dan v`, en: `Iteration ${iter}: compute u and v` },
          body: [
            {
              id: "Untuk setiap sel basis (sel terisi, termasuk ε) berlaku u_i + v_j = c_ij. Tetapkan u baris pertama = 0, lalu selesaikan persamaan secara berantai.",
              en: "Every basic cell (filled cells, including ε) satisfies u_i + v_j = c_ij. Set u of the first row to 0 and solve the equations one after another.",
            },
            {
              id: "Intuisinya: pada setiap rute yang sedang dipakai, biaya kirim c_ij dibagi habis menjadi bagian sumber (u_i) dan bagian tujuan (v_j). Pasangan u dan v ini lalu dipakai sebagai patokan harga untuk menilai rute yang belum dipakai.",
              en: "The intuition: on every route currently in use, the shipping cost c_ij is split exactly into a source part (u_i) and a destination part (v_j). These u and v values then act as reference prices for judging the unused routes.",
            },
            {
              id: "Jika biaya sel basis berupa M, nilai u atau v ikut mengandung M. Itu wajar, cukup hitung sebagai ekspresi aljabar.",
              en: "If a basic cell costs M, the resulting u or v also contains M. That is fine; just treat it as an algebraic expression.",
            },
          ],
          calc: uv.eq,
          snap: { alloc: clone2(alloc), u, v },
        });
        for (let r = 0; r < m; r++)
          for (let c = 0; c < n; c++) {
            if (alloc[r][c] !== null) continue;
            const d = sub(sub(costs[r][c], u[r]!), v[c]!);
            reduced[r][c] = d;
            const tag = isNeg(d) ? "   < 0" : isZero(d) ? "   = 0" : "";
            dCalc.push(`${cn(r, c)}: d = ${fmt(costs[r][c])} − ${fmtP(u[r]!)} − ${fmtP(v[c]!)} = ${fmt(d)}${tag}`);
          }
      } else {
        for (let r = 0; r < m; r++)
          for (let c = 0; c < n; c++) {
            if (alloc[r][c] !== null) continue;
            const L = loopFor(r, c);
            let d = ZERO;
            const parts: string[] = [];
            L.forEach((x, k) => {
              const cc = costs[x.r][x.c];
              d = x.sign === "+" ? add(d, cc) : sub(d, cc);
              parts.push(`${k === 0 ? "" : x.sign === "+" ? " + " : " − "}${fmtP(cc)}`);
            });
            reduced[r][c] = d;
            const tag = isNeg(d) ? "   < 0" : isZero(d) ? "   = 0" : "";
            dCalc.push(`${cn(r, c)}: ${parts.join("")} = ${fmt(d)}${tag}`);
          }
      }
      // Pilih sel masuk
      let enter: Cell | null = null;
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          const d = reduced[r][c];
          if (!d || !isNeg(d)) continue;
          if (!enter || cmp(d, reduced[enter.r][enter.c]!) < 0) enter = { r, c };
        }
      const anyZero = reduced.flat().some((d) => d && isZero(d));

      const evalBody: Bi[] =
        optimality === "modi"
          ? [
              {
                id: "Untuk setiap sel kosong hitung d_ij = c_ij − u_i − v_j. Nilai ini menyatakan perubahan biaya per unit jika barang dialihkan lewat sel tersebut.",
                en: "For every empty cell compute d_ij = c_ij − u_i − v_j. It tells how much the cost changes per unit if goods are rerouted through that cell.",
              },
              {
                id: "Cara membaca hasilnya: d negatif berarti mengalihkan 1 unit lewat sel itu menurunkan total biaya, jadi solusi masih bisa diperbaiki. d positif berarti pengalihan justru menambah biaya. d nol berarti biayanya tidak berubah.",
                en: "How to read the result: a negative d means rerouting 1 unit through that cell lowers the total cost, so the plan can still improve. A positive d means rerouting adds cost. A zero d means the cost stays the same.",
              },
            ]
          : [
              {
                id: "Untuk setiap sel kosong, bentuk loop tertutup melalui sel basis, lalu jumlahkan biayanya dengan tanda bergantian (+, −, +, −, …). Hasilnya adalah perubahan biaya per unit.",
                en: "For every empty cell, build a closed loop through basic cells and add the costs with alternating signs (+, −, +, −, …). The result is the cost change per unit.",
              },
            ];
      evalBody.push({
        id: "Ingat aturan M: ekspresi dibandingkan dari koefisien M dulu. Contohnya 8 − M bernilai negatif dan M − 8 bernilai positif.",
        en: "Remember the M rule: compare the M coefficient first. For example 8 − M is negative while M − 8 is positive.",
      });
      if (enter) {
        evalBody.push({
          id: `Nilai paling negatif adalah ${fmt(reduced[enter.r][enter.c]!)} di ${cn(enter.r, enter.c)}. Solusi belum optimal, dan ${cn(enter.r, enter.c)} menjadi sel masuk.`,
          en: `The most negative value is ${fmt(reduced[enter.r][enter.c]!)} at ${cn(enter.r, enter.c)}. The solution is not optimal yet, and ${cn(enter.r, enter.c)} becomes the entering cell.`,
        });
      } else {
        evalBody.push({
          id: "Tidak ada nilai negatif. Semua d_ij ≥ 0, jadi solusi sudah optimal.",
          en: "There are no negative values. Every d_ij ≥ 0, so the solution is optimal.",
        });
        if (anyZero)
          evalBody.push({
            id: "Ada sel kosong dengan nilai 0. Artinya terdapat solusi optimal alternatif dengan biaya yang sama.",
            en: "Some empty cell has value 0, so an alternative optimal solution with the same cost exists.",
          });
      }
      steps.push({
        phase: "reduced",
        iteration: iter,
        title:
          optimality === "modi"
            ? { id: `Iterasi ${iter}: uji sel kosong (d_ij)`, en: `Iteration ${iter}: test empty cells (d_ij)` }
            : { id: `Iterasi ${iter}: evaluasi loop setiap sel kosong`, en: `Iteration ${iter}: evaluate each empty cell's loop` },
        body: evalBody,
        calc: dCalc,
        snap: {
          alloc: clone2(alloc),
          u,
          v,
          reduced,
          focus: enter ? [enter] : undefined,
          focusKind: enter ? "enter" : undefined,
        },
      });

      if (!enter) {
        alternateOptima = anyZero;
        break;
      }

      // Loop & theta
      iterations++;
      const L = loopFor(enter.r, enter.c);
      const minusCells = L.filter((x) => x.sign === "-");
      const theta = Math.min(...minusCells.map((x) => alloc[x.r][x.c] as number));
      const leavingCandidates = minusCells.filter((x) => alloc[x.r][x.c] === theta);
      // Prioritaskan sel jalur rusak keluar dari basis, lalu biaya tertinggi
      leavingCandidates.sort((a, b) => cmp(costs[b.r][b.c], costs[a.r][a.c]));
      const leave = leavingCandidates[0];
      const loopStr = L.map((x) => `${cn(x.r, x.c)}(${x.sign === "+" ? "+" : "−"})`).join(" → ");
      const loopBody: Bi[] = [
        {
          id: `Bentuk loop tertutup yang dimulai dan berakhir di sel masuk ${cn(enter.r, enter.c)}. Loop hanya boleh berbelok di sel basis dan bergerak lurus horizontal atau vertikal.`,
          en: `Build a closed loop that starts and ends at the entering cell ${cn(enter.r, enter.c)}. The loop may only turn at basic cells and moves straight horizontally or vertically.`,
        },
        {
          id: `Beri tanda bergantian mulai dari sel masuk (+): ${loopStr}.`,
          en: `Assign alternating signs starting with the entering cell (+): ${loopStr}.`,
        },
        {
          id: "Kenapa tandanya bergantian? Kalau satu sel ditambah, sel lain di baris yang sama harus dikurangi agar supply tetap pas, lalu sel lain di kolomnya harus ditambah agar demand tetap pas, dan seterusnya. Loop adalah rantai penyeimbang ini.",
          en: "Why do the signs alternate? If one cell goes up, another cell in the same row must go down to keep supply exact, then another cell in that column must go up to keep demand exact, and so on. The loop is this balancing chain.",
        },
        {
          id: `θ adalah alokasi terkecil di antara sel bertanda (−). Sel tempat θ berada akan keluar dari basis: ${cn(leave.r, leave.c)}.`,
          en: `θ is the smallest allocation among the (−) cells. The cell holding θ leaves the basis: ${cn(leave.r, leave.c)}.`,
        },
      ];
      if (isBroken(leave.r, leave.c))
        loopBody.push({
          id: `Sel yang keluar adalah jalur rusak ${cn(leave.r, leave.c)}. Setelah iterasi ini, barang tidak lagi lewat rute tersebut.`,
          en: `The leaving cell is the broken route ${cn(leave.r, leave.c)}. After this iteration, no goods travel along it anymore.`,
        });
      if (leavingCandidates.length > 1)
        loopBody.push({
          id: "Ada lebih dari satu sel (−) dengan nilai θ yang sama. Hanya satu yang dikeluarkan, sisanya tetap di basis dengan alokasi 0 (ε).",
          en: "More than one (−) cell holds the same θ. Only one leaves; the others stay in the basis with allocation 0 (ε).",
        });
      steps.push({
        phase: "loop",
        iteration: iter,
        title: { id: `Iterasi ${iter}: loop dan nilai θ`, en: `Iteration ${iter}: loop and θ` },
        body: loopBody,
        calc: [
          `θ = min(${minusCells.map((x) => `${cn(x.r, x.c)} = ${alloc[x.r][x.c]}`).join(", ")}) = ${theta}`,
          `ΔZ = θ × d = ${theta} × ${fmtP(reduced[enter.r][enter.c]!)} = ${fmt(scale(reduced[enter.r][enter.c]!, theta))}`,
        ],
        snap: { alloc: clone2(alloc), loop: L, focus: [leave], focusKind: "leave" },
      });

      // Pivot
      const before = clone2(alloc);
      const zBefore = totalOf(alloc);
      const pivotCalc: string[] = [];
      for (const x of L) {
        const old = before[x.r][x.c] ?? 0;
        const nv = x.sign === "+" ? old + theta : old - theta;
        alloc[x.r][x.c] = nv;
        pivotCalc.push(`${cn(x.r, x.c)}: ${old} ${x.sign === "+" ? "+" : "−"} ${theta} = ${nv}`);
      }
      alloc[leave.r][leave.c] = null;
      const zAfter = totalOf(alloc);
      pivotCalc.push(`Z = ${costTerms(alloc).join(" + ")}`);
      pivotCalc.push(`Z = ${fmt(zAfter)}`);
      pivotCalc.push(`Z: ${fmt(zBefore)}  ⟶  ${fmt(zAfter)}`);
      steps.push({
        phase: "pivot",
        iteration: iter,
        title: { id: `Iterasi ${iter}: perbarui tabel`, en: `Iteration ${iter}: update the table` },
        body: [
          {
            id: `Tambahkan θ = ${theta} ke setiap sel (+) dan kurangkan dari setiap sel (−). Supply dan demand tetap seimbang karena setiap baris dan kolom pada loop mendapat satu tambahan dan satu pengurangan.`,
            en: `Add θ = ${theta} to every (+) cell and subtract it from every (−) cell. Supply and demand stay balanced because each row and column on the loop gets one increase and one decrease.`,
          },
          {
            id: `${cn(enter.r, enter.c)} masuk ke basis dan ${cn(leave.r, leave.c)} keluar dari basis.`,
            en: `${cn(enter.r, enter.c)} enters the basis and ${cn(leave.r, leave.c)} leaves it.`,
          },
        ],
        calc: pivotCalc,
        snap: { alloc: clone2(alloc), focus: [enter], focusKind: "alloc", loop: L },
      });
    }
  }

  const totalCost = totalOf(alloc);
  const brokenUsed: Shipment[] = [];
  for (const b of brokenCells) if ((alloc[b.r][b.c] ?? 0) > 0) brokenUsed.push({ r: b.r, c: b.c, q: alloc[b.r][b.c]! });
  const feasible = brokenUsed.length === 0;

  if (!options.initialOnly) {
    const body: Bi[] = [];
    const ships: string[] = [];
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) {
        const q = alloc[r][c];
        if (!q) continue;
        if (isDummyCell(r, c)) continue;
        ships.push(`${cn(r, c)} = ${q}`);
      }
    body.push({
      id: `Rencana pengiriman optimal: ${ships.join("; ")}.`,
      en: `Optimal shipping plan: ${ships.join("; ")}.`,
    });
    if (feasible) {
      body.push(
        brokenCells.length
          ? {
              id: "Tidak ada barang yang lewat jalur rusak. Rencana ini layak dijalankan dan sudah paling murah.",
              en: "No goods travel along a broken route. The plan is feasible and already the cheapest.",
            }
          : {
              id: "Rencana ini sudah paling murah.",
              en: "This plan is already the cheapest.",
            }
      );
    } else {
      body.push({
        id: `Walaupun sudah optimal, masih ada barang di jalur rusak (${brokenUsed.map((b) => `${cn(b.r, b.c)} = ${b.q}`).join(", ")}). Artinya masalah ini tidak punya solusi layak tanpa melewati jalur rusak. Perusahaan perlu memperbaiki jalan, mencari rute alternatif, atau menerima kekurangan pasokan.`,
        en: `Even at the optimum, goods still travel on a broken route (${brokenUsed.map((b) => `${cn(b.r, b.c)} = ${b.q}`).join(", ")}). The problem has no feasible solution without using a broken route. The company must repair the road, find an alternative route, or accept a supply shortage.`,
      });
    }
    if (dummyCol) {
      const kept = [...Array(m).keys()].filter((r) => (alloc[r][n - 1] ?? 0) > 0).map((r) => `${RL[r]} = ${alloc[r][n - 1]}`);
      if (kept.length)
        body.push({
          id: `Alokasi ke kolom Dummy berarti barang tidak dikirim dan tetap di gudang: ${kept.join(", ")} unit.`,
          en: `Allocations to the Dummy column are goods kept in the warehouse: ${kept.join(", ")} units.`,
        });
    }
    if (dummyRow) {
      const short = [...Array(n).keys()].filter((c) => (alloc[m - 1][c] ?? 0) > 0).map((c) => `${CL[c]} = ${alloc[m - 1][c]}`);
      if (short.length)
        body.push({
          id: `Alokasi dari baris Dummy berarti permintaan tidak terpenuhi: ${short.join(", ")} unit.`,
          en: `Allocations from the Dummy row are unmet demand: ${short.join(", ")} units.`,
        });
    }
    if (alternateOptima)
      body.push({
        id: "Karena ada d_ij = 0 pada sel kosong, terdapat pola pengiriman lain dengan total biaya yang sama.",
        en: "Since some empty cell has d_ij = 0, another shipping pattern with the same total cost exists.",
      });
    steps.push({
      phase: "result",
      title: { id: "Solusi optimal dan interpretasi", en: "Optimal solution and interpretation" },
      body,
      calc: [`Z* = ${costTerms(alloc).join(" + ") || "0"}`, `Z* = ${fmt(totalCost)}`],
      snap: { alloc: clone2(alloc), focus: brokenUsed.length ? brokenUsed.map((b) => ({ r: b.r, c: b.c })) : undefined, focusKind: brokenUsed.length ? "warn" : undefined },
    });
  }

  return {
    costs,
    rawCosts,
    supply,
    demand,
    rowLabels: RL,
    colLabels: CL,
    m,
    n,
    dummyRow,
    dummyCol,
    steps,
    initialAlloc,
    initialCost,
    finalAlloc: clone2(alloc),
    totalCost,
    feasible,
    brokenUsed,
    iterations,
    method,
    optimality,
    alternateOptima,
    brokenCells,
  };
}

/** Utilitas: total biaya sebagai angka (M diganti nilai besar) untuk perbandingan cepat */
export function numericCost(z: MV, bigM = 1e6) {
  return z.m * bigM + z.c;
}

export { mv };
