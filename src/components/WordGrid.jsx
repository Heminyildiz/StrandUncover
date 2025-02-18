import React, { useState } from "react";

function WordGrid({ grid, words, onWordFound, foundWords }) {
  // startCell/endCell: {row, col} veya null
  const [startCell, setStartCell] = useState(null);

  // Tıklanan hücreyi handle et
  const handleCellClick = (row, col) => {
    // Eğer startCell yoksa, ilk tıklama:
    if (!startCell) {
      setStartCell({ row, col });
    } 
    // İkinci tıklama:
    else {
      const endCell = { row, col };
      checkSelection(startCell, endCell);
      // seçim sonrası tekrar sıfırla
      setStartCell(null);
    }
  };

  // start & end'e karşılık gelen kelime var mı kontrol et
  const checkSelection = (start, end) => {
    for (let w of words) {
      // Zaten bulunmuşsa geç
      if (foundWords.includes(w.text)) continue;

      const s = w.start; // [row, col]
      const e = w.end;
      // Seçim, puzzle'da tanımlı start & end'e uyuyor mu?
      if (
        (s[0] === start.row && s[1] === start.col && e[0] === end.row && e[1] === end.col) ||
        (s[0] === end.row && s[1] === end.col && e[0] === start.row && e[1] === start.col)
      ) {
        // Kelime bulundu
        onWordFound(w.text);
        break;
      }
    }
  };

  return (
    <div className="inline-block">
      {grid.map((rowArray, rowIndex) => (
        <div key={rowIndex} className="flex">
          {rowArray.map((letter, colIndex) => {
            // Eğer (rowIndex,colIndex) startCell ise hafif renklendirelim
            const isSelected =
              startCell &&
              startCell.row === rowIndex &&
              startCell.col === colIndex;

            return (
              <button
                key={colIndex}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`w-8 h-8 md:w-10 md:h-10 border border-gray-300 flex items-center justify-center 
                  text-sm md:text-base uppercase font-semibold 
                  ${isSelected ? "bg-pastel-300" : "bg-white"}
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;
