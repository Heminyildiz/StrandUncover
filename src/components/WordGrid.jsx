import React, { useEffect, useState, useRef } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** path içindeki hücreler tek bir düz çizgi oluşturuyor mu (yatay, dikey, çapraz)? */
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
  return path.map(({ row, col }) => grid[row][col]).join("");
}

function WordGrid({
  grid: initialGrid,
  words,
  foundWords,
  onWordFound,
  onPartialWordChange,
}) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [usedCells, setUsedCells] = useState([]); // Hücreleri tekrar kullanılamaz kıl
  const isPointerDown = useRef(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // Boş hücreleri rastgele harfle doldur
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

  // Seçili path değiştikçe partialWord güncelle
  useEffect(() => {
    if (!selectedPath.length) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    // 10 karakter sınırı
    if (selectedPath.length > 10) {
      setWarning("Too long!");
      setTimeout(() => {
        setWarning("");
        resetSelection();
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  /** Yeni kelime bulunduğunda, path'teki hücreleri usedCells'e ekle */
  const lockUsedCells = (path) => {
    setUsedCells((prev) => [
      ...prev,
      ...path.map((p) => `${p.row},${p.col}`)
    ]);
  };

  // pointerDown => path başlat
  const handlePointerDown = (row, col, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUsedCell(row, col)) return; // Kullanılmış hücreye izin yok
    isPointerDown.current = true;
    setSelectedPath([{ row, col }]);
  };

  // pointerEnter => path'e ekle
  const handlePointerEnter = (row, col, e) => {
    if (!isPointerDown.current) return;
    e.preventDefault();
    e.stopPropagation();

    if (isUsedCell(row, col)) return; // Daha önce kullanılmışsa eklemeyelim

    // Aynı hücreyi path'e tekrar eklemeyelim
    const isAlreadyInPath = selectedPath.some(
      (p) => p.row === row && p.col === col
    );
    if (!isAlreadyInPath && selectedPath.length <= 10) {
      setSelectedPath((prev) => [...prev, { row, col }]);
    }
  };

  // pointerUp => path değerlendir
  const handlePointerUp = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      if (isStraightLine(selectedPath)) {
        const selectedWord = buildStringFromPath(selectedPath, grid);
        const reversed = selectedWord.split("").reverse().join("");

        // words listesinde var mı?
        const match = words.find(
          (w) => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
        );
        if (match) {
          onWordFound(match.toUpperCase());
          // Bulunan kelimenin hücrelerini bir daha kullanılmaz yap
          lockUsedCells(selectedPath);
        }
      }
    }
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedPath([]);
    isPointerDown.current = false;
    onPartialWordChange?.("");
  };

  // pointerLeave => parmak/kursor ızgaradan çıkarsa da up olayı
  const handlePointerLeave = () => {
    if (isPointerDown.current) {
      handlePointerUp();
    }
  };

  const isUsedCell = (row, col) => {
    return usedCells.includes(`${row},${col}`);
  };

  return (
    <div
      className="inline-block select-none relative"
      style={{ touchAction: "none" }} 
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {warning && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-brandRed text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      {grid.map((rowArray, rowIndex) => (
        <div key={rowIndex} className="flex">
          {rowArray.map((letter, colIndex) => {
            // Seçili path içinde mi?
            const isSelected = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            // Kullanılmış mı?
            const isLocked = isUsedCell(rowIndex, colIndex);

            return (
              <div
                key={colIndex}
                onPointerDown={(e) => handlePointerDown(rowIndex, colIndex, e)}
                onPointerEnter={(e) => handlePointerEnter(rowIndex, colIndex, e)}
                className={`
                  w-8 h-8 md:w-9 md:h-9 
                  flex items-center justify-center 
                  text-sm md:text-base lg:text-lg font-bold cursor-pointer mx-[1px] my-[1px]
                  ${
                    isLocked
                      ? "bg-gray-300 text-gray-500"
                      : isSelected
                      ? "bg-brandAccent text-white rounded-full border-2 border-brandSecondary"
                      : "bg-transparent text-gray-900"
                  }
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



