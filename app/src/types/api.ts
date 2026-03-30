// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

// Volunteer Application Types
export type AreaOfInterest = 
  | 'EventOrganization'
  | 'ContentCreation' 
  | 'TechnicalSupport'
  | 'SocialMediaManagement'
  | 'Other';

export interface VolunteerApplicationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  hasVolunteeringExperience: boolean;
  areasOfInterest: AreaOfInterest[];
  otherAreas?: string;
  availableTime: string;
  skillsOrKnowledge: string;
  whyVolunteer: string;
  additionalComments?: string;
}

export interface VolunteerApplicationResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  message?: string;
}

// HTTP Error Types
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: ApiError[]
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ApiError[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// HTTP Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retryAttempts?: number;
}

// ─── Evento API (source of truth: MongoDB) ───────────────────────────────────

export interface EventoSpeakerAPI {
  nombre: string;
  rol: string;
  avatar?: string;
}

export interface EventoAPI {
  _id?: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  fechaEvento?: string;
  fechaFin?: string;
  lugar?: string;
  precio?: number;
  capacidadMaxima?: number;
  activo: boolean;
  tipo?: string;
  formato?: string;
  networking?: boolean;
  tags?: string[];
  speakers?: EventoSpeakerAPI[];
  imagen?: string;
  coverImage?: string;
}

// ─── Event Registration Types ────────────────────────────────────────────────

export interface DatosTransferencia {
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  titular: string;
  ruc?: string;
}

export interface RegistroRequest {
  eventoSlug: string;
  nombre: string;
  email: string;
  empresa?: string;
  cargo?: string;
  telefono: string;
  aceptaMarketing: boolean;
}

export interface RegistroResponse {
  registroId: string;
  idCorto: string;
  sessionToken: string;
  datosTransferencia: DatosTransferencia;
  monto: number;
  nombreEvento?: string;
}

export interface EstadoRegistro {
  estado: 'pendiente' | 'pagado' | 'rechazado' | 'cancelado';
  idCorto: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminRegistro {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  cargo?: string;
  telefono: string;
  estado: 'pendiente' | 'pagado' | 'rechazado' | 'cancelado';
  referenciaTransferencia?: string;
  comprobanteUrl?: string;
  idCorto: string;
  creadoEn: string;
}

export interface AdminListResponse {
  items: AdminRegistro[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface EventoAdminRequest {
  slug: string;
  nombre: string;
  descripcion: string;
  fechaEvento: string;
  lugar: string;
  precio: number;
  capacidadMaxima: number;
  activo: boolean;
  datosTransferencia: DatosTransferencia;
}