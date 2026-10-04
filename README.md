# AI Business Assistant MVP

A production-quality, reusable AI Customer Assistant and Lead Generation system for businesses. Built with React, Vite, Node.js, Express, MongoDB, and Gemini LLM.

---

## 📌 Project Overview

**AI Business Assistant** enables businesses (coaching institutes, restaurants, gyms, clinics, real estate, etc.) to deploy an intelligent, context-aware AI chatbot on their website. The assistant automatically answers customer queries using structured business knowledge and captures potential customer leads directly into a MongoDB database for sales follow-up.

For this MVP, the system is configured with a fictional business: **ABC Academy** (a technical training institute offering courses like Full Stack Development, Data Science, and AI & Machine Learning).

---

## 🎯 Problem Statement

Small and medium businesses lose potential customers due to slow response times or lack of 24/7 customer support. Generic chatbots often invent inaccurate information (hallucination) or provide generic answers.

**AI Business Assistant** solves this by:
1. **Strict Context Adherence:** Restricting the AI strictly to verified business information (courses, fees, schedules, location).
2. **Preventing Information Invention:** Politely declining to invent unverified prices, discounts, or policies, and instead offering to capture customer contact details.
3. **Automated Lead Capture:** Converting website visitors into qualified leads stored in a centralized database with an admin dashboard.

---

## ✨ Features

- 🤖 **Interactive AI Chatbot:** Real-time customer Q&A powered by Google Gemini LLM via server-side API call.
- 📚 **Structured Business Knowledge:** Fully configurable business profile (`server/config/businessInfo.js`) with courses, pricing, FAQs, and location details.
- 📋 **Lead Capture System:** Input validation and submission form collecting customer name, phone, email, and interest.
- 📊 **Admin Dashboard:** Responsive interface showing total leads, today's leads, database status, and a filterable lead management table.
- 🔒 **Server-Side AI API Key Protection:** API keys remain strictly on the Express backend and are never exposed to the React client.
- 🛡️ **Graceful Fallbacks & Error Handling:** Operates seamlessly even if MongoDB is offline (using local in-memory fallback) or if the AI key is not configured.
- 📱 **Mobile-First Responsive UI:** Modern, clean SaaS interface optimized across desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + Vite 8
- **Language:** JavaScript (ES Modules)
- **Styling:** Vanilla CSS with CSS Variables & Modern Micro-animations
- **Icons:** Lucide React
- **HTTP Client:** Axios

### **Backend**
- **Runtime:** Node.js (v25+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ORM
- **AI Integration:** `@google/generative-ai` (Google Gemini API)
- **Environment Management:** dotenv & cors

---

## 🏗️ System Architecture

```
                               ┌───────────────────────────┐
                               │     React 19 / Vite       │
                               │   Customer UI & Chatbot   │
                               │   Admin Lead Dashboard    │
                               └─────────────┬─────────────┘
                                             │ HTTP / REST API
                                             ▼
                               ┌───────────────────────────┐
                               │   Express Node.js Server  │
                               │       (Port 5000)         │
                               ├─────────────┬─────────────┤
                               │ /api/chat   │ /api/leads  │
                               └──────┬──────┴──────┬──────┘
                                      │             │
                    ┌─────────────────┘             └─────────────────┐
                    ▼                                                 ▼
     ┌─────────────────────────────┐                   ┌─────────────────────────────┐
     │   Google Gemini LLM API     │                   │       MongoDB Database      │
     │  (Server-Side Execution)    │                   │   (Mongoose Lead Model)     │
     └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 📁 Folder Structure

```
AI-Business-Assistant/
├── client/                     # React Vite Frontend Application
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── Navbar.jsx      # Sticky Navigation & Brand Header
│   │   │   ├── ChatBot.jsx     # Customer AI Chat Window & Suggestions
│   │   │   ├── LeadModal.jsx   # Lead Capture Form & Validation
│   │   │   └── BusinessInfoCard.jsx # Business Profile & Course Listings
│   │   ├── pages/              # Main App Views
│   │   │   ├── HomePage.jsx    # Public Customer Portal
│   │   │   └── AdminDashboard.jsx # Admin Lead Table & Statistics
│   │   ├── services/
│   │   │   └── api.js          # Axios API Client
│   │   ├── App.jsx             # Main Layout & Tab Routing
│   │   ├── main.jsx            # React Entry Point
│   │   └── index.css           # Global Design Tokens & CSS Variables
│   ├── index.html
│   └── package.json
│
├── server/                     # Express Node.js Backend Application
│   ├── config/
│   │   ├── db.js               # MongoDB Connection Handler
│   │   └── businessInfo.js     # Configurable Business Knowledge Base
│   ├── controllers/
│   │   ├── chatController.js   # Chat Request Handler
│   │   └── leadController.js   # Lead Storage & Retrieval Handler
│   ├── models/
│   │   └── Lead.js             # Mongoose Lead Schema & Validation
│   ├── routes/
│   │   ├── chatRoutes.js       # /api/chat Route Endpoints
│   │   └── leadRoutes.js       # /api/leads Route Endpoints
│   ├── services/
│   │   └── aiService.js        # Gemini AI Prompt Builder & API Caller
│   ├── .env.example
│   ├── server.js               # Express Server Entry Point
│   └── package.json
│
├── .env.example                # Root Environment Variable Template
├── .gitignore                  # Git Ignore Rules
└── README.md                   # Documentation
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_business_assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Security Warning:** Never expose `GEMINI_API_KEY` on the frontend or commit `.env` files to source control. `.env` is listed in `.gitignore`.

---

## ⚙️ Installation & Setup

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### **Step 1: Clone or Navigate to Project**
```bash
cd AI-Business-Assistant
```

### **Step 2: Install Backend Dependencies**
```bash
cd server
npm install
```

### **Step 3: Install Frontend Dependencies**
```bash
cd ../client
npm install
```

---

## 🚀 Running the Application

### **Start Backend Server**
```bash
cd server
npm run dev     # Starts server on http://localhost:5000
```
*Output confirmation:*
```
🚀 AI Business Assistant Server running on port 5000
📡 Base API Endpoint: http://localhost:5000/api
[MongoDB] Connected successfully to host: 127.0.0.1
```

### **Start Frontend Application**
In a new terminal window:
```bash
cd client
npm run dev     # Starts Vite dev server on http://localhost:5173
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🗄️ MongoDB Setup

1. **Local MongoDB:** Ensure the MongoDB service (`mongod`) is running on your system. The default connection string is `mongodb://127.0.0.1:27017/ai_business_assistant`.
2. **MongoDB Atlas (Cloud):** Replace `MONGODB_URI` in `server/.env` with your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_business_assistant?retryWrites=true&w=majority
   ```
3. **Offline Fallback:** If MongoDB is offline, the backend automatically uses a safe in-memory fallback store so development and testing can continue uninterrupted.

---

## 🤖 AI API Setup (Google Gemini)

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your key to `server/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. If no key is provided, the chatbot informs the user via a friendly server message without crashing.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Process user query & return AI response based on business info |
| `GET` | `/api/chat/business-info` | Retrieve structured business knowledge metadata |
| `POST` | `/api/leads` | Validate & save a new lead to MongoDB |
| `GET` | `/api/leads` | Retrieve all leads & stats for Admin Dashboard |
| `GET` | `/api/health` | Backend server health check |

---

## 🖼️ Interface Preview

### 1. Customer AI Assistant & Course Catalog Page
- Interactive chatbot with suggested question pills.
- Structured business details, course list, pricing, and FAQs.
- Instant lead capture modal.

### 2. Admin Lead Management Dashboard
- Overview stat cards: Total Leads, Today's Leads, DB Connection Status.
- Real-time search/filter table containing customer contact info and interest.

---

## 🚀 Future Improvements

- 🔐 Admin authentication & JWT protected routes.
- 📱 WhatsApp / SMS notifications upon lead capture.
- 🏢 Multi-tenant database model for managing multiple business clients from one control panel.
- 📊 Advanced analytics (most asked customer questions, lead conversion rates).

---

## ⚠️ Known Limitations

- Admin dashboard does not require password login in this MVP stage.
- Business configuration is stored in `server/config/businessInfo.js` (can be updated to dynamic DB storage in V2).
