# Fraction Frenzy

A web-based game for teaching fractions to middle school students.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   FIREBASE_APP_ID=your_app_id_here
   ```

4. Replace the placeholder values with your Firebase project credentials from the Firebase Console.

## Development

To run the development server:
```bash
npm run dev
```

This will start a development server at `http://localhost:9000`

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Firebase Setup

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Anonymous Authentication:
   - Go to Authentication > Sign-in method
   - Enable Anonymous authentication
3. Set up Firestore Database:
   - Create a new database
   - Set up the following collections:
     - `users`: For storing user information
     - `leaderboard`: For storing game scores
4. Get your Firebase configuration:
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click the web app icon (</>)
   - Register your app and copy the configuration

## Running the Game

1. Start the development server or build for production
2. Open the game in a web browser
3. Enter a username to start playing
4. Choose between Easy and Hard modes
5. Play the game and try to get the highest score!

## Features

- Two game modes: Easy and Hard
- Visual fraction representations
- Real-time leaderboard
- User authentication
- Score tracking
- Responsive design

## Project Overview

Fraction Frenzy is a simple but engaging game that helps students understand fractions by matching them to their visual representations and decimal equivalents. The game features:

- Visual fraction representations using circles
- Decimal equivalents
- Score tracking
- Time-based gameplay
- Immediate feedback on answers
- Modern, responsive design

## How to Play

1. Click the "Start Game" button to begin
2. You'll see a fraction displayed at the top
3. Click on the visual representation that matches the fraction
4. Get points for correct answers
5. Try to get the highest score before time runs out!

## Technical Details

The project is built using:
- HTML5
- CSS3 (with modern features like CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)

No external dependencies or build tools are required.

## How to Run

Simply open the `index.html` file in a modern web browser. No server or additional setup is required.

## Learning Objectives

This game helps students:
- Understand fraction concepts visually
- Connect fractions with their decimal equivalents
- Develop quick mental math skills
- Learn through interactive gameplay

## Future Improvements

Potential enhancements could include:
- More fraction types
- Different difficulty levels
- Sound effects
- High score tracking
- Additional visual representations
- Multiplayer mode

## License

MIT License - Feel free to use and modify for educational purposes. 