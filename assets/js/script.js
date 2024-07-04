/* jshint esversion: 11 */

document.addEventListener("DOMContentLoaded", () => {

    // constant variables
    const userBoard = by.id("user-board");
    const userTiles = by.queryAll("#user-board .card .inner .back");
    const btnNew = by.id("btn-new");
    const btnLingoBingo = by.id("btn-lingobingo");
    const btnStart = by.id("btn-start");
    const btnSettings = by.id("btn-settings");
    const btnScoreboard = by.id("btn-scoreboard");
    const languageList = by.id("language-list");
    const gameList = by.id("game-list");
    const flags = by.queryAll(".flag");
    const timerSpan = by.id("timer-span");
    const timerDiv = by.id("timer");
    const scoreSpan = by.id("score-span");
    const scoreDiv = by.id("score");
    const gameSpan = by.id("game-span");
    const wordSpan = by.id("word-span");
    const modals = by.queryAll(".modal");
    const modalSettings = by.id("modal-settings");
    const modalInfo = by.id("modal-info");
    const modalScoreboard = by.id("modal-scoreboard");
    const modalClose = by.queryAll(".modal-close");
    const toHide = by.queryAll("small, br:not(.ignore)");
    const players = ["user", "ai", "goal"];

    const games = ["Blackout", "Bullseye", "Columns", "Corners", "Cross", "Diagonals", "Diamond", "Heart", "Inside", "Outside", "Rows", "Smiley", "X"];
    const arrBlackout = ["b1", "b2", "b3", "b4", "b5", "i1", "i2", "i3", "i4", "i5", "n1", "n2", "n3", "n4", "n5", "g1", "g2", "g3", "g4", "g5", "o1", "o2", "o3", "o4", "o5"];
    const arrBullseye = ["b1", "b2", "b3", "b4", "b5", "i1", "i5", "n1", "n3", "n5", "g1", "g5", "o1", "o2", "o3", "o4", "o5"];
    const arrColumns = [["b1", "b2", "b3", "b4", "b5"], ["i1", "i2", "i3", "i4", "i5"], ["n1", "n2", "n3", "n4", "n5"], ["g1", "g2", "g3", "g4", "g5"], ["o1", "o2", "o3", "o4", "o5"]];
    const arrCorners = ["b1", "b2", "b4", "b5", "i1", "i2", "i4", "i5", "g1", "g2", "g4", "g5", "o1", "o2", "o4", "o5"];
    const arrCross = ["b3", "i3", "n1", "n2", "n3", "n4", "n5", "g3", "o3"];
    const arrDiagonals = [["b1", "i2", "n3", "g4", "o5"], ["o1", "g2", "n3", "i4", "b5"]];
    const arrDiamond = ["b3", "i2", "i4", "n1", "n5", "g2", "g4", "o3"];
    const arrHeart = ["b2", "b3", "i1", "i4", "n2", "n5", "g1", "g4", "o2", "o3"];
    const arrInside = ["i2", "i3", "i4", "n2", "n3", "n4", "g2", "g3", "g4"];
    const arrOutside = ["b1", "b2", "b3", "b4", "b5", "i1", "i5", "n1", "n5", "g1", "g5", "o1", "o2", "o3", "o4", "o5"];
    const arrRows = [["b1", "i1", "n1", "g1", "o1"], ["b2", "i2", "n2", "g2", "o2"], ["b3", "i3", "n3", "g3", "o3"], ["b4", "i4", "n4", "g4", "o4"], ["b5", "i5", "n5", "g5", "o5"]];
    const arrSmiley = ["b4", "i1", "i2", "i5", "n5", "g1", "g2", "g5", "o4"];
    const arrX = ["b1", "b5", "i2", "i4", "n3", "g2", "g4", "o1", "o5"];

    // dynamic variables
    let userWon, aiWon, activeGame, pointsDeducted = false;
    let answerList = [];
    let score = 2500;
    let userCards, aiCards, selectedLanguage, game, langGame, getGameLS,
        userWinCount, aiWinCount, highScore, gameSetup, enableCards,
        currentGame, cardInterval, cardList, markAI, result, resultList;


    userTiles.forEach((card) => card.classList.add("disabled")); // disable user cards on load


    // generate score board modal data
    generateScoreboard();
    function generateScoreboard() {
        languages.forEach((btnLang) => {
            // generate flag for each language, clickable for easy scrolling
            let flagSelection = by.id("flag-selection");
            flagSelection.innerHTML += `<a href="#${btnLang}" class="flag-group"><img src="assets/svg/${btnLang}.svg" alt="${btnLang} flag" class="flag"></a>`;
            // ignore octothorp (#) when clicking
            let anchors = by.queryAll("a.flag-group");
            anchors.forEach(anchor => {
                anchor.addEventListener("click", function (e) {
                    if (this.hash !== "") {
                        e.preventDefault();
                        let langId = this.hash.replace("#", "");
                        let firstLangGame = by.queryAll(`[id^="${langId}"]`)[0];
                        // smooth scroll into view with offset (plus CSS scroll-margin-top)
                        let langOffset = firstLangGame.getBoundingClientRect().top + window.scrollY;
                        firstLangGame.scrollIntoView({behavior: "smooth", top: langOffset});
                    }
                });
            });
            games.forEach((btnGame) => {
                // get localStorage information per game
                langGame = `${btnLang}${btnGame}`;
                getGameLS = JSON.parse(localStorage.getItem(langGame));
                if (getGameLS) {
                    userWinCount = getGameLS.userWon;
                    aiWinCount = getGameLS.aiWon;
                    highScore = getGameLS.highScore;
                } else {
                    userWinCount = aiWinCount = highScore = "-";
                }
                // tbody: generate rows
                let tbody = by.id("tbody");
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
                // cell: user's wins
                let td1 = tr.insertCell(1);
                let winsEl = document.createTextNode(userWinCount);
                td1.appendChild(winsEl);
                // cell: ai's wins
                let td2 = tr.insertCell(2);
                let losesEl = document.createTextNode(aiWinCount);
                td2.appendChild(losesEl);
                // cell: user high score
                let td3 = tr.insertCell(3);
                let scoreEl = document.createTextNode(numberWithCommas(highScore));
                td3.appendChild(scoreEl);
                // cell: play button (for specific game)
                let td4 = tr.insertCell(4);
                let buttonEl = document.createElement("button");
                buttonEl.innerHTML = "Play";
                buttonEl.classList.add("btn-play");
                buttonEl.addEventListener("click", () => {
                    languageList.value = selectedLanguage = btnLang; // update languageList + selectedLanguage
                    gameList.value = game = btnGame; // update gameList + game
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


    // helper: add comma to thousands // https://stackoverflow.com/a/2901298
    function numberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    // helper: generates global variables based on 'games' for User/AI/Goal, then calls getGameCards()
    function generateGameSettings(game) {
        players.forEach((player) => {
            window[`${player}${game}`] = []; // generate global variables for each
            switch (game) {
                case "Columns":
                case "Rows":
                case "Diagonals":
                    // repeat 5x (cols/rows) or 2x (diagonals)
                    eval(`arr${game}`).forEach((arr) => window[`${player}${game}`].push(getGameCards(player, arr)));
                    break;
                default: // all other 'games'
                    window[`${player}${game}`] = getGameCards(player, eval(`arr${game}`));
                    break;
            }
        });
    }


    // generate the goal-grid with the cards required to win
    function generateGoalGrid(game) {
        cards = window[`goal${game}`];
        switch (game) {
            case "Columns":
            case "Rows":
                // cards = window[`goal${game}`];
                cards[2].forEach((card) => card.classList.add("correct"));
                break;
            case "Diagonals":
                // cards = window[`goal${game}`];
                cards[1].forEach((card) => card.classList.add("correct"));
                break;
            default:
                // cards = window[`goal${game}`];
                cards.forEach((card) => card.classList.add("correct"));
                break;
        }
    }


    // helper function: generate gameCards required to win
    function getGameCards(player, arr) {
        let gameArr = [];
        arr.forEach((card) => gameArr.push(`#${player}-board li[id^='${player}-${card}'].card`));
        return by.queryAll(gameArr);
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
                break;
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
            case "Diagonals":
                value = window[`${player}${game}`];
                checkForLingoBingo(Array.from(value[0]), player);
                checkForLingoBingo(Array.from(value[1]), player);
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
            setTimeout(() => { // minor timeout needed for cols/rows/diagonals for all checks
                 // deduct half of the player's points
                if (!resultList.includes(true) && player == "user") deductHalf();
            }, 50);
        }
    }


    // game function: result = true, so we have a winner!
    function isLingoBingo(player, cardsToCheck) {
        switch (player) {
            case "user":
                userWon = true; // User has won! trigger winning function!
                aiWon = false;
                // add pulsing effect to the tiles that won
                cardsToCheck.forEach((card) => card.firstElementChild.lastElementChild.classList.add("winning-tiles"));
                break;
            case "ai":
                aiWon = true; // AI has won! trigger losing function
                userWon = false;
                // add blinking effect to the tiles that won
                cardsToCheck.forEach((card) => {
                    card.firstElementChild.classList.add("flipped");
                    card.firstElementChild.lastElementChild.classList.add("winning-tiles");
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
            scoreSpan.innerHTML = `- ${deduction}`;
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
                    scoreSpan.innerHTML = numberWithCommas(score);
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
        by.query("link#favicon").href = `assets/svg/${selectedLanguage}.svg`;
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
        wordSpan.innerHTML = "LOADING GAME";
        closeModals(); // close all modals
        // check if selectedLanguage in user's browser speechSynth API
        if (langCodes.indexOf(selectedLanguage) !== -1) {
            btnAudio.style.pointerEvents = "auto";
        } else { // lang not supported - disable audio button
            btnAudio.innerHTML = "🔇";
            btnAudio.style.pointerEvents = "none";
        }
        // start the game: words and timer
        currentGame = setInterval(() => {
            populateAnswerList(selectedLanguage);
            gameTimer();
        }, 5000);
        // instead of obtaining all languages from the library, only get selectedLanguage
        // https://stackoverflow.com/a/54907643
        let keys = ["word", "emoji", "aria", selectedLanguage]; // only get these keys from [allCards]
        let allCardsSelectedLanguage = allCards.map((val) => {
            let obj = {};
            keys.forEach((key) => obj[key] = val[key]);
            return obj;
        });
        // generate emoji list for the current game, user, and AI
        cardList = getRandomCards(allCardsSelectedLanguage, 60); // only get 60 random cards (max. 5min game)
        userCards = getRandomCards(cardList, 25); // assign 25 random cards to User from [cardList]
        aiCards = getRandomCards(cardList, 25); // assign 25 random cards to AI from [cardList]
        // populate the User & AI boards
        populateCards(userCards, "#user-board .card .inner .back .emoji");
        populateCards(aiCards, "#ai-board .card .inner .back .emoji");
        activeGame = true; // game is now active
        gameSetup = setTimeout(() => {
            // display specific game being played on goal-board
            gameSpan.innerHTML = game;
            generateGoalGrid(game);
        }, 3500);
        enableCards = setTimeout(() => {
            scoreSpan.innerHTML = numberWithCommas(2500);
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
            score = 2500;
            scoreSpan.innerHTML = timerSpan.innerHTML = gameSpan.innerHTML = "-";
            wordSpan.innerHTML = "Click 'New Game'";
            toHide.forEach((item) => item.style.display = "unset");
            timerDiv.classList.remove("correct", "incorrect");
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
                timerDiv.classList.add("correct");
                scoreDiv.classList.add("correct");
            }, 500);
            confetti.start(5000);
            // open scoreBoard and scroll to specific game
            modalScoreboard.style.display = "block";
            document.body.classList.add("disabled-overflow");
            let thisGame = by.id(langGame);
            // https://stackoverflow.com/a/62043599
            thisGame.scrollIntoView({behavior: "smooth", block: "center"});
            thisGame.children[3].classList.add("chicken-dinner");
        } else if (aiWon) {
            aiWinCount = ++aiWinCount; // increment aiWon count
            timerSpan.innerHTML = scoreSpan.innerHTML = "Game Over";
            setTimeout(() => {
                timerDiv.classList.add("incorrect");
                scoreDiv.classList.add("incorrect");
            }, 500);
        }
        // set the new localStorage variables : must stringify localStorage Object
        let setGameLS = {"userWon": userWinCount, "aiWon": aiWinCount, "highScore": highScore};
        localStorage.setItem(langGame, JSON.stringify(setGameLS));
        // update scoreBoard modal
        let gameCells = by.id(langGame).getElementsByTagName("td");
        gameCells[1].innerHTML = userWinCount;
        gameCells[2].innerHTML = aiWinCount;
        gameCells[3].innerHTML = highScore;
    }


    // reset all cards (user, ai, goal)
    function resetCards() {
        cardsToReset = by.queryAll("#user-board .card, #ai-board .card, #goal-board .card");
        cardsToReset.forEach((card) => {
            if (card.firstChild) {
                // #user-board && #ai-board
                card.firstElementChild.classList.remove("flipped"); // un-flip cards
                card.firstElementChild.lastElementChild.classList.remove("correct", "winning-tiles"); // user board
                card.classList.remove("correct", "winning-tiles"); // ai board
            } else {
                // #goal-board
                card.classList.remove("correct");
            }
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


    // TEST!!!! ENABLE USER CARDS FOR TESTING SAFARI
    // let keys = ["word", "emoji", "aria", "en"]; // only get these keys from [allCards]
    //     let allCardsSelectedLanguage = allCards.map((val) => {
    //         let obj = {};
    //         keys.forEach((key) => obj[key] = val[key]);
    //         return obj;
    //     });
    // populateCards(getRandomCards(allCardsSelectedLanguage, 25), "#user-board .card .inner .back .emoji");
    // let xxx = by.queryAll("#user-board .card .inner");
    // xxx.forEach((x)=>x.classList.add("flipped"));


    // helper: populate grid
    function populateCards(array, grid) {
        let cards = by.queryAll(grid);
        let i = 0;
        cards.forEach((card) => {
            // use emoji in HTML: https://www.kirupa.com/html5/emoji.htm
            card.innerText = String.fromCodePoint(array[i].emoji.replace("U+", "0x"));
            card.setAttribute("role", "img");
            card.setAttribute("aria-label", array[i].aria);
            card.setAttribute("data-emoji", array[i].word);
            i++;
        });
        flipCards(cards, grid);
        
    }


    // flip each card with slight delay each : https://stackoverflow.com/a/41924097
    function flipCards(cards, grid) {
        let cardIndex = 0;
        cardInterval = setInterval(() => {
            if (cardIndex != cards.length && activeGame) {
                if (grid === "#user-board .card .inner .back .emoji") {
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
            // speak word if available, and not muted
            if (btnAudio.innerHTML != "🔇") {
                // check if language is part of user's browser speechSynth API
                if (speechAvailable && langCodes.indexOf(lang) !== -1) {
                    btnAudio.style.pointerEvents = "auto";
                    speakWord(spokenWord, lang);
                } else {
                    // no matching language code, disable audio button
                    btnAudio.innerHTML = "🔇";
                    btnAudio.style.pointerEvents = "none";
                }
            }
            autocompleteAiGrid(cardList[0]); // function to fill-out AI grid
            cardList.shift(); // remove first item from cardList to avoid dupes
        }
    }


    // helper: function to fill-out AI grid
    function autocompleteAiGrid(word) {
        if (aiCards.includes(word)) {
            // https://stackoverflow.com/a/13449757
            let aiCard = by.query(`#ai-board .card .inner .back .emoji[data-emoji~="${word.word}"]`);
            // give a delay to allow user to guess first in case of tie
            markAI = setTimeout(() => {
                if (activeGame) aiCard.parentNode.parentNode.parentNode.classList.add("correct");
                checkCards("ai", game);
            }, 4500); // delay 4.5s to allow user to call LingoBingo first, in case of tie
        }
    }


    // toggle mute emoji
    btnAudio.addEventListener("click", () => {
        speechSynthesis.cancel(); // immediately stop any spoken word
        btnAudio.innerHTML = (btnAudio.innerHTML == "🔊") ? "🔇" : "🔊";
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
                    score += 300; // add 300pts (correct)
                    scoreSpan.innerHTML = "+ 300";
                    userCheck("correct", card);
                } else {
                    score -= 300; // deduct 300pts (incorrect)
                    scoreSpan.innerHTML = "- 300";
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
            scoreSpan.innerHTML = numberWithCommas(score);
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
            let hasClassCD = by.queryAll(".chicken-dinner");
            hasClassCD.forEach((item) => item.classList.remove("chicken-dinner"));
            modal.style.display = "none";
            document.body.classList.remove("disabled-overflow");
        });
    }


});
