const list = new Proxy(
    { countries: [], favorites: [] },
    {
        get: (target, property, _) => target[property] || null,
        set: (target, property, value, _) => {
            target[property] = [...value].sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            if (property === "countries") renderList(value, listCountries);
            if (property === "favorites") renderList(value, listFavorites);
            renderHeader(value, property);
        },
    }
);

const qtdFavorites = document.querySelector("#qtd-favorites");
const popFavorites = document.querySelector("#pop-favorites");
const listFavorites = document.querySelector("#list-favorites");

const qtdCountries = document.querySelector("#qtd-countries");
const popCountries = document.querySelector("#pop-countries");
const listCountries = document.querySelector("#list-countries");

window.addEventListener("load", () => {
    init();
});

const init = () => {
    fetchCountries();
};

const fetchCountries = async () => {
    try {
        renderLoading(true);
        const response = await fetch("https://restcountries.eu/rest/v2/all");
        list.countries = await response.json();
        renderLoading(false);
    } catch (error) {
        console.log(error);
    }
};
const renderHeader = (list, type) => {
    let qtdEl = qtdCountries;
    let popEl = popCountries;
    if (type === "favorites") {
        qtdEl = qtdFavorites;
        popEl = popFavorites;
    }
    qtdEl.innerHTML = formatNumber(list.length);
    popEl.innerHTML = formatNumber(
        list.reduce((memo, country) => memo + country.population, 0)
    );
};
const renderList = (list, target) => {
    // redraw the list
    target.innerHTML = list
        .map(
            (country) => `
    <li class='list-item'>
        <div class='list-item-button'><button class='igti-bg-color' data-code='${
            country.alpha3Code
        }'>+</button></div>
        <div class='list-item-flag'><img src='${
            country.flag
        }' alt='flag'/></div>
        <div class='list-item-name'>
            <p>${country.name}</p>
            <p class='list-item-population'>
                ${formatNumber(country.population)}
            </p>
        <div>
    </li>
    `
        )
        .join("");
    // bind click events
    target
        .querySelectorAll("button")
        .forEach((button) => button.addEventListener("click", toggleFavorite));
};

const toggleFavorite = (event) => {
    const code = event.target.dataset.code;
    if (list.countries.some((c) => c.alpha3Code === code)) {
        list.favorites = [
            ...list.favorites,
            list.countries.find((f) => f.alpha3Code === code),
        ];
        list.countries = list.countries.filter((c) => c.alpha3Code !== code);
    } else if (list.favorites.some((f) => f.alpha3Code === code)) {
        list.countries = [
            ...list.countries,
            list.favorites.find((f) => f.alpha3Code === code),
        ];
        list.favorites = list.favorites.filter((c) => c.alpha3Code !== code);
    }
};
const renderLoading = (value) => {
    document.documentElement.style.setProperty(
        "--show-loading",
        value ? "flex" : "none"
    );
};
const formatNumber = (value) => value.toLocaleString();
