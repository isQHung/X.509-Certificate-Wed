// ============================================
// FRONTEND SCHEMA INDEX
// Export all database schemas and types
// ============================================

export * from './database.schema';

// ============================================
// TYPE GUARDS & UTILITIES
// ============================================

import { UUID, UserStatus, CertificateStatus, CertificateRequestStatus } from './database.schema';

/**
 * Type guard to check if a string is a valid UUID
 */
export function isUUID(value: string): value is UUID {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for UserStatus enum
 */
export function isUserStatus(value: string): value is UserStatus {
  return Object.values(UserStatus).includes(value as UserStatus);
}

/**
 * Type guard for CertificateStatus enum
 */
export function isCertificateStatus(value: string): value is CertificateStatus {
  return Object.values(CertificateStatus).includes(value as CertificateStatus);
}

/**
 * Type guard for CertificateRequestStatus enum
 */
export function isCertificateRequestStatus(value: string): value is CertificateRequestStatus {
  return Object.values(CertificateRequestStatus).includes(value as CertificateRequestStatus);
}

/**
 * Utility function to format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Utility function to check if certificate is expired
 */
export function isCertificateExpired(validTo?: string): boolean {
  if (!validTo) return false;
  return new Date(validTo) < new Date();
}

/**
 * Utility function to get certificate status with expiration check
 */
export function getCertificateDisplayStatus(
  status: CertificateStatus,
  validTo?: string
): CertificateStatus {
  if (status === CertificateStatus.ACTIVE && isCertificateExpired(validTo)) {
    return CertificateStatus.EXPIRED;
  }
  return status;
}