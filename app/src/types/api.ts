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