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






});
