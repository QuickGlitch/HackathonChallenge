---
applyTo: "**"
---

# Intention

- Create a pentesting application using Vue.js for the frontend and Express JS for the backend.
- The application is a simple web shop where users can browse products and make purchases.

# Project Structure

- Project consists of a Turbo monorepo with multiple packages and apps.
- Frontend is built with Vue.js and located in the `apps/frontend` directory.
- Backend is built with Express JS and located in the `apps/backend` directory.
- Project includes a Docker Compose setup for local development and testing.
- A postgres container is also setup with a mounted volume for data persistence of the webshop.
- The backend connects to the postgres database to store product and order information, using Prisma as a ORM.
