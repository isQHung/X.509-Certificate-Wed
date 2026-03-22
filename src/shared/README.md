# Database Schema Definitions

This directory contains unified schema definitions for the X.509 Certificate Management System, ensuring consistency between Frontend (TypeScript), Backend (Python), and Database (PostgreSQL).

## 📁 Structure

```
src/
├── frontend/schema/
│   ├── database.schema.ts    # Main TypeScript interfaces
│   ├── index.ts             # Exports and utilities
│   └── user.schema.ts       # (existing file)
└── backend/schema/
    ├── database_schema.py   # Main Pydantic models
    └── __init__.py          # Python package exports
```

## 🎯 Purpose

- **Type Safety**: Ensure consistent data structures across FE/BE/DB
- **Validation**: Automatic validation using Pydantic (BE) and TypeScript types (FE)
- **Documentation**: Self-documenting code with clear field descriptions
- **API Consistency**: Unified request/response models
- **Database Mapping**: Direct mapping to SQL schema

## 📋 Schema Coverage

### Core Entities
- **Users**: User management with roles
- **Certificates**: X.509 certificate lifecycle
- **Certificate Requests**: CSR processing workflow
- **Revocations**: Certificate revocation management
- **CRL**: Certificate Revocation Lists
- **Audit Logs**: Security audit trail
- **Key Pairs**: Cryptographic key management

### Enums
- `UserStatus`: active/disabled
- `CertificateStatus`: active/revoked/expired
- `CertificateRequestStatus`: pending/approved/rejected/issued

## 🚀 Usage Examples

### Frontend (TypeScript)

```typescript
import { User, Certificate, CertificateRequestStatus } from '@/schema';

// Type-safe API calls
const user: User = {
  id: "uuid-string",
  email: "user@example.com",
  status: "active",
  created_at: "2024-01-01T00:00:00Z"
};

// Type guards
if (isCertificateRequestStatus(status)) {
  // status is guaranteed to be valid
}
```

### Backend (Python)

```python
from schema import User, CertificateCreate, create_audit_log_entry

# Pydantic validation
user = User(
    id="uuid-string",
    email="user@example.com",
    password_hash="hashed_password",
    status="active",
    created_at=datetime.utcnow()
)

# Automatic validation
cert_data = CertificateCreate(
    serial_number="123456789",
    public_key="-----BEGIN PUBLIC KEY-----...",
    certificate_pem="-----BEGIN CERTIFICATE-----..."
)

# Audit logging helper
audit_entry = create_audit_log_entry(
    action="CERTIFICATE_CREATED",
    actor_id=user.id,
    target_type="certificate",
    target_id=cert_data.serial_number
)
```

## 🔧 Key Features

### TypeScript Features
- **Strict typing** with UUID, Timestamp, JSONValue types
- **Enum validation** for status fields
- **Relationship interfaces** for complex queries
- **API request/response types**
- **Pagination support**
- **Type guards** for runtime validation
- **Utility functions** for common operations

### Python Features
- **Pydantic models** with automatic validation
- **Enum classes** for database enums
- **Relationship models** for joined queries
- **API request/response models**
- **Pagination & filtering**
- **Audit logging helpers**
- **SQLAlchemy integration** ready (`from_attributes = True`)

## 🔄 Database Mapping

| SQL Type | TypeScript | Python |
|----------|------------|--------|
| UUID | `string` (UUID type) | `UUID` |
| TEXT | `string` | `str` |
| JSONB | `JSONValue` | `Json` |
| TIMESTAMP | `string` (ISO 8601) | `datetime` |
| SERIAL | `number` | `int` |
| BIGSERIAL | `number` | `int` |

## 📝 Best Practices

### Frontend
1. Always import from `@/schema` for consistency
2. Use type guards for enum validation
3. Leverage relationship interfaces for complex data
4. Use utility functions for common operations

### Backend
1. Import from `schema` package
2. Use Pydantic models for API validation
3. Leverage `from_attributes=True` for SQLAlchemy integration
4. Use enum classes for database constraints
5. Utilize audit logging helpers

### General
1. Keep schemas in sync with database migrations
2. Update schemas when modifying database structure
3. Use consistent naming conventions
4. Document complex relationships
5. Test validation thoroughly

## 🔗 Integration

### With Database
- Direct mapping to `db/schemas/tables/` SQL files
- Compatible with Supabase migrations
- Supports Row Level Security policies

### With APIs
- Request/response models for REST endpoints
- Pagination support for list endpoints
- Filtering models for search functionality

### With Authentication
- User models integrate with auth systems
- Role-based access control support
- Audit logging for security events
