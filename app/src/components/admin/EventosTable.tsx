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
import type { EventoAPI } from '../../types/api';

const PAGE_SIZE = 10;
const col = createColumnHelper<EventoAPI>();

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPrecio(precio?: number) {
  if (precio === undefined || precio === null) return '—';
  return precio === 0 ? 'Gratis' : `$${precio.toFixed(2)}`;
}

function fmtCap(cupos?: number, max?: number) {
  if (!max) return '—';
  return cupos !== undefined && cupos !== null ? `${cupos} / ${max}` : String(max);
}

// ── Sub-components ─────────────────────────────────────────────────────────

const TIPO_COLORS: Record<string, string> = {
  meetup:     'bg-blue-100 text-blue-800',
  taller:     'bg-violet-100 text-violet-800',
  workshop:   'bg-violet-100 text-violet-800',
  conference: 'bg-indigo-100 text-indigo-800',
  webinar:    'bg-teal-100 text-teal-800',
};

const FORMATO_COLORS: Record<string, string> = {
  presencial: 'bg-emerald-100 text-emerald-800',
  virtual:    'bg-sky-100 text-sky-800',
  hibrido:    'bg-amber-100 text-amber-800',
};

const FORMATO_LABELS: Record<string, string> = { hibrido: 'Híbrido' };

const BADGE = 'inline-flex items-center px-[0.55rem] py-[0.2rem] rounded-full text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap';

function TipoBadge({ tipo }: { tipo?: string }) {
  if (!tipo) return null;
  const cls = TIPO_COLORS[tipo] ?? 'bg-zinc-100 text-zinc-600';
  return <span className={`${BADGE} ${cls}`}>{tipo}</span>;
}

function FormatoBadge({ formato }: { formato?: string }) {
  if (!formato) return null;
  const cls = FORMATO_COLORS[formato] ?? 'bg-zinc-100 text-zinc-600';
  return <span className={`${BADGE} ${cls}`}>{FORMATO_LABELS[formato] ?? formato}</span>;
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-0 leading-none text-[8px] opacity-50 group-hover:opacity-100">
      <span style={{ color: sorted === 'asc' ? 'currentColor' : undefined, opacity: sorted === 'asc' ? 1 : 0.4 }}>▲</span>
      <span style={{ color: sorted === 'desc' ? 'currentColor' : undefined, opacity: sorted === 'desc' ? 1 : 0.4 }}>▼</span>
    </span>
  );
}

function IconBtn({
  variant, onClick, title, children,
}: {
  variant: 'blue' | 'red';
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    red:  'bg-red-100 text-red-900 hover:bg-red-200',
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

function EventoCell({ e }: { e: EventoAPI }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-[#0d0020] leading-snug">{e.nombre}</span>
      <code className="text-[11px] font-mono bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded w-fit">{e.slug}</code>
      {(e.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {e.tags!.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-1.5 py-0 rounded-full">{t}</span>
          ))}
          {e.tags!.length > 3 && (
            <span className="text-[10px] font-medium bg-violet-100 text-violet-700 px-1.5 rounded-full">+{e.tags!.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Table component ────────────────────────────────────────────────────────

export default function EventosTable() {
  const [data, setData]       = useState<EventoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch]   = useState('');
  const [tipoFilter, setTipoFilter]     = useState('');
  const [formatoFilter, setFormatoFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const jwt = useMemo(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('adminJwt') : null, []);

  const load = useCallback(async () => {
    if (!jwt) { window.location.replace('/admin'); return; }
    setLoading(true);
    setError(null);
    const res = await apiService.getAdminEventos(jwt);
    if (!res.success) {
      if (/(401|403|unauthorized)/i.test(res.message ?? '')) {
        sessionStorage.removeItem('adminJwt');
        window.location.replace('/admin');
        return;
      }
      setError(res.message ?? 'Error al cargar eventos.');
      setLoading(false);
      return;
    }
    const items = (Array.isArray(res.data) ? res.data : [])
      .sort((a, b) => (b.fechaEvento ?? '').localeCompare(a.fechaEvento ?? ''));
    setData(items);
    setLoading(false);
    window.dispatchEvent(new CustomEvent('tabla:stats-update', {
      detail: {
        total:     items.length,
        activos:   items.filter(e => e.activo).length,
        inactivos: items.filter(e => !e.activo).length,
        speakers:  items.filter(e => (e.speakers?.length ?? 0) > 0).length,
      },
    }));
  }, [jwt]);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('tabla:refresh', onRefresh);
    return () => window.removeEventListener('tabla:refresh', onRefresh);
  }, [load]);

  // Dropdown pre-filter (outside TanStack so globalFilter handles only search)
  const preFiltered = useMemo(() => {
    let d = data;
    if (tipoFilter)   d = d.filter(e => e.tipo === tipoFilter);
    if (formatoFilter) d = d.filter(e => e.formato === formatoFilter);
    if (activoFilter === 'activo')   d = d.filter(e => e.activo);
    if (activoFilter === 'inactivo') d = d.filter(e => !e.activo);
    return d;
  }, [data, tipoFilter, formatoFilter, activoFilter]);

  const columns = useMemo(() => [
    col.accessor('nombre', {
      header: 'Evento',
      enableSorting: true,
      cell: ({ row }) => <EventoCell e={row.original} />,
    }),
    col.accessor('fechaEvento', {
      header: 'Fecha',
      enableSorting: true,
      cell: ({ getValue }) => <span className="whitespace-nowrap">{fmtDate(getValue())}</span>,
    }),
    col.accessor('lugar', {
      header: 'Lugar',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="block max-w-[150px] truncate">{getValue() || '—'}</span>
      ),
    }),
    col.accessor('precio', {
      header: 'Precio',
      enableSorting: true,
      cell: ({ getValue }) => <span className="whitespace-nowrap">{fmtPrecio(getValue())}</span>,
    }),
    col.accessor('capacidadMaxima', {
      header: 'Capacidad',
      enableSorting: true,
      cell: ({ row }) => fmtCap(row.original.cuposDisponibles, row.original.capacidadMaxima),
    }),
    col.display({
      id: 'tipoFormato',
      header: 'Tipo / Formato',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 items-start">
          <TipoBadge tipo={row.original.tipo} />
          <FormatoBadge formato={row.original.formato} />
        </div>
      ),
    }),
    col.accessor('activo', {
      header: 'Estado',
      enableSorting: true,
      cell: ({ getValue }) =>
        getValue()
          ? <span className={`${BADGE} bg-emerald-100 text-emerald-800`}>Activo</span>
          : <span className={`${BADGE} bg-zinc-100 text-zinc-600`}>Inactivo</span>,
    }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <IconBtn variant="blue" title="Editar evento"
            onClick={() => window.dispatchEvent(new CustomEvent('tabla:edit-evento', { detail: row.original }))}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>
          <IconBtn variant="red" title="Eliminar evento"
            onClick={() => window.dispatchEvent(new CustomEvent('tabla:delete-evento', {
              detail: { slug: row.original.slug, nombre: row.original.nombre },
            }))}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </IconBtn>
        </div>
      ),
    }),
  ], []);

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
      return `${row.original.nombre} ${row.original.slug}`.toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  // ── Render ──────────────────────────────────────────────────────────────

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
            placeholder="Buscar por nombre o slug…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            className={`${inputCls} pl-8 w-full`}
            autoComplete="off"
          />
        </div>
        <select value={tipoFilter} onChange={handleFilterChange(setTipoFilter)} className={selectCls} aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option value="meetup">Meetup</option>
          <option value="taller">Taller</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conferencia</option>
          <option value="webinar">Webinar</option>
        </select>
        <select value={formatoFilter} onChange={handleFilterChange(setFormatoFilter)} className={selectCls} aria-label="Filtrar por formato">
          <option value="">Todos los formatos</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <select value={activoFilter} onChange={handleFilterChange(setActivoFilter)} className={selectCls} aria-label="Filtrar por estado">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden overflow-x-auto shadow-sm">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-zinc-500 text-sm">
            <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>Cargando eventos…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 px-5 py-3.5 bg-red-50 text-red-700 text-sm" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-zinc-500 text-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p className="m-0 font-semibold text-zinc-700">Sin eventos</p>
            <p className="m-0 text-[13px] text-zinc-400">No hay resultados para los filtros aplicados.</p>
          </div>
        )}

        {/* Table */}
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
                  style={{ animation: `rowIn 0.28s ease ${i * 35}ms both` }}
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
              return `Mostrando ${start}–${end} de ${total} eventos`;
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
