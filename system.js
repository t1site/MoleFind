"use strict";


const SEARCH_MODES = {
    SMILES: 0,
    FORMULA: 1,
    INCHIKEY: 2
};


let currentMode = SEARCH_MODES.SMILES;
let compounds = [];


let modeName;
let inputLabel;
let searchInput;
let searchButton;
let previousModeButton;
let nextModeButton;
let modeWrapper;
let results;


/* =========================================================
   Initialisation
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        modeName =
            document.getElementById("modeName");


        inputLabel =
            document.getElementById("inputLabel");


        searchInput =
            document.getElementById("searchInput");


        searchButton =
            document.getElementById("searchButton");


        previousModeButton =
            document.getElementById("previousMode");


        nextModeButton =
            document.getElementById("nextMode");


        modeWrapper =
            document.getElementById("modeWrapper");


        results =
            document.getElementById("results");


        updateModeUI();


        previousModeButton.addEventListener(
            "click",
            previousMode
        );


        nextModeButton.addEventListener(
            "click",
            nextMode
        );


        searchButton.addEventListener(
            "click",
            search
        );


        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    search();
                }
            }
        );


        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        setupSwipe();


        /*
         * データベースの読み込みが完了してから
         * URLの ?q= を処理する。
         */

        const loaded =
            await loadCompounds();


        if (loaded) {

            runURLQuery();
        }
    }
);


/* =========================================================
   Load database
   ========================================================= */

async function loadCompounds() {

    try {

        const response =
            await fetch(
                "compds.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "compds.json must contain an array."
            );
        }


        compounds = data;


        console.log(
            `MoleFind: ${compounds.length} compounds loaded.`
        );


        return true;

    } catch (error) {

        console.error(
            "MoleFind database error:",
            error
        );


        results.innerHTML =
            '<div class="error">Failed to load the compound database.</div>';


        return false;
    }
}


/* =========================================================
   URL query
   ========================================================= */

/*
 * ?q=CCO
 *
 * URLから q パラメータが指定された場合、
 * 必ずSMILESとして検索する。
 *
 * 例:
 * https://t1site.github.io/MoleFind/?q=CCO
 *
 * この場合:
 * - 検索モード → SMILES
 * - 入力欄 → CCO
 * - 自動的に検索
 */

function runURLQuery() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    if (!params.has("q")) {

        return;
    }


    const query =
        params.get("q");


    if (
        query === null ||
        query.trim() === ""
    ) {

        return;
    }


    /*
     * ?q= は常にSMILES検索。
     */

    currentMode =
        SEARCH_MODES.SMILES;


    updateModeUI();


    searchInput.value =
        query;


    search();
}


/* =========================================================
   Mode switching
   ========================================================= */

function setMode(mode) {

    currentMode =
        mode;


    updateModeUI();


    searchInput.focus();
}


function nextMode() {

    if (
        currentMode ===
        SEARCH_MODES.SMILES
    ) {

        setMode(
            SEARCH_MODES.FORMULA
        );

    } else if (
        currentMode ===
        SEARCH_MODES.FORMULA
    ) {

        setMode(
            SEARCH_MODES.INCHIKEY
        );

    } else {

        setMode(
            SEARCH_MODES.SMILES
        );
    }
}


function previousMode() {

    if (
        currentMode ===
        SEARCH_MODES.SMILES
    ) {

        setMode(
            SEARCH_MODES.INCHIKEY
        );

    } else if (
        currentMode ===
        SEARCH_MODES.FORMULA
    ) {

        setMode(
            SEARCH_MODES.SMILES
        );

    } else {

        setMode(
            SEARCH_MODES.FORMULA
        );
    }
}


function updateModeUI() {

    if (
        currentMode ===
        SEARCH_MODES.SMILES
    ) {

        modeName.textContent =
            "SMILES";


        inputLabel.textContent =
            "SMILES";


        searchInput.placeholder =
            "e.g. CCO";


        searchInput.setAttribute(
            "aria-label",
            "SMILES search input"
        );


    } else if (
        currentMode ===
        SEARCH_MODES.FORMULA
    ) {

        modeName.textContent =
            "Molecular Formula";


        inputLabel.textContent =
            "Molecular Formula";


        searchInput.placeholder =
            "e.g. C2H6O";


        searchInput.setAttribute(
            "aria-label",
            "Molecular formula search input"
        );


    } else {

        modeName.textContent =
            "InChIKey";


        inputLabel.textContent =
            "InChIKey";


        searchInput.placeholder =
            "e.g. LFQSCWFLJHTTHZ-UHFFFAOYSA-N";


        searchInput.setAttribute(
            "aria-label",
            "InChIKey search input"
        );
    }
}


/* =========================================================
   Keyboard
   ========================================================= */

function handleKeyboard(event) {

    if (
        document.activeElement ===
        searchInput
    ) {

        return;
    }


    if (
        event.key === "ArrowLeft"
    ) {

        event.preventDefault();

        previousMode();
    }


    if (
        event.key === "ArrowRight"
    ) {

        event.preventDefault();

        nextMode();
    }
}


/* =========================================================
   Swipe
   ========================================================= */

let touchStartX = 0;
let touchStartY = 0;


function setupSwipe() {

    modeWrapper.addEventListener(
        "touchstart",
        (event) => {

            if (
                event.touches.length !== 1
            ) {

                return;
            }


            touchStartX =
                event.touches[0].clientX;


            touchStartY =
                event.touches[0].clientY;
        },
        {
            passive: true
        }
    );


    modeWrapper.addEventListener(
        "touchend",
        (event) => {

            if (
                event.changedTouches.length !== 1
            ) {

                return;
            }


            const touch =
                event.changedTouches[0];


            const deltaX =
                touch.clientX -
                touchStartX;


            const deltaY =
                touch.clientY -
                touchStartY;


            const minimumDistance = 60;


            if (
                Math.abs(deltaX) <
                minimumDistance
            ) {

                return;
            }


            if (
                Math.abs(deltaX) <=
                Math.abs(deltaY)
            ) {

                return;
            }


            if (
                deltaX < 0
            ) {

                nextMode();

            } else {

                previousMode();
            }
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   Search
   ========================================================= */

function search() {

    const query =
        searchInput.value.trim();


    if (!query) {

        results.innerHTML =
            '<div class="empty">Enter a search query.</div>';

        return;
    }


    let matches;


    if (
        currentMode ===
        SEARCH_MODES.SMILES
    ) {

        matches =
            searchBySMILES(query);


    } else if (
        currentMode ===
        SEARCH_MODES.FORMULA
    ) {

        matches =
            searchByFormula(query);


    } else {

        matches =
            searchByInChIKey(query);
    }


    renderResults(
        query,
        matches
    );
}


/* =========================================================
   SMILES search
   ========================================================= */

function searchBySMILES(query) {

    const normalizedQuery =
        normalizeSMILES(query);


    return compounds.filter(
        (compound) => {

            if (!compound.smiles) {

                return false;
            }


            const smilesList =
                Array.isArray(
                    compound.smiles
                )
                    ? compound.smiles
                    : [compound.smiles];


            return smilesList.some(
                (smiles) => {

                    return (
                        normalizeSMILES(
                            smiles
                        ) ===
                        normalizedQuery
                    );
                }
            );
        }
    );
}


function normalizeSMILES(smiles) {

    return String(smiles)
        .trim()
        .replace(
            /\s+/g,
            ""
        );
}


/* =========================================================
   Molecular formula search
   ========================================================= */

function searchByFormula(query) {

    const normalizedQuery =
        normalizeFormula(query);


    return compounds.filter(
        (compound) => {

            if (!compound.formula) {

                return false;
            }


            return (
                normalizeFormula(
                    compound.formula
                ) ===
                normalizedQuery
            );
        }
    );
}


function normalizeFormula(formula) {

    let value =
        String(formula)
            .trim()
            .replace(
                /\s+/g,
                ""
            );


    const subscriptMap = {

        "₀": "0",
        "₁": "1",
        "₂": "2",
        "₃": "3",
        "₄": "4",
        "₅": "5",
        "₆": "6",
        "₇": "7",
        "₈": "8",
        "₉": "9"

    };


    value =
        value.replace(
            /[₀₁₂₃₄₅₆₇₈₉]/g,
            (character) =>
                subscriptMap[character]
        );


    const matches =
        value.match(
            /([A-Za-z]{1,2})(\d*)/g
        );


    if (!matches) {

        return value.toLowerCase();
    }


    const elements = {};


    for (
        const token of matches
    ) {

        const match =
            token.match(
                /^([A-Za-z]{1,2})(\d*)$/
            );


        if (!match) {

            continue;
        }


        const symbol =
            match[1][0].toUpperCase() +
            match[1]
                .slice(1)
                .toLowerCase();


        const count =
            match[2]
                ? Number(match[2])
                : 1;


        elements[symbol] =
            (
                elements[symbol] ||
                0
            ) +
            count;
    }


    return Object.keys(elements)
        .sort()
        .map(
            (element) => {

                const count =
                    elements[element];


                return count === 1
                    ? element
                    : `${element}${count}`;
            }
        )
        .join("");
}


/* =========================================================
   InChIKey search
   ========================================================= */

function searchByInChIKey(query) {

    const normalizedQuery =
        normalizeInChIKey(query);


    return compounds.filter(
        (compound) => {

            if (
                !compound.inchi_key
            ) {

                return false;
            }


            return (
                normalizeInChIKey(
                    compound.inchi_key
                ) ===
                normalizedQuery
            );
        }
    );
}


function normalizeInChIKey(inchiKey) {

    return String(inchiKey)
        .trim()
        .replace(
            /\s+/g,
            ""
        )
        .toUpperCase();
}


/* =========================================================
   Results
   ========================================================= */

function renderResults(
    query,
    matches
) {

    if (
        matches.length === 0
    ) {

        results.innerHTML =
            '<div class="empty">No matching compounds found.</div>';

        return;
    }


    const cards =
        matches
            .map(
                renderCompoundCard
            )
            .join("");


    results.innerHTML = `
        <p class="result-summary">` +
        `${matches.length} ` +
        `${
            matches.length === 1
                ? "compound"
                : "compounds"
        } ` +
        `found for <strong>${
            escapeHTML(query)
        }</strong>.</p>` +
        cards;
}


/* =========================================================
   Compound card
   ========================================================= */

function renderCompoundCard(
    compound
) {

    const smilesList =
        Array.isArray(
            compound.smiles
        )
            ? compound.smiles
            : compound.smiles
                ? [compound.smiles]
                : [];


    const scholarURL =
        "https://scholar.google.com/scholar" +
        "?hl=ja&as_sdt=0%2C5&q=" +
        encodeURIComponent(
            compound.name || ""
        );


    return `
        <article class="result-card">

            <h2 class="result-name">${
                escapeHTML(
                    compound.name ||
                    "Unnamed compound"
                )
            }</h2>


            ${renderProperty(
                "Formula",
                compound.formula
            )}


            ${renderProperty(
                "SMILES",
                smilesList.join("\n")
            )}


            ${renderProperty(
                "CAS RN",
                compound.cas
            )}


            ${renderProperty(
                "Molar mass",
                formatMolarMass(
                    compound.molar_mass
                )
            )}


            ${renderProperty(
                "Boiling point",
                compound.boiling_point
            )}


            ${renderProperty(
                "Density",
                compound.density
            )}


            ${renderProperty(
                "LogP",
                compound.logp
            )}


            ${renderProperty(
                "Functional group",
                formatList(
                    compound.functional_groups
                )
            )}


            ${renderProperty(
                "Acid / base",
                compound.acid_base
            )}


            ${renderProperty(
                "IUPAC name",
                compound.iupac_name
            )}


            ${renderProperty(
                "InChIKey",
                compound.inchi_key
            )}


            ${renderPropertyLink(
                "Google Scholar",
                scholarURL,
                `Search ${
                    compound.name ||
                    "this compound"
                }`
            )}


            ${renderProperty(
                "Description",
                compound.description
            )}

        </article>
    `;
}


/* =========================================================
   Properties
   ========================================================= */

function renderProperty(
    name,
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";
    }


    const cleanValue =
        String(value).trim();


    if (
        cleanValue === ""
    ) {

        return "";
    }


    return `
        <div class="property">

            <span class="property-name">
                ${escapeHTML(name)}
            </span>

            <span class="property-value">
                ${escapeHTML(cleanValue)}
            </span>

        </div>
    `;
}


function renderPropertyLink(
    name,
    url,
    text
) {

    if (!url) {

        return "";
    }


    return `
        <div class="property">

            <span class="property-name">
                ${escapeHTML(name)}
            </span>

            <span class="property-value">
                <a
                    href="${escapeHTML(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(text)}
                </a>
            </span>

        </div>
    `;
}


function formatList(value) {

    if (
        Array.isArray(value)
    ) {

        if (
            value.length === 0
        ) {

            return "";
        }


        return value.join(", ");
    }


    return value;
}


function formatMolarMass(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";
    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return String(value);
    }


    return `${number.toFixed(3)} g/mol`;
}


/* =========================================================
   HTML escaping
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}