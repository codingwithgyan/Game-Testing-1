window.addEventListener("load", function () {
  /** @type {CanvasRenderingContext2D} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  const CANVAS_WIDTH = (canvas.width = 1200);
  const CANVAS_HEIGHT = (canvas.height = 600);
  const btn = document.getElementById("btn");
  btn.addEventListener("click",function(){
    window.location.reload();
  });
  let gameScore = 0;
  let gameOver = false;
  let isActive = false;
  let jumSound = new Audio("./audio/jump.wav");
  let musicSound = new Audio("./audio/music.ogg");
  let explodeSound = new Audio("./audio/explode.wav");
  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener("keydown", (e) => { 
        if(e.keyCode === 32 && gameOver)
        {
          restartGame();
        }
        else if (
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === " ") &&
          this.keys.indexOf(e.key) === -1
        )
        {
          this.keys.push(e.key);
        }
      });

      window.addEventListener("keyup", (e) => {
        if (
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === " "
        )
          this.keys.splice(this.keys.indexOf(e.key), 1);
      });

    }
  }

  class Player {
    constructor(width, height) {
      this.image = new Image();
      this.image.src = "./image/shadow_dog.png";
      this.gameWidth = width;
      this.gameHeight = height;
      this.spriteWidth = 575;
      this.spriteHeight = 523;
      this.width = Math.floor(this.spriteWidth / 5);
      this.height = Math.floor(this.spriteHeight / 5);
      this.x = this.gameWidth / 2 - this.width - 300;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.frameY = 3;
      this.speed = 0;
      this.velocity = 0;
      this.weight = 1;

      this.fps = 40;
      this.maxFrame = 9;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
    }
    restart()
    {
      this.x = this.gameWidth / 2 - this.width - 300;
      this.y = this.gameHeight - this.height;
      this.maxFrame = 9;
      this.frameX = 0;
      this.frameY = 3;
    }
    update(input, deltaTime, enemyArr) {
      // Collision Detection
      enemyArr.forEach((enemy) => {
        const dx = (enemy.x+enemy.width/2-20) - (this.x+this.width/2);
        const dy = (enemy.y+enemy.height/2) - ((this.y+this.height/2)+10);
        const distance = Math.sqrt(dx * dx+ dy * dy);
        const radius= enemy.width/3 + this.width/3;
        if(distance < radius)
        {
          gameOver = true;
        }
      });

      // Player animation
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame - 1) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      // Key Controls
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if (
        (input.keys.indexOf("ArrowUp") > -1 || input.keys.indexOf(" ") > -1) &&
        this.onGround()
      ) {
        this.velocity -= 20;
        console.log("iactive",isActive);
        if(!isActive)
        {
          musicSound.play();
          // musicSound.loop();
          musicSound.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
          isActive = true;
        }
        jumSound.play();
        
      } else {
        this.speed = 0;
      }

      // Setting X-axis Movement
      this.x += this.speed;
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

      // Setting Y-axis Movement
      this.y += this.velocity;
      if (!this.onGround()) {
        this.velocity += this.weight;
        this.frameY = 1;
        this.maxFrame = 7;
      } else {
        this.velocity = 0;
        this.frameY = 3;
        this.maxFrame = 9;
      }

      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
      // context.strokeStyle = "white";
      // context.beginPath();
      // context.arc(this.x+this.width/2,(this.y+this.height/2)+10,this.width/3,0,Math.PI*2);
      // context.stroke();
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    constructor(width, height) {
      this.x = 0;
      this.y = 0;
      this.gameWidth = width;
      this.gameHeight = height;
      this.image = new Image();
      this.image.src = "./image/background_single.png";
      this.width = 2400;
      this.height = 720;
      this.speed = 3;
    }
    restart()
    {
      this.x = 0;
    }
    update() {
      this.x -= this.speed;
      if (this.x < -this.width) this.x = 0;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Enemy {
    constructor(width, height) {
      this.gameWidth = width;
      this.gameHeight = height;
      this.image = new Image();
      this.image.src = "./image/enemy_1.png";
      this.spriteWidth = 160;
      this.spriteHeight = 119;
      this.frameX = 0;
      this.maxFrame = 6;
      this.width = this.spriteWidth / 1.5;
      this.height = this.spriteHeight / 1.5;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;

      this.fps = 20;
      this.frameInterval = 1000 / this.fps;
      this.framTimer = 0;
      this.speed = Math.random() * 5 + 3;
      this.markForDeletion = false;
    }
    update(deltaTime) {
      if (this.framTimer >= this.frameInterval) {
        if (this.frameX >= this.maxFrame - 1) this.frameX = 0;
        else this.frameX++;
        this.framTimer = 0;
      } else {
        this.framTimer += deltaTime;
      }

      this.x -= this.speed;
      if (this.x < -this.width) {
        this.markForDeletion = true;
        gameScore++;
      }
    }
    draw(context) {
     
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );

      // context.strokeStyle = "white";
      // context.beginPath();
      // context.arc(this.x+this.width/2-20,this.y+this.height/2,this.width/3,0,Math.PI*2);
      // context.stroke();

    }
  }

  function displayScore(ctx) {
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.font = "40px Courier New";
    ctx.fillText("Score : " + gameScore, 20, 50);

    ctx.fillStyle = "white";
    ctx.font = "40px Courier New";
    ctx.fillText("Score : " + gameScore, 22, 52);
  }

  function handleGameOver() {
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.font = "bold 50px Courier New";
    ctx.fillText("Game Over: Try Again!", CANVAS_WIDTH / 2, 200);

    ctx.fillStyle = "white";
    ctx.font = "bold 50px Courier New";
    ctx.fillText("Game Over: Try Again!", CANVAS_WIDTH / 2, 203);
    explodeSound.play();
    musicSound.pause();
  }


  let enemyArr = [];
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomInterval = Math.random() * 2000 + 500;
  function handleEnemy(ctx, deltaTime) {
    if (enemyTimer > enemyInterval + randomInterval) {
      enemyArr.push(new Enemy(CANVAS_WIDTH, CANVAS_HEIGHT));
      enemyTimer = 0;
      randomInterval = Math.random() * 2000 + 500;
    } else {
      enemyTimer += deltaTime;
    }
    enemyArr.forEach((enemy) => {
      enemy.update(deltaTime);
      enemy.draw(ctx);
    });
    enemyArr = enemyArr.filter((enemy) => !enemy.markForDeletion);
  }

  const input = new InputHandler();
  const player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT);
  const background = new Background(CANVAS_WIDTH, CANVAS_HEIGHT);
  let lastTime = 0;



  function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    background.update();
    background.draw(ctx);
    handleEnemy(ctx, deltaTime);
    player.update(input, deltaTime, enemyArr);
    player.draw(ctx);
    displayScore(ctx);
    if (!gameOver) requestAnimationFrame(animate);
    else{handleGameOver(ctx); return;};
  }
  animate(0);
  function restartGame()
  {
      gameOver = false;
      enemyArr = [];
      gameScore = 0;
      player.restart();
      background.restart();
      console.log(gameOver)
      musicSound.play().catch(error=>{
        console.log(error); 
      });
      animate(0);
  }
});

