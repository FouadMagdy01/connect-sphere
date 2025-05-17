
# ConnectSphere API - Backend

This repository hosts the backend API for ConnectSphere, a social media application built with Node.js, Express.js, and MongoDB. It provides services for user authentication, profile management, content posting, commenting, and image uploads.

## Table of Contents

- [ConnectSphere API - Backend](#connectsphere-api---backend)
  - [Table of Contents](#table-of-contents)
  - [1. Core Features](#1-core-features)
  - [2. Tech Stack](#2-tech-stack)
  - [3. Prerequisites](#3-prerequisites)
  - [4. Quick Start](#4-quick-start)
    - [4.1. Installation](#41-installation)
    - [4.2. Environment Variables](#42-environment-variables)
    - [4.3. Create `uploads` Directory](#43-create-uploads-directory)
    - [4.4. Running the Application](#44-running-the-application)
  - [5. Project Structure Overview](#5-project-structure-overview)
  - [6. Key Architectural Concepts](#6-key-architectural-concepts)
    - [6.1. Authentication (JWT)](#61-authentication-jwt)
    - [6.2. File Uploads (Multer)](#62-file-uploads-multer)
  - [7. API Endpoints Overview](#7-api-endpoints-overview)
    - [7.1. Authentication (`/api/auth`)](#71-authentication-apiauth)
    - [7.2. Users (`/api/users`)](#72-users-apiusers)
    - [7.3. Posts \& Comments (`/api/posts`)](#73-posts--comments-apiposts)
  - [8. Testing with Postman](#8-testing-with-postman)
  - [9. Contributing](#9-contributing)

## 1. Core Features

* **User Authentication:** Secure registration and login using email/password, powered by JWT (JSON Web Tokens) for access and refresh token management.
* **Profile Management:** Users can create, view, and update their profiles (name, bio, profile picture).
* **Post Creation & Interaction:** Users can create text posts with optional image uploads, view a feed of posts, and access individual post details. Users have control to modify and delete their own posts.
* **Commenting System:** Enables users to comment on posts, with optional image attachments. Users can edit/delete their comments; post owners can also moderate comments on their posts.
* **Image Uploads:** Supports uploading images for user profiles, posts, and comments.

## 2. Tech Stack

* **Backend:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose ODM for object-relational mapping)
* **Authentication:** JWT (`jsonwebtoken` package), `bcryptjs` (for password hashing)
* **File Handling:** `Multer` (for `multipart/form-data`)
* **Environment Config:** `dotenv`
* **Development:** `nodemon` (for live server reloading)

## 3. Prerequisites

* Node.js (v14.x or later)
* npm (Node Package Manager) or Yarn
* MongoDB (local instance or a cloud service like MongoDB Atlas)
* Postman (recommended for API testing)

## 4. Quick Start

### 4.1. Installation

1.  **Clone:** `git clone https://github.com/FouadMagdy01/connect-sphere && cd connect-sphere`
2.  **Install Dependencies:** `npm install` or `yarn install`

### 4.2. Environment Variables

1.  Create a `.env` file in the project root.
2.  Copy contents from `.env.example` to `.env`.
3.  Update `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `PORT` with your specific configurations.

### 4.3. Create `uploads` Directory

If using the default local storage for file uploads, create an `uploads` folder in the project root:
```bash
mkdir uploads
````

### 4.4. Running the Application

  * **Development (with auto-restart):** `npm run dev` or `yarn dev`
  * **Production:** `npm start` or `yarn start`

The server typically runs on `http://localhost:5000` (or the `PORT` specified in `.env`).

## 5\. Project Structure Overview

The project is organized for clarity and maintainability:

  * `config/`: Database connection settings.
  * `controllers/`: Request handling logic for each route.
  * `middleware/`: Custom functions that process requests (e.g., auth, error handling, file uploads).
  * `models/`: Mongoose schemas defining the structure of data (User, Post, Comment).
  * `routes/`: API endpoint definitions, mapping URLs to controller actions.
  * `utils/`: Helper functions (e.g., token generation).
  * `uploads/`: Default local storage for uploaded files.
  * `server.js`: Main application entry point.
  * `postman-collection.json`: For API testing.

## 6\. Key Architectural Concepts

### 6.1. Authentication (JWT)

  * **Process:** Upon login/registration, the server issues a short-lived `accessToken` and a long-lived `refreshToken`.
  * **Access Token:** Sent with requests to protected routes in the `Authorization: Bearer <token>` header.
  * **Refresh Token:** Used to obtain a new `accessToken` when the current one expires, via the `/api/auth/refresh-token` endpoint. It's stored in the database and invalidated on logout.

### 6.2. File Uploads (Multer)

  * `Multer` middleware processes `multipart/form-data` requests, primarily for image uploads.
  * It saves files (by default to the local `/uploads` directory) and makes file information (`req.file`) available to controllers.
  * The file path is then stored in the database. Static serving via `express.static` makes these files accessible via URL.

## 7\. API Endpoints Overview

All endpoints are prefixed by the `{{baseURL}}` (e.g., `http://localhost:5000/api`).

### 7.1. Authentication (`/api/auth`)

  * `POST /register`: New user registration.
  * `POST /login`: User login.
  * `POST /refresh-token`: Get a new access token.
  * `POST /logout`: User logout (invalidates refresh token). (Protected)

### 7.2. Users (`/api/users`)

  * `GET /profile`: Get current authenticated user's profile. (Protected)
  * `PUT /profile`: Update current authenticated user's profile (supports image upload). (Protected)
  * `GET /:id`: Get a specific user's public profile by ID.
  * `GET /`: Get a list of all users. (Protected, consider for admin use)

### 7.3. Posts & Comments (`/api/posts`)

  * `POST /`: Create a new post (supports image upload). (Protected)
  * `GET /`: Get all posts (paginated).
  * `GET /:id`: Get a single post by ID (includes comments).
  * `PUT /:id`: Update a post (owner only, supports image upload). (Protected)
  * `DELETE /:id`: Delete a post (owner only). (Protected)
  * `POST /:postId/comments`: Add a comment to a post (supports image upload). (Protected)
  * `PUT /:postId/comments/:commentId`: Update a comment (owner only, supports image upload). (Protected)
  * `DELETE /:postId/comments/:commentId`: Delete a comment (comment owner or post owner). (Protected)

## 8\. Testing with Postman

A `postman-collection.json` file is provided in the root directory for easy API testing.

**Import Instructions:**

1.  Open Postman.
2.  Click "Import".
3.  Drag & drop the `postman-collection.json` file or use "Upload Files" to select it.
4.  Click "Import".

The collection uses variables like `{{baseURL}}`, `{{accessToken}}`, and `{{refreshToken}}`. The token variables are typically set automatically by test scripts within the login/register requests.

## 9\. Contributing

Contributions are welcome\! Please fork the repository, create a feature branch, make your changes, and open a pull request.

-----
