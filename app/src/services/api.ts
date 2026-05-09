const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.dotnetecuador.com';

export interface VolunteerApplicationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  hasVolunteeringExperience: boolean;
  areasOfInterest: string[];
  otherAreas: string;
  availableTime: string;
  skillsOrKnowledge: string;
  whyVolunteer: string;
  additionalComments: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

import type {
  RegistroRequest,
  RegistroResponse,
  EstadoRegistro,
  RecuperarRegistroResponse,
  AdminListResponse,
  LoginRequest,
  LoginResponse,
  EventoAdminRequest,
  PromoCodeValidateRequest,
  PromoCodeValidateResponse,
  InstitucionDto,
  SolicitudMentoriaRequest,
  SolicitudMentoriaResponse,
} from '../types/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private errorMessage(result: any, status: number): string {
    return result.detail || result.message || result.title || `Error ${status}`;
  }

  private async post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(this.errorMessage(result, response.status));
      return { success: true, data: result.data ?? result, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error inesperado' };
    }
  }

  private async get<T>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'Accept': 'application/json', ...headers },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(this.errorMessage(result, response.status));
      return { success: true, data: result.data ?? result, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error inesperado' };
    }
  }

  private async patch<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(this.errorMessage(result, response.status));
      return { success: true, data: result.data ?? result, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error inesperado' };
    }
  }

  async submitVolunteerApplication(data: VolunteerApplicationRequest): Promise<ApiResponse<any>> {
    return this.post('/api/v1/volunteer-application/apply', data);
  }

  async getEvento(slug: string): Promise<ApiResponse<any>> {
    return this.get(`/api/v1/eventos/${slug}`);
  }

  async getEventos(): Promise<ApiResponse<any[]>> {
    return this.get('/api/v1/eventos');
  }

  async getDatosCuenta(): Promise<ApiResponse<any>> {
    return this.get('/api/v1/pago/datos-cuenta');
  }

  async crearRegistro(data: RegistroRequest): Promise<ApiResponse<RegistroResponse>> {
    return this.post('/api/v1/registros', data);
  }

  async subirComprobante(
    registroId: string,
    referenciaTransferencia: string,
    archivo: File | null,
    sessionToken: string
  ): Promise<ApiResponse<void>> {
    try {
      const formData = new FormData();
      formData.append('referenciaPago', referenciaTransferencia);
      if (archivo) formData.append('comprobante', archivo);

      const response = await fetch(`${this.baseUrl}/api/v1/registros/${registroId}/comprobante`, {
        method: 'POST',
        headers: { 'X-Session-Token': sessionToken },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Error ${response.status}`);
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error inesperado' };
    }
  }

  async getEstadoRegistro(registroId: string): Promise<ApiResponse<EstadoRegistro>> {
    return this.get(`/api/v1/registros/${registroId}/estado`);
  }

  async recuperarRegistro(email: string, eventoSlug: string): Promise<ApiResponse<RecuperarRegistroResponse>> {
    const qs = new URLSearchParams({ email, eventoSlug });
    return this.get(`/api/v1/registros/recuperar?${qs}`);
  }

  async adminLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post('/api/v1/auth/login', data);
  }

  async getAdminRegistros(
    jwt: string,
    params: { eventoId?: string; estado?: string; page?: number; pageSize?: number }
  ): Promise<ApiResponse<AdminListResponse>> {
    const qs = new URLSearchParams();
    if (params.eventoId) qs.set('eventoId', params.eventoId);
    if (params.estado) qs.set('estado', params.estado);
    qs.set('page', String(params.page ?? 1));
    qs.set('pageSize', String(params.pageSize ?? 50));
    return this.get(`/api/v1/admin/eventos/registros?${qs}`, { Authorization: `Bearer ${jwt}` });
  }

  async aprobarRegistro(registroId: string, jwt: string): Promise<ApiResponse<void>> {
    return this.patch(`/api/v1/admin/eventos/registros/${registroId}/aprobar`, '', {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async rechazarRegistro(registroId: string, motivo: string, jwt: string): Promise<ApiResponse<void>> {
    return this.patch(`/api/v1/admin/eventos/registros/${registroId}/rechazar`, { motivo }, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async eliminarRegistro(registroId: string, jwt: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/admin/eventos/registros/${registroId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', Authorization: `Bearer ${jwt}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(this.errorMessage(result, response.status));
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error inesperado' };
    }
  }

  async exportarCSV(eventoId: string, jwt: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/eventos/registros/exportar?eventoId=${eventoId}`,
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    if (!response.ok) throw new Error('Error al exportar CSV');
    return response.blob();
  }

  async getAdminEventos(jwt: string): Promise<ApiResponse<any[]>> {
    return this.get('/api/v1/admin/eventos', { Authorization: `Bearer ${jwt}` });
  }

  async crearEvento(data: EventoAdminRequest, jwt: string): Promise<ApiResponse<any>> {
    return this.post('/api/v1/admin/eventos', data, { Authorization: `Bearer ${jwt}` });
  }

  async validatePromoCode(code: string): Promise<ApiResponse<PromoCodeValidateResponse>> {
    return this.post<PromoCodeValidateResponse>('/api/v1/promo-codes/validate', { code } as PromoCodeValidateRequest);
  }

  async aplicarPromo(registroId: string, sessionToken: string, promoCode: string): Promise<ApiResponse<void>> {
    return this.post<void>(`/api/v1/registros/${registroId}/aplicar-promo`, { code: promoCode }, {
      'X-Session-Token': sessionToken,
    });
  }

  async getInstituciones(): Promise<ApiResponse<InstitucionDto[]>> {
    return this.get<InstitucionDto[]>('/api/v1/mentorias/instituciones');
  }

  async enviarSolicitudMentoria(data: SolicitudMentoriaRequest): Promise<ApiResponse<SolicitudMentoriaResponse>> {
    return this.post<SolicitudMentoriaResponse>('/api/v1/mentorias/solicitudes', data);
  }
}

export const apiService = new ApiService();