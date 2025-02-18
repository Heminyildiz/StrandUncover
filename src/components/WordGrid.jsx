import React, { useEffect, useState, useRef } from "react";

// Harf oluşturmak için
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Check if a path is in a straight line (horizontal, vertical, diagonal)
function isStraightLine(path) {
  if (path.length < 2) return false;
  const rowDiff = path[1].row - path[0].row;
  const colDiff = path[1].col - path[0].col;

  // Her adımda aynı fark var mı?
  for (let i = 2; i < path.length; i++) {
    const rDiff = path[i].row - path[i - 1].row;
    const cDiff = path[i].col - path[i - 1].col;
    // sabit rowDiff, colDiff
    if (rDiff !== rowDiff || cDiff !== colDiff) {
      return false;
    }
  }
  return true;
}

function buildStringFromPath(path, grid) {
  return path.map(({ row, col }) => grid[row][col]).join("");
}

function WordGrid({ grid: initialGrid, words, foundWords, onWordFound }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const isPointerDown = useRef(false);

  // Grid içindeki boş hücreleri rastgele harflerle doldur
  useEffect(() => {
    const filled = initialGrid.map((row) =>
      row.map((cell) => {
        if (cell === "" || cell == null) {
          return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return cell;
      })
    );
    setGrid(filled);
  }, [initialGrid]);

  // pointerDown
  const handlePointerDown = (row, col) => {
    isPointerDown.current = true;
    setSelectedPath([{ row, col }]);
  };

  // pointerMove => e.target içinde row,col yakalamak
  const handlePointerEnter = (row, col) => {
    if (!isPointerDown.current) return;
    // Aynı hücreyi tekrar eklemeyelim
    const last = selectedPath[selectedPath.length - 1];
    if (last && last.row === row && last.col === col) return;
    // path'e ekle
    setSelectedPath((prev) => [...prev, { row, col }]);
  };

  // pointerUp => path'i değerlendir
  const handlePointerUp = () => {
    if (selectedPath.length > 1) {
      // Tek çizgide mi?
      if (isStraightLine(selectedPath)) {
        const selectedString = buildStringFromPath(selectedPath, grid).toUpperCase();
        // Tersini de kontrol edelim
        const reversed = selectedString.split("").reverse().join("");
        // Puzzle words içinde mi?
        const matchedWord = words.find(
          (w) => 
            w.toUpperCase() === selectedString ||
            w.toUpperCase() === reversed
        );

        if (matchedWord) {
          onWordFound(matchedWord.toUpperCase());
        }
      }
    }
    // Seçimi sıfırla
    setSelectedPath([]);
    isPointerDown.current = false;
  };

  return (
    <div
      className="inline-block select-none"
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => {
        if (isPointerDown.current) {
          handlePointerUp();
        }
      }}
    >
      {grid.map((rowArray, rowIndex) => (
        <div key={rowIndex} className="flex">
          {rowArray.map((letter, colIndex) => {
            const isInPath = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            const alreadyFound = foundWords.some((fw) => {
              // Bu hücre, fw kelimesinde var mı? (Zor kontrol)
              // Basitçe, bulduğumuz kelimeleri işaretlemiyoruz, 
              // ama istersen “highlight” eklenebilir. Şimdilik yok.
              return false;
            });

            return (
              <div
                key={colIndex}
                onPointerDown={() => handlePointerDown(rowIndex, colIndex)}
                onPointerEnter={() => handlePointerEnter(rowIndex, colIndex)}
                className={`
                  w-10 h-10 md:w-12 md:h-12 
                  flex items-center justify-center
                  cursor-pointer text-xl md:text-2xl font-bold 
                  ${
                    isInPath 
                      ? "bg-pastel-200" 
                      : "bg-transparent"
                  }
                  ${alreadyFound ? "opacity-50" : ""}
                `}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;

