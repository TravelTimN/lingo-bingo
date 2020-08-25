document.addEventListener("DOMContentLoaded", () => {


    const languageList = document.getElementById("language");
    const gameStyleList = document.getElementById("gameStyle");
    const userGrid = document.getElementById("user-grid");
    const styleSpan = document.getElementById("style");
    const startBtn = document.getElementById("start");
    const scoreSpan = document.getElementById("score");
    const flags = document.querySelectorAll(".flag");
    const wordSpan = document.getElementById("word");
    const newGameBtn = document.getElementById("newGameBtn");
    const bingoBtn = document.getElementById("bingoBtn");
    const timer = document.getElementById("timer");
    const audio = document.getElementById("audio");
    const modals = document.querySelectorAll(".modal");
    const settingsModal = document.getElementById("settings-modal");
    const settingsBtn = document.getElementById("settings-btn");
    const modalClose = document.querySelectorAll(".close");
    const columns = ["b", "i", "n", "g", "o"];
    const rows = ["1", "2", "3", "4", "5"];
    const players = ["user", "ai"];
    const gameStyles = ["Columns", "Rows", "Corners", "Cross", "Outside", "Inside", "Blackout"];

    let userWon = false;
    let aiWon = false;
    let selectedLanguage;
    let currentGame;
    let answerList = [];
    let userCards;
    let aiCards;
    let markAI;
    let cardList;
    let cardInterval;
    let activeGame = false;
    let score = 1000;
    let pointsDeducted = false;
    // speech syntheses
    let msg, msgVoice, msgLang;
    const voices = window.speechSynthesis.getVoices();
    const mutedLangs = ["ie"]; // array of languages to mute


    // helper: generates global variables based on gameStyles for User and AI, then calls getGameStyleCards()
    function generateGameSettings(game) {
        players.forEach((player) => {
            window[`${player}${game}`] = []; // needs generated first for each
            switch (player) {
                case "user": // generate all 'User' variables
                    switch (game) {
                        case "Columns": // must be repeated 5x (for each column)
                            columns.forEach((col) => {
                                window[`${player}${game}`].push(getGameStyleCards(game, player, col));
                            });
                            break;
                        case "Rows": // must be repeated 5x (for each row)
                            rows.forEach((row) => {
                                window[`${player}${game}`].push(getGameStyleCards(game, player, row));
                            });
                            break;
                        default: // all other gameStyles (not cols/rows)
                            window[`${player}${game}`] = getGameStyleCards(game, player, "");
                            break;
                    }
                    break;
                case "ai": // generate all 'AI' variables
                    switch (game) {
                        case "Columns": // must be repeated 5x (for each column)
                            columns.forEach((col) => {
                                window[`${player}${game}`].push(getGameStyleCards(game, player, `ai-${col}`));
                            });
                            break;
                        case "Rows": // must be repeated 5x (for each row)
                            rows.forEach((row) => {
                                window[`${player}${game}`].push(getGameStyleCards(game, player, row));
                            });
                            break;
                        default: // all other gameStyles (not cols/rows)
                            window[`${player}${game}`] = getGameStyleCards(game, player, "ai-");
                            break;
                    }
                    break;
            }
        });
        // //------------- TEST!!!
        // switch (game) {
        //     case "Columns":
        //     case "Rows":
        //         xyz = window[`ai${game}`];
        //         xyz[2].forEach((card) => {
        //             card.firstElementChild.classList.add("flipped");
        //             card.firstElementChild.lastElementChild.classList.add("correct");
        //             card.classList.add("correct");
        //         });
        //         break;
        //     default:
        //         xyz = window[`ai${game}`];
        //         xyz.forEach((card) => {
        //             card.firstElementChild.classList.add("flipped");
        //             card.firstElementChild.lastElementChild.classList.add("correct");
        //             card.classList.add("correct");
        //         });
        //         break;
        // }
        // //---------- END TEST
    }


    // helper function: generate gameStyle cards required to win
    function getGameStyleCards(game, player, val) {
        switch (game) {
            case "Columns": // any vertical column
                return document.querySelectorAll(`#${player}-grid div[id^=${val}]`);
            case "Rows": // any horizontal row
                return document.querySelectorAll(`#${player}-grid div[id$='${val}']`);
            case "Corners": // ignore the 'N' Column and the '3' Row
                return document.querySelectorAll(`#${player}-grid div:not([id^='${val}n']):not([id$='3']).emoji-card`);
            case "Cross": // only the 'N' Column and the '3' Row
                return document.querySelectorAll(`#${player}-grid div[id^='${val}n'].emoji-card, #${player}-grid div[id$='3'].emoji-card`);
            case "Outside": // only cards starting with 'Bs', 'Os', or ending with '1s', '5s'
                return document.querySelectorAll(`#${player}-grid div[id^='${val}b'],[id^='${val}o'].emoji-card, #${player}-grid div[id$='1'].emoji-card, #${player}-grid div[id$='5'].emoji-card`);
            case "Inside": // only cards that do NOT start with 'Bs', 'Os', or end with '1s', '5s'
                return document.querySelectorAll(`#${player}-grid div:not([id^='${val}b']):not([id^='${val}o']):not([id$='1']):not([id$='5']).emoji-card`);
            case "Blackout": // entire board must be completed
                return document.querySelectorAll(`#${player}-grid div.emoji-card`);
        }
    }


    let gameStyle;
    // game logic: <select> option for gameStyle
    gameStyleList.addEventListener("change", () => {
        selectedGame(gameStyleList);
    });
    selectedGame(gameStyleList); // run automatically on page-load
    // game logic: get selected gameStyle based on user selection
    function selectedGame(gameStyleList) {
        gameStyle = gameStyleList.options[gameStyleList.selectedIndex].value;
        switch (gameStyle) {
            case "Random":
                // assign a random gameStyle if user selects 'Random'
                gameStyle = gameStyles[Math.floor(Math.random() * gameStyles.length)];
        }
        styleSpan.innerHTML = gameStyle;
        generateGameSettings(gameStyle);
    }


    // always called on AI turn, but user needs to click button to check
    let resultList;
    function checkCards(player, game) {
        resultList = [];
        pointsDeducted = false; // reset to false each check
        switch (game) {
            // Array.from() required to convert from Object
            // window[`vars`] required to combine 2 vars into 1
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
            setTimeout(() => { // timeout needed for Cols/Rows for all 5x checks
                 // deduct half of the player's points
                if (!resultList.includes(true) && player == "user") deductHalf();
            }, 50);
        }
        // if user reaches 0 points, then the AI automatically wins, so stop the game
        if (score <= 0) {
            aiWon = true;
            userWon = false;
            stopGame();
        }
    }


    // result = true so we have a winner!
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
            pointsDeducted = true; // true so rows/cols don't trigger 5x
            let half = score / 2; // divide score in half
            if (half < 50) half = 0;
            score = Math.round(half / 50) * 50; // round to nearest 50pts
            scoreSpan.innerHTML = score;
            scoreSpan.classList.add("incorrect"); // add red text
            userGrid.classList.add("incorrect"); // shake the userGrid
            setTimeout(() => {
                scoreSpan.classList.remove("incorrect"); // remove red text
                userGrid.classList.remove("incorrect"); // remove the shake
            }, 1000);
        }
    }


    // game logic: function for language selection
    function languageSelection(flag) {
        languageList.addEventListener("change", () => {
            selectedLanguage = languageList.options[languageList.selectedIndex].value;
            flag.src = `assets/svg/${selectedLanguage}.svg`;
            document.querySelector("link#favicon").href = `assets/svg/${selectedLanguage}.svg`;
            // change audio emoji if a muted-language and disable it
            if (mutedLangs.indexOf(selectedLanguage) >= 0) {
                audio.innerHTML = "🔇";
                audio.style.pointerEvents = "none";
            } else {
                audio.style.pointerEvents = "auto";
            }
        });
    }
    
    // game logic: flag selection
    flagSelection();
    function flagSelection() {
        flags.forEach((flag) => {
            flag.src = `assets/svg/gb.svg`;
            languageSelection(flag);
        });
    }
    
    
    // game logic: start button
    startBtn.addEventListener("click", () => {
        selectedGame(gameStyleList);
        startGame();
    });


    // game logic: start game
    function startGame() {
        word.innerHTML = "... LOADING GAME ...";
        settingsModal.style.display = "none"; // close settingsModal
        selectedLanguage = languageList.options[languageList.selectedIndex].value;
        // start the game/words and timer
        currentGame = setInterval(() => {
            populateAnswerList(selectedLanguage);
            gameTimer();
        }, 5000);
        // game logic: generate emoji list for user and AI
        userCards = getRandomCards(allCards, 25);
        aiCards = getRandomCards(allCards, 25);
        // cardList = getRandomCards(allCards, 3); // testing shorter games
        cardList = getRandomCards(allCards, allCards.length);
        // game logic: populate the boards
        populateCards(userCards, "#user-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        populateCards(aiCards, "#ai-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        activeGame = true; // game is now active
        setTimeout(() => {
            if (activeGame) bingoBtn.classList.remove("disabled"); // enable the Bingo button once cards are ready
        }, 5000);
    }


    settingsBtn.addEventListener("click", () => {
        resetGame();
    });
    // reset game
    function resetGame() {
        confetti.stop(); // stop confetti
        score = 1000;
        scoreSpan.innerHTML = 1000;
        bingoBtn.classList.add("disabled");
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
        word.innerHTML = "Start New Game";
        timer.innerHTML = 5;
    }

    
    // stop game
    function stopGame() {
        bingoBtn.classList.add("disabled");
        activeGame = false;
        clearInterval(cardInterval);
        clearInterval(currentGame);
        confetti.stop();
        if (userWon) {
            console.log("User Won");
            confetti.start(5000);
        } else if (aiWon) {
            console.log("AI won");
        }
    }


    // reset all cards (user and AI)
    function resetCards() {      
        userEmojiCards = document.querySelectorAll("#user-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        userEmojiCards.forEach((card) => {
            card.parentNode.parentNode.classList.remove("flipped"); // unflip cards
            card.parentNode.classList.remove("correct"); // remove 'correct' class
            card.parentNode.classList.remove("winning-tiles"); // remove 'winning-tiles' class
        });
        aiEmojiCards = document.querySelectorAll("#ai-grid .emoji-card");
        aiEmojiCards.forEach((card) => {
            card.classList.remove("correct"); // remove 'correct' class
            card.classList.remove("winning-tiles"); // remove 'winning-tiles' class
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
            if (grid === "#user-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji") {
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
                if (grid === "#user-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji") {
                    cards[cardIndex++].parentNode.parentNode.classList.add("flipped");
                }
            } else {
                clearInterval(cardInterval);
                cardIndex = 0;
            }
        }, 150);
    }


    // game logic
    // function every 5 seconds to pull item from 'cardList' array
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
            if (mutedLangs.indexOf(lang) < 0 && audio.innerHTML != "🔇") {
                speakWord(spokenWord, lang);
            }
            autocompleteAIgrid(cardList[0]); // function to fill-out AI grid
            cardList.shift(); // remove first item from cardList to avoid dupes
        }
    }


    // helper: function to fill-out AI grid
    function autocompleteAIgrid(word) {
        if (aiCards.includes(word)) {
            // https://stackoverflow.com/a/13449757
            let aiCard = document.querySelector(`#ai-grid .emoji-card .emoji-card-inner .emoji-card-back .emoji[data-emoji~="${word.word}"]`);
            // give a delay to allow user to guess first in case of tie
            markAI = setTimeout(() => {
                aiCard.parentNode.parentNode.parentNode.classList.add("correct");
                checkCards("ai", gameStyle);
            }, 4500);
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
            audio.innerHTML = "&#x1F507";
        }
    }


    // toggle mute emoji
    audio.addEventListener("click", () => {
        audio.innerHTML = (audio.innerHTML == "🔊") ? "&#x1F507" : "&#x1F50A";
    });


    // game logic: timer repeats unless last word or inactive game
    function gameTimer() {
        let time = 4;
        let timeInterval;
        timer.innerHTML = 5;
        timeInterval = setInterval(() => {
            if (time >= 1 && cardList.length >= 0 && activeGame) {
                timer.innerHTML = time;
                time--;
            } else {
                clearInterval(timeInterval);
            }
        }, 1000);
    }


    // user click event
    // NON-TEST! FIX: this should be in a function instead
    userCardsList = document.querySelectorAll("#user-grid .emoji-card .emoji-card-inner .emoji-card-back");
    userCardsList.forEach((card) => {
        card.addEventListener("click", () => {
            if(activeGame) { // only if the game is active
                // https://stackoverflow.com/a/8217584
                // check if clicked card exists inside of the answerList[]
                if (answerList.some(word => word.word === card.firstElementChild.dataset.emoji)) {
                    score += 250; // add 250pts (correct)
                    userCheck("correct", card);
                } else {
                    score -= 250; // deduct 250pts (incorrect)
                    userCheck("incorrect", card);
                }
                scoreSpan.innerHTML = score;
            }
        });
    });


    // game function: user correct vs incorrect
    function userCheck(answer, card) {
        card.classList.add(answer);
        scoreSpan.classList.add(answer);
        setTimeout(() => {
            // remove temporary color
            scoreSpan.classList.remove(answer);
            if (answer == "incorrect") card.classList.remove(answer);
        }, 1000);
    }


    // game function: user clicks to check for Bingo
    bingoBtn.addEventListener("click", () => {
        checkCards("user", gameStyle);
    });


    // settingsModal
    settingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "block";
    });
    newGameBtn.addEventListener("click", () => {
        settingsModal.style.display = "block";
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
        if (e.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });


});
