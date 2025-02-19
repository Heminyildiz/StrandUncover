import React, { useEffect, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 8 yönlü “komşu” (L şekli dahil)
function isNeighbor(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  // Kendisi değil ve fark <=1 => komşu
  return !(rowDiff === 0 && colDiff === 0) && rowDiff <= 1 && colDiff <= 1;
}

function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({ grid: initialGrid, words, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // Boş hücrelere random harf
    const filled = initialGrid.map(row =>
      row.map(cell => {
        if (!cell || cell.trim() === "") {
          return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return cell.toUpperCase();
      })
    );
    setGrid(filled);
    setSelectedPath([]);
  }, [initialGrid]);

  useEffect(() => {
    if (selectedPath.length === 0) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    if (selectedPath.length > 10) {
      setWarning("Too long!");
      setTimeout(() => {
        setWarning("");
        resetSelection();
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  // Hücreye tıklayınca toggle
  const handleCellClick = (row, col) => {
    // Seçili mi?
    const idx = selectedPath.findIndex(p => p.row === row && p.col === col);
    if (idx !== -1) {
      // Path'ten çıkar (toggle off)
      setSelectedPath(prev => {
        const newPath = [...prev];
        newPath.splice(idx, 1);
        return newPath;
      });
      return;
    }

    // Path'e ekleme
    if (selectedPath.length === 0) {
      // Hiç seçili harf yoksa direkt ekle
      setSelectedPath([{ row, col }]);
    } else {
      // Son seçili hücreye komşu mu?
      const lastCell = selectedPath[selectedPath.length - 1];
      if (isNeighbor(lastCell, { row, col })) {
        if (selectedPath.length < 10) {
          setSelectedPath(prev => [...prev, { row, col }]);
        }
      }
    }
  };

  const finalizeSelection = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      const selectedWord = buildStringFromPath(selectedPath, grid);
      const reversed = selectedWord.split("").reverse().join("");
      const found = words.find(
        w => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
      );
      if (found) {
        onWordFound?.(found.toUpperCase());
      }
    }
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedPath([]);
    onPartialWordChange?.("");
  };

  return (
    <div className="relative w-full flex flex-col items-center mt-4">
      {warning && (
        <div className="absolute top-0 bg-red-500 text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      <div className="grid grid-rows-7 grid-cols-6 gap-1 p-1">
        {grid.map((rowArray, rowIndex) =>
          








