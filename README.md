# Voting & Polls API

API REST para crear encuestas, votar y consultar resultados en tiempo casi real, con autenticación JWT y roles.

**Stack:** Node.js · Express  TypeScript · MongoDB · Docker

> Portfolio project — demuestra auth, modelado de dominio, control de acceso y resultados agregados.
>
> ## Highlights
>
> - Autenticación JWT + hashing con bcrypt
> - - CRUD de encuestas y votación con prevención de duplicados
>   - - Resultados con porcentajes
>     - - Roles `user` / `admin`
>       - - MongoDB local con Docker Compose
>        
>         - ## Architecture
>        
>         - ```
>           Client (HTTP)
>
>           Express routes → middlewares (auth, errors)
>
>           Controllers → Mongoose models (User, Poll, Vote)
>              ↓
>           MongoDB
>           ```
>
> ## Quick start
>
> ```bash
> git clone https://github.com/ENER90/voting-polls-api.git
> cd voting-polls-api
> npm install
> cp .env.example .env
> docker-compose up -d mongodb
> npm run dev
> ```
>
> Server: `http://localhost:3002`
>
> ## API endpoints
>
> ### Auth
> ```
> POST   /api/auth/register
> POST   /api/auth/login
> GET    /api/auth/me          (auth)
> ```
>
> ### Polls
> ```
> GET    /api/polls
> GET    /api/polls/:id
> POST   /api/polls            (auth)
> PUT    /api/polls/:id        (auth)
> DELETE /api/polls/:id        (auth)
> ```
>
> ### Votes
> ```
> POST   /api/votes                 (auth)
> GET    /api/votes/results/:pollId
> GET    /api/votes/my-votes        (auth)
> ```
>
> ## Example
>
> ```bash
> # Register
> curl -X POST http://localhost:3002/api/auth/register \
>   -H "Content-Type: application/json" \
>   -d '{"username":"john","email":"john@test.com","password":"123456"}'
>
> # Login
> curl -X POST http://localhost:3002/api/auth/login \
>   -H "Content-Type: application/json" \
>   -d '{"email":"john@test.com","password":"123456"}'
>
> # Create poll
> curl -X POST http://localhost:3002/api/polls \
>   -H "Content-Type: application/json" \
>   -H "Authorization: Bearer YOUR_TOKEN" \
>   -d '{"title":"Best language?","options":["JavaScript","Python","Go"]}'
>
> # Vote
> curl -X POST http://localhost:3002/api/votes \
>   -H "Content-Type: application/json" \
>   -H "Authorization: Bearer YOUR_TOKEN" \
>   -d '{"pollId":"POLL_ID","selectedOption":"JavaScript"}'
>
> # Results
> curl http://localhost:3002/api/votes/results/POLL_ID
> ```
>
> ## Project structure
>
> ```
> src/
> ├── controllers/
> ├── models/
> ─ routes/
> ├── middlewares/
> ── utils/
> ```
>
> ## Environment
>
> ```env
> PORT=3002
> MONGODB_URI=mongodb://admin:password123@localhost:27018/voting-polls-db?authSource=admin
> JWT_SECRET=your-secret-key
> JWT_EXPIRES_IN=7d
> ```
>
> ## Author
>
> [René Del Valle Rodríguez](https://github.com/ENER90) · [LinkedIn](https://www.linkedin.com/in/renédelvalle)
>
> ## License
>
> MIT
> 
