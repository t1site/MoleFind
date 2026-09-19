# MoleFind

MoleFind is a simple web-based chemical compound search tool.

It allows users to search registered chemical compounds by:

- SMILES
- Molecular formula

MoleFind is designed to provide a simple and lightweight interface for quickly viewing chemical information.

## Features

- Search compounds by SMILES
- Search compounds by molecular formula
- Support multiple SMILES representations for one compound
- Normalize molecular formula notation
- Support Unicode subscripts in molecular formulas
- Display molecular formula
- Display SMILES
- Display CAS RN
- Display molar mass
- Display boiling point
- Display density
- Display LogP
- Display functional groups
- Display acid/base classification
- Display IUPAC name
- Display InChIKey
- Search the compound on Google Scholar
- Display a description of the compound
- Mobile swipe support for switching search modes
- Keyboard arrow-key support for switching search modes
- Enter-key support for searching
- Responsive design
- JavaScript-disabled warning

## Search Modes

### SMILES

Searches the database using a SMILES string.

Example:

`CCO`

A compound can have multiple registered SMILES strings.

Example:

`"smiles": ["CCO", "OCC"]`

Both representations can be used to find ethanol.

### Molecular Formula

Searches compounds using their molecular formula.

Examples:

`H2O`

`C2H6O`

`C6H6`

Unicode subscripts are also supported.

For example, `C₂H₆O` is normalized to `C2H6O`.

Element symbol capitalization is also normalized.

## Compound Information

Each compound can contain the following information:

- Name
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

A Google Scholar search link is automatically generated from the compound name.

## Data Format

Compound data is stored in `compds.json`.

A compound record uses the following fields:

- `name`
- `formula`
- `smiles`
- `cas`
- `molar_mass`
- `boiling_point`
- `density`
- `logp`
- `functional_groups`
- `acid_base`
- `iupac_name`
- `inchi_key`
- `description`

The `smiles` field is an array so that multiple SMILES representations can be registered for one compound.

The `functional_groups` field is also an array because a compound can contain multiple functional groups.

If no functional group is applicable, an empty array can be used.

## Project Structure

MoleFind has a simple three-file structure:

- `index.html` - User interface and styling
- `system.js` - Search logic and application behavior
- `compds.json` - Compound database

## Technologies

MoleFind uses:

- HTML
- CSS
- JavaScript
- JSON

No external JavaScript framework is required.

## Running Locally

Because MoleFind loads `compds.json` using `fetch()`, it should be served through a local HTTP server rather than opened directly with the `file://` protocol.

For example, with Python:

`python -m http.server`

Then open:

`http://localhost:8000/`

## Deployment

MoleFind can be deployed as a static website.

GitHub Pages is suitable because MoleFind only requires static HTML, CSS, JavaScript, and JSON files.

## License

Copyright © 2026 TAICHI1129.

The licensing terms of MoleFind are defined by the repository.
