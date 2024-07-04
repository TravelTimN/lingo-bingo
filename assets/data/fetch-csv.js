/* jshint esversion: 11 */

document.addEventListener("DOMContentLoaded", async () => {
    const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYzn3qcsCxUZpQQIFCM0vTrX7kCWDkT_2n3dPD6RwklmKhYcbu_sAoXW1-F7MUGTtN0hroEuV_drt7/pub?gid=0&single=true&output=csv";

    // fetch CSV data from Google Sheets
    const fetchData = async () => {
        const response = await fetch(googleSheetUrl);
        const data = await response.text();
        return data;
    };

    // parse CSV data into a JS array of objects
    const parseCSV = (str) => {
        const rows = str.split("\n");
        const headers = rows[0].split(",");

        return rows.slice(1).map(row => {
            const values = row.split(",");
            return headers.reduce((object, header, index) => {
                object[header.trim()] = values[index].trim();
                return object;
            }, {});
        });
    };

    // fetch and parse data, then initialize game logic
    const startGameWithFetchedData = async () => {
        try {
            const csvData = await fetchData();
            const allCards = parseCSV(csvData);
            // console.log(allCards); // for debugging / view fetched data
            console.log("Game pieces successfully fetched!");

            // start the game / initialize using the CSV data
            initializeGame(allCards);
        } catch (error) {
            console.error("Error fetching and/or parsing game pieces: ", error);

            // use the backup allCards from library.js
            if (typeof window.allCards !== "undefined") {
                console.log("Game pieces successfully loaded from library!");

                initializeGame(window.allCards);
            } else {
                console.error("Error retrieving game pieces.");
            }
        }
    };

    startGameWithFetchedData();
});
