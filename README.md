# Open Crossword

Open Crossword is a lightweight, locally hosted crossword puzzle editor built entirely with HTML and JavaScript. It provides a fast and intuitive interface for creating, editing, and exporting crosswords in both American and Quick styles. Keep all your creations under your control, with no paywalls or accounts needed.

## Features

- 🧩 Interactive grid-based crossword editor  
- 🔢 Automatic, real-time clue numbering  
- 🎨 Supports special cell marking via keyboard shortcuts:  
  - `.` to black out a cell  
  - `,` to circle a cell  
  - `~` to highlight a cell  
- ✏️ Clue editor that automatically populates based on grid layout  
- 💾 Save and load puzzles as JSON (.puz is WIP)
- 📏 Resizable grid (3x3 to 25x25)  
- 🖨️ Export to PDF for printing (WIP) 
- 🔁 Optional 180° rotational symmetry
- ✅ Enforces American-style crossword rules

## Usage

1. Open the directory in your terminal.
2. Run `python -m http.server 8000`
3. Open `http://localhost:8000/index.html` in your preferred browser.
4. Click cells to type letters (input is automatically capitalized).
5. Use special characters to mark cells:
   - `.` for black squares
   - `,` for circled cells
   - `~` for highlighted cells
   - Once an effect is applied, you can safely delete the special character.
   - Enter any character a second time to remove the effect from a cell.
6. Clue numbers are automatically updated as you build your grid.
7. The clue editor below the grid will populate automatically — just fill in the clues.
8. Use the control buttons to:
   - Resize the grid
   - Save or load puzzles as JSON
   - Export clues and grid to PDF

## To Do
1. Rebus support
2. Wordlists and suggestions
3. Finalise PDF and .PUZ export
4. Add support for other rulesets besides American style.
5. Add support for non-square grids.
6. Make it look less like baby's first HTML site.

## Acknowledgements

Thanks to `https://favicon.io` for the Favicon
Thanks to dwyl for the word list from `https://github.com/dwyl/english-words`