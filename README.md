# MoleFind

MoleFind is a lightweight web-based chemical compound search tool.

It allows users to search for chemical compounds using:

- SMILES
- Molecular Formula
- InChIKey

MoleFind is designed to provide a simple and fast way to find compound information from a structured JSON database.

## Features

### Multiple Search Modes

MoleFind supports three search methods:

#### SMILES

Search compounds by their SMILES representation.

Example:

    CCO

#### Molecular Formula

Search compounds by molecular formula.

Example:

    C2H6O

Element ordering and numerical subscripts are normalized during the search.

#### InChIKey

Search compounds by their InChIKey.

Example:

    LFQSCWFLJHTTHZ-UHFFFAOYSA-N

InChIKey searches are case-insensitive and whitespace is ignored.

## Compound Information

Depending on the data available in `compds.json`, MoleFind can display information such as:

- Compound name
- Molecular formula
- SMILES
- CAS RN
- Molar mass
- Boiling point
- Density
- LogP
- Functional groups
- Acid/base classification
- IUPAC name
- InChIKey
- Description
- Google Scholar search link

## Search Mode Navigation

Search modes can be changed using:

- The left arrow button
- The right arrow button
- The left/right arrow keys on a keyboard
- Horizontal swipes on mobile devices

The search modes cycle through:

    SMILES
    ↓
    Molecular Formula
    ↓
    InChIKey
    ↓
    SMILES

## URL Search

MoleFind supports searching through the `q` URL parameter.

For example:

    https://t1site.github.io/MoleFind/?q=CCO

The `q` parameter is interpreted as a SMILES query.

## Project Structure

    MoleFind/
    ├── index.html
    ├── system.js
    └── compds.json

### `index.html`

Contains the MoleFind user interface and styling.

### `system.js`

Contains the search system, database loading, search-mode management, result rendering, and user interaction logic.

### `compds.json`

Contains the compound database.

The JSON database does not need to be modified to enable InChIKey searching, provided that each compound contains an `inchi_key` field.

## Data Format

A compound entry can contain fields such as:

    {
        "name": "Ethanol",
        "formula": "C2H6O",
        "smiles": "CCO",
        "cas": "64-17-5",
        "molar_mass": 46.069,
        "inchi_key": "LFQSCWFLJHTTHZ-UHFFFAOYSA-N"
    }

Additional fields may be included.

## Technology

MoleFind is built using standard web technologies:

- HTML
- CSS
- JavaScript
- JSON

No server-side application is required for the basic search functionality.

The compound database is loaded directly from `compds.json`.

## Running Locally

Clone the repository:

    git clone https://github.com/t1site/MoleFind.git

Then open the project using a local web server.

For example:

    python -m http.server

Then open:

    http://localhost:8000/

A local web server is recommended because browsers may restrict `fetch()` requests for local files opened directly with `file://`.

## Deployment

MoleFind can be deployed as a static website.

For example, it can be hosted using GitHub Pages.

The project does not require a traditional backend server for its current search functionality.

## License

See the repository for the applicable license.

## Author

TAICHI1129

GitHub:

https://github.com/TAICHI1129