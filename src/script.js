class FractionGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.timer = null;
        this.isHardMode = false;
        this.questionsCompleted = 0;
        this.isAnswerLocked = false;
        this.currentUser = null;
        
        // Initialize DOM elements
        this.initializeDOMElements();
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Initialize game
        this.updateDisplay();
        this.updateLeaderboard();
    }

    initializeDOMElements() {
        // Get all required DOM elements
        const elements = {
            loginSection: document.getElementById('login-section'),
            usernameInput: document.getElementById('username'),
            startGameBtn: document.getElementById('start-game'),
            easyModeButton: document.querySelector('[data-mode="easy"]'),
            hardModeButton: document.querySelector('[data-mode="hard"]'),
            restartButton: document.getElementById('restart'),
            scoreDisplay: document.getElementById('score'),
            timerDisplay: document.getElementById('timer'),
            fractionDisplay: document.getElementById('fraction'),
            optionsContainer: document.getElementById('options'),
            gameArea: document.getElementById('game-area'),
            gameOverScreen: document.getElementById('game-over'),
            finalScoreDisplay: document.getElementById('final-score'),
            leaderboardMode: document.getElementById('leaderboard-mode'),
            leaderboardBody: document.querySelector('#leaderboard tbody'),
            modeSelection: document.getElementById('mode-selection'),
            leaderboardSection: document.getElementById('leaderboard-section')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Required DOM element not found: ${key}`);
                throw new Error(`Required DOM element not found: ${key}`);
            }
            this[key] = element;
        }

        // Optional elements
        this.questionsDisplay = document.getElementById('questions');
    }

    bindEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.handleLogin());
        this.easyModeButton.addEventListener('click', () => this.startGame(false));
        this.hardModeButton.addEventListener('click', () => this.startGame(true));
        this.restartButton.addEventListener('click', () => this.showModeSelection());
        this.leaderboardMode.addEventListener('change', () => this.updateLeaderboard());
    }
    
    async handleLogin() {
        const username = this.usernameInput.value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        try {
            console.log('Attempting to sign in anonymously...');
            // Create anonymous user
            const userCredential = await firebase.auth().signInAnonymously();
            console.log('Anonymous sign-in successful:', userCredential);
            this.currentUser = userCredential.user;
            
            console.log('Storing username in database...');
            // Store username in Realtime Database
            await firebase.database().ref(`users/${this.currentUser.uid}`).set({
                username: username
            });
            console.log('Username stored successfully');

            // Show mode selection
            this.loginSection.style.display = 'none';
            this.modeSelection.style.display = 'block';
        } catch (error) {
            console.error('Login error details:', {
                code: error.code,
                message: error.message,
                fullError: error
            });
            alert('Error logging in. Please try again.');
        }
    }
    
    async updateLeaderboard() {
        try {
            const mode = this.leaderboardMode.value;
            const leaderboardRef = firebase.database().ref('leaderboard')
                .orderByChild('mode')
                .equalTo(mode)
                .limitToLast(10);
            
            const snapshot = await leaderboardRef.once('value');
            this.leaderboardBody.innerHTML = '';
            
            const scores = [];
            snapshot.forEach(childSnapshot => {
                scores.push(childSnapshot.val());
            });
            
            // Sort scores in descending order
            scores.sort((a, b) => b.score - a.score);
            
            let rank = 1;
            scores.forEach(data => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rank}</td>
                    <td>${data.username}</td>
                    <td>${data.score}</td>
                `;
                this.leaderboardBody.appendChild(row);
                rank++;
            });
        } catch (error) {
            console.error('Error updating leaderboard:', error);
        }
    }
    
    async saveScore() {
        if (!this.currentUser) return;
        
        try {
            const userRef = firebase.database().ref(`users/${this.currentUser.uid}`);
            const userSnapshot = await userRef.once('value');
            const username = userSnapshot.val().username;
            
            await firebase.database().ref('leaderboard').push({
                userId: this.currentUser.uid,
                username: username,
                score: this.score,
                mode: this.isHardMode ? 'hard' : 'easy',
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            
            this.updateLeaderboard();
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
    
    showModeSelection() {
        this.gameOverScreen.style.display = 'none';
        this.gameArea.style.display = 'none';
        this.modeSelection.style.display = 'block';
        this.leaderboardSection.classList.remove('hidden');
    }
    
    startGame(isHardMode) {
        this.isHardMode = isHardMode;
        this.score = 0;
        this.timeLeft = 60;
        this.isPlaying = true;
        this.questionsCompleted = 0;
        this.isAnswerLocked = false;
        
        this.modeSelection.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.gameArea.style.display = 'block';
        this.leaderboardSection.classList.add('hidden');
        
        this.updateDisplay();
        this.generateNewFraction();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    generateNewFraction() {
        let fraction;
        
        if (this.isHardMode) {
            // Generate two random fractions for hard mode
            const fraction1 = this.getRandomFraction();
            const fraction2 = this.getRandomFraction();
            const operation = Math.random() < 0.5 ? '+' : '-';
            
            const result = operation === '+' ? 
                fraction1.value + fraction2.value : 
                fraction1.value - fraction2.value;
            
            // Ensure result is between 0 and 1
            const finalResult = Math.max(0, Math.min(1, result));
            
            fraction = {
                display: `${fraction1.fraction} ${operation} ${fraction2.fraction}`,
                value: finalResult
            };
        } else {
            // Easy mode - simple fraction matching
            const fractions = [
                { fraction: '1/2', value: 0.5 },
                { fraction: '1/4', value: 0.25 },
                { fraction: '3/4', value: 0.75 },
                { fraction: '1/3', value: 0.333333 },
                { fraction: '2/3', value: 0.666667 },
                { fraction: '1/8', value: 0.125 },
                { fraction: '3/8', value: 0.375 },
                { fraction: '5/8', value: 0.625 },
                { fraction: '7/8', value: 0.875 },
                { fraction: '2/5', value: 0.4 },
                { fraction: '3/5', value: 0.6 },
                { fraction: '4/5', value: 0.8 }
            ];
            
            // Get a random fraction
            fraction = fractions[Math.floor(Math.random() * fractions.length)];
            
            // For easy mode, we want to show the fraction
            fraction.display = `Match this fraction: ${fraction.fraction}`;
        }
        
        this.currentFraction = fraction;
        this.fractionDisplay.textContent = fraction.display;
        this.isAnswerLocked = false;
        
        // Generate options and render them
        const options = this.generateOptions(fraction.value);
        this.renderOptions(options);
    }
    
    getRandomFraction() {
        const fractions = [
            { fraction: '1/2', value: 0.5 },
            { fraction: '1/4', value: 0.25 },
            { fraction: '3/4', value: 0.75 },
            { fraction: '1/3', value: 0.333333 },
            { fraction: '2/3', value: 0.666667 },
            { fraction: '1/8', value: 0.125 },
            { fraction: '3/8', value: 0.375 },
            { fraction: '5/8', value: 0.625 },
            { fraction: '7/8', value: 0.875 },
            { fraction: '2/5', value: 0.4 },
            { fraction: '3/5', value: 0.6 },
            { fraction: '4/5', value: 0.8 }
        ];
        return fractions[Math.floor(Math.random() * fractions.length)];
    }
    
    generateOptions(correctValue) {
        const options = [correctValue];
        const possibleValues = [
            0.5,    // 1/2
            0.25,   // 1/4
            0.75,   // 3/4
            0.333333, // 1/3
            0.666667, // 2/3
            0.125,  // 1/8
            0.375,  // 3/8
            0.625,  // 5/8
            0.875,  // 7/8
            0.4,    // 2/5
            0.6,    // 3/5
            0.8     // 4/5
        ];
        
        // First, add all possible visual fractions
        possibleValues.forEach(value => {
            if (Math.abs(value - correctValue) > 0.000001 && options.length < 6) {
                options.push(value);
            }
        });
        
        // Then fill remaining slots with random values
        while (options.length < 6) {
            const randomValue = Math.round(Math.random() * 100) / 100;
            if (!options.some(opt => Math.abs(opt - randomValue) < 0.000001) && randomValue > 0 && randomValue < 1) {
                options.push(randomValue);
            }
        }
        
        return this.shuffleArray(options);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    renderOptions(options) {
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <div class="visual">
                    <div class="visual-fill" style="width: ${option * 100}%"></div>
                </div>
                <div class="decimal">${option}</div>
            `;
            
            optionElement.addEventListener('click', () => this.checkAnswer(option));
            optionsContainer.appendChild(optionElement);
        });
    }
    
    checkAnswer(selectedValue) {
        if (!this.isPlaying || this.isAnswerLocked) return;
        
        this.isAnswerLocked = true;
        const isCorrect = Math.abs(selectedValue - this.currentFraction.value) < 0.001;
        
        // Find all option elements
        const options = document.querySelectorAll('.option');
        
        // Find the selected option and the correct option
        options.forEach(option => {
            const optionValue = parseFloat(option.querySelector('.decimal').textContent);
            if (Math.abs(optionValue - selectedValue) < 0.001) {
                // This is the selected option
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else if (Math.abs(optionValue - this.currentFraction.value) < 0.001) {
                // This is the correct option
                option.classList.add('correct');
            }
        });
        
        if (isCorrect) {
            this.score += this.isHardMode ? 20 : 10;
        }
        
        this.questionsCompleted++;
        this.updateDisplay();
        
        setTimeout(() => {
            // Remove all highlight classes before generating new fraction
            options.forEach(option => {
                option.classList.remove('correct', 'incorrect');
            });
            this.generateNewFraction();
        }, 1000);
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.timerDisplay.textContent = this.timeLeft;
        if (this.questionsDisplay) {
            this.questionsDisplay.textContent = this.questionsCompleted;
        }
    }
    
    async endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.finalScoreDisplay.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
        
        // Save score to leaderboard
        await this.saveScore();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    try {
        new FractionGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to initialize game. Please check the console for details.');
    }
}); 