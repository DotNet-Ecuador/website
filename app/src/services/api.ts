// API configuration
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.dotnetecuador.com';

// Types for the API requests
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

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit volunteer application
   */
  async submitVolunteerApplication(
    data: VolunteerApplicationRequest
  ): Promise<ApiResponse<any>> {
    try {
      // Use local API route to avoid CORS issues
      const response = await fetch('/api/volunteer-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        // Return detailed error information from API
        const errorMessage = result.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      return {
        success: true,
        data: result.data,
        message: result.message || 'Operación completada exitosamente'
      };
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al enviar la aplicación',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();