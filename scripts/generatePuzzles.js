/**
 * generatePuzzles.js
 *
 * Bu script, 7x6 boyutunda rastgele "word search" puzzle'ları üretir.
 * - Her puzzle'da 5-8 kelime rastgele seçilir.
 * - Kelimeler rastgele konum ve yönlerde yerleştirilir.
 * - Kelimeler çakışabilir, eğer harfler uyumlu ise (örneğin 'A' üstüne 'A').
 * - Boş hücreler rastgele harfle doldurulur.
 * - 1 adet "dailyPuzzle" ve 50 adet "zenPuzzles" üretilir.
 *
 * Terminalde çalıştır: node scripts/generatePuzzles.js
 * Oluşan puzzleData.json dosyasını projenin public/puzzleData.json konumuna kopyalayabilirsin.
 */

const fs = require("fs");

// Puzzle boyutları
const ROWS = 7;
const COLS = 6;
// Kaç puzzle üreteceğiz (zenPuzzles için)
const ZEN_COUNT = 50;

// Kullanacağımız harf seti
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Rastgele kelime listemiz.
 * Dilerseniz genişletebilirsiniz.
 */
const WORD_POOL = [
  "APPLE", "PEACH", "GRAPE", "CRASH", "SPILL",
  "PLANE", "TRAIN", "TABLE", "PHONE", "CHAIR",
  "BURST", "MUSIC", "MOVIE", "BOOK", "CROSS",
  "BREW", "NIGHT", "CHALLENGE", "BRAVE", "SOUND",
  "LIGHT", "CLOUD", "LION", "TIGER", "BREAD",
  "PIZZA", "PASTA", "SALAD", "SCORE", "STORY",
  "POWER", "STACK", "BLINK", "HARSH", "HEART",
  "DAZZLE", "FREEDOM", "RHYTHM", "WATER", "WIND",
  "ROAST", "TOAST", "HONEY", "TRICK", "TRACE",
  "QUIET", "QUEST", "BUZZ", "GRIND", "FLAME",
  "SPARK", "POLAR", "DELTA", "MAGIC", "POINT",
  "CANDY", "SUGAR", "GROUND", "EARTH", "WHALE",
  "SHARK", "SPICE", "THREAD", "FINAL", "LASER",
  "CURLY", "BRUSH", "FLOAT", "MOVIE", "STEAM",
  "SOUND", "CABLE", "BRAIN", "SMILE", "KNIFE",
  "SWORD", "SHINE", "BLIZZARD", "SPRING", "MAJOR",
  "MINOR", "OREO", "FRUIT", "GRASS", "WOODS",
  "FAITH", "GLASS", "FAKE", "EMPTY", "BRICK",
];

/**
 * Bir puzzle'da kaç kelime yerleştiriyoruz? 5-8 arası
 */
const MIN_WORDS = 5;
const MAX_WORDS = 8;

/** Basit rastgele integer */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

/** Belirli sayıda kelime seç. (Bu kodda unique garanti değil; havuzda çok kelime var. 
 *  Tekrarlar olabilir, isterseniz set kullanabilirsiniz.)
 */
function pickWords() {
  const wordCount = MIN_WORDS + randInt(MAX_WORDS - MIN_WORDS + 1);
  const selected = [];
  for (let i = 0; i < wordCount; i++) {
    const w = WORD_POOL[randInt(WORD_POOL.length)];
    selected.push(w.toUpperCase());
  }
  return selected;
}

/** 7x6 boş grid oluştur ("" ile dolu) */
function createEmptyGrid() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push("");
    }
    grid.push(row);
  }
  return grid;
}

/** 
 * 8 farklı yön (satır-sütun farkları).
 * left->right(0,1), right->left(0,-1), up->down(1,0), down->up(-1,0),
 * diag(1,1), diag(1,-1), diag(-1,1), diag(-1,-1)
 */
const DIRECTIONS = [
  { dr: 0, dc: 1 },   // L->R
  { dr: 0, dc: -1 },  // R->L
  { dr: 1, dc: 0 },   // Top->Down
  { dr: -1, dc: 0 },  // Down->Top
  { dr: 1, dc: 1 },   // diag down-right
  { dr: 1, dc: -1 },  // diag down-left
  { dr: -1, dc: 1 },  // diag up-right
  { dr: -1, dc: -1 }, // diag up-left
];

/** 
 * Bu fonksiyon, word'ü (örnek: "APPLE") grid'e yerleştirmeyi dener. 
 * - Rastgele startRow, startCol, direction
 * - Kelimeler çakışabilir, eğer harfler match ediyorsa
 * - Mismatch olursa bu konuma yerleştiremez, başka deneme
 */
function placeWord(grid, word) {
  let placed = false;
  let attempts = 0;

  while (!placed && attempts < 100) {
    attempts++;
    // Rastgele başlangıç
    const startRow = randInt(ROWS);
    const startCol = randInt(COLS);
    // Rastgele yön
    const dir = DIRECTIONS[randInt(DIRECTIONS.length)];

    if (canPlace(grid, word, startRow, startCol, dir)) {
      doPlace(grid, word, startRow, startCol, dir);
      placed = true;
    }
    // else diğer denemeye geç
  }
}

/**
 * Sığma ve çakışma kontrolü
 */
function canPlace(grid, word, startRow, startCol, dir) {
  const endRow = startRow + dir.dr * (word.length - 1);
  const endCol = startCol + dir.dc * (word.length - 1);

  // Izgara dışına çıkıyor mu?
  if (endRow < 0 || endRow >= ROWS) return false;
  if (endCol < 0 || endCol >= COLS) return false;

  // Her harfi kontrol et
  let rr = startRow;
  let cc = startCol;
  for (let i = 0; i < word.length; i++) {
    const existing = grid[rr][cc];
    const letter = word[i];
    if (existing !== "" && existing !== letter) {
      // mismatch => yerleşemez
      return false;
    }
    rr += dir.dr;
    cc += dir.dc;
  }

  return true;
}

/**
 * Kelimeyi grid'e gerçekten yaz
 * (önceden canPlace = true olmalı)
 */
function doPlace(grid, word, startRow, startCol, dir) {
  let rr = startRow;
  let cc = startCol;
  for (let i = 0; i < word.length; i++) {
    grid[rr][cc] = word[i];
    rr += dir.dr;
    cc += dir.dc;
  }
}

/**
 * Boş hücreleri rastgele harfle doldur
 */
function fillBlanks(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[randInt(ALPHABET.length)];
      }
    }
  }
}

/**
 * Tek puzzle üret
 */
function generateOnePuzzle() {
  // 1) Boş grid
  const grid = createEmptyGrid();
  // 2) Rastgele kelimeler seç
  const words = pickWords();

  // 3) Her kelimeyi yerleştirmeyi dene
  for (const w of words) {
    placeWord(grid, w);
  }

  // 4) Boşlukları doldur
  fillBlanks(grid);

  return { grid, words };
}

/**
 * Ana fonksiyon
 * 1) Bir daily puzzle
 * 2) 50 adet zen puzzle
 * 3) Sonuç puzzleData.json
 */
function main() {
  // Tek puzzle dailyPuzzle üretelim
  const daily = generateOnePuzzle();

  // 50 adet zen puzzle
  const zenPuzzles = [];
  for (let i = 0; i < ZEN_COUNT; i++) {
    const p = generateOnePuzzle();
    zenPuzzles.push(p);
  }

  // JSON objesi
  const output = {
    // Bir örnek daily puzzle
    dailyPuzzles: [
      {
        date: "2025-02-18",
        themeTitle: "Random Daily",
        hint: "Random puzzle of the day",
        grid: daily.grid,
        words: daily.words
      }
    ],
    zenPuzzles
  };

  // Yazdır
  const jsonStr = JSON.stringify(output, null, 2);
  fs.writeFileSync("puzzleData.json", jsonStr);
  console.log("puzzleData.json oluşturuldu! =>", __dirname);
}

// Çalıştır
main();
