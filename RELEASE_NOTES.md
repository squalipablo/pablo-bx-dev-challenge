
# Release Notes - Bonusx File Upload Challenge

## Version 1.0.0

## VERY IMPORTANT: before start, copy the JSON sent in email to project_root/chiave folder, as specified in .env file. 
## The JSON contains G Cloud Storage credentials and cannot be shared on public github repo.

### Overview
Complete implementation of a full-stack application for file upload and download, developed as part of the Bonusx technical challenge.

---

## Running instructions
cd backend && yarn install
yarn start:dev (port 5000)
cd frontend && yarn install
yarn start:dev (port 3000)

## Architectural Choices

### Storage Provider: Google Cloud Storage vs AWS S3
**Decision**: using google storage instead of aws

**Reasons**:
- Issues encountered during S3 bucket creation on AWS (unique id not found)
- For the purpose of the challenge, managing an alternative cloud provider (Google Cloud) is considered technically equivalent
- Google Cloud Storage offers similar APIs and same reliability as AWS S3
- Allows demonstrating cloud integration skills without being tied to a single provider

**Implementation**:
- `GCSService` service for upload/download management
- Configured bucket: `pablo-bx-chal`
- Project ID: `bx-chal`

---

### Authentication System
**Decision**: Simplified authentication with mock credentials

**Reasons**:
- A complete implementation would have required:
  - Database to store users and passwords
  - Encryption system for passwords
  - JWT management for sessions
  - Authentication middleware
- For the demonstrative nature of the challenge, a simplified system was chosen
- Focus maintained on main functionality (file upload/download)

**Implementation**:
- Hardcoded credentials in code (demo only)
- Unique username: `admin` / Password: `admin123`
- Validation on both frontend and backend
- Login state storage in localStorage (frontend)

---

### Application Configuration
**Decision**: Configurable parameters via environment variables

**Google Cloud Configurations** (to migrate to Secrets for production):
```env
GOOGLE_CLOUD_PROJECT_ID=bx-chal
GOOGLE_CLOUD_KEY_FILE=../chiave/bx-chal-8a8a4dd881d0.json
GCS_BUCKET_NAME=pablo-bx-chal
```

**Upload Configurations**:
```env
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=PDF,JPG,JSON
```

**Reasons**:
- Flexibility in configuration without code changes
- Easy deployment in different environments
- Separation of sensitive configurations from application ones

---

## Security and Production

### Secrets Management
**Current State**: Google Cloud key in local file (root directory: `bx-chal-df522001fcf2.json`)
**Development/demo only**

**Migration for Production**:
- Use Secrets for:
  - `GOOGLE_CLOUD_PROJECT_ID`
  - `GOOGLE_CLOUD_CLIENT_EMAIL`  
  - `GOOGLE_CLOUD_PRIVATE_KEY`
  - `GCS_BUCKET_NAME`

### Security Recommendations
1. **Remove key files** from repository
2. **JWT implementation** for stateless authentication
3. **Strict validation** of file uploads
4. **Rate limiting** to prevent abuse
5. **HTTPS** mandatory in production

---

## Implemented Features

### Core Features
- [x] File upload with validation
- [x] File download
- [x] List of uploaded files
- [x] User authentication
- [x] Dynamic configuration of upload limits

### File Validations
- [x] Maximum size check (10MB)
- [x] Allowed extensions check
- [x] File name sanitization
- [x] Unique key generation (UUID)

### UI/UX
- [x] Responsive interface (Material-UI)
- [x] Visual feedback (progress bar, alerts)
- [x] Loading state management
- [x] User-friendly error handling

---

## Technical Architecture

### Backend (NestJS)
```
├── Controllers
│   ├── AuthController (login)
│   └── FilesController (CRUD files)
├── Services
│   ├── AuthService (credential validation)
│   └── GCSService (Google Cloud integration)
├── DTOs & Validation
└── Configuration (upload limits, cloud config)
```

### Frontend (React + TypeScript)
```
├── Components
│   ├── Login (authentication)
│   └── FileUpload (file management)
├── Services
│   ├── AuthService (session management)
│   └── FileService (API calls)
└── Utils & Testing
```
