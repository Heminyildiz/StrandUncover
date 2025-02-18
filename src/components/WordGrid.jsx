import React, { useEffect, useState, useRef } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function isStraightLine(path) {
  if (path.length < 2) return true; 
  const rowDiff = path[1].row - path[0].row;
  const colDiff = path[1].col - path[0].col;
  for (let i = 2; i < path.length; i++) {
    const rDiff = path[i].row - path[i - 1].row;
    const cDiff = path[i].col - path[i - 1].col;
    if (rDiff !== rowDiff || cDiff !== colDiff) {
      return false;
    }
  }
  return true;
}

function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({
  grid: initialGrid,
  words,
  foundWords,
  onWordFound,
  onPartialWordChange
}) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [usedCells, setUsedCells] = useState([]); // hücreler tekrar kullanılamaz
  const [warning, setWarning] = useState("");
  const [pointerDown, setPointerDown] = useState(false);

  // Container ref
  const containerRef = useRef(null);

  // Grid'i boş hücrelere random harflerle doldur
  useEffect(() => {
    const filled = initialGrid.map((row) =>
      row.map((cell) => {
        if (!cell || cell.trim() === "") {
          return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return cell.toUpperCase();
      })
    );
    setGrid(filled);
  }, [initialGrid]);

  // Seçili path değiştiğinde partialWord güncelle
  useEffect(() => {
    if (!selectedPath.length) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    // 10 karakteri aşıyor mu?
    if (selectedPath.length > 10) {
      setWarning("Too long!");
      setTimeout(() => {
        setWarning("");
        resetSelection();
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  const handlePointerDown = (e) => {
    e.preventDefault(); 
    setPointerDown(true);
    setSelectedPath([]);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setPointerDown(false);

    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      if (isStraightLine(selectedPath)) {
        const selectedWord = buildStringFromPath(selectedPath, grid);
        const reversed = selectedWord.split("").reverse().join("");
        // Bulmacadaki kelimelerden biri mi?
        const match = words.find(
          (w) => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
        );
        if (match) {
          onWordFound(match.toUpperCase());
          // Kullanılan hücreleri kitliyoruz
          lockUsedCells(selectedPath);
        }
      }
    }
    resetSelection();
  };

  const handlePointerMove = (e) => {
    if (!pointerDown) return;
    e.preventDefault();

    // Hücrenin row/col'unu dataset'ten al
    const target = e.target;
    if (!target.dataset || target.dataset.row === undefined) return;

    const row = parseInt(target.dataset.row, 10);
    const col = parseInt(target.dataset.col, 10);

    // Kullanılmış hücreyse ekleme
    if (isUsedCell(row, col)) return;

    // Zaten pathte varsa ekleme
    const already = selectedPath.some((p) => p.row === row && p.col === col);
    if (already) return;

    // 10 sınırını aşmıyorsak ekle
    if (selectedPath.length < 10) {
      setSelectedPath((prev) => [...prev, { row, col }]);
    }
  };

  const resetSelection = () => {
    setSelectedPath([]);
    onPartialWordChange?.("");
  };

  const lockUsedCells = (path) => {
    const pathKeys = path.map((p) => `${p.row},${p.col}`);
    setUsedCells((prev) => [...prev, ...pathKeys]);
  };

  const isUsedCell = (row, col) => {
    return usedCells.includes(`${row},${col}`);
  };

  return (
    <div className="relative w-full flex justify-center mt-4">
      {warning && (
        <div className="absolute top-0 bg-brandRed text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      {/* Grid Container */}
      <div
        ref={containerRef}
        className="grid grid-rows-7 grid-cols-6 gap-1 p-1"
        style={{
          touchAction: "none"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {grid.map((rowArray, rowIndex) =>
          rowArray.map((letter, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;

            // Seçili path'te mi?
            const isSelected = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            // Kullanılmış mı?
            const locked = isUsedCell(rowIndex, colIndex);

            // Stiller
            let cellClass = "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold cursor-pointer select-none";
            if (locked) {
              cellClass += " bg-gray-300 text-gray-500";
            } else if (isSelected) {
              // Gradient arka plan + hafif border efekti
              cellClass += " bg-gradient-to-r from-brandGradientFrom to-brandGradientTo text-white rounded-full border-2 border-brandAccent";
            } else {
              cellClass += " bg-white text-gray-900";
            }

            return (
              <div
                key={cellKey}
                data-row={rowIndex}
                data-col={colIndex}
                className={cellClass}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WordGrid;




