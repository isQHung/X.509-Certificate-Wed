// ============================================
// USAGE EXAMPLES - Frontend TypeScript
// ============================================

import {
  User,
  Certificate,
  CertificateRequest,
  CertificateRequestStatus,
  CertificateStatus,
  CreateCertificateRequestRequest,
  ApproveCertificateRequest,
  PaginatedResponse,
  isUUID,
  formatTimestamp,
  getCertificateDisplayStatus
} from './index';

// Example: Creating a certificate request
function createCertificateRequest(
  csrPem: string,
  subject?: any,
  san?: any
): CreateCertificateRequestRequest {
  return {
    csr_pem: csrPem,
    subject,
    san
  };
}

// Example: Approving a certificate request
function approveRequest(
  requestId: string,
  approved: boolean,
  reason?: string
): ApproveCertificateRequest {
  if (!isUUID(requestId)) {
    throw new Error('Invalid request ID');
  }

  return {
    approved,
    reason
  };
}

// Example: Processing certificate data
function processCertificate(cert: Certificate) {
  const displayStatus = getCertificateDisplayStatus(cert.status, cert.valid_to);
  const formattedDate = formatTimestamp(cert.created_at);

  return {
    ...cert,
    display_status: displayStatus,
    formatted_created_at: formattedDate,
    is_expired: displayStatus === CertificateStatus.EXPIRED
  };
}

// Example: API response handling
interface CertificateAPIResponse extends PaginatedResponse<Certificate> {}

function handleCertificateList(response: CertificateAPIResponse) {
  const processedCerts = response.data.map(processCertificate);

  return {
    ...response,
    data: processedCerts
  };
}

// Example: Form validation
function validateUserForm(email: string, password: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && password.length >= 8;
}

// Example: Type-safe API client
class CertificateAPI {
  async getCertificates(filters?: {
    status?: CertificateStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Certificate>> {
    // Implementation would use fetch/axios
    return {} as PaginatedResponse<Certificate>;
  }

  async createRequest(request: CreateCertificateRequestRequest): Promise<CertificateRequest> {
    // Implementation
    return {} as CertificateRequest;
  }

  async approveRequest(id: string, approval: ApproveCertificateRequest): Promise<CertificateRequest> {
    // Implementation
    return {} as CertificateRequest;
  }
}

export const certificateAPI = new CertificateAPI();