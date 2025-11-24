# Hackathon instructions

## For organizers

This application is meant to be used as a demo app for hackathons and workshops focused on web security. It contains several intentional vulnerabilities that participants can discover and exploit. Certain exploits and findings are automatically tracked and scored, others need to be entered by competing teams in their team dashboard. We also encourage organizers to have the parcticipants present their findings at the end of the event - and award additional points for any vulnerabilities exploited that were not covered in the initial scoring list.

To get started, clone the repository and follow the setup instructions in the README file.

```sh
git clone https://github.com/QuickGlitch/HackathonChallenge.git
cd hackathon-challenge
npm install
npm run docker:up
npm run dev
```

This will setup multiple applications (frontend, backend, admin panel) running on different ports with only the database running within a Docker container. For the actual hackathon, you probably want to use the production setup instead:

```sh
npm run docker:up:prod
```

### Starting the event
Once the application is running, organizers can share the `team-page` app with the competing teams. Teams are created beforehand (see [seed.js](./apps/backend/src/seed.js)) and their credentials should be shared with the respective teams. Once logged in, teams will find the hackathon rules and are free to start exploring the application and looking for vulnerabilities.

## Useful Resources to share with participants

- [attack payloads](https://github.com/swisskyrepo/PayloadsAllTheThings)