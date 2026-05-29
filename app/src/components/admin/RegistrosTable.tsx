import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { apiService } from '../../services/api';
import type { AdminRegistro, EventoAPI } from '../../types/api';

const PAGE_SIZE = 20;
const col = createColumnHelper<AdminRegistro>();

const AVATAR_COLORS = ['#5b21b6','#0369a1','#0f766e','#b45309','#be185d','#7c3aed','#1d4ed8'];

function avatarColor(name: string) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

const BADGE = 'inline-flex items-center px-[0.55rem] py-[0.2rem] rounded-full text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap';

const ESTADO_CONFIG: Record<string, [string, string]> = {
  pendiente: [`${BADGE} bg-amber-100 text-amber-900`,  'Pendiente'],
  pagado:    [`${BADGE} bg-emerald-100 text-emerald-800`, 'Aprobado'],
  rechazado: [`${BADGE} bg-red-100 text-red-800`,   'Rechazado'],
  cancelado: [`${BADGE} bg-zinc-100 text-zinc-600`,  'Cancelado'],
};

function EstadoBadge({ estado }: { estado: string }) {
  const [cls, label] = ESTADO_CONFIG[estado] ?? [`${BADGE} bg-zinc-100 text-zinc-600`, estado];
  return <span className={cls}>{label}</span>;
}

function IconBtn({
  variant, onClick, title, children,
}: {
  variant: 'green' | 'amber' | 'red';
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    amber: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    red:   'bg-red-100 text-red-900 hover:bg-red-200',
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md border-0 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 ${colors[variant]}`}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function RegistrosTable() {
  const [data, setData]       = useState<AdminRegistro[]>([]);
  const [eventos, setEventos] = useState<EventoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch]   = useState('');
  const [eventoFilter, setEventoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const jwt = useMemo(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('adminJwt') : null, []);

  const storageBase = useMemo(() =>
    typeof window !== 'undefined' ? ((window as any).__storageBase as string ?? '').replace(/\/$/, '') : '', []);

  function comprobanteUrl(raw?: string | null) {
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const base = storageBase || (import.meta.env.PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
    return `${base}/${raw}`;
  }

  const fetchAllPages = useCallback(async (eventoId?: string): Promise<AdminRegistro[] | null> => {
    if (!jwt) return null;
    const collected: AdminRegistro[] = [];
    let page = 1;
    while (true) {
      const res = await apiService.getAdminRegistros(jwt, { eventoId, pageSize: 100, page });
      if (!res.success) {
        if (/(401|403|unauthorized)/i.test(res.message ?? '')) {
          sessionStorage.removeItem('adminJwt');
          window.location.replace('/admin');
          return null;
        }
        setError(res.message ?? 'Error al cargar registros.');
        return null;
      }
      const batch = res.data?.data ?? [];
      collected.push(...batch);
      if (!res.data?.hasNextPage || batch.length === 0) break;
      page++;
    }
    return collected;
  }, [jwt]);

  const load = useCallback(async (eventoId?: string) => {
    if (!jwt) { window.location.replace('/admin'); return; }
    setLoading(true);
    setError(null);
    const items = await fetchAllPages(eventoId);
    if (items === null) return;
    const sorted = [...items].sort((a, b) =>
      new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime());
    setData(sorted);
    setLoading(false);

    let pendiente = 0, pagado = 0, rechazado = 0;
    sorted.forEach(r => {
      if (r.estado === 'pendiente') pendiente++;
      else if (r.estado === 'pagado') pagado++;
      else if (r.estado === 'rechazado') rechazado++;
    });
    window.dispatchEvent(new CustomEvent('tabla:stats-update', {
      detail: { total: sorted.length, pendiente, pagado, rechazado },
    }));
  }, [jwt, fetchAllPages]);

  // Load events for the dropdown
  useEffect(() => {
    if (!jwt) return;
    apiService.getAdminEventos(jwt).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setEventos(res.data.sort((a, b) => (b.fechaEvento ?? '').localeCompare(a.fechaEvento ?? '')));
      }
    });
  }, [jwt]);

  useEffect(() => {
    load();
    const onRefresh = () => {
      const evt = eventos.find(e => e.slug === eventoFilter);
      load(evt?.id ?? undefined);
    };
    window.addEventListener('tabla:refresh', onRefresh);
    return () => window.removeEventListener('tabla:refresh', onRefresh);
  }, [load, eventoFilter, eventos]);

  const handleEventoChange = (slug: string) => {
    setEventoFilter(slug);
    setPagination(p => ({ ...p, pageIndex: 0 }));
    const evt = eventos.find(e => e.slug === slug);
    load(evt?.id ?? undefined);
  };

  const preFiltered = useMemo(() => {
    if (!estadoFilter) return data;
    return data.filter(r => r.estado === estadoFilter);
  }, [data, estadoFilter]);

  const columns = useMemo(() => [
    col.accessor('nombreAsistente', {
      header: 'Asistente',
      enableSorting: true,
      cell: ({ row }) => {
        const r = row.original;
        const name  = r.nombreAsistente || '';
        const email = r.emailAsistente  || '';
        const color = avatarColor(name || email || r.idCorto);
        const ini   = initials(name || email.split('@')[0] || '?');
        return (
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: color }}
            >{ini}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[#0d0020] text-[13px] leading-snug">{name || '—'}</span>
              <span className="text-zinc-500 text-[12px]">{email || '—'}</span>
              <code className="text-[10px] font-mono bg-violet-100 text-violet-700 px-1.5 py-0 rounded w-fit">{r.idCorto}</code>
            </div>
          </div>
        );
      },
    }),
    col.accessor('empresaAsistente', {
      header: 'Empresa / Cargo',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[130px]">
          <span>{row.original.empresaAsistente || '—'}</span>
          {row.original.cargoAsistente && (
            <span className="text-zinc-400 text-[12px]">{row.original.cargoAsistente}</span>
          )}
        </div>
      ),
    }),
    col.accessor('estado', {
      header: 'Estado',
      enableSorting: true,
      cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
    }),
    col.accessor('registradoEn', {
      header: 'Registrado',
      enableSorting: true,
      cell: ({ getValue }) => <span className="whitespace-nowrap">{fmtDate(getValue())}</span>,
    }),
    col.display({
      id: 'comprobante',
      header: 'Comprobante',
      cell: ({ row }) => {
        const url = comprobanteUrl(row.original.comprobanteUrl);
        return url
          ? <button type="button" className="text-violet-600 hover:text-violet-800 text-[13px] font-medium hover:underline cursor-pointer"
              onClick={() => window.dispatchEvent(new CustomEvent('tabla:ver-comp', { detail: { url } }))}
            >Ver</button>
          : <span className="text-zinc-400">—</span>;
      },
    }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {r.estado === 'pendiente' && (
              <>
                <IconBtn variant="green" title="Aprobar pago"
                  onClick={() => window.dispatchEvent(new CustomEvent('tabla:aprobar', { detail: { id: r.id } }))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </IconBtn>
                <IconBtn variant="amber" title="Rechazar pago"
                  onClick={() => window.dispatchEvent(new CustomEvent('tabla:rechazar', { detail: { id: r.id } }))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </IconBtn>
              </>
            )}
            <IconBtn variant="red" title="Eliminar registro"
              onClick={() => window.dispatchEvent(new CustomEvent('tabla:eliminar', { detail: { id: r.id } }))}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </IconBtn>
          </div>
        );
      },
    }),
  ], [comprobanteUrl]);

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const table = useReactTable({
    data: preFiltered,
    columns,
    state: { sorting, globalFilter: search, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (v) => { setSearch(v); setPagination(p => ({ ...p, pageIndex: 0 })); },
    onPaginationChange: setPagination,
    globalFilterFn: (row, _, filterValue) => {
      const q = String(filterValue).toLowerCase();
      const r = row.original;
      return `${r.nombreAsistente} ${r.emailAsistente} ${r.idCorto}`.toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const inputCls = 'h-9 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition';
  const selectCls = `${inputCls} pr-8 cursor-pointer`;

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o código…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            className={`${inputCls} pl-8 w-full`}
            autoComplete="off"
          />
        </div>
        <select
          value={eventoFilter}
          onChange={e => handleEventoChange(e.target.value)}
          className={selectCls}
          aria-label="Filtrar por evento"
        >
          <option value="">Todos los eventos</option>
          {eventos.map(e => (
            <option key={e.slug} value={e.slug}>{e.nombre}</option>
          ))}
        </select>
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }} className={selectCls} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="rechazado">Rechazado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden overflow-x-auto shadow-sm">

        {loading && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-zinc-500 text-sm">
            <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>Cargando registros…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 px-5 py-3.5 bg-red-50 text-red-700 text-sm" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-zinc-500 text-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
            <p className="m-0 font-semibold text-zinc-700">Sin registros</p>
            <p className="m-0 text-[13px] text-zinc-400">No hay resultados para los filtros aplicados.</p>
          </div>
        )}

        {!loading && !error && table.getRowModel().rows.length > 0 && (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className={`px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.05em] bg-violet-50 border-b border-violet-100 whitespace-nowrap select-none group ${h.column.getCanSort() ? 'cursor-pointer hover:text-violet-700' : ''}`}
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && <SortIcon sorted={h.column.getIsSorted()} />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-violet-50/40 transition-colors duration-100"
                  style={{ animation: `rowIn 0.28s ease ${i * 25}ms both` }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3.5 align-middle text-zinc-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[13px] text-zinc-500">
            {(() => {
              const total = table.getFilteredRowModel().rows.length;
              const start = pageIndex * pageSize + 1;
              const end   = Math.min((pageIndex + 1) * pageSize, total);
              return `Mostrando ${start}–${end} de ${total} registros`;
            })()}
          </span>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>←</PageBtn>
            {buildPageRange(pageIndex + 1, table.getPageCount()).map((p, i) =>
              p === '…'
                ? <span key={`el-${i}`} className="px-1 text-zinc-400 text-xs">…</span>
                : <PageBtn key={p} onClick={() => table.setPageIndex((p as number) - 1)} active={p === pageIndex + 1}>{p}</PageBtn>
            )}
            <PageBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>→</PageBtn>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-0 leading-none text-[8px] opacity-50 group-hover:opacity-100">
      <span style={{ opacity: sorted === 'asc' ? 1 : 0.4 }}>▲</span>
      <span style={{ opacity: sorted === 'desc' ? 1 : 0.4 }}>▼</span>
    </span>
  );
}

function PageBtn({ onClick, disabled, active, children }: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-violet-700 text-white border-violet-700'
          : 'border-zinc-200 text-zinc-600 hover:bg-violet-50 bg-white'
      }`}
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}
