# MTube - YouTube Backend API

A scalable YouTube-inspired backend application built using Node.js, Express.js, and MongoDB. MTube provides RESTful APIs for video sharing, user authentication, subscriptions, playlists, comments, likes, and dashboard analytics.

## Features

- User Authentication using JWT
- Secure Password Hashing with bcrypt
- Access Token & Refresh Token Authentication
- Video Upload and Management
- Cloudinary Integration for Video & Thumbnail Storage
- Like and Dislike Videos
- Comment System
- Playlist Management
- Subscription System
- Tweet/Post Feature
- User Dashboard APIs
- Watch History
- Profile Management
- Pagination, Sorting and Search
- MongoDB Aggregation Pipelines
- File Upload using Multer

---

## Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- bcrypt

### Cloud Storage

- Cloudinary

### File Upload

- Multer

### API Testing

- Postman

---

## Folder Structure

```
src
│
├── controllers
├── models
├── routes
├── middlewares
├── utils
├── db
├── constants
├── app.js
└── index.js
```

---

## Database Models

- User
- Video
- Playlist
- Subscription
- Comment
- Like
- Tweet

Model link-[https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj]
---

## Key Functionalities

### User

- Register
- Login
- Logout
- Refresh Tokens
- Update Profile
- Change Password
- Watch History

### Video

- Upload Video
- Update Video
- Delete Video
- Publish/Unpublish
- Fetch Videos

### Playlist

- Create Playlist
- Update Playlist
- Delete Playlist
- Add/Remove Videos

### Subscription

- Subscribe Channel
- Unsubscribe Channel
- Subscriber Count

### Comments

- Add Comment
- Edit Comment
- Delete Comment

### Likes

- Like Video
- Unlike Video
- Like Comment

---

## Authentication Flow

```
User Login
      │
      ▼
Generate Access Token + Refresh Token
      │
      ▼
Protected Routes
      │
      ▼
Token Expired
      │
      ▼
Refresh Token API
      │
      ▼
New Access Token
```

---

## API Highlights

- Authentication APIs
- User APIs
- Video APIs
- Playlist APIs
- Subscription APIs
- Comment APIs
- Like APIs
- Dashboard APIs

---

## Installation

```bash
git clone <repository-url>

cd MTube

npm install
```

Create a `.env` file.

```env
PORT=

MONGODB_URI=

ACCESS_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=

REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

Run

```bash
npm run dev
```

---

## Future Improvements

- Video Streaming
- Notifications
- Recommendation System
- Elasticsearch-based Search
- Redis Caching
- WebSocket Notifications

---

## Learning Outcomes

- Backend Architecture
- REST API Design
- JWT Authentication
- MongoDB Aggregation
- Secure Authentication
- Cloud File Management
- Middleware Design
- Scalable Backend Development

---

## Author

**Abhideep**
