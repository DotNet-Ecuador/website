# Findings: Admin CRUD de Eventos

## Design System (de registros.astro + tailwind.config.js)

### Paleta de colores
| Token | Valor | Uso |
|-------|-------|-----|
| `#0d0020` | sidebar bg, page-title | Background oscuro principal |
| `#f0eeff` | main bg | Fondo del área de contenido |
| `#5b21b6` | btn-primary, accent | Purple primario |
| `#4c1d95` | btn-primary hover | Purple hover |
| `#c4b5fd` | nav-item active text | Purple claro |
| `rgba(139,92,246,0.18)` | nav-item active bg | Active state |
| `#ede9ff` | card border, table header bg | Lavender suave |
| `#faf8ff` | table hover, field-input bg | Off-white lavender |

### Tipografía
- Font: `Inter` (admin), `DM Sans` (login)
- Tamaños: `0.6875rem` labels caps, `0.8125rem` body, `1.375rem` page-title

### Componentes existentes reutilizables
- `.shell` — grid 230px sidebar + 1fr main
- `.sidebar`, `.sidebar-nav`, `.nav-item`, `.nav-item--active`, `.logout-btn`
- `.main`, `.page-header`, `.page-title`, `.page-sub`
- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`
- `.stat-card`, `.stats-row` (4 col grid)
- `.toolbar`, `.search-wrap`, `.search-input`, `.filter-select`
- `.table-card`, `.data-table` + thead/tbody styles
- `.overlay`, `.modal`, `.modal--form`, `.modal-header`, `.modal-footer`
- `.form-grid`, `.field`, `.field--full`, `.field-input`, `.field-label`
- `.badge--*` (amber, green, red, gray)
- `.icon-btn--*` (green, amber, red)
- `.spin` animation, `.hidden` utility
- `.state-box` (loading, empty, error states)

### Animaciones ya definidas en base.css
- `shimmer` (skeleton)
- `float` (3s ease-in-out)
- `pulse-glow` (box-shadow pulse)
- `gradient-shift` (gradient text)
- `.animation-fade-scale` (opacity + translateY + scale)
- `.stagger-1..10` (animation-delay)

## Schema: EventoAPI (types/api.ts)

```typescript
interface EventoAPI {
  _id?: string;           // read-only
  slug: string;           // required, URL-safe, unique
  nombre: string;         // required, max 120
  descripcion?: string;   // optional, max 2000
  fechaEvento?: string;   // optional, ISO datetime
  fechaFin?: string;      // optional, ISO datetime (must be > fechaEvento)
  lugar?: string;         // optional, max 200
  precio?: number;        // optional, min 0, decimal
  capacidadMaxima?: number; // optional, integer, min 1
  activo: boolean;        // required
  tipo?: string;          // optional: meetup|workshop|conference|webinar
  formato?: string;       // optional: presencial|virtual|hibrido
  networking?: boolean;   // optional
  tags?: string[];        // optional, max 10 tags, each max 30 chars
  speakers?: EventoSpeakerAPI[]; // optional, dynamic list
  imagen?: string;        // optional, URL
  coverImage?: string;    // optional, URL
}

interface EventoSpeakerAPI {
  nombre: string;   // required, max 100
  rol: string;      // required, max 100
  avatar?: string;  // optional, URL
}
```

## API Methods (services/api.ts)

### Existentes
- `getAdminEventos(jwt)` → GET `/api/v1/admin/eventos`
- `crearEvento(data, jwt)` → POST `/api/v1/admin/eventos`
- `getEvento(slug)` → GET `/api/v1/eventos/{slug}` (público)

### Faltantes (agregar)
- `actualizarEvento(slug, data, jwt)` → PUT `/api/v1/admin/eventos/{slug}`
- `eliminarEvento(slug, jwt)` → DELETE `/api/v1/admin/eventos/{slug}`

## Validaciones por campo

| Campo | Tipo | Reglas |
|-------|------|--------|
| slug | string | required, pattern `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, max 80, solo en creación (read-only en edición) |
| nombre | string | required, trim, min 3, max 120 |
| descripcion | string | optional, trim, max 2000 |
| fechaEvento | datetime | optional; si fechaFin presente → debe ser anterior |
| fechaFin | datetime | optional; debe ser posterior a fechaEvento |
| lugar | string | optional, trim, max 200 |
| precio | number | optional, min 0, step 0.01, parseFloat |
| capacidadMaxima | number | optional, integer (parseInt), min 1, max 10000 |
| tipo | enum | optional, one of: meetup/workshop/conference/webinar |
| formato | enum | optional, one of: presencial/virtual/hibrido |
| networking | boolean | optional, checkbox |
| activo | boolean | required |
| tags | string[] | optional, split por coma, trim cada uno, max 10, cada tag max 30 chars, sin duplicados |
| imagen | URL string | optional, must start with http:// o https:// si se provee |
| coverImage | URL string | optional, same URL validation |
| speakers[].nombre | string | required (si speaker existe), max 100 |
| speakers[].rol | string | required (si speaker existe), max 100 |
| speakers[].avatar | URL string | optional, URL validation |

## Estructura de la página /admin/eventos

```
Shell (sidebar + main)
├── Sidebar (igual a registros.astro)
│   ├── Logo
│   ├── Nav: "Registrados" (link) 
│   ├── Nav: "Eventos" (active)  ← nuevo
│   └── Logout
└── Main
    ├── Page Header
    │   ├── Title: "Eventos" + sub
    │   └── Actions: [+ Nuevo evento] 
    ├── Stats Row (4 cards)
    │   ├── Total eventos
    │   ├── Activos
    │   ├── Inactivos
    │   └── Con speakers
    ├── Toolbar
    │   ├── Search (nombre/slug)
    │   ├── Filter: tipo
    │   ├── Filter: formato
    │   └── Filter: activo
    ├── Table Card
    │   ├── State: loading (spinner)
    │   ├── State: empty
    │   ├── State: error
    │   └── Table
    │       ├── th: Evento (nombre + slug chip)
    │       ├── th: Fecha
    │       ├── th: Lugar
    │       ├── th: Precio
    │       ├── th: Cap.
    │       ├── th: Tipo/Formato
    │       ├── th: Estado
    │       └── th: Acciones (edit + delete)
    └── Pagination
    
Drawer (right slide) — Crear/Editar
├── Header (título + close)
├── Form sections (tabs or stacked)
│   ├── Sección: Info básica
│   │   ├── slug (text, disabled en edición)
│   │   ├── nombre (text, required)
│   │   ├── descripcion (textarea)
│   │   ├── tipo (select)
│   │   ├── formato (select)
│   │   ├── tags (text con chips)
│   │   ├── networking (toggle)
│   │   └── activo (toggle)
│   ├── Sección: Fecha y lugar
│   │   ├── fechaEvento (datetime-local)
│   │   ├── fechaFin (datetime-local)
│   │   └── lugar (text)
│   ├── Sección: Precio y capacidad
│   │   ├── precio (number)
│   │   └── capacidadMaxima (number)
│   ├── Sección: Imágenes
│   │   ├── imagen (text/URL)
│   │   └── coverImage (text/URL)
│   └── Sección: Speakers (dynamic list)
│       ├── [+ Agregar speaker]
│       └── Speaker items: nombre + rol + avatar + [remove]
└── Footer: [Cancelar] [Guardar]

Modal: Confirmar eliminación
├── Icono de advertencia
├── Texto de confirmación (con nombre del evento)
└── [Cancelar] [Eliminar]

Toast: Feedback
├── Success (verde)
└── Error (rojo)
```

## Animaciones planeadas

| Elemento | Animación |
|----------|-----------|
| Filas de tabla | `animation-fade-scale` con `stagger-1..N` al cargar |
| Drawer | `translateX(100%) → translateX(0)` con `cubic-bezier(0.4, 0, 0.2, 1)` 300ms |
| Overlay | `opacity: 0 → 1` 200ms |
| Stats cards | `slideUp` con stagger al cargar |
| Botones acción | `scale(1.08)` on hover, `scale(0.95)` on active |
| Toggle switches | Smooth `translateX` + color transition |
| Tag chips | Scale + fade al agregar/quitar |
| Speaker rows | Slide down + fade al agregar, slide up + fade al quitar |
| Toast | Slide in desde abajo + auto-dismiss con fade out |
| Form fields | Focus ring `box-shadow` purple glow |
| Delete modal | Slight `scale(0.95) → scale(1)` on enter |
