import * as params from '@params';

let fuse;
let first;
let last;
let currentElement = null;
let resultsAvailable = false;

const resultsList = document.getElementById('searchResults');
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');

function setStatus(message) {
    searchStatus.textContent = message;
}

function reset() {
    resultsAvailable = false;
    resultsList.replaceChildren();
    searchInput.value = '';
    setStatus('');
    searchInput.focus();
}

function buildResult(item) {
    const result = document.createElement('li');
    result.className = 'search-result';

    const link = document.createElement('a');
    link.href = item.permalink;
    link.setAttribute('aria-label', `Read ${item.title}`);

    const title = document.createElement('span');
    title.className = 'search-result__title';
    title.textContent = item.title;
    link.appendChild(title);

    if (item.summary) {
        const summary = document.createElement('span');
        summary.className = 'search-result__summary';
        summary.textContent = item.summary;
        link.appendChild(summary);
    }

    result.appendChild(link);
    return result;
}

function renderResults(items) {
    resultsList.replaceChildren(...items.map(result => buildResult(result.item)));
    resultsAvailable = items.length > 0;
    first = resultsList.firstElementChild;
    last = resultsList.lastElementChild;
    setStatus(resultsAvailable ? `${items.length} matching notes` : 'No matching notes');
}

function activate(link) {
    document.querySelectorAll('.focus').forEach(element => element.classList.remove('focus'));
    if (link) {
        link.focus();
        currentElement = link;
        link.parentElement.classList.add('focus');
    }
}

window.addEventListener('load', function () {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState !== 4) return;
        if (request.status !== 200) {
            setStatus('Search index unavailable');
            return;
        }

        const data = JSON.parse(request.responseText);
        let options = {
            distance: 100,
            threshold: 0.4,
            ignoreLocation: true,
            keys: ['title', 'permalink', 'summary', 'content']
        };

        if (params.fuseOpts) {
            options = {
                isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
                includeScore: params.fuseOpts.includescore ?? false,
                includeMatches: params.fuseOpts.includematches ?? false,
                minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
                shouldSort: params.fuseOpts.shouldsort ?? true,
                findAllMatches: params.fuseOpts.findallmatches ?? false,
                keys: params.fuseOpts.keys ?? options.keys,
                location: params.fuseOpts.location ?? 0,
                threshold: params.fuseOpts.threshold ?? 0.4,
                distance: params.fuseOpts.distance ?? 100,
                ignoreLocation: params.fuseOpts.ignorelocation ?? true
            };
        }

        fuse = new Fuse(data, options);
    };
    request.open('GET', '../index.json');
    request.send();
});

searchInput.addEventListener('input', function () {
    const query = this.value.trim();
    if (!query) {
        resultsList.replaceChildren();
        resultsAvailable = false;
        setStatus('');
        return;
    }
    if (!fuse) {
        setStatus('Preparing search');
        return;
    }

    const limit = params.fuseOpts?.limit;
    renderResults(fuse.search(query, limit ? { limit } : undefined));
});

searchInput.addEventListener('search', function () {
    if (!this.value) reset();
});

document.addEventListener('keydown', function (event) {
    const active = document.activeElement;
    const inSearch = document.getElementById('searchbox').contains(active);

    if (active === searchInput) {
        document.querySelectorAll('.focus').forEach(element => element.classList.remove('focus'));
    } else if (currentElement) {
        currentElement = active;
    }

    if (event.key === 'Escape' && inSearch) {
        reset();
        return;
    }
    if (!resultsAvailable || !inSearch) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (active === searchInput) activate(first.querySelector('a'));
        else if (active.parentElement !== last) activate(active.parentElement.nextElementSibling.querySelector('a'));
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (active.parentElement === first) activate(searchInput);
        else if (active !== searchInput) activate(active.parentElement.previousElementSibling.querySelector('a'));
    } else if (event.key === 'ArrowRight' && active !== searchInput) {
        active.click();
    }
});
