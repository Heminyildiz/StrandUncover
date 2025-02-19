/**
 * scripts/generatePuzzles.js
 *
 * Bu script, 7x6 boyutunda rastgele "word search" puzzle'ları üretir.
 * - Kelimeler çakışabilir (harfler uyuşuyorsa).
 * - Boş hücreleri rastgele harfle doldurur.
 * - 1 adet "dailyPuzzle", 100 adet "zenPuzzles" üretir.
 *
 * Terminalde çalıştır:
 *    node scripts/generatePuzzles.js
 * Ardından scripts klasöründe puzzleData.json oluşur.
 * Bunu public/puzzleData.json olarak kopyalayın.
 */

const fs = require("fs");

// Puzzle boyutu
const ROWS = 7;
const COLS = 6;

// Kaç puzzle (zenPuzzles) üretilecek
const ZEN_COUNT = 100;

// Kullanacağımız harf seti
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Kelime havuzu (3,4,6,7 harfli örnekler)
const WORD_POOL = [
  // 3 harfli kelimeler (100 tane)
  "SUN", "DOG", "CAT", "MAP", "HAT", "PEN", "CAR", "RUN", "TOP", "NET",
  "BAT", "RAY", "BUG", "POT", "BOX", "TIP", "LID", "BUS", "HOP", "WAX",
  "PIN", "VAN", "LOG", "BEE", "HEN", "OWL", "FOX", "TEA", "RIP", "EYE",
  "CAP", "CUP", "TOY", "RUG", "MUD", "ZIP", "TAP", "JAM", "FIG", "KEY",
  "BOW", "BAG", "EAR", "ARM", "LEG", "INK", "ORB", "DYE", "OAR", "EGG",
  "HUG", "MOP", "NOD", "BUG", "HIT", "JUG", "KIN", "LAG", "MEN", "NIP",
  "OIL", "PEW", "QUI", "ROD", "SIP", "TUG", "VOW", "WIG", "YAK", "ZAP",
  "ACE", "BAR", "DEN", "ELM", "FIN", "GEM", "HID", "JAY", "KID", "LOB",
  "MOB", "NUN", "OAT", "PET", "QUI", "RAM", "SUM", "TOM", "URN", "VIM",

  // 4 harfli kelimeler (100 tane)
  "MOON", "FISH", "JUMP", "WALK", "TREE", "FIRE", "HAND", "BELL", "ROCK", "STAR",
  "SAND", "WISH", "LOVE", "BLUE", "GRAY", "FORK", "WAVE", "DOOR", "RICE", "KITE",
  "LAMP", "BONE", "TANK", "YARD", "BEAR", "BIRD", "ROAD", "SEED", "WIND", "WOOD",
  "COAT", "LACE", "RACE", "TILE", "PEAR", "BOAT", "SNOW", "GIFT", "GOLD", "KING",
  "FIST", "TONE", "MINT", "PEAK", "CREW", "ZONE", "VEIN", "FALL", "QUIZ", "CORN",
  "BARK", "CHAR", "DEED", "ECHO", "FLIP", "GRIT", "HALO", "IRON", "JOLT", "KIND",
  "LUSH", "MOLE", "NEON", "OATH", "PLUM", "QUAD", "RISK", "SLIM", "TWIN", "ULTRA",
  "VIBE", "WARP", "XENO", "YULE", "ZEST", "BOLT", "CRAB", "DRUM", "ELAN", "FLEA",
  "GLUE", "HAZE", "IDOL", "JUMP", "KNOT", "LAMP", "MIND", "NERD", "OPUS", "PINE",

  // 5 harfli kelimeler (100 tane)
  "APPLE", "PEACH", "GRAPE", "CRASH", "SPILL", "PLANE", "TRAIN", "TABLE", "PHONE", "CHAIR",
  "BURST", "MUSIC", "MOVIE", "BOOKS", "CROSS", "BRAVE", "SOUND", "LIGHT", "CLOUD", "TIGER",
  "BREAD", "PIZZA", "PASTA", "SALAD", "SCORE", "STORY", "POWER", "STACK", "BLINK", "HEART",
  "WATER", "EARTH", "QUIET", "QUEST", "FLAME", "SPARK", "CANDY", "SUGAR", "WHALE", "SHARK",
  "SPICE", "THREAD", "FINAL", "LASER", "FLOAT", "STEAM", "CABLE", "BRAIN", "SMILE", "KNIFE",
  "SWORD", "SHINE", "SPRING", "MAJOR", "MINOR", "FRUIT", "GRASS", "WOODS", "FAITH", "GLASS",
  "EMPTY", "BRICK", "DAZZLE", "ROAST", "TOAST", "HONEY", "TRICK", "TRACE", "BUZZY", "GRIND",
  "POLAR", "DELTA", "MAGIC", "POINT", "FRESH", "BLAST", "GLARE", "CHIME", "WAVES", "FLOUR",
  "JOLLY", "LEMON", "MELOD", "NERVE", "ORBIT", "PIXEL", "QUICK", "RUMOR", "SOLID", "TWIST",

  // 6 harfli kelimeler (100 tane)
  "PLANET", "GARDEN", "FATHER", "MARKET", "BOTTLE", "JOURNY", "NARROW", "CANDLE", "LANTER", "BORDER",
  "BREEZE", "MIRROR", "WINDOW", "TUNNEL", "RABBIT", "SPHERE", "SILVER", "LITTLE", "BANANA", "YELLOW",
  "WINTER", "FISHER", "CANYON", "MIRAGE", "SINGER", "HUNTER", "WEALTH", "GLOWER", "THRILL", "CIRCUS",
  "MUSCLE", "FINGER", "BORDER", "ANCHOR", "JACKET", "GARDEN", "MARKER", "HUMMER", "BORDER", "JUNGLE",
  "DANGER", "STAPLE", "GOBLET", "CLOVER", "SCARAB", "VORTEX", "DUNGER", "MOTION", "SWEEPS", "TRAVEL",
  "ACTION", "BEACON", "CANDLE", "DUNGEA", "FABLES", "GLITCH", "HUNTER", "INVENT", "JOURNY", "KINDLE",
  "LANTER", "MIRAGE", "NATURE", "ORANGE", "PILLAR", "QUAKER", "ROCKET", "SUMMIT", "TUNNEL", "UPLIFT",

  // 7 harfli kelimeler (100 tane)
  "CAMPING", "CRYSTAL", "FANTASY", "GADGETS", "HISTORY", "LIBRARY", "MEADOWS", "NATURES", "OCTOPUS", "PIRATES",
  "RAINBOW", "TUNNELS", "VILLAGE", "WARRIOR", "ZODIACS", "JOURNEY", "HOLIDAY", "MOUNTAIN", "CANYONS", "GLACIER",
  "CIRCLES", "BOTTLES", "CUPCAKE", "TROUBLE", "TURMOIL", "FURTHER", "HUMMING", "IMPACTO", "SHADOWS", "SECRETS",
  "LANTERN", "JUNGLES", "DUNGEON", "VORTEXS", "MYSTERY", "CLOVERS", "JACKETS", "FURNACE", "NUGGETS", "TROPHYS",
  "MISSION", "CANYONS", "MUSICAL", "CANDLES", "BARRIER", "FLAMING", "SPLITTY", "GARLAND", "LANTERN", "VIBRANT",
  "GENESIS", "HEAVENS", "ICICLES", "JUBILEE", "KINGDOM", "LOCKETS", "MIRRORS", "NOMADIC", "OUTLAWS", "PHANTOM"
];


// Her puzzle'da kaç kelime olacak (10 - 18 arası)
const MIN_WORDS = 10;
const MAX_WORDS = 18;

// 8 yön
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

// Rastgele integer
function randInt(max) {
  return Math.floor(Math.random() * max);
}

// 10-18 kelime seç
function pickWords() {
  const howMany = MIN_WORDS + randInt(MAX_WORDS - MIN_WORDS + 1);
  const selected = [];
  for (let i = 0; i < howMany; i++) {
    const w = WORD_POOL[randInt(WORD_POOL.length)];
    selected.push(w.toUpperCase());
  }
  return selected;
}

// Boş 7x6 grid
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

// Kelimeyi grid'e yerleştir
function placeWord(grid, word) {
  let placed = false;
  let attempts = 0;
  while (!placed && attempts < 100) {
    attempts++;
    const startRow = randInt(ROWS);
    const startCol = randInt(COLS);
    const dir = DIRECTIONS[randInt(DIRECTIONS.length)];

    if (canPlace(grid, word, startRow, startCol, dir)) {
      doPlace(grid, word, startRow, startCol, dir);
      placed = true;
    }
  }
}

// Sığma ve çakışma kontrolü
function canPlace(grid, word, startR, startC, dir) {
  const endR = startR + dir.dr * (word.length - 1);
  const endC = startC + dir.dc * (word.length - 1);

  // Dışına çıkıyor mu?
  if (endR < 0 || endR >= ROWS) return false;
  if (endC < 0 || endC >= COLS) return false;

  // Her harfi kontrol et
  let rr = startR;
  let cc = startC;
  for (let i = 0; i < word.length; i++) {
    const existing = grid[rr][cc];
    const letter = word[i];
    if (existing !== "" && existing !== letter) {
      return false;
    }
    rr += dir.dr;
    cc += dir.dc;
  }
  return true;
}

// Grid'e harfleri yaz
function doPlace(grid, word, startR, startC, dir) {
  let rr = startR;
  let cc = startC;
  for (let i = 0; i < word.length; i++) {
    grid[rr][cc] = word[i];
    rr += dir.dr;
    cc += dir.dc;
  }
}

// Boş yerleri rastgele harf
function fillBlanks(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[randInt(ALPHABET.length)];
      }
    }
  }
}

// Tek puzzle
function generateOnePuzzle() {
  const grid = createEmptyGrid();
  const words = pickWords();

  for (const w of words) {
    placeWord(grid, w);
  }
  fillBlanks(grid);

  return { grid, words };
}

function main() {
  // Tek daily puzzle
  const daily = generateOnePuzzle();

  // 100 Zen puzzle
  const zenPuzzles = [];
  for (let i = 0; i < ZEN_COUNT; i++) {
    const p = generateOnePuzzle();
    zenPuzzles.push(p);
  }

  // JSON
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

  const jsonStr = JSON.stringify(output, null, 2);
  fs.writeFileSync("puzzleData.json", jsonStr);
  console.log("puzzleData.json oluşturuldu!");
}

main();


