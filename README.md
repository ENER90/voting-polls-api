# 🚀 Voting & Polls API

A RESTful API for creating polls, voting, and viewing results with JWT authentication.

Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

## ✨ Features

- User authentication with JWT
- Create and manage polls
- Vote with duplicate prevention
- Real-time results with percentages
- Role-based access (user/admin)
- Password hashing with bcrypt

## Tech Stack

- Node.js + Express + TypeScript
- MongoDB with Mongoose
- JWT + bcrypt
- Docker

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd voting-polls-api
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start MongoDB
docker-compose up -d mongodb

# 4. Run server
npm run dev
```

Server runs on `http://localhost:3002`

## API Endpoints

### Authentication

```
POST   /api/auth/register    - Register user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get profile (auth)
```

### Polls

```
GET    /api/polls            - List polls
GET    /api/polls/:id        - Get poll
POST   /api/polls            - Create poll (auth)
PUT    /api/polls/:id        - Update poll (auth)
DELETE /api/polls/:id        - Delete poll (auth)
```

### Votes

```
POST   /api/votes                 - Cast vote (auth)
GET    /api/votes/results/:pollId - Get results
GET    /api/votes/my-votes        - Vote history (auth)
```

## Example Usage

### Register & Login

```bash
# Register
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"123456"}'

# Login (get token)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

### Create Poll & Vote

```bash
# Create poll
curl -X POST http://localhost:3002/api/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Best language?","options":["JavaScript","Python","Go"]}'

# Vote
curl -X POST http://localhost:3002/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"pollId":"POLL_ID","selectedOption":"JavaScript"}'

# Get results
curl http://localhost:3002/api/votes/results/POLL_ID
```

## Project Structure

```
src/
├── controllers/    - Request handlers
├── models/        - MongoDB schemas
├── routes/        - API routes
├── middlewares/   - Auth, errors, database
└── utils/         - JWT, database, errors
```

## Environment Variables

Create `.env` file:

```env
PORT=3002
MONGODB_URI=mongodb://admin:password123@localhost:27018/voting-polls-db?authSource=admin
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## License

MIT
