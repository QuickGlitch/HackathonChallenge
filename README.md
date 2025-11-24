# Hackathon instructions

## For organizers

This application is meant to be used as a demo app for hackathons and workshops focused on web security. It contains several intentional vulnerabilities that participants can discover and exploit. Certain exploits and findings are automatically tracked and scored, others need to be entered by competing teams in their team dashboard. We also encourage organizers to have the parcticipants present their findings at the end of the event - and award additional points for any vulnerabilities exploited that were not covered in the initial scoring list.

To get started, clone the repository and follow the setup instructions in the README file.

```sh
git clone https://github.com/QuickGlitch/HackathonChallenge.git
cd hackathon-challenge
npm install

### DEV SETUP
npm run docker:up # dev docker compose for db and php image server
npm run dev
```

This will setup multiple applications (frontend, backend, admin panel) running on different ports with only the database running within a Docker container. For the actual hackathon, you probably want to use the production setup instead:

```sh
npm run docker:up:prod 
# which is equivalent to:
docker-compose -f docker-compose.yml up
```

### Starting the event
Once the application is running, organizers can share the `team-page` app with the competing teams. Teams are created beforehand (see [seed.js](./apps/backend/src/seed.js)) and their credentials should be shared with the respective teams. Once logged in, teams will find the hackathon rules and are free to start exploring the application and looking for vulnerabilities.

## Application Overview

The hackathon application consists of several apps managed with Docker:

- **PostgreSQL Database** (Port 5432): Stores all application data including products, users, orders, and forum messages.
- **Backend API** (Port 3001): Express.js REST API that handles authentication, business logic, and database operations using Prisma ORM.
- **Frontend** (Port 3000): Vue.js e-commerce web application where users can browse products, make purchases, and participate in the forum.
- **Scoreboard** (Port 5174): Vue.js application displaying real-time scores for gamified vulnerabilities exploited by competing teams.
- **Team Page** (Port 5175): Vue.js dashboard for hackathon teams to view rules, submit answers to fixed questions, and track their progress.
- **Image Server** (Port 8080): PHP server for handling product image uploads and serving static images.
- **Boomer Bots** (No external port): Automated bot users (DorothyWilliams and admin) that periodically interact with the forum to simulate real users.
- **CSRF App** (Port 8081): Demonstration application for testing Cross-Site Request Forgery attack vectors.

## Useful Resources to share with participants

- [attack payloads](https://github.com/swisskyrepo/PayloadsAllTheThings)