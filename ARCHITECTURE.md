# System Architecture

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        User[👤 User/Browser]
        Attacker[🔴 Attacker/Pentester]
        Bot[🤖 Boomer Bots]
    end

    subgraph "Reverse Proxy Layer - Port 80"
        Traefik[Traefik Reverse Proxy<br/>Port 80, 8888]
    end

    subgraph "Application Layer"
        Frontend[Vue.js Frontend<br/>Main Store App<br/>Port 3000]
        Backend[Express.js Backend<br/>REST API<br/>Port 3001]
        Scoreboard[Vue.js Scoreboard<br/>Team Scores<br/>Port 5174]
        TeamPage[Vue.js Team Page<br/>Team Dashboard<br/>Port 5175]
        ImageServer[PHP Image Server<br/>File Upload<br/>Port 8090]
        CSRF[CSRF Attack App<br/>Port 8081<br/>🔴 Optional]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL DB<br/>Port 5432)]
        Images[Image Storage<br/>Volume Mount]
        Logs[Backend Logs<br/>Volume Mount]
    end

    subgraph "Bot Services"
        Dorothy[Boomer Bot Dorothy<br/>Forum User]
        Admin[Boomer Bot Admin<br/>Privileged User]
    end

    %% User interactions
    User -->|HTTP :80| Traefik
    Attacker -->|HTTP :80| Traefik
    Attacker -.->|Direct Attack| CSRF

    %% Traefik routing
    Traefik -->|"/ (priority 1)"| Frontend
    Traefik -->|"/api (priority 10)"| Backend
    Traefik -->|"/scoreboard"| Scoreboard
    Traefik -->|"/team-page"| TeamPage
    Traefik -->|"/images (priority 10)"| ImageServer
    Traefik -->|"/api/upload-image (priority 20)"| ImageServer

    %% Frontend communications
    Frontend -->|API Calls| Backend
    Frontend -->|Load Images| ImageServer
    Frontend -->|XHR/Fetch| Backend
    
    %% Team Page communications
    TeamPage -->|API Calls| Backend
    TeamPage -->|View Scores| Scoreboard
    
    %% Scoreboard communications
    Scoreboard -->|SSE Stream| Backend
    Scoreboard -->|Score API| Backend

    %% Backend interactions
    Backend -->|Prisma ORM| Postgres
    Backend -->|Write Logs| Logs
    Backend -->|SSE Broadcast| Scoreboard

    %% Image Server interactions
    ImageServer -->|Store/Read| Images
    Backend -.->|Reference URLs| ImageServer

    %% Bot interactions
    Dorothy -->|HTTP :80| Traefik
    Admin -->|HTTP :80| Traefik
    Dorothy -->|Forum Posts| Backend
    Admin -->|Forum Posts| Backend
    Bot -.->|Status Updates| Backend

    %% CSRF Attack Path
    CSRF -.->|Malicious Request| User
    User -.->|Authenticated Request| Frontend

    %% Styling
    classDef vulnerable fill:#ff6b6b,stroke:#c92a2a,color:#fff
    classDef secure fill:#51cf66,stroke:#2f9e44,color:#000
    classDef proxy fill:#339af0,stroke:#1864ab,color:#fff
    classDef data fill:#ffd43b,stroke:#fab005,color:#000
    
    class Frontend,Backend,ImageServer vulnerable
    class Traefik proxy
    class Postgres,Images,Logs data
    class CSRF vulnerable
```

## Component Details

### Entry Point
- **Traefik Reverse Proxy**: Single entry point on port 80, routes traffic to appropriate services based on path and priority
- **Dashboard**: Available on port 8888 for monitoring

### Frontend Applications
1. **Frontend (Vue.js)** - Main e-commerce application
   - Product browsing and purchasing
   - Forum/community features
   - User authentication
   - **Route**: `/` (priority 1)

2. **Scoreboard (Vue.js)** - Real-time competition tracking
   - Live scores via SSE
   - Team rankings
   - Exploit tracking
   - **Route**: `/scoreboard`

3. **Team Page (Vue.js)** - Team dashboard
   - Submit answers to questions
   - View hackathon rules
   - Track team progress
   - **Route**: `/team-page`

### Backend Services
1. **Backend API (Express.js)**
   - REST API with multiple routes:
     - `/api/products` - Product catalog
     - `/api/orders` - Order management
     - `/api/users` - User authentication & management
     - `/api/admin` - Admin operations (honeypot)
     - `/api/scores` - Scoreboard data
     - `/api/forum` - Forum/community features
     - `/api/hackathon` - Team submissions
     - `/api/bot-activity` - Bot status SSE stream
   - Uses Prisma ORM for database access
   - JWT authentication with cookies
   - Rate limiting (50 req/min)
   - **Route**: `/api` (priority 10)

2. **Image Server (PHP)**
   - File upload endpoint (`upload.php`)
   - Static image serving
   - **Routes**: 
     - `/images` (priority 10) - Serve images
     - `/api/upload-image` (priority 20) - Upload endpoint

### Database
- **PostgreSQL 15**: Persistent data storage
  - Products, orders, users
  - Forum messages
  - Team scores and submissions
  - Volume: `postgres-data`

### Automated Services
1. **Boomer Bot Dorothy** - Simulated user
   - Username: `DorothyWilliams`
   - Posts forum messages every 10 minutes
   - Interacts with store

2. **Boomer Bot Admin** - Simulated admin user
   - Username: `admin`
   - Privileged account for exploitation
   - Posts forum messages every 10 minutes

### Attack Surface (Optional)
- **CSRF App**: External attack demonstration
  - Hosts malicious pages for CSRF attacks
  - Can be linked in forum posts
  - Steals cookies/session data

## Network Architecture

```mermaid
graph LR
    subgraph "Docker Network: store-network"
        T[traefik]
        F[frontend]
        B[backend]
        S[scoreboard]
        TP[team-page]
        I[image-server]
        P[(postgres)]
        D[boomer-bot-dorothy]
        A[boomer-bot-admin]
        C[csrf-app]
    end
    
    Internet((Internet<br/>Port 80)) --> T
    T --> F
    T --> B
    T --> S
    T --> TP
    T --> I
    B --> P
    I --> P
    D --> T
    A --> T
    C -.-> Internet
```

All services communicate within the `store-network` Docker bridge network. Only Traefik exposes port 80 to the host.

## Data Flow

### User Purchase Flow
```mermaid
sequenceDiagram
    participant U as User
    participant T as Traefik
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL
    
    U->>T: Browse products
    T->>FE: Route to frontend
    FE->>BE: GET /api/products
    BE->>DB: Query products
    DB-->>BE: Product data
    BE-->>FE: JSON response
    FE-->>U: Display products
    
    U->>FE: Add to cart & checkout
    FE->>BE: POST /api/orders
    BE->>DB: Create order
    DB-->>BE: Order created
    BE-->>FE: Order confirmation
    FE-->>U: Success page
```

### Bot Activity Flow
```mermaid
sequenceDiagram
    participant Bot as Boomer Bot
    participant T as Traefik
    participant BE as Backend
    participant DB as PostgreSQL
    participant SB as Scoreboard
    
    Bot->>T: Start activity
    T->>BE: POST /api/bot-activity
    BE->>SB: SSE: Bot active
    
    loop Every 10 minutes
        Bot->>T: HTTP Request
        T->>BE: API Call
        BE->>DB: Store data
        Bot->>BE: Post forum message
    end
    
    Bot->>T: Stop activity
    T->>BE: POST /api/bot-activity
    BE->>SB: SSE: Bot inactive
```

### Score Update Flow
```mermaid
sequenceDiagram
    participant T as Team
    participant TP as Team Page
    participant BE as Backend
    participant DB as PostgreSQL
    participant SB as Scoreboard
    
    T->>TP: Submit answer
    TP->>BE: POST /api/hackathon/submit
    BE->>DB: Store submission
    BE->>DB: Update score
    DB-->>BE: Score updated
    BE-->>TP: Confirmation
    BE->>SB: SSE: Score update
    SB-->>T: Live score refresh
```

## Security Considerations (Intentional Vulnerabilities)

This is a **deliberately vulnerable** application for educational purposes. Known vulnerability categories include:

1. **SQL Injection** - Unsafe database queries
2. **XSS (Cross-Site Scripting)** - Unescaped user input
3. **CSRF (Cross-Site Request Forgery)** - Missing CSRF tokens
4. **IDOR (Insecure Direct Object Reference)** - Weak authorization
5. **File Upload** - Unrestricted file upload in image server
6. **Authentication** - Weak session management
7. **Access Control** - Privilege escalation opportunities
8. **Information Disclosure** - Verbose error messages

See `intentional_vulnerabilities.md` for complete details.

## Deployment Modes

### Development Mode
```bash
npm run docker:up     # DB + Image Server only
npm run dev           # Run apps locally
```
- Direct access to each service on separate ports
- Hot reload enabled
- Verbose logging

### Production Mode
```bash
docker compose up --build
```
- All services containerized
- Traefik reverse proxy routing
- Single entry point (port 80)
- Production logging

## Port Mapping

| Service | Internal Port | External Port (Dev) | Production Route |
|---------|--------------|---------------------|------------------|
| Traefik | 80, 8080 | 80, 8888 | `:80` |
| Frontend | 3000 | 3000 | `/` |
| Backend | 3001 | 3001 | `/api` |
| Scoreboard | 5174 | 5174 | `/scoreboard` |
| Team Page | 5175 | 5175 | `/team-page` |
| Image Server | 8090 | 8080 | `/images`, `/api/upload-image` |
| PostgreSQL | 5432 | 5432 | Internal only |
| CSRF App | 8081 | 8081 | External (optional) |

## Technology Stack

- **Frontend**: Vue.js 3 + Vite + Pinia (state management)
- **Backend**: Express.js + Prisma ORM + PostgreSQL
- **Reverse Proxy**: Traefik v3.2
- **Bots**: Node.js automation scripts
- **Image Server**: PHP 8 + Apache
- **Container**: Docker + Docker Compose
- **Monorepo**: Turborepo
