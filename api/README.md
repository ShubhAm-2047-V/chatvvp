# ChatVVP Backend (API)

The core engine of ChatVVP, handling authentication, OCR processing, AI interactions, and resource management.

## 🛠️ Setup

1. **Install Dependencies**: `npm install`
2. **Environment Variables**: Create a `.env` file based on `.env.example`.
3. **Run Server**: 
   - Development: `npm run dev`
   - Production: `npm start`

## 📡 API Endpoints

- `POST /api/auth/login`: User authentication.
- `POST /api/admin/create-user`: Provision new users.
- `POST /api/admin/upload-excel`: Bulk student onboarding.
- `POST /api/teacher/upload-note`: OCR and AI processing for notes.
- `POST /api/student/chat`: Interactive AI study assistant.

## 📂 Scripts Directory

We've moved diagnostic and utility scripts to the `/scripts` folder for a cleaner environment:
- `db-test.js`: Check MongoDB connectivity.
- `seed-test-video.js`: Populate initial video data.
- `fix-teacher-data.js`: Maintenance script for teacher profiles.
