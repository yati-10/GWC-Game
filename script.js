// Arrow keys to move and collect coins
let player, ground, platforms, coins, monsters;
let score = 0;
let gameState = "home";
let levelButtons = [];
let grassBg, iceBg, lavaBg, sandBg;
let blockImg, guyImg, coinImg, monsterImg;
let homeBg, homeButton;

// Just adding a time pressure
let levelTime = 20;
let timeLeft = levelTime;
let timerActive = false;

function preload() {
  monsterImg = loadImage('assets/monster.png');
  grassBg = loadImage('assets/Grass.png');
  iceBg = loadImage('assets/Ice.png');
  lavaBg = loadImage('assets/Lava.png');
  sandBg = loadImage('assets/Sand.png');
  blockImg = loadImage('assets/Block.png');
  guyImg = loadImage('assets/Guy.png');
  coinImg = loadImage('assets/coin.jpg');
  homeBg = loadImage('assets/Home.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.gravity.y = 8.5;
  monsterImg.resize(60, 0); // probably need to adjust monster size

  // off-screen until game starts
  player = new Sprite(80, height - 200, 50, 50);
  player.img = guyImg;
  player.img.resize(70, 80);
  player.rotationLock = true;
  player.visible = false;

  // Ground 
  ground = new Sprite(width / 2, height - 20, width + 800, 40, "s");
  ground.color = color(188, 158, 130);
  ground.friction = 0;
  ground.visible = false;

  // Blocks
  platforms = new Group();
  platforms.collider = "s";
  platforms.friction = 0;

  coins = new Group();
  coins.collider = "k";

  monsters = new Group();
  monsters.friction = 0;
  monsters.collider = "k";

  player.overlaps(coins, collect); // grabs coins

  createHomeButtons(); // Home
}

function draw() {
  if (gameState === "home") {
    background(homeBg);
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(18);
    textStyle(BOLD);
    text(
      "Collect all the coins \nin time, to save the world.\nBe sure to not fall or \nget eaten by the monsters!",
      width * 0.9,
      height / 1.8
    );
    fill('#2e180e');
    textAlign(RIGHT, CENTER);
    textSize(40);
    textStyle(BOLD);
    text(
      "Hope's Message",
      width * 0.9,
      height / 2.7
    );

    
  } else if (gameState.startsWith("level")) {
    // Handles different themes
    switch (gameState) {
      case "level1":
        background(grassBg);
        break;
      case "level2":
        background(iceBg);
        break;
      case "level3":
        background(lavaBg);
        break;
      case "level4":
        background(sandBg);
        break;
    }

    fill(0);
    textAlign(LEFT);
    textSize(28);
    text("COins = " + score, 20, 60);
    textSize(20);
    text("Collect all 10 coins to win!", 20, 30);

    // Countdown 
    if (timerActive) {
      timeLeft -= deltaTime / 1000;
      if (timeLeft <= 0) {
        timeLeft = 0;
        timerActive = false;
        reset(); // start over on timeout
      }
    }

    fill(0);
    textAlign(RIGHT, TOP);
    textSize(28);
    text("Time: " + Math.ceil(timeLeft), width - 20, 20);

    // Move controls
    if (kb.pressing("up")) player.vel.y = -4.5;
    if (kb.pressing("left")) player.vel.x = -3;
    else if (kb.pressing("right")) player.vel.x = 3;
    else player.vel.x = 0;

    // Keep player inside
    player.x = constrain(player.x, 20, 4000);
    if (player.y < 20) player.y = 20;

    for (let m of monsters) {
      if (player.collides(m) || player.collides(ground)) {
        reset();
        break;
      }

      // Making monster bounce
      if (m.x < camera.x - width / 2 + 100 || m.x > camera.x + width / 2 - 100) m.vel.x *= -1;
      if (m.y < 100 || m.y > height - 50) m.vel.y *= -1;
    }
    if (score === 10) {
      youWin();
    }
    camera.x = player.x + 150;
    ground.x = camera.x;
  }
}

function createHomeButtons() {
  const numButtons = 4;
  const btnW = width * 0.15; 
  const btnH = height * 0.09;
  const spacing = width * 0.025;

  const totalW = numButtons * btnW + (numButtons - 1) * spacing;
  const xStart = width / 2 - totalW / 2;
  const y = height * 0.82;

  const levelNames = ["Level 1", "Level 2", "Level 3", "Level 4"];

  for (let i = 0; i < numButtons; i++) {
    let btn = createButton("");
    btn.size(btnW, btnH);
    btn.position(xStart + i * (btnW + spacing), y);
    btn.style("background-color", "transparent");
    btn.style("border", "none");
    btn.style("cursor", "pointer");
    btn.mousePressed(() => startLevel(i + 1));
    levelButtons.push(btn);
  }
}


function startLevel(levelNum) {
  gameState = "level" + levelNum;
  levelButtons.forEach(btn => btn.remove());

  player.visible = true;
  ground.visible = true;
  score = 0;

  timeLeft = levelTime;
  timerActive = true;

  if (levelNum === 1) loadLevel1();
  else if (levelNum === 2) loadLevel2();
  else if (levelNum === 3) loadLevel3();
  else if (levelNum === 4) loadLevel4();
}

function reset() {
  score = 0;

  // Replay current level
  switch (gameState) {
    case "level1":
      loadLevel1();
      break;
    case "level2":
      loadLevel2();
      break;
    case "level3":
      loadLevel3();
      break;
    case "level4":
      loadLevel4();
      break;
  }

  timeLeft = levelTime;
  timerActive = true;
}

function youWin() {
  monsters.removeAll(); // wipe 
  player.x = 6000; // off-screen 

  timerActive = false;

  textSize(40);
  fill(0);
  text("You win!", width / 2 + 75, height / 2 - 50);

  if (!homeButton) {
    homeButton = createButton("Return to Home");
    homeButton.position(width / 2 - 90, height / 2);
    homeButton.size(180, 50);
    homeButton.style("background-color", "#4CAF50");
    homeButton.style("color", "black");
    homeButton.style("font-size", "18px");
    homeButton.style("cursor", "pointer");
    homeButton.mousePressed(() => {
      gameState = "home";
      homeButton.remove();
      homeButton = null;
      player.visible = false;
      ground.visible = false;
      monsters.removeAll();
      createHomeButtons();
    });
  }
}

function collect(player, coin) {
  coin.remove();
  score++;
}

function addPlatform(x, y, w, h) {
  let plat = new platforms.Sprite(x, y, w, h);
  plat.img = blockImg;
  blockImg.resize(w, h); //resizing every time: not good
  return plat;
}

function addMonster(x, y, vx = 0, vy = 0) {
  let creep = new monsters.Sprite(monsterImg, x, y, "k");
  creep.vel.x = vx;
  creep.vel.y = vy;
  return creep;
}

function placeCoins(positions) {
  for (let posX of positions) {
    let c = new coins.Sprite(posX, height - 350, 15);
    c.img = coinImg;
    c.scale = 0.1;
  }
}


function loadLevel1() {
  platforms.removeAll();
  coins.removeAll();
  monsters.removeAll();
  player.x = 80;
  player.y = height - 200;

  addPlatform(300, height - 120, 120, 30);
  addPlatform(600, height - 200, 150, 30);
  addPlatform(900, height - 300, 150, 30);
  addPlatform(1200, height - 180, 200, 30);
  addPlatform(1500, height - 120, 100, 30);
  addPlatform(1800, height - 250, 180, 30);
  addPlatform(2200, height - 180, 180, 30);
  addPlatform(2500, height - 100, 150, 30);

  placeCoins([300, 600, 900, 1200, 1500, 1800, 2000, 2200, 2400, 2600]);
  addMonster(1600, height - 200, 0, 2);
  addMonster(2600, height - 200, 0, 2);
}

function loadLevel2() {
  platforms.removeAll();
  coins.removeAll();
  monsters.removeAll();
  player.x = 100;
  player.y = height - 200;
  addPlatform(300, height - 150, 100, 20);
  addPlatform(600, height - 240, 100, 20);
  addPlatform(900, height - 320, 100, 20);
  addPlatform(1200, height - 220, 120, 20);
  addPlatform(1500, height - 180, 100, 20);
  addPlatform(1800, height - 260, 100, 20);
  addPlatform(2100, height - 140, 100, 20);
  addPlatform(2400, height - 220, 100, 20);
  addPlatform(2700, height - 300, 100, 20);
  placeCoins([320, 620, 940, 1240, 1540, 1840, 2120, 2300, 2500, 2700]);
  addMonster(1600, height - 200, 0, 2);
  addMonster(2000, height - 200, 0, 2);
  addMonster(2600, height - 200, 0, 2);
}

function loadLevel3() {
  platforms.removeAll();
  coins.removeAll();
  monsters.removeAll();
  player.x = 100;
  player.y = height - 300;

  addPlatform(400, height - 150, 100, 20);
  addPlatform(700, height - 300, 100, 20);
  addPlatform(1000, height - 400, 100, 20);
  addPlatform(1300, height - 300, 100, 20);
  addPlatform(1600, height - 200, 100, 20);
  addPlatform(1900, height - 150, 100, 20);
  addPlatform(2200, height - 120, 100, 20);
  addPlatform(2500, height - 100, 100, 20);

  placeCoins([420, 720, 1020, 1320, 1620, 1920, 2100, 2300, 2500, 2700]);
  addMonster(1400, height - 200, 0, 2);
  addMonster(2000, height - 200, 0, 2);
  addMonster(2600, height - 200, 0, 2);
  addMonster(2700, height - 200, 0, 2);
}


function loadLevel4() {
  platforms.removeAll();
  coins.removeAll();
  monsters.removeAll();
  player.x = 50;
  player.y = height - 400;

  addPlatform(300, height - 300, 80, 20);
  addPlatform(600, height - 310, 80, 20);
  addPlatform(900, height - 320, 80, 20);
  addPlatform(1200, height - 300, 80, 20);
  addPlatform(1500, height - 270, 80, 20);
  addPlatform(1800, height - 250, 80, 20);
  addPlatform(2100, height - 200, 80, 20);
  addPlatform(2400, height - 150, 80, 20);
  addPlatform(2700, height - 120, 80, 20);

  placeCoins([300, 600, 900, 1200, 1500, 1800, 2100, 2300, 2500, 2800]);
  addMonster(1000, height - 200, 0, 2);
  addMonster(1200, height - 200, 0, 2);
  addMonster(1600, height - 200, 0, 2);
  addMonster(2400, height - 200, 0, 2);
  addMonster(2800, height - 200, 0, 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gameState === "home") {
    levelButtons.forEach(btn => btn.remove());
    levelButtons = [];
    createHomeButtons();
  }
  if (homeButton) {
    homeButton.position(width / 2 - 90, height / 2);
  }
}