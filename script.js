// HTML ELEMENTS

const cardsContainer = document.querySelector('#cardsContainer');

// QUOTES DATA

let quotesData = null;
let showMoreCardsCooldown = false;

// FUNCTIONS

/**
 * Loads data into quotesData
 * @returns {Promise} Promise that is resolved when data has been loaded. Or rejected if it fails to load for some reason
 */
async function loadQuotesData() {
    const promise = new Promise((resolve, reject) => {
        // Check if data has already been loaded
        if (quotesData !== null) {
            resolve(quotesData);
            return;
        }

        // Fetch data from file
        fetch('quotes.json').then((response) => {
            // Fail if status is not OK
            if (response.status !== 200) {
                reject(`Error ${response.status}: ${response.statusText}`);
            }

            // Parse JSON data and resolve promise
            response.json().then((value) => {
                quotesData = value;
                resolve(quotesData);
            },
                // Fail on error while parsin JSON
                (reason) => {
                    reject(`Error while parsing JSON: ${reason}`);
                });
        },
            // Fail on error while fetching (that does not have an error status code)
            (reason) => {
                reject(`Error while fetching data: ${reason}`);
            });
    });

    return promise;
}

/**
 * Create and show card of the provided index
 * @param {number} index 
 * @returns {void}
 */
function showQuoteCard(index) {
    if (!quotesData[index]) {
        // No such card
        console.error(`Card #${index} not found! (Shouldn't happen!)`)
        return;
    }

    const { text, author } = quotesData[index];

    const card = document.createElement('section');
    card.classList.add('card');

    const quoteTextDiv = document.createElement('div');
    quoteTextDiv.classList.add('quote');
    quoteTextDiv.innerText = text;

    card.appendChild(quoteTextDiv);

    if (author) {
        const authorDiv = document.createElement('div');
        authorDiv.classList.add('author');
        authorDiv.innerText = author;

        card.appendChild(authorDiv);
    }

    cardsContainer.appendChild(card);
}

/**
 * Create and display the specified amount of cards
 * @param {number} count 
 */
function showMoreCards(count) {
    for (let i = 0; i < count; i++) {
        // Find random card index
        const index = Math.floor(Math.random() * quotesData.length);
        // Show card
        showQuoteCard(index);
        // Remove card to avoid showing the same card more than once
        quotesData.splice(index, 1);
    }
}

// This function is called when the user first enters the page
loadQuotesData().then(() => {
    // Clear the cardscontainer (There is a loading icon in case things move slowly on the internetz)
    cardsContainer.innerHTML = '';
    showMoreCards(1);
})

// Every 300ms check if the user has scrolled far enough down the page to load the next card.
// I could have used a 'scrolled' event listener, but for some reason it didn't alway fire when I reached the bottom
// of the page
setInterval(() => {
    // Quick exit if the data hasn't been loaded yet
    if (!quotesData) return;

    // Return if on cooldown. (to not rapidly load many more cards than we want)
    if (showMoreCardsCooldown) return;

    // Get scroll variables from document
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // Check if we're near the bottom of the page
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        showMoreCards(1);

        // Start the cooldown, then reset the cooldown after 300ms
        showMoreCardsCooldown = true;
        setTimeout(() => showMoreCardsCooldown = false, 300);
    }
}, 300);

