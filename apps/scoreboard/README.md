# Hackathon Scoreboard

A Vue 3 application for displaying live hackathon team scores in a beautiful bar chart format.

## Features

- **Real-time Updates**: Automatically refreshes every 30 seconds to show the latest scores
- **Interactive Bar Chart**: Beautiful, animated charts using Chart.js and vue-chartjs
- **Responsive Design**: Works on desktop and mobile devices
- **Team Scoring**: Calculates scores based on:
  - 1 point per order with total value of 0 and payable to team 1
  - X points for order items payable to the team (X = price * quantity)

## Scoring Logic

The scoreboard calculates team scores as follows:

1. **Free Orders**: Each order with a total value of 0 that has items payable to team 1 awards 1 point
2. **Payable Items**: Each order item where `payableTo` equals the team's ID contributes points equal to `price * quantity`

Teams are ranked by total score in descending order.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoint

The scoreboard fetches data from: `GET /api/scores`

Expected response format:
```json
[
  {
    "teamId": 1,
    "teamName": "Hackors1", 
    "score": 125.50
  },
  ...
]
```

## Technologies Used

- Vue 3 with Composition API
- Chart.js & vue-chartjs for data visualization
- Axios for API calls
- Vite for build tooling
- CSS3 with gradient backgrounds and animations

## Port

- Development: `http://localhost:5174`
- Production (Docker): `http://localhost:5174`