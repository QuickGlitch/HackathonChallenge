# Hackathon instructions

A hackathon project that lets multiple teams compete in finding and exploiting intentional vulnerabilities in an web application.

## For organizers

This application is meant to be used as a demo app for hackathons and workshops focused on web security. It contains several intentional vulnerabilities that participants can discover and exploit. Certain exploits and findings are automatically tracked and scored, others need to be entered by competing teams in their team dashboard. We also encourage organizers to have the parcticipants present their findings at the end of the event - and award additional points for any vulnerabilities exploited that were not covered in the initial scoring list.

To get started, clone the repository and follow the setup instructions in the README file.

```sh
git clone https://github.com/QuickGlitch/HackathonChallenge.git
cd hackathon-challenge
npm install

### DEV SETUP
npm run docker:up # dev docker compose for db and php image server
npm run dev # the rest of the aplications can be run locally assuming you have nodejs installed

### default ports on dev setup:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Scoreboard: http://localhost:5174
# Team Page: http://localhost:5175
# Image Server: http://localhost:8080
```

This will setup multiple applications (frontend, backend, admin panel) running on different ports with only the database running within a Docker container. For the actual hackathon, you probably want to use the production setup instead:

```sh
npm run docker:up:production 
# which is equivalent to:
docker-compose -f docker-compose.yml up

# production setup runs the apps behind a proxy (Traefik)
# assuming you didn't change the root env file, the applications will be available at:
# Frontend: http://localhost
# Backend API: http://localhost/api
# Scoreboard: http://localhost/scoreboard
# Team Page: http://localhost/team-page
# Image Server: http://localhost/api/upload-image
```

### Starting the event

Once the application is running, organizers can share the `team-page` app with the competing teams. Teams are created beforehand (see [seed.js](./apps/backend/src/seed.js), Hackors1 - Hackors5) and their credentials should be shared with the respective teams. Once logged in, teams will find the hackathon rules and are free to start exploring the application and looking for vulnerabilities.

The entrypoint for teams is the team-page app, which contains links to the main frontend application as well as the scoreboard and rules. Teams can submit answers to fixed questions directly in the team page, while other vulnerabilities are tracked automatically by the backend.

### Scoring

For some of the known vulnerabilities, teams will need to submit answers in the team page app. These answers and free purchases exploited on the app are automatically scored and shown in the scoreboard. However, there are additional vulenerabilities that organizers can choose to reward points for at their own digression.

## Known Vulnerabilities

Please see the [intentional-vulnerabilities.md](./intentional_vulnerabilities.md) file for a list of known vulnerabilities in the application along with their descriptions.

### Example Exploits

Example exploits of the known vulnerabilities can be found in the [attack-utils](./attack-utils) directory.

## Application Overview

The hackathon application consists of several apps managed with Docker:

- **PostgreSQL Database**: Stores all application data including products, users, orders, and forum messages.
- **Backend API**: Express.js REST API that handles authentication, business logic, and database operations using Prisma ORM.
- **Frontend**: Vue.js e-commerce web application where users can browse products, make purchases, and participate in the forum.
- **Scoreboard**: Vue.js application displaying real-time scores for gamified vulnerabilities exploited by competing teams.
- **Team Page**: Vue.js dashboard for hackathon teams to view rules, submit answers to fixed questions, and track their progress.
- **Image Server**: PHP server for handling product image uploads and serving static images.
- **Boomer Bots**: Automated bot users (DorothyWilliams and admin) that periodically interact with the forum to simulate real users.
- **CSRF App**: Demonstration application for testing Cross-Site Request Forgery attack vectors.

## Useful Resources to share with participants

- [attack payloads](https://github.com/swisskyrepo/PayloadsAllTheThings)