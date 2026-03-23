# ChatVVP - AI-Powered College Study Platform

ChatVVP is a premium, AI-driven study environment designed to help college students and teachers manage academic resources, automate note extraction, and interact with an intelligent study assistant.

## 📁 Repository Structure

- **`/web`**: The frontend application built with React, Vite, and Tailwind CSS. Featuring a "Digital Sanctuary" design with 3D elements and glassmorphism.
- **`/api`**: The backend server built with Node.js, Express, and MongoDB. Includes OCR integration, AI services (Gemini), and user management.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd ChatVVP
   ```

2. **Setup the Backend (API):**
   ```bash
   cd api
   npm install
   # Create a .env file (see .env.example)
   npm run dev
   ```

3. **Setup the Frontend (Web):**
   ```bash
   cd ../web
   npm install
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT, Bcrypt, Multer, Cloudinary (for file storage).
- **AI/ML**: Google Gemini AI (for chat and content cleaning), OCR.Space (for text extraction from notes).

## 🛡️ Administrative Features

Admins can manage students/teachers, perform bulk provisioning via Excel, and block/unblock users. Access the dashboard at `/admin` (Default: `admin@test.com` / `admin123`).

## 📄 License

ISC License.
