# Bonusx developer interview challenge

## 📘 Challenge

### Request

**As a** Fullstack Developer Candidate  
**I want** to build a simple application where users can upload and download files  
**So that** I can demonstrate my ability to integrate a frontend form with a backend API and an AWS S3 storage system

---

### ✅ Acceptance Criteria

- **Given** a user opens the frontend  
  **When** they select a file and submit the form  
  **Then** the file is uploaded to the backend and stored in an S3 bucket  

- **Given** a file was uploaded successfully  
  **When** the user receives a confirmation  
  **Then** they should be able to download it back  

---

### 💡 Nice to Have

- **Authentication**: a simple login system (e.g., with email + password or JWT)
- **File listing**: a list of uploaded files with metadata and download links
- **Presigned URLs**: for secure file uploads/downloads directly to/from S3
- **File validation**: limit allowed file types or sizes

## 🚀 How to start

To start the project, you can use the following commands:

```
yarn && yarn prepare
```

## Frontend

[how to start](./frontend/README.md)

## Backend

[how to start](./backend/README.md)
