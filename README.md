# ChowNow

ChowNow is an intelligent, AI-powered application that helps users find the perfect meal based on their specific context. Unlike standard map searches, ChowNow understands how you are traveling (walking, bus, driving) and what you are specifically craving, using Google Gemini to verify menus and provide personalized recommendations.

Live demo here: [https://chownow-47c6a.web.app/](https://chownow-47c6a.web.app/)

## Features

### AI-Powered Recommendations

Uses Google Gemini Flash 2.5 to analyze restaurant data and generate sophisticated, context-aware suggestions.

### Smart Craving Search

- **Custom Search:** Type specific dishes (e.g., "spicy tonkotsu ramen"). The AI verifies menu availability before recommending.
- **Categories:** Browse standard favorites (Italian, Fast Food, Healthy, etc.).
- **Profile Matching:** Get recommendations based on your saved dietary preferences.

### Context-Aware Radius

Search radius automatically adjusts based on your transport mode(range adjustable in settings):

- **Walk:** Strict 1.5km – 3km limit
- **Bus:** Extended 5km – 8km range
- **Drive:** Wide 15km – 25km range

### Menu OCR & Verification

The AI performs a "Menu Verification" step to ensure suggested restaurants actually serve the specific item you requested. It may also just produce a guess based off the website's name and reputation. For example, Taco Bell obviously sells Tacos.

### Dual Authentication

Full support for both Guest Mode(broswer cache) and User Accounts (persistent preferences via Firebase Auth).

### Late Night Mode

Automatically prioritizes fast food and 24-hour convenience stores (Wawa, 7-Eleven) during late-night hours (10 PM – 6 AM).

## Tech Stack

### Frontend

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Backend & Services

- **Intelligence:** Google Gemini 2.5 Flash API and Google Place API
- **Backend Logic:** Firebase Cloud Functions (Node.js)
- **Database:** Firebase Firestore (User preferences & history)
- **Authentication:** Firebase Auth
- **Hosting:** Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A Firebase project with Firestore and Auth enabled
- Google Cloud API Key (for Google Places API)
- Gemini API Key

### Installation

Clone the repository and install dependencies for both the frontend and the backend functions.

```bash
# Install root dependencies (Frontend)
npm install

# Install functions dependencies (Backend)
cd functions
npm install
cd ..
```

### Environment Setup

Create a `.env` file in the root directory for your frontend keys.

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Configuration (If running client-side)
GEMINI_API_KEY=your_google_ai_key

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### Running Locally

Frontend development server:

```bash
npm run dev
```

Testing Cloud Functions locally:

```bash
firebase emulators:start
```

## Deployment

### Build the Frontend

```bash
npm run build
```

### Set Backend Secrets

```bash
firebase functions:secrets:set API_KEY
```

### Deploy

```bash
firebase deploy
```

## Project Structure

```text
chownow/
├── dist/
├── functions/
│   ├── index.js
│   └── package.json
├── src/
│   ├── components/
│   ├── services/
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── firebase.json
├── firestore.rules
└── package.json
```

## Contributing

- Checkout the main branch (Development).
- Create a feature branch.
- Commit your changes.
- Push to the branch.
- Open a Pull Request.

Note: The legacy branch contains the pre-migration code state.

## License

Distributed under the MIT License. See LICENSE for more information.
