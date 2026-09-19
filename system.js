"use strict";

/*
 * MoleFind
 * Main application system
 *
 * Search modes:
 *   0 = SMILES
 *   1 = Molecular Formula
 */

const SEARCH_MODES = {
    SMILES: 0,
    FORMULA: 1
};

let currentMode = SEARCH_MODES.SMILES;
let compounds = [];

const modeName = document.getElementById("modeName");
const inputLabel = document.getElementById("inputLabel");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");
const modeWrapper = document.getElementById("modeWrapper");


/* =========================================================
   Initialisation
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    updateModeUI();
    await loadCompounds();
});


/* =========================================================
   Load JSON database
   ========================================================= */

async function loadCompounds() {
    try {
        const response = await fetch("compds.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load compds.json (${response.status})`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("compds.json must contain an array.");
        }

        compounds = data;
    } catch (error) {
        console.error(error);

        results.innerHTML = `
            <div class="error">
                Failed to load the compound database.
            </div>
        `;
    }
}


/* =========================================================
   Mode switching
   ========================================================= */

function setMode(mode) {
    if (
        mode !== SEARCH_MODES.SMILES &&
        mode !== SEARCH_MODES.FORMULA
    ) {
        return;
    }

    currentMode = mode;
    updateModeUI();
}


function nextMode() {
    setMode(
        currentMode === SEARCH_MODES.SMILES
            ? SEARCH_MODES.FORMULA
            : SEARCH_MODES.SMILES
    );
}


function previousMode() {
    setMode(
        currentMode === SEARCH_MODES.SMILES
            ? SEARCH_MODES.FORMULA
            : SEARCH_MODES.SMILES
    );
}


function updateModeUI() {
    const isSMILES = currentMode === SEARCH_MODES.SMILES;

    modeName.textContent = isSMILES
        ? "SMILES"
        : "Molecular Formula";

    inputLabel.textContent = isSMILES
        ? "SMILES"
        : "Molecular Formula";

    searchInput.placeholder = isSMILES
        ? "e.g. CCO"
        : "e.g. C2H6O";
}


/* =========================================================
   PC keyboard controls
   ========================================================= */

document.addEventListener("keydown", (event) => {
    /*
     * Do not intercept arrow keys while the user is editing
     * the input field.
     */
    if (
        document.activeElement === searchInput ||
        document.activeElement === searchButton
    ) {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousMode();
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        nextMode();
    }
});


/* =========================================================
   Enter key search
   ========================================================= */

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        search();
    }
});

searchButton.addEventListener("click", search);


/* =========================================================
   Touch / swipe controls
   ========================================================= */

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

modeWrapper.addEventListener(
    "touchstart",
    (event) => {
        if (event.touches.length !== 1) {
            return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchStartTime = Date.now();
    },
    { passive: true }
);


modeWrapper.addEventListener(
    "touchend",
    (event) => {
        if (event.changedTouches.length !== 1) {
            return;
        }

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const deltaX = endX - touchStartX;
        const deltaY = endY - touchStartY;
        const elapsed = Date.now() - touchStartTime;

        const minimumDistance = 60;

        /*
         * Ignore slow or mostly vertical gestures.
         */
        if (
            elapsed > 800 ||
            Math.abs(deltaX) < minimumDistance ||
            Math.abs(deltaX) <= Math.abs(deltaY)
        ) {
            return;
        }

        if (deltaX < 0) {
            nextMode();
        } else {
            previousMode();
        }
    },
    { passive: true }
);


/* =========================================================
   Search
   ========================================================= */

function search() {
    if (compounds.length === 0) {
        return;
    }

    const query = searchInput.value.trim();

    if (!query) {
        results.innerHTML = `
            <div class="empty">
                Enter a ${currentMode === SEARCH_MODES.SMILES
                    ? "SMILES notation"
                    : "molecular formula"}.
            </div>
        `;

        return;
    }

    let matches = [];

    if (currentMode === SEARCH_MODES.SMILES) {
        matches = searchBySMILES(query);
    } else {
        matches = searchByFormula(query);
    }

    renderResults(query, matches);
}


/* =========================================================
   SMILES search
   ========================================================= */

function searchBySMILES(query) {
    const normalizedQuery = normalizeSMILES(query);

    return compounds.filter((compound) => {
        if (!compound.smiles) {
            return false;
        }

        return normalizeSMILES(compound.smiles) === normalizedQuery;
    });
}


/*
 * This is intentionally a basic normalisation layer.
 *
 * It does NOT perform full chemical SMILES canonicalisation.
 * Full structural equivalence requires a chemistry toolkit.
 */
function normalizeSMILES(smiles) {
    return String(smiles)
        .trim()
        .replace(/\s+/g, "");
}


/* =========================================================
   Molecular formula search
   ========================================================= */

function searchByFormula(query) {
    const normalizedQuery = normalizeFormula(query);

    return compounds.filter((compound) => {
        if (!compound.formula) {
            return false;
        }

        return normalizeFormula(compound.formula) === normalizedQuery;
    });
}


/*
 * Converts formulas such as:
 *
 *   C2H6O
 *   c2h6o
 *   C₂H₆O
 *
 * into a consistent internal representation.
 *
 * The resulting element order is alphabetical by element symbol.
 */

function normalizeFormula(formula) {
    let value = String(formula)
        .trim()
        .replace(/\s+/g, "");

    /*
     * Convert common Unicode subscripts to normal digits.
     */
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

    value = value.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (char) => {
        return subscriptMap[char];
    });

    /*
     * Basic molecular formula parser.
     *
     * Examples:
     * C2H6O
     * NaCl
     * C6H12O6
     */
    const matches = value.match(
        /([A-Za-z]{1,2})(\d*)/g
    );

    if (!matches) {
        return value.toLowerCase();
    }

    const elements = {};

    for (const token of matches) {
        const match = token.match(
            /^([A-Za-z]{1,2})(\d*)$/
        );

        if (!match) {
            continue;
        }

        const symbol =
            match[1][0].toUpperCase() +
            match[1].slice(1).toLowerCase();

        const count = match[2]
            ? Number(match[2])
            : 1;

        if (!Number.isFinite(count)) {
            continue;
        }

        elements[symbol] =
            (elements[symbol] || 0) + count;
    }

    return Object.keys(elements)
        .sort()
        .map((element) => {
            const count = elements[element];

            return count === 1
                ? element
                : `${element}${count}`;
        })
        .join("");
}


/* =========================================================
   Result rendering
   ========================================================= */

function renderResults(query, matches) {
    if (matches.length === 0) {
        results.innerHTML = `
            <div class="empty">
                No matching compounds found.
            </div>
        `;

        return;
    }

    const modeText =
        currentMode === SEARCH_MODES.SMILES
            ? "SMILES"
            : "molecular formula";

    const cards = matches.map((compound) => {
        return `
            <article class="result-card">
                <h2 class="result-name">
                    ${escapeHTML(compound.name || "Unnamed compound")}
                </h2>

                ${renderProperty(
                    "Formula",
                    compound.formula
                )}

                ${renderProperty(
                    "SMILES",
                    compound.smiles
                )}

                ${renderProperty(
                    "CAS RN",
                    compound.cas
                )}

                ${renderProperty(
                    "Molar mass",
                    formatMolarMass(compound.molar_mass)
                )}

                ${renderProperty(
                    "Description",
                    compound.description
                )}
            </article>
        `;
    }).join("");

    results.innerHTML = `
        <p class="result-summary">
            ${matches.length}
            ${matches.length === 1 ? "compound" : "compounds"}
            found for ${escapeHTML(modeText)}:
            <strong>${escapeHTML(query)}</strong>
        </p>

        ${cards}
    `;
}


/* =========================================================
   Property rendering
   ========================================================= */

function renderProperty(name, value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "";
    }

    return `
        <div class="property">
            <span class="property-name">
                ${escapeHTML(name)}
            </span>

            <span class="property-value">
                ${escapeHTML(String(value))}
            </span>
        </div>
    `;
}


function formatMolarMass(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return String(value);
    }

    return `${number.toFixed(3)} g/mol`;
}


/* =========================================================
   HTML escaping
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}