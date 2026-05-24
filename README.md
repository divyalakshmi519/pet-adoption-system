# Pet Adoption Management System

A full-stack web application for managing pet adoptions, connecting loving homes with shelter pets.

---

## Live Demo

[Deploy Link](https://pet-adoption-system-by-divya.netlify.app/)

---

## Tech Stack

### Frontend
- ReactJS
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Authentication
- JWT (JSON Web Tokens)

---

## Features

- User Authentication (Adopter, Shelter Staff, Admin)
- Pet Listings with Filters and Pagination
- Adoption Application System
- Shelter Dashboard for Pet Management
- Admin Analytics Dashboard with Charts
- Role-Based Access Control
- Application Tracking for Users

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@petadoption.com | admin123 |
| Shelter Staff | staff@petadoption.com | staff123 |
| Adopter | user@example.com | user123 |

---

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)

---

## Setup Instructions

### 1. Clone the Repository

bash
git clone https://github.com/divyalakshmi519/pet-adoption-system.git
cd pet-adoption-system


### 2. Install Backend Dependencies

bash
cd backend
npm install


### 3. Install Frontend Dependencies

bash
cd ../frontend
npm install


### 4. Setup Database

bash
cd ../database
node seed.js


### 5. Start the Application

#### Terminal 1 - Start Backend

bash
cd backend
npm run dev


#### Terminal 2 - Start Frontend

bash
cd frontend
npm start


### 6. Open in Browser

Visit:

text
http://localhost:3000


---

# API Endpoints

## Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

---

## Pets APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pets | Get all pets with filters |
| GET | /api/pets/:id | Get single pet |
| POST | /api/pets | Add new pet (Staff/Admin) |
| PUT | /api/pets/:id/status | Update pet status |

---

## Adoption APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/adoptions/apply | Apply for adoption |
| GET | /api/adoptions/user | Get user applications |
| GET | /api/adoptions/all | Get all applications |
| PUT | /api/adoptions/:id/status | Update application status |

---

## Dashboard APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/admin | Admin analytics |
| GET | /api/dashboard/shelter | Shelter analytics |

---

# Business Rules Implemented

- No duplicate approved adoptions for the same pet
- Pet status automatically updates when adopted
- Users can only have one pending application per pet
- Role-based access control for all features
- Form validation for all inputs

---

# Video Demo

[Insert video recording link here]

---

# Deployment

The application is deployed at:

Frontend: [Deploy Link](https://pet-adoption-system-by-divya.netlify.app/)

Backend: [Deploy Link](https://pet-adoption-system-zcvl.onrender.com/api/)

---

# Author

Divya Lakshmi

---
