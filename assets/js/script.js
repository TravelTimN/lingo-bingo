/* jshint esversion: 8 */

document.addEventListener("DOMContentLoaded", () => {

    // constant variables
    const userBoard = document.getElementById("user-board");
    const userTiles = document.querySelectorAll("#user-board .emoji-card .emoji-card-inner .emoji-card-back");
    const btnNew = document.getElementById("btn-new");
    const btnLingoBingo = document.getElementById("btn-lingobingo");
    const btnStart = document.getElementById("btn-start");
    const btnSettings = document.getElementById("btn-settings");
    const btnAudio = document.getElementById("btn-audio");
    const btnScoreboard = document.getElementById("btn-scoreboard");
    const languageList = document.getElementById("language-list");
    const gameList = document.getElementById("game-list");
    const flags = document.querySelectorAll(".flag");
    const timerSpan = document.getElementById("timer-span");
    const scoreSpan = document.getElementById("score-span");
    const scoreDiv = document.getElementById("score");
    const gameSpan = document.getElementById("game-span");
    const wordSpan = document.getElementById("word-span");
    const modals = document.querySelectorAll(".modal");
    const modalSettings = document.getElementById("modal-settings");
    const modalInfo = document.getElementById("modal-info");
    const modalScoreboard = document.getElementById("modal-scoreboard");
    const modalClose = document.querySelectorAll(".modal-close");
    const toHide = document.querySelectorAll("small, br:not(.ignore)");
    const columns = ["b", "i", "n", "g", "o"];
    const rows = ["1", "2", "3", "4", "5"];
    const players = ["user", "ai", "goal"];
    const games = ["Blackout", "Columns", "Corners", "Cross", "Inside", "Outside", "Rows"];
    const languages = ["cn", "nl", "gb", "fr", "de", "in", "ie", "it", "jp", "kr", "pl", "pt", "ru", "mx"];

    // dynamic variables
    let userWon, aiWon, activeGame, pointsDeducted = false;
    let answerList = [];
    let score = 1000;
    let userCards, aiCards, selectedLanguage, game, langGame, getGameLS,
        userWinCount, aiWinCount, highScore, gameSetup, enableCards,
        currentGame, cardInterval, cardList, markAI, result, resultList;

    // speech syntheses
    let msg, msgVoice, msgLang, voices;
    let speechAvailable = false;
    const mutedLangs = ["ie"]; // languages to mute by default


    userTiles.forEach((card) => card.classList.add("disabled")); // disable user cards on load


    // generate score board modal data
    generateScoreboard();
    function generateScoreboard() {
        languages.forEach((btnLang) => {
            games.forEach((btnGame) => {
                // get localStorage information per game
                langGame = `${btnLang}${btnGame}`;
                getGameLS = JSON.parse(localStorage.getItem(langGame));
                if (getGameLS) {
                    userWinCount = getGameLS.userWon;
                    aiWinCount = getGameLS.aiWon;
                    highScore = getGameLS.highScore;
                } else {
                    userWinCount = aiWinCount = highScore = 0;
                }
                // tbody: generate rows
                let tbody = document.getElementById("tbody");
                let br = document.createElement("br");
                let tr = tbody.insertRow();
                tr.id = `${btnLang}${btnGame}`;
                // cell: flag + game
                let td0 = tr.insertCell(0);
                let flagEl = document.createElement("img");
                flagEl.src = `assets/svg/${btnLang}.svg`;
                flagEl.alt = `${btnLang} flag`;
                flagEl.classList.add("flag");
                let gameEl = document.createTextNode(btnGame);
                td0.appendChild(flagEl);
                td0.appendChild(br);
                td0.appendChild(gameEl);
                // cell: user wins
                let td1 = tr.insertCell(1);
                //////
                let winsEl = document.createTextNode(userWinCount);
                td1.appendChild(winsEl);
                // cell: ai wins
                let td2 = tr.insertCell(2);
                let losesEl = document.createTextNode(aiWinCount);
                td2.appendChild(losesEl);
                // cell: high score
                let td3 = tr.insertCell(3);
                let scoreEl = document.createTextNode(highScore);
                td3.appendChild(scoreEl);
                // cell: play button (specific game)
                let td4 = tr.insertCell(4);
                let buttonEl = document.createElement("button");
                buttonEl.innerHTML = "Play";
                buttonEl.classList.add("btn-play");
                buttonEl.addEventListener("click", function() {
                    languageList.value = btnLang; // update languageList selected value
                    selectedLanguage = btnLang; // update selectedLanguage global variable
                    gameList.value = btnGame; // update gameList selected value
                    game = btnGame; // update game global variable
                    flags.forEach((flag) => {
                        languageSelection(flag); // update all .flags (not score board)
                    });
                    generateGameSettings(game); // generate the game settings
                    startGame(); // start the game
                });
                td4.appendChild(buttonEl);
            });
        });
    }


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
                break;
            default:
                cards = window[`goal${game}`];
                cards.forEach((card) => {
                    card.classList.add("correct");
                });
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
    function checkCards(player, game) {
        resultList = [];
        pointsDeducted = false; // reset to false each check
        switch (game) {
            // window[`vars`] required to combine 2 vars into 1
            // Array.from() required to convert from Object
            case "Columns":
            case "Rows":
                value = window[`${player}${game}`];
                checkForLingoBingo(Array.from(value[0]), player);
                checkForLingoBingo(Array.from(value[1]), player);
                checkForLingoBingo(Array.from(value[2]), player);
                checkForLingoBingo(Array.from(value[3]), player);
                checkForLingoBingo(Array.from(value[4]), player);
                break;
            default: // game = all other games
                checkForLingoBingo(Array.from(window[`${player}${game}`]), player);
                break;
        }
    }


    // game logic: check if user or AI has LingoBingo
    function checkForLingoBingo(cardsToCheck, player) {
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
            isLingoBingo(player, cardsToCheck);
        } else {
            // resultList is entirely 'false'
            setTimeout(() => { // timeout needed for cols/rows for all 5x checks
                 // deduct half of the player's points
                if (!resultList.includes(true) && player == "user") deductHalf();
            }, 50); // slight delay due to checking all cols/rows
        }
    }


    // game function: result = true, so we have a winner!
    function isLingoBingo(player, cardsToCheck) {
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


    // game logic:  deduct half of the user's points if clicking LingoBingo incorrectly
    function deductHalf() {
        if (!pointsDeducted) {
            pointsDeducted = true; // true so cols/rows don't trigger 5x
            let half = score / 2; // divide score in half
            if (half < 50) half = 0;
            let roundedUp = Math.round(half / 50) * 50; // round to nearest 50pts
            let deduction = score - roundedUp;
            scoreSpan.innerHTML = `- ${deduction} pts`;
            score = roundedUp;
            scoreDiv.classList.add("incorrect"); // add red bgColor
            userBoard.classList.add("incorrect"); // wiggle the userBoard
            if (score <= 0) { // user lost all points, so the AI automatically wins - stopGame()
                aiWon = true;
                userWon = false;
                stopGame();
            } else { // user still has points, and can continue playing
                setTimeout(() => {
                    scoreDiv.classList.remove("incorrect"); // remove red bgColor
                    btnLingoBingo.classList.remove("disabled"); // re-enable LingoBingo button
                    scoreSpan.innerHTML = score;
                }, 1000);
            }
            setTimeout(() => {
                userBoard.classList.remove("incorrect"); // remove the wiggle
            }, 1000);
        }
    }


    // game logic: function for language selection
    function languageSelection(flag) {
        flag.src = `assets/svg/${selectedLanguage}.svg`;
        flag.alt = `${selectedLanguage} flag`;
        document.querySelector("link#favicon").href = `assets/svg/${selectedLanguage}.svg`;
        // recursive function calling self
        languageList.addEventListener("change", () => {
            selectedLanguage = languageList.options[languageList.selectedIndex].value;
            languageSelection(flag);
        });
    }


    // game logic: flag selection
    flagSelection();
    function flagSelection() {
        selectedLanguage = languageList.options[languageList.selectedIndex].value;
        flags.forEach((flag) => {
            languageSelection(flag);
        });
    }


    // game logic: start button
    btnStart.addEventListener("click", () => {
        selectedLanguage = languageList.options[languageList.selectedIndex].value;
        selectedGame(gameList);
        startGame();
    });


    // game logic: start game
    function startGame() {
        wordSpan.innerHTML = "... LOADING GAME ...";
        closeModals(); // close all modals
        // change btnAudio emoji if a muted-language and disable it
        if (mutedLangs.indexOf(selectedLanguage) >= 0) {
            btnAudio.innerHTML = "🔇";
            btnAudio.style.pointerEvents = "none";
        } else {
            btnAudio.style.pointerEvents = "auto";
        }
        // start the game: words and timer
        currentGame = setInterval(() => {
            populateAnswerList(selectedLanguage);
            gameTimer();
        }, 5000);
        // instead of obtaining all languages from the library, only get selectedLanguage
        // https://stackoverflow.com/a/54907643
        let keys = ["word", "emoji", "aria", selectedLanguage]; // only get these keys from [allCards]
        let allCardsSelectedLanguage = allCards.map(elem => {
            let obj = {};
            keys.forEach(key => obj[key] = elem[key]);
            return obj;
        });
        // generate emoji list for the current game, user, and AI
        cardList = getRandomCards(allCardsSelectedLanguage, 60); // only get 60 random cards (max. 5min game)
        // cardList = getRandomCards(allCards, allCards.length); // entire length of [allCards] *original TEST*
        userCards = getRandomCards(cardList, 25); // assign 25 random cards to User from [cardList]
        aiCards = getRandomCards(cardList, 25); // assign 25 random cards to AI from [cardList]
        // populate the User & AI boards
        populateCards(userCards, "#user-board .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        populateCards(aiCards, "#ai-board .emoji-card .emoji-card-inner .emoji-card-back .emoji");
        activeGame = true; // game is now active
        gameSetup = setTimeout(() => {
            // display specific game being played on goal-board
            gameSpan.innerHTML = game;
            generateGoalGrid(game);
        }, 3500);
        enableCards = setTimeout(() => {
            // chickenDinner(); // *TEST* only here to test localStorage variables quickly!
            scoreSpan.innerHTML = 1000;
            btnLingoBingo.classList.remove("disabled"); // enable the LingoBingo button
            userTiles.forEach((card) => card.classList.remove("disabled")); // enable user cards
        }, 5000);
    }


    // reset game
    function resetGame() {
        setTimeout(() => {
            confetti.stop(); // stop confetti
            activeGame = userWon = aiWon = false;
            userCards = aiCards = answerList = cardList = [];
            clearInterval(cardInterval);
            clearInterval(currentGame);
            clearTimeout(markAI);
            clearTimeout(gameSetup);
            clearTimeout(enableCards);
            resetCards();
            score = 1000;
            scoreSpan.innerHTML = timerSpan.innerHTML = gameSpan.innerHTML = "-";
            wordSpan.innerHTML = "Click 'New Game'";
            toHide.forEach((item) => item.style.display = "unset");
            scoreDiv.classList.remove("correct", "incorrect");
            btnLingoBingo.classList.add("disabled");
            userTiles.forEach((card) => card.classList.add("disabled"));
        }, 50);
    }


    // stop game : disabled game settings (not reset) because someone won!
    function stopGame() {
        toHide.forEach((item) => item.style.display = "none");
        btnLingoBingo.classList.add("disabled"); // disable btnLingoBingo
        activeGame = false;
        clearInterval(cardInterval);
        clearInterval(currentGame);
        confetti.stop(); // reset confetti
        chickenDinner(); // winner-winner chicken-dinner!
    }


    // user or ai won : winner-winner chicken-dinner!
    function chickenDinner() {
        // get existing localStorage values for specific game setup
        langGame = `${selectedLanguage}${game}`;
        // localStorage as Object: https://stackoverflow.com/a/2010948
        getGameLS = JSON.parse(localStorage.getItem(langGame));
        if (getGameLS) {
            userWinCount = getGameLS.userWon;
            aiWinCount = getGameLS.aiWon;
            highScore = getGameLS.highScore;
        } else {
            userWinCount = aiWinCount = highScore = 0;
        }
        // who won? User or AI
        if (userWon) {
            userWinCount = ++userWinCount; // increment userWon count
            highScore = (score > highScore) ? score : highScore; // set to 'score' if higher than 'highScore'
            timerSpan.innerHTML = "You Win";
            setTimeout(() => {
                scoreDiv.classList.add("correct");
            }, 500);
            confetti.start(5000);
            // open scoreBoard and scroll to specific game
            modalScoreboard.style.display = "block";
            document.body.classList.add("disabled-overflow");
            let thisGame = document.getElementById(langGame);
            // https://stackoverflow.com/a/62043599
            thisGame.scrollIntoView({behavior: "smooth", block: "center"});
            thisGame.children[3].classList.add("chicken-dinner");
        } else if (aiWon) {
            aiWinCount = ++aiWinCount; // increment aiWon count
            timerSpan.innerHTML = scoreSpan.innerHTML = "Game Over";
            setTimeout(() => {
                scoreDiv.classList.add("incorrect");
            }, 500);
        }
        // set the new localStorage variables : must stringify localStorage Object
        let setGameLS = {"userWon": userWinCount, "aiWon": aiWinCount, "highScore": highScore};
        localStorage.setItem(langGame, JSON.stringify(setGameLS));
        // update scoreBoard modal
        let gameCells = document.getElementById(`${selectedLanguage}${game}`).getElementsByTagName("td");
        gameCells[1].innerHTML = userWinCount;
        gameCells[2].innerHTML = aiWinCount;
        gameCells[3].innerHTML = highScore;
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
        let randomArray = new Array(num);
        let len = array.length;
        let selectedCards = new Array(len);
        while (num--) {
            let card = Math.floor(Math.random() * len);
            randomArray[num] = array[card in selectedCards ? selectedCards[card] : card];
            selectedCards[card] = --len in selectedCards ? selectedCards[len] : len;
        }
        return randomArray;
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
                if (activeGame) aiCard.parentNode.parentNode.parentNode.classList.add("correct");
                checkCards("ai", game);
            }, 4500); // delay 4.5s to allow user to call LingoBingo first, in case of tie
        }
    }


    // speechSynthesis API
    if ("speechSynthesis" in window) {
        speechAvailable = true;
        voices = window.speechSynthesis.getVoices();
        btnAudio.classList.remove("disabled-audio");
    } else {
        speechAvailable = false;
        alert("No SpeechSynthesis Available");
        btnAudio.classList.add("disabled-audio");
    }


    // helper: speak the word if available
    function speakWord(word, lang) {
        if (speechAvailable) {
            // synthesis supported
            msg = new SpeechSynthesisUtterance();
            switch (lang) {
                case "de":
                    msgVoice = voices[2];
                    msgLang = "de-DE";
                    break;
                case "gb":
                    msgVoice = voices[4];
                    msgLang = "en-GB";
                    break;
                case "mx":
                    msgVoice = voices[7];
                    msgLang = "es-US";
                    break;
                case "fr":
                    msgVoice = voices[8];
                    msgLang = "fr-FR";
                    break;
                case "in":
                    msgVoice = voices[9];
                    msgLang = "hi-IN";
                    break;
                case "it":
                    msgVoice = voices[11];
                    msgLang = "it-IT";
                    break;
                case "jp":
                    msgVoice = voices[12];
                    msgLang = "ja-JP";
                    break;
                case "kr":
                    msgVoice = voices[13];
                    msgLang = "ko-KR";
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
                case "ru":
                    msgVoice = voices[17];
                    msgLang = "ru-RU";
                    break;
                case "cn":
                    msgVoice = voices[18];
                    msgLang = "zh-CN";
                    break;
            }
            msg.voice = msgVoice;
            msg.text = word.toString();
            msg.lang = msgLang.toString();
            speechSynthesis.speak(msg);
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


    // user click event on tiles
    userTiles.forEach((card) => {
        card.addEventListener("click", () => {
            if (activeGame) { // only if the game is active
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
            // user lost all points, so the AI automatically wins - stopGame()
            if (score <= 0) {
                aiWon = true;
                userWon = false;
                stopGame();
            }
        }, 1000);
    }


    // game function: user clicks to check for LingoBingo
    btnLingoBingo.addEventListener("click", () => {
        btnLingoBingo.classList.add("disabled"); // temporarily disable LingoBingo button
        checkCards("user", game);
    });


    // modalSettings
    btnSettings.addEventListener("click", () => {
        openSettings();
    });
    btnNew.addEventListener("click", () => {
        openSettings();
    });
    function openSettings() {
        modalSettings.style.display = "block";
        document.body.classList.add("disabled-overflow");
        resetGame();
    }
    // modalScoreboard
    btnScoreboard.addEventListener("click", () => {
        modalScoreboard.style.display = "block";
        document.body.classList.add("disabled-overflow");
        resetGame();
    });
    // close modals
    modalClose.forEach((close) => {
        close.addEventListener("click", () => {
            closeModals();
        });
    });
    window.addEventListener("click", (e) => {
        if (e.target == modalSettings || e.target == modalScoreboard) {
            closeModals();
        }
    });
    function closeModals() {
        // close any open modal
        modals.forEach((modal) => {
            let hasClassCD = document.querySelectorAll(".chicken-dinner");
            hasClassCD.forEach((item) => item.classList.remove("chicken-dinner"));
            modal.style.display = "none";
            document.body.classList.remove("disabled-overflow");
        });
    }


});
