let size = 15;
let grid = [];
let lastDirection = 'across';
let wordList = [];
let wordListReady = false;

function loadWordlist() {
    console.log("Fetching wordList...");
    fetch('words.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => {
        wordList = text.toUpperCase().split('\n').map(line => line.trim()).filter(Boolean);
        console.log(wordList.length + " Loaded"); // Output the list to the console
        wordListReady = true;
      })
      .catch(error => {
        console.error('Error fetching the file:', error);
      });
}

function createGrid() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    gridEl.style.gridTemplateRows = `repeat(${size}, 50px)`;
    grid = [];

    for (let r = 0; r < size; r++) {
        grid[r] = [];
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const input = document.createElement('input');
            input.maxLength = 1;
            input.addEventListener('input', e => {
                input.value = input.value.toUpperCase();
                updateNumbers();
                updateClueEditor();
            });
            input.addEventListener('keydown', e => {
                const row = r;
                const col = c;

                // Special key toggles
                if (e.key === '.') {
                    toggleClass(cell, 'blacked');
                    applySymmetry(r, c, 'blacked');
                    updateNumbers();
                    updateClueEditor();
                    highlightLine(r, c);
                    e.preventDefault();
                }
                if (e.key === ',') toggleClass(cell, 'circled'); 
                if (e.key === '~') toggleClass(cell, 'highlighted');

                // Arrow key navigation
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {

                    e.preventDefault();
                    let targetRow = row;
                    let targetCol = col;

                    if (['ArrowUp', 'ArrowDown'].includes(e.key) && lastDirection == 'across') {
                        clearHighlights();
                        lastDirection = 'down'
                        updateSuggestions(row, col);
                        highlightLine(targetRow, targetCol);
                    }
                    else if (['ArrowLeft', 'ArrowRight'].includes(e.key) && lastDirection == 'down') {
                        clearHighlights();
                        lastDirection = 'across';
                        updateSuggestions(row, col);
                        highlightLine(targetRow, targetCol);
                    }
                    else {

                        clearHighlights();
                        switch (e.key) {
                            case 'ArrowUp': targetRow = row > 0 ? row - 1 : row; lastDirection = 'down'; break;
                            case 'ArrowDown': targetRow = row < size - 1 ? row + 1 : row; lastDirection = 'down'; break;
                            case 'ArrowLeft': targetCol = col > 0 ? col - 1 : col; lastDirection = 'across'; break;
                            case 'ArrowRight': targetCol = col < size - 1 ? col + 1 : col; lastDirection = 'across'; break;
                        }

                        const targetCell = grid[targetRow][targetCol];
                        if (targetCell) {
                            const targetInput = targetCell.querySelector('input');
                            targetInput.focus();
                        }

                        updateSuggestions(row, col);
                        highlightLine(targetRow, targetCol);
                    }


                }

                updateNumbers();
                updateClueEditor();
            });
            cell.appendChild(input);

            const number = document.createElement('div');
            number.className = 'number';
            cell.appendChild(number);

            grid[r][c] = cell;
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridEl.appendChild(cell);

            input.addEventListener('focus', () => {
                const row = r;
                const col = c;
                clearHighlights();
                
                cell.classList.add('focused');

                if (!grid[r][c].classList.contains('blacked')) {
                    highlightLine(row, col);
                }
                updateSuggestions(row, col);
            });

            input.addEventListener('dblclick', () => {
                lastDirection = (lastDirection === 'across') ? 'down' : 'across';

                const row = r;
                const col = c;
                clearHighlights();
                highlightLine(row, col);
                updateSuggestions(row, col);
            });
            document.addEventListener('click', (event) => {
                // If the click target is NOT inside the grid element...
                if (!gridEl.contains(event.target)) {
                    clearHighlights();
                }
            });

        }
    }
}

function toggleClass(cell, className) {
    cell.classList.toggle(className);
}

function resizeGrid() {
    size = parseInt(document.getElementById('size').value);
    createGrid();
    updateNumbers();
    updateClueEditor();
}

function updateNumbers() {
    let count = 1;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = grid[r][c];
            const input = cell.querySelector('input');
            const number = cell.querySelector('.number');

            const isStartOfAcross = c === 0 || grid[r][c - 1].classList.contains('blacked');
            const isStartOfDown = r === 0 || grid[r - 1][c].classList.contains('blacked');
            const isLetter = !cell.classList.contains('blacked');

            if (isLetter && ((isStartOfAcross && c + 1 < size && !grid[r][c + 1].classList.contains('blacked')) ||
                (isStartOfDown && r + 1 < size && !grid[r + 1][c].classList.contains('blacked')))) {
                number.textContent = count++;
            } else {
                number.textContent = '';
            }
        }
    }
}

function updateClueEditor() {
    const acrossClues = document.getElementById('across-clues');
    const downClues = document.getElementById('down-clues');
    acrossClues.innerHTML = '';
    downClues.innerHTML = '';

    let added = {};

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = grid[r][c];
            const number = cell.querySelector('.number').textContent;
            if (!number) continue;

            // Across
            if ((c === 0 || grid[r][c - 1].classList.contains('blacked')) && c + 1 < size && !grid[r][c + 1].classList.contains('blacked')) {
                let word = '';
                let cc = c;
                while (cc < size && !grid[r][cc].classList.contains('blacked')) {
                    word += grid[r][cc].querySelector('input').value || '.';
                    cc++;
                }
                if (!added[`A${number}`]) {
                    addClueRow(acrossClues, number, word, 'Across');
                    added[`A${number}`] = true;
                }
            }

            // Down
            if ((r === 0 || grid[r - 1][c].classList.contains('blacked')) && r + 1 < size && !grid[r + 1][c].classList.contains('blacked')) {
                let word = '';
                let rr = r;
                while (rr < size && !grid[rr][c].classList.contains('blacked')) {
                    word += grid[rr][c].querySelector('input').value || '.';
                    rr++;
                }
                if (!added[`D${number}`]) {
                    addClueRow(downClues, number, word, 'Down');
                    added[`D${number}`] = true;
                }
            }
        }
    }
}

function addClueRow(container, number, word, direction) {
    const div = document.createElement('div');
    div.className = 'clue-entry';
    div.innerHTML = `<span>${number} </span><span>${word}</span><input type="text" placeholder="Enter clue" />`;
    container.appendChild(div);
}

function saveJSON() {
    const data = { size, cells: [], clues: [] };
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = grid[r][c];
            const input = cell.querySelector('input').value;
            data.cells.push({ r, c, value: input, blacked: cell.classList.contains('blacked'), circled: cell.classList.contains('circled'), highlighted: cell.classList.contains('highlighted') });
        }
    }
    const clues = document.querySelectorAll('#clue-editor input[type="text"]');
    clues.forEach(clue => data.clues.push(clue.value));
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = document.getElementById('filename').value.trim();

    if (!filename) {
        filename = "crossword"
    }

    a.href = url;
    a.download = filename + '.json';
    a.click();
}

function loadJSON() {
    document.getElementById('fileInput').click();
}

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        const data = JSON.parse(e.target.result);
        size = data.size;
        document.getElementById('size').value = size;
        createGrid();
        data.cells.forEach(cell => {
            const el = grid[cell.r][cell.c];
            el.querySelector('input').value = cell.value;
            if (cell.blacked) el.classList.add('blacked');
            if (cell.circled) el.classList.add('circled');
            if (cell.highlighted) el.classList.add('highlighted');
        });
        updateNumbers();
        updateClueEditor();
        const clues = document.querySelectorAll('#clue-editor input[type="text"]');
        clues.forEach((clue, i) => clue.value = data.clues[i] || '');
    };
    reader.readAsText(file);
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.text("Crossword Grid (not drawn in this demo)", 10, 10);
    doc.addPage();

    let y = 10;
    const clues = document.querySelectorAll('.clue-entry');
    clues.forEach(entry => {
        const number = entry.children[0].textContent;
        const word = entry.children[1].textContent;
        const clue = entry.children[2].value;
        doc.text(`${number} ${word}: ${clue}`, 10, y);
        y += 5;
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });
    const filename = document.getElementById('filename').value.trim();

    if (!filename) {
        filename = "crossword"
    }
    doc.save(filename + '.pdf');
}

function exportImage() {
    const gridEl = document.getElementById('grid');

    // Clone the grid
    const clone = gridEl.cloneNode(true);

    // Replace input elements with divs for consistent rendering
    clone.querySelectorAll('input').forEach(input => {
        const val = input.value;
        const div = document.createElement('div');
        div.textContent = val;
        div.style.fontSize = '25px';
        div.style.textAlign = 'center';
        div.style.lineHeight = '50px';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.textTransform = 'uppercase';
        div.style.fontFamily = 'sans-serif';

        const parent = input.parentNode;
        parent.replaceChild(div, input);
    });

    document.body.appendChild(clone); // temporarily add to DOM for rendering
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';

    html2canvas(clone).then(canvas => {
        const link = document.createElement('a');
        link.download = 'crossword.png';
        link.href = canvas.toDataURL();
        link.click();
        clone.remove(); // Clean up
    });
}


function applySymmetry(row, col, action) {
    if (!document.getElementById('rotational_symmetry').checked) return;
    const symRow = size - 1 - row;
    const symCol = size - 1 - col;
    if (symRow === row && symCol === col) return; // Don't double toggle center cell in odd grids
    const symCell = grid[symRow][symCol];
    if (!symCell) return;
    if (action === 'blacked') {
        const originalCell = grid[row][col];
        if (originalCell.classList.contains('blacked')) {
            symCell.classList.add('blacked');
        } else {
            symCell.classList.remove('blacked');
        }
    }
}

function updateSuggestions(row, col) {
    if (!wordListReady) {
        console.warn('Suggestions blocked: word list not ready');
        console.log('Word list length:', wordList.length);

        return;
    }

    let pattern = '';
    let startRow = row;
    let startCol = col;

    if (lastDirection === 'across') {
        while (startCol > 0 && !grid[row][startCol - 1].classList.contains('blacked')) startCol--;
        let c = startCol;
        while (c < size && !grid[row][c].classList.contains('blacked')) {
            const val = grid[row][c].querySelector('input').value;
            pattern += val ? val.toUpperCase() : '.';
            c++;
        }
    } else {
        while (startRow > 0 && !grid[startRow - 1][col].classList.contains('blacked')) startRow--;
        let r = startRow;
        while (r < size && !grid[r][col].classList.contains('blacked')) {
            const val = grid[r][col].querySelector('input').value;
            pattern += val ? val.toUpperCase() : '.';
            r++;
        }
    }

    console.log(`Pattern: ${pattern} | Wordlist length: ${wordList.length}`);
    showSuggestions(pattern);
}


function showSuggestions(pattern) {
    if (!wordListReady) {
        console.warn('Word list not ready yet');
        return;
    }
    pattern = pattern.toUpperCase();
    const regex = new RegExp('^' + pattern.replace(/\./g, '.') + '$');
    const matches = wordList.filter(word => regex.test(word));

    const list = document.getElementById('suggestion-list');
    list.innerHTML = '';
    if (matches.length === 0) {
        const li = document.createElement('li');
        li.textContent = '(no matches)';
        list.appendChild(li);
    } else {
        // matches.slice(0, 10).forEach(word => {
        matches.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            list.appendChild(li);
        });
    }
}

function highlightLine(row, col) {
    clearHighlights();

    if (!grid[row][col].classList.contains('blacked')) {
        if (lastDirection === 'across') {
            let c = col;
            // Move left until hitting edge or black cell
            while (c >= 0 && !grid[row][c].classList.contains('blacked')) c--;
            c++;
            // Highlight across, excluding focused cell
            while (c < size && !grid[row][c].classList.contains('blacked')) {
                if (c !== col) {
                    grid[row][c].classList.add('highlighted-word');
                }
                c++;
            }
        } else { // direction is down
            let r = row;
            while (r >= 0 && !grid[r][col].classList.contains('blacked')) r--;
            r++;
            while (r < size && !grid[r][col].classList.contains('blacked')) {
                if (r !== row) {
                    grid[r][col].classList.add('highlighted-word');
                }
                r++;
            }
        }
    }
}

function clearHighlights() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            grid[r][c].classList.remove('highlighted-word');            
        }
    }
    document.querySelectorAll('.cell.focused').forEach(cell => cell.classList.remove('focused'));
}

document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const cell = active?.parentElement;
    if (!cell || !cell.classList.contains('cell')) return;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
});

window.addEventListener('beforeunload', (e) => {
    // This message is usually ignored by modern browsers,
    // but returning a value triggers the confirmation dialog.
    e.preventDefault();
    e.returnValue = '';
});

loadWordlist();
createGrid();
updateNumbers();
updateClueEditor();