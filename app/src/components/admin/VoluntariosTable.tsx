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
import type { VolunteerAdmin } from '../../types/api';

const PAGE_SIZE = 20;
const col = createColumnHelper<VolunteerAdmin>();

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

const AREA_LABELS: Record<string, string> = {
  EventOrganization:     'Org. eventos',
  ContentCreation:       'Contenido',
  TechnicalSupport:      'Soporte técnico',
  SocialMediaManagement: 'Redes sociales',
  Other:                 'Otras áreas',
};

const AREA_COLORS: Record<string, string> = {
  EventOrganization:     'bg-violet-100 text-violet-800',
  ContentCreation:       'bg-sky-100 text-sky-800',
  TechnicalSupport:      'bg-emerald-100 text-emerald-800',
  SocialMediaManagement: 'bg-pink-100 text-pink-800',
  Other:                 'bg-zinc-100 text-zinc-700',
};

const BADGE = 'inline-flex items-center px-[0.5rem] py-[0.18rem] rounded-full text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap';

function AreaBadge({ area, otherAreas }: { area: string; otherAreas?: string }) {
  const label = area === 'Other' && otherAreas ? otherAreas : (AREA_LABELS[area] ?? area);
  const color = AREA_COLORS[area] ?? 'bg-zinc-100 text-zinc-700';
  return <span className={`${BADGE} ${color}`}>{label}</span>;
}

function IconBtn({
  variant, onClick, title, children,
}: {
  variant: 'violet' | 'slate';
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const colors = {
    violet: 'bg-violet-100 text-violet-800 hover:bg-violet-200',
    slate:  'bg-slate-100 text-slate-700 hover:bg-slate-200',
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

export default function VoluntariosTable() {
  const [data, setData]     = useState<VolunteerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [experienciaFilter, setExperienciaFilter] = useState('');
  const [{ pageIndex, pageSize }, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const jwt = useMemo(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('adminJwt') : null, []);

  const fetchAllPages = useCallback(async (): Promise<VolunteerAdmin[] | null> => {
    if (!jwt) return null;
    const collected: VolunteerAdmin[] = [];
    let page = 1;
    while (true) {
      const res = await apiService.getAdminVoluntarios(jwt, { pageSize: 100, page });
      if (!res.success) {
        if (/(401|403|unauthorized)/i.test(res.message ?? '')) {
          sessionStorage.removeItem('adminJwt');
          window.location.replace('/admin');
          return null;
        }
        setError(res.message ?? 'Error al cargar voluntarios.');
        return null;
      }
      const batch = res.data?.data ?? [];
      collected.push(...batch);
      if (!res.data?.hasNextPage || batch.length === 0) break;
      page++;
    }
    return collected;
  }, [jwt]);

  const load = useCallback(async () => {
    if (!jwt) { window.location.replace('/admin'); return; }
    setLoading(true);
    setError(null);
    const items = await fetchAllPages();
    if (items === null) return;
    const sorted = [...items].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setData(sorted);
    setLoading(false);
    window.dispatchEvent(new CustomEvent('voluntarios:stats-update', {
      detail: { total: sorted.length },
    }));
  }, [jwt, fetchAllPages]);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('voluntarios:refresh', onRefresh);
    return () => window.removeEventListener('voluntarios:refresh', onRefresh);
  }, [load]);

  const preFiltered = useMemo(() => {
    if (experienciaFilter === '') return data;
    const val = experienciaFilter === 'si';
    return data.filter(v => v.hasVolunteeringExperience === val);
  }, [data, experienciaFilter]);

  const columns = useMemo(() => [
    col.accessor('fullName', {
      header: 'Voluntario',
      enableSorting: true,
      cell: ({ row }) => {
        const v = row.original;
        const color = avatarColor(v.fullName || v.email);
        const ini   = initials(v.fullName || v.email.split('@')[0] || '?');
        return (
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: color }}
            >{ini}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[#0d0020] text-[13px] leading-snug">{v.fullName || '—'}</span>
              <span className="text-zinc-500 text-[12px]">{v.email || '—'}</span>
            </div>
          </div>
        );
      },
    }),
    col.accessor('city', {
      header: 'Ubicación',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-[110px]">
          <span className="text-[13px]">{row.original.city || '—'}</span>
          <span className="text-zinc-400 text-[12px]">{row.original.country || ''}</span>
        </div>
      ),
    }),
    col.accessor('areasOfInterest', {
      header: 'Áreas de interés',
      enableSorting: false,
      cell: ({ row }) => {
        const v = row.original;
        const areas = v.areasOfInterest ?? [];
        if (!areas.length) return <span className="text-zinc-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1 min-w-[160px]">
            {areas.map(a => (
              <AreaBadge key={a} area={a} otherAreas={v.otherAreas} />
            ))}
          </div>
        );
      },
    }),
    col.accessor('availableTime', {
      header: 'Disponibilidad',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-[12px] text-zinc-600 max-w-[160px] line-clamp-2 block">{getValue() || '—'}</span>
      ),
    }),
    col.accessor('hasVolunteeringExperience', {
      header: 'Experiencia',
      enableSorting: true,
      cell: ({ getValue }) => {
        const has = getValue();
        return has
          ? <span className={`${BADGE} bg-emerald-100 text-emerald-800`}>Sí</span>
          : <span className={`${BADGE} bg-zinc-100 text-zinc-600`}>No</span>;
      },
    }),
    col.accessor('createdAt', {
      header: 'Registrado',
      enableSorting: true,
      cell: ({ getValue }) => <span className="whitespace-nowrap text-[12px]">{fmtDate(getValue())}</span>,
    }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <IconBtn variant="violet" title="Ver detalle"
              onClick={() => window.dispatchEvent(new CustomEvent('voluntarios:ver-detalle', { detail: v }))}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </IconBtn>
            {v.phoneNumber && (
              <IconBtn variant="slate" title={`Llamar: ${v.phoneNumber}`}
                onClick={() => window.open(`tel:${v.phoneNumber}`, '_self')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.72 6.72l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/>
                </svg>
              </IconBtn>
            )}
          </div>
        );
      },
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
      const v = row.original;
      return `${v.fullName} ${v.email} ${v.city} ${v.country}`.toLowerCase().includes(q);
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
            placeholder="Buscar por nombre, email o ciudad…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            className={`${inputCls} pl-8 w-full`}
            autoComplete="off"
          />
        </div>
        <select
          value={experienciaFilter}
          onChange={e => { setExperienciaFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
          className={selectCls}
          aria-label="Filtrar por experiencia"
        >
          <option value="">Toda la experiencia</option>
          <option value="si">Con experiencia</option>
          <option value="no">Sin experiencia</option>
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden overflow-x-auto shadow-sm">

        {loading && (
          <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-zinc-500 text-sm">
            <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>Cargando voluntarios…</span>
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p className="m-0 font-semibold text-zinc-700">Sin voluntarios</p>
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
              return `Mostrando ${start}–${end} de ${total} voluntarios`;
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
