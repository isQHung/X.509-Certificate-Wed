// ============================================
// COMMON TYPES & ENUMS
// ============================================

import { isUUID } from ".";

export type UUID = string;
export type Timestamp = string; // ISO 8601 date string
export type JSONValue = any;

// User Status Enum
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

// Certificate Request Status Enum
export enum CertificateRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ISSUED = 'issued'
}

// Certificate Status Enum
export enum CertificateStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

// ============================================
// USER MANAGEMENT INTERFACES
// ============================================

export interface User {
  id: UUID;
  email: string;
  password_hash: string;
  created_at: Timestamp;
  status: UserStatus;
}

export interface Role {
  id: number;
  name: string; // 'admin', 'user', etc.
}

export interface UserRole {
  user_id: UUID;
  role_id: number;
}

// ============================================
// CERTIFICATE MANAGEMENT INTERFACES
// ============================================

export interface CertificateRequest {
  id: UUID;
  user_id: UUID;
  csr_pem: string;
  subject?: JSONValue;
  san?: JSONValue;
  status: CertificateRequestStatus;
  approved_by?: UUID;
  approved_at?: Timestamp;
  created_at: Timestamp;
}

export interface Certificate {
  id: UUID;
  serial_number: string;
  issuer_id?: UUID; // self-signed for root CA
  subject?: JSONValue;
  san?: JSONValue;
  public_key: string;
  valid_from?: Timestamp;
  valid_to?: Timestamp;
  status: CertificateStatus;
  certificate_pem: string;
  csr_id?: UUID;
  created_at: Timestamp;
}

// ============================================
// REVOCATION & CRL INTERFACES
// ============================================

export interface Revocation {
  id: UUID;
  certificate_id: UUID;
  requested_by: UUID;
  reason?: string;
  status: string;
  approved_by: UUID;
  approved_at: Timestamp;
  created_at: Timestamp;
}

export interface Revocation {
  id: UUID;
  certificate_id: UUID;
  serial_number: string;
  reason?: string;
  revoked_at: Timestamp;
}

export interface CRL {
  id: UUID;
  version: number;
  generated_at: Timestamp;
  next_update?: Timestamp;
  crl_pem: string;
}

export interface CRLEntry {
  id: UUID;
  crl_id: UUID;
  serial_number: string;
  revoked_at: Timestamp;
  reason?: string;
}

// ============================================
// AUDIT LOG INTERFACE
// ============================================

export interface AuditLog {
  id: number;
  actor_id?: UUID;
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: JSONValue;
  created_at: Timestamp;
}

// ============================================
// KEY PAIR INTERFACE
// ============================================

export interface KeyPair {
  id: UUID;
  owner_id: UUID;
  key_type: string;
  key_size: number;
  fingerprint: string;
  created_at: Timestamp;
}

// ============================================
// SYSTEM CONFIGURATION MODELS
// ============================================

export interface SystemConfigBase{
    name: string;
    key_algorithm: string;
    key_size: string;
    signature_algorithm: string;
    hash_algorithm: string;
    default_validity_days: number;
}

// ============================================
// RELATIONSHIP INTERFACES (for API responses)
// ============================================

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface CertificateWithDetails extends Certificate {
  issuer?: Certificate;
  request?: CertificateRequest;
  revocations?: Revocation[];
}

export interface CertificateRequestWithDetails extends CertificateRequest {
  user: User;
  approver?: User;
  certificate?: Certificate;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateUserRequest {
  email: string;
  password: string;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  email?: string;
  status?: UserStatus;
}

export interface CreateCertificateRequestRequest {
  csr_pem: string;
  subject?: JSONValue;
  san?: JSONValue;
}

export interface ApproveCertificateRequest {
  approved: boolean;
  reason?: string;
}

export interface RevokeCertificateRequest {
  reason?: string;
}

// ============================================
// PAGINATION & FILTERING
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CertificateFilters extends PaginationParams {
  status?: CertificateStatus;
  user_id?: UUID;
  serial_number?: string;
}

export interface AuditLogFilters extends PaginationParams {
  actor_id?: UUID;
  action?: string;
  target_type?: string;
  date_from?: Timestamp;
  date_to?: Timestamp;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}