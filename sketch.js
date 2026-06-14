let symbols = [
  "🍄","🍄","🍄","🍄","🍄","🍄","🍄","🍄","🍄","🍄",
  "🌷","🌷","🌷","🌷","🌷","🌷","🌷",
  "🌞","🌞","🌞","🌞","🌞",
  "🦋","🦋","🦋","🦋",
  "💐","💐","💐",
  "🍁","🍁",
  "🌹",
];

let reels = [
  ["?", "?", "?"],
  ["?", "?", "?"],
  ["?", "?", "?"]
];

let reelStopTime = [0, 50, 100];
let reelDone = [false, false, false];

let jackpotTriggered = false;
let fullGridJackpot = false;

let spinning = false;
let spinTime = 0;
let resultText = "";

let startingCredits = 5000;
let credits = 500;
let bet = 10;

let totalWinnings = 0;
let winCount = 0;

const MAX_MULTIPLIER = 40;

let winningLines = [];
let scaleFactor;

// LONG PRESS RESET
let pressStartTime = 0;
let isPressing = false;
const LONG_PRESS_DURATION = 3000;

function getRandomSymbol() {
  return random(symbols);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont("Times New Roman");

  let savedCredits = localStorage.getItem("slotCredits");
  credits = savedCredits !== null ? int(savedCredits) : 500;
  startingCredits = credits;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateScale() {
  scaleFactor = min(width / 400, height / 800);
}

function draw() {
  updateScale();
  background(30);

  // Title
  fill(255);
  textSize(30 * scaleFactor);
  textStyle(BOLD);
  text("Slot Machine Mobile", width / 2, 40 * scaleFactor);

  // Credits / Bet
  textSize(20 * scaleFactor);
  text("Credits: " + credits, width * 0.25, 90 * scaleFactor);
  text("Bet: " + bet, width * 0.75, 90 * scaleFactor);

  textSize(15);
  text("What’s gambling really costing you?", width / 2, width/4);
  text("Bet with your head not over it.", width/2, width/4 + width/20);

  drawReels();
  drawButtons();

  fill(255, 215, 0);
  textSize(30 * scaleFactor);
  text(resultText, width / 2, height * 0.7);

  handleSpinning();

  // ✅ LONG PRESS RESET CHECK
  if (isPressing) {
    let heldTime = millis() - pressStartTime;

    if (heldTime >= LONG_PRESS_DURATION) {
      doReset();
      isPressing = false;
    }
  }
}

function drawReels() {
  let spacing = 90 * scaleFactor;
  let startX = width / 2 - spacing;
  let startY = height / 2 - spacing;

  textSize(50 * scaleFactor);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let x = startX + col * spacing;
      let y = startY + row * spacing;

      if (isWinningCell(row, col)) {
        fill(255, 215, 0, 120);
        rect(x - 35 * scaleFactor, y - 35 * scaleFactor, 70 * scaleFactor, 70 * scaleFactor, 10);
      }

      fill(255);
      text(reels[row][col], x, y);
    }
  }
}

function drawButtons() {
  let btnW = width * 0.35;
  let btnH = height * 0.08;

  // SPIN
  fill(100, 200, 100);
  rect(width / 2 - btnW / 2, height - btnH - 20, btnW, btnH, 20);
  fill(0);
  textSize(25 * scaleFactor);
  text("SPIN", width / 2, height - btnH / 2 - 20);

  // -
  fill(255, 100, 100);
  rect(width * 0.1, height - btnH - 20, btnH, btnH, 20);
  fill(0);
  text("-", width * 0.1 + btnH / 2, height - btnH / 2 - 20);

  // +
  fill(100, 150, 255);
  rect(width * 0.9 - btnH, height - btnH - 20, btnH, btnH, 20);
  fill(0);
  text("+", width * 0.9 - btnH / 2, height - btnH / 2 - 20);
}

function touchStarted() {
  pressStartTime = millis();
  isPressing = true;

  handleInput(mouseX, mouseY);
  return false;
}

function mousePressed() {
  pressStartTime = millis();
  isPressing = true;

  handleInput(mouseX, mouseY);
}

function touchEnded() {
  isPressing = false;
}

function mouseReleased() {
  isPressing = false;
}

function handleInput(x, y) {
  let btnW = width * 0.35;
  let btnH = height * 0.08;

  // SPIN
  if (
    x > width / 2 - btnW / 2 &&
    x < width / 2 + btnW / 2 &&
    y > height - btnH - 20 &&
    y < height - 20
  ) {
    if (!spinning && credits >= bet) {
      startSpin();
    }
  }

  // +
  if (
    x > width * 0.9 - btnH &&
    x < width * 0.9 &&
    y > height - btnH - 20 &&
    y < height - 20
  ) {
    bet += 5;
  }

  // -
  if (
    x > width * 0.1 &&
    x < width * 0.1 + btnH &&
    y > height - btnH - 20 &&
    y < height - 20
  ) {
    bet = max(5, bet - 5);
  }
}

function doReset() {
  localStorage.removeItem("slotCredits");
  localStorage.removeItem("slotStartingCredits");

  credits = 500;
  startingCredits = 500;
  bet = 10;

  resultText = "RESET";
}

function startSpin() {
  spinning = true;
  spinTime = 0;
  resultText = "";
  credits -= bet;
  winningLines = [];

  jackpotTriggered = random(1) <  0.0001; //1 in a million for each square
  fullGridJackpot = random(1) < 0.0015;
}

function handleSpinning() {
  if (!spinning) return;

  spinTime++;

  for (let col = 0; col < 3; col++) {
    if (!reelDone[col]) {

      if (spinTime % 5 === 0) {
        for (let row = 0; row < 3; row++) {
          reels[row][col] = getRandomSymbol();
        }
      }

      if (spinTime > 60 + reelStopTime[col]) {
        reelDone[col] = true;
      }
    }
  }

  if (reelDone.every(r => r)) {
    spinning = false;
    reelDone = [false, false, false];

    if (jackpotTriggered) {
      reels[floor(random(3))][floor(random(3))] = "🌸";
    }

    if (fullGridJackpot) {
      let s = random(symbols);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          reels[r][c] = s;
        }
      }
    }

    checkWin();
  }
}

function checkWin() {
  if (fullGridJackpot) {
    let winnings = floor(bet * 20);
    credits += winnings;
    totalWinnings += winnings;
    winCount++;
    resultText = "FULL GRID JACKPOT!";
    saveStats();
    fullGridJackpot = false;
    return;
  }

  if (jackpotTriggered) {
    let winnings = 1000000;
    credits += winnings;
    totalWinnings += winnings;
    winCount++;
    resultText = "🌸 JACKPOT!";
    jackpotTriggered = false;
    saveStats();
    return;
  }

  let lines = [];

  for (let r = 0; r < 3; r++) {
    lines.push([reels[r][0], reels[r][1], reels[r][2]]);
  }

  for (let c = 0; c < 3; c++) {
    lines.push([reels[0][c], reels[1][c], reels[2][c]]);
  }

  lines.push([reels[0][0], reels[1][1], reels[2][2]]);
  lines.push([reels[0][2], reels[1][1], reels[2][0]]);

  let totalMultiplier = 0;
  winningLines = [];

  for (let i = 0; i < lines.length; i++) {
    let [a, b, c] = lines[i];
    if (a === b && b === c) {
      totalMultiplier += getMultiplier(a);
      winningLines.push(i);
    }
  }

  totalMultiplier = min(totalMultiplier, MAX_MULTIPLIER);

  let winnings = floor(bet * totalMultiplier);

  resultText = winnings > 0 ? "WIN x" + totalMultiplier : "Try again!";
  credits += winnings;

  saveStats();
}

function isWinningCell(row, col) {
  let lines = [
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]],
    [[0,2],[1,1],[2,0]]
  ];

  for (let i of winningLines) {
    for (let pos of lines[i]) {
      if (pos[0] === row && pos[1] === col) return true;
    }
  }
  return false;
}

function getMultiplier(symbol) {
  if (symbol === "🌹") return 30;
  if (symbol === "🍁") return 10;
  if (symbol === "💐") return 5;
  if (symbol === "🦋") return 4;
  if (symbol === "🌞") return 3;
  if (symbol === "🌷") return 2;
  if (symbol === "🍄") return 2;
  return 0;
}

function saveStats() {
  localStorage.setItem("slotCredits", credits);
}
