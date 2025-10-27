// HTML ELEMENTS

const cardsContainer = document.querySelector('#cardsContainer');

// QUOTES DATA

let quotesData = null;
let showMoreCardsCooldown = false;

// FUNCTIONS

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

function showQuoteCard(index) {
    if (!quotesData[index]) {
        // No such card
        console.error(`Card #${index} not found! (Shouldn't happen!)`)
        return;
    }

    const { text, author, source } = quotesData[index];

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

    if (source) {
        const sourceLink = document.createElement('a');
        sourceLink.href = source;
        sourceLink.innerText = 'Source';
    }

    cardsContainer.appendChild(card);
}

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

loadQuotesData().then(() => {
    cardsContainer.innerHTML = '';
    showMoreCards(1);
})

setInterval(() => {
    if (!quotesData) return;
    if (showMoreCardsCooldown) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        showMoreCards(1);

        showMoreCardsCooldown = true;
        setTimeout(() => showMoreCardsCooldown = false, 300);
    }
}, 300);

