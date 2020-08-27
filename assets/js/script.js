/* jshint esversion: 8 */

document.addEventListener("DOMContentLoaded", () => {

    // constant variables
    const userBoard = document.getElementById("user-board");
    const aiBoard = document.getElementById("ai-board");
    const btnNew = document.getElementById("btn-new");
    const btnBingo = document.getElementById("btn-bingo");
    const btnStart = document.getElementById("btn-start");
    const btnSettings = document.getElementById("btn-settings");
    const btnAudio = document.getElementById("btn-audio");
    const languageList = document.getElementById("language-list");
    const gameList = document.getElementById("game-list");
    const flags = document.querySelectorAll(".flag");
    const timerSpan = document.getElementById("timer-span");
    const scoreSpan = document.getElementById("score-span");
    const scoreDiv = document.getElementById("score");
    const wordSpan = document.getElementById("word-span");
    const modals = document.querySelectorAll(".modal");
    const modalSettings = document.getElementById("modal-settings");
    const modalInfo = document.getElementById("modal-info");
    const modalLeaderboard = document.getElementById("modal-leaderboard");
    const modalClose = document.querySelectorAll(".close");
    const columns = ["b", "i", "n", "g", "o"];
    const rows = ["1", "2", "3", "4", "5"];
    const players = ["user", "ai", "goal"];
    const games = ["Columns", "Rows", "Corners", "Cross", "Outside", "Inside", "Blackout"];

    // dynamic variables
    let userWon, aiWon = false;
    let userCards, aiCards, goalCards;
    let activeGame = false;
    let answerList = [];
    let score = 1000;
    let pointsDeducted = false;
    let selectedLanguage, currentGame, cardInterval, cardList, markAI;

    // speech syntheses
    let msg, msgVoice, msgLang;
    const voices = window.speechSynthesis.getVoices();
    const mutedLangs = ["ie"]; // languages to mute by default


    // helper: generates global variables based on 'games' for User/AI/Goal, then calls getGameCards()
    function generateGameSettings(game) {
        players.forEach((player) => {
            window[`${player}${game}`] = []; // needs generated first for each
            // generate all 'User' and 'AI' variables
            switch (game) {
                case "Columns": // must be repeated 5x (for each column)
                    columns.forEach((col) => {
                        window[`${player}${game}`].push(getGameCards(player, game, `${player}-${col}`));
                    });
                    break;
                case "Rows": // must be repeated 5x (for each row)
                    rows.forEach((row) => {
                        window[`${player}${game}`].push(getGameCards(player, game, row));
                    });
                    break;
                default: // all other 'games' (not cols/rows)
                    window[`${player}${game}`] = getGameCards(player, game, `${player}-`);
                    break;
            }
        });
    }


    // generate the goal-grid with the cards required to win
    function generateGoalGrid(game) {
        switch (game) {
            case "Columns":
            case "Rows":
                cards = window[`goal${game}`];
                cards[2].forEach((card) => {
                    card.classList.add("correct");
                });
                // //----- TEST (start)
                // // user
                // cardsUser = window[`user${game}`];
                // cardsUser[2].forEach((card) => {
                //     card.firstElementChild.classList.add("flipped");
                //     card.firstElementChild.lastElementChild.classList.add("correct");
                // });
                // // ai
                // cardsAI = window[`ai${game}`];
                // cardsAI[2].forEach((card) => {
                //     card.classList.add("correct");
                // });
                // //----- TEST (end)
                break;
            default:
                cards = window[`goal${game}`];
                cards.forEach((card) => {
                    card.classList.add("correct");
                });
                // //----- TEST (start)
                // // user
                // cardsUser = window[`user${game}`];
                // cardsUser.forEach((card) => {
                //     card.firstElementChild.classList.add("flipped");
                //     card.firstElementChild.lastElementChild.classList.add("correct");
                // });
                // // ai
                // cardsAI = window[`ai${game}`];
                // cardsAI.forEach((card) => {
                //     card.classList.add("correct");
                // });
                // //----- TEST (end)
                break;
        }
    }


    // helper function: generate gameCards required to win
    function getGameCards(player, game, val) {
        switch (game) {
            case "Columns": // any vertical column
                return document.querySelectorAll(`#${player}-board li[id^=${val}]`);
            case "Rows": // any horizontal row
                return document.querySelectorAll(`#${player}-board li[id$='${val}']`);
            case "Corners": // ignore the 'N' Column and the '3' Row
                return document.querySelectorAll(`#${player}-board li:not([id^='${val}n']):not([id$='3']).emoji-card`);
            case "Cross": // only the 'N' Column and the '3' Row
                return document.querySelectorAll(`#${player}-board li[id^='${val}n'].emoji-card, #${player}-board li[id$='3'].emoji-card`);
            case "Outside": // only cards starting with 'Bs', 'Os', or ending with '1s', '5s'
                return document.querySelectorAll(`#${player}-board li[id^='${val}b'],[id^='${val}o'].emoji-card, #${player}-board li[id$='1'].emoji-card, #${player}-board li[id$='5'].emoji-card`);
            case "Inside": // only cards that do NOT start with 'Bs', 'Os', or end with '1s', '5s'
                return document.querySelectorAll(`#${player}-board li:not([id^='${val}b']):not([id^='${val}o']):not([id$='1']):not([id$='5']).emoji-card`);
            case "Blackout": // entire board must be completed
                return document.querySelectorAll(`#${player}-board li.emoji-card`);
        }
    }


    let game;
    // game logic: <select> option for 'game'
    gameList.addEventListener("change", () => {
        selectedGame(gameList);
    });
    selectedGame(gameList); // run automatically on page-load
    // game logic: get selected 'game' based on user selection
    function selectedGame(gameList) {
        game = gameList.options[gameList.selectedIndex].value;
        switch (game) {
            case "Random":
                // assign a random 'game' if user selects 'Random'
                game = games[Math.floor(Math.random() * games.length)];
        }
        generateGameSettings(game);
    }


    // always called on AI turn, but user needs to click button to check
    let resultList;
    function checkCards(player, game) {
        resultList = [];
        pointsDeducted = false; // reset to false each check
        switch (game) {
            // window[`vars`] required to combine 2 vars into 1
            // Array.from() required to convert from Object
            case "Columns":
            case "Rows":
                value = window[`${player}${game}`];
                checkForBingo(Array.from(value[0]), player);
                checkForBingo(Array.from(value[1]), player);
                checkForBingo(Array.from(value[2]), player);
                checkForBingo(Array.from(value[3]), player);
                checkForBingo(Array.from(value[4]), player);
                break;
            default: // game = Corners|Cross|Outside|Inside|Blackout
                checkForBingo(Array.from(window[`${player}${game}`]), player);
                break;
        }
    }


    // game logic: check if user or AI has Bingo
    let result;
    function checkForBingo(cardsToCheck, player) {
        result = cardsToCheck.every((card) => {
            // return 'true' if .every(card) checked contains 'correct' class
            switch (player) {
                case "user":
                    return card.firstElementChild.lastElementChild.classList.contains("correct");
                case "ai":
                    return card.classList.contains("correct");
            }
        });
        resultList.push(result);
        if (resultList.includes(true) && activeGame) {
            // resultList includes 'true'
            isBingo(player, cardsToCheck);
        } else {
            // resultList is entirely 'false'
            setTimeout(() => { // timeout needed for cols/rows for all 5x checks
                 // deduct half of the player's points
                if (!resultList.includes(true) && player == "user") deductHalf();
            }, 50); // slight delay due to checking all cols/rows
        }
        // if user reaches 0 points, then the AI automatically wins, so stop the game
        if (score <= 0) {
            aiWon = true;
            userWon = false;
            stopGame();
        }
    }


    // game function: result = true so we have a winner!
    function isBingo(player, cardsToCheck) {
        switch (player) {
            case "user":
                userWon = true; // User has won! trigger winning function!
                aiWon = false;
                cardsToCheck.forEach((card) => {
                    // add pulsing effect to the tiles that won
                    card.firstElementChild.lastElementChild.classList.add("winning-tiles");
                });
                break;
            case "ai":
                aiWon = true; // AI has won! trigger losing function
                userWon = false;
                cardsToCheck.forEach((card) => {
                    // add blinking effect to the tiles that won
                    card.classList.add("winning-tiles");
                });
                break;
        }
        stopGame(); // we have a winner! stop the game
    }


    // game logic:  deduct half of the user's points if clicking Bingo incorrectly
    function deductHalf() {
        if (!pointsDeducted) {
            pointsDeducted = true; // true so cols/rows don't trigger 5x
            let half = score / 2; // divide score in half
            if (half < 50) half = 0;
            let roundedUp = Math.round(half / 50) * 50; // round to nearest 50pts
            let deduction = score - roundedUp;
            scoreSpan.innerHTML = `- ${deduction} pts`;
            score = roundedUp;
            scoreDiv.classList.add("incorrect"); // add red text
            userBoard.classList.add("incorrect"); // wiggle the userBoard
            setTimeout(() => {
                scoreDiv.classList.remove("incorrect"); // remove red text
                userBoard.classList.remove("incorrect"); // remove the wiggle
                scoreSpan.innerHTML = score;
            }, 1000);
        }
    }


    // game logic: function for language selection
    function languageSelection(flag) {
        languageList.addEventListener("change", () => {
            selectedLanguage = languageList.options[languageList.selectedIndex].value;
            flag.src = `assets/svg/${selectedLanguage}.svg`;
            flag.alt = `${selectedLanguage} flag`;
            document.querySelector("link#favicon").href = `assets/svg/${selectedLanguage}.svg`;
            // change btnAudio emoji if a muted-language and disable it
            if (mutedLangs.indexOf(selectedLanguage) >= 0) {
                btnAudio.innerHTML = "🔇";
                btnAudio.style.pointerEvents = "none";
            } else {
                btnAudio.style.pointerEvents = "auto";
            }
        });
    }
    
    // game logic: flag selection
    flagSelection();
    function flagSelection() {
        flags.forEach((flag) => {
            languageSelection(flag);
        });
    }
    
    
    // game logic: start button
    btnStart.addEventListener("click", () => {
        selectedGame(gameList);
        startGame();
    });


    // game logic: start game
    function startGame() {
        wordSpan.innerHTML = "... LOADING GAME ...";
        modalSettings.style.display = "none"; // close modalSettings
        selectedLanguage = languageList.options[languageList.selectedIndex].value;
        // start the game: words and timer
        currentGame = setInterval(() => {
            populateAnswerList(selectedLanguage);
            gameTimer();
        }, 5000);
        // generate emoji list for user and AI
        userCards = getRandomCards(allCards, 25);
        aiCards = getRandomCards(allCards, 25);
        // cardList = getRandomCards(allCards, 3); // testing shorter games
        cardList = getRandomCards(allCards, allCards.length);
        // populate the User & AI boards
        populateCards(userCards, "#user-board .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        populateCards(aiCards, "#ai-board .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        activeGame = true; // game is now active
        setTimeout(() => {
            // display specific game being played on goal-board
            generateGoalGrid(game);
        }, 3500);
        setTimeout(() => {
            if (activeGame) btnBingo.classList.remove("disabled"); // enable the Bingo button once cards are ready
        }, 5000);
    }


    btnSettings.addEventListener("click", () => {
        resetGame();
    });
    // reset game
    function resetGame() {
        confetti.stop(); // stop confetti
        score = 1000;
        scoreSpan.innerHTML = 1000;
        scoreDiv.classList.remove("correct", "incorrect");
        btnBingo.classList.add("disabled");
        activeGame = false;
        userWon = false;
        aiWon = false;
        userCards = [];
        aiCards = [];
        answerList = [];
        cardList = [];
        clearInterval(cardInterval);
        clearTimeout(markAI);
        clearInterval(currentGame);
        resetCards();
        wordSpan.innerHTML = "Start New Game";
        timerSpan.innerHTML = 5;
    }

    
    // stop game
    function stopGame() {
        btnBingo.classList.add("disabled");
        activeGame = false;
        clearInterval(cardInterval);
        clearInterval(currentGame);
        confetti.stop();
        if (userWon) {
            // console.log("User Won"); // TEST
            setTimeout(() => {
                scoreDiv.classList.add("correct");
            }, 500);
            confetti.start(5000);
        } else if (aiWon) {
            // console.log("AI won"); // TEST
            scoreSpan.innerHTML = "Game Over";
            setTimeout(() => {
                scoreDiv.classList.add("incorrect");
            }, 500);
        }
    }


    // reset all cards (user, ai, goal)
    function resetCards() {
        cardsToReset = document.querySelectorAll("#user-board .emoji-card .emoji-card-inner .emoji-card-back .emoji, #ai-board .emoji-card, #goal-board .emoji-card");
        cardsToReset.forEach((card) => {
            card.parentNode.parentNode.classList.remove("flipped"); // un-flip user cards
            card.parentNode.classList.remove("correct", "winning-tiles"); // user cards
            card.classList.remove("correct", "winning-tiles"); // ai and goal cards
        });
    }


    // helper: get random number of items from array
    // https://stackoverflow.com/a/19270021
    function getRandomCards(array, num) {
        let result = new Array(num);
        let len = array.length;
        let selectedCards = new Array(len);
        while (num--) {
            let card = Math.floor(Math.random() * len);
            result[num] = array[card in selectedCards ? selectedCards[card] : card];
            selectedCards[card] = --len in selectedCards ? selectedCards[len] : len;
        }
        return result;
    }


    // helper: populate grid
    function populateCards(array, grid) {
        let cards = document.querySelectorAll(grid);
        let i = 0;
        cards.forEach((card) => {
            // use emoji in HTML: https://www.kirupa.com/html5/emoji.htm
            if (grid === "#user-board .emoji-card .emoji-card-inner .emoji-card-back .emoji") {
                card.innerText = String.fromCodePoint(array[i].emoji.replace("U+", "0x"));
            }
            card.setAttribute("aria-label", array[i].aria);
            card.setAttribute("data-emoji", array[i].word);
            i++;
        });
        flipCards(cards, grid);
        
    }


    // flip each card with slight delay each
    // https://stackoverflow.com/a/41924097
    function flipCards(cards, grid) {
        let cardIndex = 0;
        cardInterval = setInterval(() => {
            if (cardIndex != cards.length && activeGame) {
                if (grid === "#user-board .emoji-card .emoji-card-inner .emoji-card-back .emoji") {
                    cards[cardIndex++].parentNode.parentNode.classList.add("flipped");
                }
            } else {
                clearInterval(cardInterval);
                cardIndex = 0;
            }
        }, 150);
    }


    // game logic: function every 5 seconds to pull item from 'cardList' array
    function populateAnswerList(lang) {
        if (cardList.length === 0) {
            clearInterval(currentGame);
            aiWon = true;
            stopGame();
        } else {
            answerList.push(cardList[0]); // push each word per round into an answerList
            wordSpan.innerHTML = cardList[0][lang];
            spokenWord = cardList[0][lang];
            // verbalize spoken word if available
            if (mutedLangs.indexOf(lang) < 0 && btnAudio.innerHTML != "🔇") {
                speakWord(spokenWord, lang);
            }
            autocompleteAiGrid(cardList[0]); // function to fill-out AI grid
            cardList.shift(); // remove first item from cardList to avoid dupes
        }
    }


    // helper: function to fill-out AI grid
    function autocompleteAiGrid(word) {
        if (aiCards.includes(word)) {
            // https://stackoverflow.com/a/13449757
            let aiCard = document.querySelector(`#ai-board .emoji-card .emoji-card-inner .emoji-card-back .emoji[data-emoji~="${word.word}"]`);
            // give a delay to allow user to guess first in case of tie
            markAI = setTimeout(() => {
                aiCard.parentNode.parentNode.parentNode.classList.add("correct");
                checkCards("ai", game);
            }, 4500); // delay 4.5s to allow user to call Bingo first, in case of tie
        }
    }


    // helper: speak the word if available
    function speakWord(word, lang) {
        if ("speechSynthesis" in window) {
            // synthesis supported
            msg = new SpeechSynthesisUtterance();
            switch (lang) {
                case "gb":
                    msgVoice = voices[4];
                    msgLang = "en-GB";
                    break;
                case "de":
                    msgVoice = voices[2];
                    msgLang = "de-DE";
                    break;
                case "mx":
                    msgVoice = voices[7];
                    msgLang = "es-US";
                    break;
                case "fr":
                    msgVoice = voices[8];
                    msgLang = "fr-FR";
                    break;
                case "it":
                    msgVoice = voices[11];
                    msgLang = "it-IT";
                    break;
                case "nl":
                    msgVoice = voices[14];
                    msgLang = "nl-NL";
                    break;
                case "pl":
                    msgVoice = voices[15];
                    msgLang = "pl-PL";
                    break;
                case "pt":
                    msgVoice = voices[16];
                    msgLang = "pt-BR";
                    break;
            }
            msg.voice = msgVoice;
            msg.text = word.toString();
            msg.lang = msgLang.toString();
            speechSynthesis.speak(msg);
        } else {
            alert("No SpeechSynthesis Available");
            btnAudio.innerHTML = "&#x1F507;";
            // NON-TEST: need to make this disabled
            // also, if suddenly available above, remove disabled
        }
    }


    // toggle mute emoji
    btnAudio.addEventListener("click", () => {
        btnAudio.innerHTML = (btnAudio.innerHTML == "🔊") ? "&#x1F507;" : "&#x1F50A;";
    });


    // game logic: timer repeats unless last word or inactive game
    function gameTimer() {
        let time = 4;
        let timeInterval;
        timerSpan.innerHTML = 5;
        timeInterval = setInterval(() => {
            if (time >= 1 && cardList.length >= 0 && activeGame) {
                timerSpan.innerHTML = time;
                time--;
            } else {
                clearInterval(timeInterval);
            }
        }, 1000);
    }


    // user click event
    // NON-TEST! FIX: this should be in a function instead
    userCardsList = document.querySelectorAll("#user-board .emoji-card .emoji-card-inner .emoji-card-back");
    userCardsList.forEach((card) => {
        card.addEventListener("click", () => {
            if(activeGame) { // only if the game is active
                // https://stackoverflow.com/a/8217584
                // check if clicked card exists inside of the answerList[]
                if (answerList.some(word => word.word === card.firstElementChild.dataset.emoji)) {
                    score += 250; // add 250pts (correct)
                    scoreSpan.innerHTML = "+ 250 pts";
                    userCheck("correct", card);
                } else {
                    score -= 250; // deduct 250pts (incorrect)
                    scoreSpan.innerHTML = "- 250 pts";
                    userCheck("incorrect", card);
                }
            }
        });
    });


    // game function: user correct vs incorrect
    function userCheck(answer, card) {
        card.classList.add(answer);
        scoreDiv.classList.add(answer);
        setTimeout(() => {
            // remove temporary color
            scoreDiv.classList.remove(answer);
            if (answer == "incorrect") card.classList.remove(answer);
            scoreSpan.innerHTML = score;
        }, 1000);
    }


    // game function: user clicks to check for Bingo
    btnBingo.addEventListener("click", () => {
        checkCards("user", game);
    });


    // modalSettings
    btnSettings.addEventListener("click", () => {
        modalSettings.style.display = "block";
    });
    btnNew.addEventListener("click", () => {
        modalSettings.style.display = "block";
        resetGame();
    });
    // close modals
    modalClose.forEach((close) => {
        close.addEventListener("click", () => {
            modals.forEach((modal) => {
                modal.style.display = "none";
            });
        });
    });
    window.addEventListener("click", (e) => {
        if (e.target == modalSettings) {
            modalSettings.style.display = "none";
        }
    });


});
