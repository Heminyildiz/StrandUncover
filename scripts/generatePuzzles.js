/**
 * scripts/generatePuzzles.js
 *
 * Bu script, 7x6 boyutunda rastgele "word search" puzzle'ları üretir.
 * - Kelimeler çakışabilir (harfler uyuşuyorsa).
 * - Boş hücreler rastgele harfle doldurulur.
 * - 1 adet "dailyPuzzle", 50 adet "zenPuzzles" üretir.
 *
 * Çalıştırmak için proje kök dizininde:
 *    node scripts/generatePuzzles.js
 * Ardından scripts klasöründe puzzleData.json oluşur.
 * Bu dosyayı public/puzzleData.json olarak koyman gerekiyor.
 */

const fs = require("fs");

// Puzzle boyutu
const ROWS = 7;
const COLS = 6;

// Kaç puzzle (zenPuzzles) üretilecek
const ZEN_COUNT = 100;

// Kullanacağımız harf seti
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Kelime havuzumuz
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

  // 3 harfli kelimeler (min. 50)
  "SUN", "DOG", "CAT", "MAP", "HAT", "PEN", "CAR", "RUN", "TOP", "NET",
  "BAT", "RAY", "BUG", "POT", "BOX", "TIP", "LID", "BUS", "HOP", "WAX",
  "PIN", "VAN", "LOG", "BEE", "HEN", "OWL", "FOX", "TEA", "RIP", "EYE",
  "CAP", "CUP", "TOY", "RUG", "MUD", "ZIP", "TAP", "JAM", "FIG", "KEY",
  "BOW", "BAG", "EAR", "ARM", "LEG", "INK", "ORB", "DYE", "OAR", "EGG",

  // 4 harfli kelimeler (min. 50)
  "MOON", "FISH", "JUMP", "WALK", "TREE", "FIRE", "HAND", "BELL", "ROCK", "STAR",
  "SAND", "WISH", "LOVE", "BLUE", "GRAY", "FORK", "WAVE", "DOOR", "RICE", "KITE",
  "LAMP", "BONE", "TANK", "YARD", "BEAR", "BIRD", "ROAD", "SEED", "WIND", "WOOD",
  "COAT", "LACE", "RACE", "TILE", "PEAR", "BOAT", "SNOW", "GIFT", "GOLD", "KING",
  "FIST", "TONE", "MINT", "PEAK", "CREW", "ZONE", "VEIN", "FALL", "QUIZ", "CORN",

  // 6 harfli kelimeler (min. 50)
  "PLANET", "GARDEN", "FATHER", "MARKET", "BOTTLE", "JOURNY", "NARROW", "CANDLE", "LANTER", "BORDER",
  "BREEZE", "MIRROR", "WINDOW", "TUNNEL", "RABBIT", "SPHERE", "SILVER", "LITTLE", "BANANA", "YELLOW",
  "WINTER", "FISHER", "CANYON", "MIRAGE", "SINGER", "HUNTER", "WEALTH", "GLOWER", "THRILL", "CIRCUS",
  "MUSCLE", "FINGER", "BORDER", "ANCHOR", "JACKET", "GARDEN", "MARKER", "HUMMER", "BORDER", "JUNGLE",
  "DANGER", "STAPLE", "GOBLET", "CLOVER", "SCARAB", "VORTEX", "DUNGER", "MOTION", "SWEEPS", "TRAVEL",

  // 7 harfli kelimeler (min. 50)
  "CAMPING", "CRYSTAL", "FANTASY", "GADGETS", "HISTORY", "LIBRARY", "MEADOWS", "NATURES", "OCTOPUS", "PIRATES",
  "RAINBOW", "TUNNELS", "VILLAGE", "WARRIOR", "ZODIACS", "JOURNEY", "HOLIDAY", "MOUNTAIN", "CANYONS", "GLACIER",
  "CIRCLES", "BOTTLES", "CUPCAKE", "TROUBLE", "TURMOIL", "FURTHER", "HUMMING", "IMPACTO", "SHADOWS", "SECRETS",
  "LANTERN", "JUNGLES", "DUNGEON", "VORTEXS", "MYSTERY", "CLOVERS", "JACKETS", "FURNACE", "NUGGETS", "TROPHYS",
  "MISSION", "CANYONS", "MUSICAL", "CANDLES", "BARRIER", "FLAMING", "SPLITTY", "GARLAND", "LANTERN", "VIBRANT"
];


// Her puzzle'da kaç kelime olacak (min - max)
const MIN_WORDS = 10;
const MAX_WORDS = 18;

// 8 farklı yön
const DIRECTIONS = [
  { dr: 0, dc: 1 },   // soldan sağa
  { dr: 0, dc: -1 },  // sağdan sola
  { dr: 1, dc: 0 },   // yukarıdan aşağı
  { dr: -1, dc: 0 },  // aşağıdan yukarı
  { dr: 1, dc: 1 },   // diag down-right
  { dr: 1, dc: -1 },  // diag down-left
  { dr: -1, dc: 1 },  // diag up-right
  { dr: -1, dc: -1 }, // diag up-left
];

// Rastgele integer [0..max)
function randInt(max) {
  return Math.floor(Math.random() * max);
}

// Rastgele kelimeler seç (5-8 arası)
function pickWords() {
  const howMany = MIN_WORDS + randInt(MAX_WORDS - MIN_WORDS + 1);
  const selected = [];
  for (let i = 0; i < howMany; i++) {
    const w = WORD_POOL[randInt(WORD_POOL.length)];
    selected.push(w.toUpperCase());
  }
  return selected;
}

// 7x6 boş grid ("" ile dolu)
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

// Kelimeyi grid'e yerleştirmeyi dene
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

    // Uygun mu?
    if (canPlace(grid, word, startRow, startCol, dir)) {
      doPlace(grid, word, startRow, startCol, dir);
      placed = true;
    }
    // Değilse tekrar dene
  }
}

// Bu pozisyona kelimeyi koymak mümkün mü?
function canPlace(grid, word, startR, startC, dir) {
  const endR = startR + dir.dr * (word.length - 1);
  const endC = startC + dir.dc * (word.length - 1);

  // Izgara dışına çıkıyor mu?
  if (endR < 0 || endR >= ROWS) return false;
  if (endC < 0 || endC >= COLS) return false;

  // Her harfi kontrol et
  let rr = startR;
  let cc = startC;
  for (let i = 0; i < word.length; i++) {
    const existing = grid[rr][cc];
    const letter = word[i];
    // eğer bu hücre boşsa ya da harfler aynıysa yerleşebilir
    if (existing !== "" && existing !== letter) {
      return false;
    }
    rr += dir.dr;
    cc += dir.dc;
  }
  return true;
}

// Kelimeyi yerleştir
function doPlace(grid, word, startR, startC, dir) {
  let rr = startR;
  let cc = startC;
  for (let i = 0; i < word.length; i++) {
    grid[rr][cc] = word[i];
    rr += dir.dr;
    cc += dir.dc;
  }
}

// Boş yerleri rastgele harfle doldur
function fillBlanks(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[randInt(ALPHABET.length)];
      }
    }
  }
}

// Tek puzzle üret
function generateOnePuzzle() {
  const grid = createEmptyGrid();
  const words = pickWords();

  for (const w of words) {
    placeWord(grid, w);
  }
  fillBlanks(grid);

  return { grid, words };
}

// Ana fonksiyon
function main() {
  // Tek daily puzzle
  const daily = generateOnePuzzle();

  // 50 adet zen puzzle
  const zenPuzzles = [];
  for (let i = 0; i < ZEN_COUNT; i++) {
    const puzzle = generateOnePuzzle();
    zenPuzzles.push(puzzle);
  }

  // Çıktı
  const output = {
    dailyPuzzles: [
      {
        date: "2025-02-18",
        themeTitle: "Random Daily",
        hint: "Random puzzle of the day",
        grid: daily.grid,
        words: daily.words,
      },
    ],
    zenPuzzles,
  };

  // Kaydet
  const jsonStr = JSON.stringify(output, null, 2);
  fs.writeFileSync("puzzleData.json", jsonStr);
  console.log("puzzleData.json oluşturuldu!");
}

main();

