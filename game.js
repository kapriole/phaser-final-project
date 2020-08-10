    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: "game",
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 300 },
                debug: false// what happens here?
            }
        },
        scene: {
            key: 'game',
            preload: preload,
            create: create,
            update: update,
        },
};

const game = new Phaser.Game(config);

    let map;
    let groundLayer;
let player;
    let stars;
let antidote;
let phone; // define phone in create ...
    let bombs;
    let platforms;
let obstacles;
    let cursors;
    let score = 0;
    let life = 0;
let gameOver = false;
let phonecallanswer = false;
let winner = true;

    let scoreText;
let gameStart = false;
let title;
let soundbite;
let soundcough;
let soundobstacle;
let soundemergency;
let soundgame;
let soundphone;
let soundmom;
let soundantidote;


function preload() {
    /// load assets
    //this.load.image("title", "assets/images/title.png");
    this.load.image("star", "assets/star.png"); //pizza
    this.load.image("bomb", "assets/bomb.png"); //corona
    this.load.image("antidote", "assets/antidote.png");
    this.load.image("phone", "assets/phone.png");
    this.load.image("phonescreen", "assets/phonescreen.png"); // add the phone screen mom is calling!!
    this.load.image("winner", "assets/end.png");

    // Load player animations from the player spritesheet and atlas JSON / or atlas
    this.load.spritesheet("dude", "assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
    });

    this.load.image("enemy", "assets/enemy.png");

    /// GAMEOVER
    this.load.image("gameover", "assets/gameover.png");

    /// LOADING MY TILES
    this.load.image("background", "assets/tilemaps/urban_night_black.png"); // I dont think I need this
    //this.load.image("obstacle", "assets/tilemaps/toxic_water.png"); // the cactuses are also obstacle / just hide the same object behind?
    //this.load.image("water", "assets/tilemaps/water.png");
    this.load.image("tiles", "assets/tilemaps/corona_tiles.png");
    this.load.tilemapTiledJSON("map", "assets/tilemaps/level_one.json");

    // also add every element so phaser can render it

    // moving platform
    this.load.image("block", "assets/platform.png");

    /////////// SOUNDS
    // sound effects
    //this.load.audio('bg', [this.p('audio/bg.mp3'),this.p('audio/bg.ogg')]);
    this.load.audio("bite", ["sound/bite.wav"]);
    this.load.audio("cough", ["sound/cough.wav"]);

    this.load.audio("obstacle", ["sound/cough.wav"]);
    this.load.audio("emergency", ["sound/emergency.mp3"]);
    // intro sounds
    // this.load.audio("intro", ["sound/intro.mp3"]); // debris
    this.load.audio("game", ["sound/game.mp3"]); // abyssal
    this.load.audio("phone", ["sound/phone.wav"]); 
    this.load.audio("antidote", ["sound/antidote.wav"]);
    this.load.audio("mom", ["sound/mom.wav"]); // abyssal
}
function create() {

                       const map = this.make.tilemap({ key: "map" });
                       const tileset = map.addTilesetImage(
                           "corona_tiles",
                           "tiles"
    );
                       //this must be the same name as the file inside tiled/the loaded image
                       //let obstacles = map.addTilesetImage("toxic_water", "obstacle");

                       // check what exactly is platformer?
                       const backGroundPicture = map.addTilesetImage(
                           "urban_night_black",
                           "background"
                       );

                       const backgroundLayer = map.createDynamicLayer(
                           "Background",
                           backGroundPicture,
                           0,
                           0
                       );

                       console.log("tileset", tileset);

                       const platforms = map.createDynamicLayer(
                           "Platforms",
                           tileset,
                           0,
                           0
                       );

                       platforms.setCollisionByExclusion([-1]);

                       /// add obstacels

                       obstacles = map.createDynamicLayer(
                           "Obstacles",
                           tileset,
                           0,
                           0
                       );

                       obstacles.setCollisionByExclusion([-1]);

                       /*
            
            obstacles = this.physics.add.group({
                key: "obstacle",
                allowGravity: false,
                immovable: true,
            });


            const obstacleObjects = map.getObjectLayer("Toxic")["objects"]; // check this Layer name is "Toxic" and another property is objects
            console.log("obstacleObjects", obstacleObjects);

                */

                       /// obstacleObjects has all the objects in it but they have no name

                       /*
            obstacleObjects.forEach((obstacleObject) => {
                // Add new spikes to our sprite group, change the start y position to meet the platform
                const obstacle = obstacles
                    .create(
                        obstacleObject.x,
                        obstacleObject.y - obstacleObject.height,
                        "obstacle"
                    )
                    .setOrigin(0, 0);
                obstacle.body
                    .setSize(obstacle.width, obstacle.height - 20)
                    .setOffset(0, 20);
            });
            */

                       //// add rotating plaforms

                       // set coliision with player Collision with Player

                       // set the boundaries of our game world
                       this.physics.world.bounds.width = platforms.width;
                       this.physics.world.bounds.height = platforms.height;

                       // The player and its settings
                       player = this.physics.add.sprite(100, 300, "dude");
                       player.setBounce(0.1);
                       player.setCollideWorldBounds(true);

                       // in case I have to resize
                       player.body.setSize(
                           player.width -10,
                           player.height - 18
                       );

                       //  Our player animations, turning, walking left and walking right.
                       this.anims.create({
                           key: "left",
                           frames: this.anims.generateFrameNumbers("dude", {
                               start: 0,
                               end: 3,
                           }),
                           frameRate: 12,
                           repeat: -1,
                       });

                       this.anims.create({
                           key: "turn",
                           frames: [{ key: "dude", frame: 4 }],
                           frameRate: 20,
                       });

                       this.anims.create({
                           key: "right",
                           frames: this.anims.generateFrameNumbers("dude", {
                               start: 5,
                               end: 8,
                           }),
                           frameRate: 12,
                           repeat: -1,
                       });

                       //  Input Events
                       cursors = this.input.keyboard.createCursorKeys();

                       //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
                       stars = this.physics.add.group({
                           key: "star",
                           repeat: 4, // use to be 11
                           setXY: { x: 12, y: 0, stepX: 70 }, // use player position
                       });


    /// add antidote
    antidote = this.physics.add.group({
                           key: "antidote",
                           repeat: 0, // use to be 11
                           setXY: { x: 1500, y: 0, stepX: 70 }, // use player position
                       });

                         /// add antidote
    phone = this.physics.add.group({
                           key: "phone",
                           repeat: 0, // use to be 11
                           setXY: { x: 650, y: 0, stepX: 70 }, // use player position
    });

                       
                       

                       stars.children.iterate(function (child) {
                           //  Give each star a slightly different bounce
                           child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                       });

                       bombs = this.physics.add.group();

                       // you have to set this after you created the object
                       this.physics.add.collider(platforms, player);
                       this.physics.add.collider(platforms, stars);
                       this.physics.add.collider(platforms, bombs);
                     
    
                       this.physics.add.collider(obstacles, player);

                       // why is obstacle undefined?

                       //  The score
                       scoreText = this.add.text(16, 16, "score: 0", {
                           visibility: "visible",
                           fontFamily: "font1",
                           fontSize: "32px",
                           fill: "#f111d4",
                       });

                       scoreText.setScrollFactor(0);

                       /// why does score disappear?

                       //  The score
                       scoreTextLife = this.add.text(32, 32, "<3: 0", {
                           visibility: "hidden",
                           fontFamily: "font1",
                           fontSize: "32px",
                           fill: "#f111d4",
                       });

                       scoreTextLife.setScrollFactor(0);

                       /// do the same with platforms and everything that colides

                       //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
                       this.physics.add.overlap(
                           player,
                           stars,
                           collectStar,
                           null,
                           this
                       );

                       this.physics.add.collider(
                           player,
                           bombs,
                           hitBomb,
                           null,
                           this
                       );
                        /*
             this.physics.add.collider(
                           player,
                           phone,
                           getPhoneCall,
                           null,
                           this
                       );
                       */

              this.physics.add.collider(
                player,
                obstacles,
                playerCough, // ring!!!
                null,
                this
            );

            
              this.physics.add.collider(
                  player,
                  antidote,
                  playerWins, // ring!!!
                  null,
                  this
              );

               this.physics.add.collider(
                  player,
                  enemy,
                  socialContact, // ring!!!
                  null,
                  this
              );
    


        
            /*
            Create platforms at the point locations in the "Platform Locations" layer created in Tiled
            map.getObjectLayer("Platform Locations").objects.forEach(point => {
                createRotatingPlatform(this, point.x, point.y);
            });
            */

    /// add some more plattform thruout the game
  
    // check the coordinates
        
        let block = this.physics.add
            .image(150, 330, "block")
            .setImmovable(true)
            .setVelocity(100, -100);

        block.body.setAllowGravity(false);

        let tween = this.tweens.add({
            targets: block,
            x: 300,
            ease: "Power1",
            duration: 3000,
            flipY: false,
            yoyo: true,
            repeat: -1,
        });
    
    let block2 = this.physics.add
        .image(1200, 1330, "block")
        .setImmovable(true)
        .setVelocity(100, -100);

    block2.body.setAllowGravity(false);

    let tween2 = this.tweens.add({
        targets: block2,
        x: 300,
        ease: "Power1",
        duration: 3000,
        flipY: false,
        yoyo: true,
        repeat: -1,
    });


    /// create a tween for the enemies
  let  enemy = this.physics.add.image(1500, 0, "enemy");// where to put the enemy?
 // coordinates / velocity-
   enemy.setBounce(0.1);
   enemy.setCollideWorldBounds(true);

   // in case I have to resize
   enemy.body.setSize(enemy.width - 10, enemy.height - 18);

    let tween3 = this.tweens.add({
        targets: enemy,
        x: 1300,
        ease: "Bounce.InOut",
        duration: 3000,
        flipX: true,
        yoyo: true,
        repeat: -1,
    });
                
   


                       this.physics.add.collider(block, player);

                       this.physics.add.collider(block, platforms);

                        this.physics.add.collider(block2, player);

                       this.physics.add.collider(block2, platforms);

                          this.physics.add.collider(platforms, phone);
                          this.physics.add.collider(platforms, antidote);
                          this.physics.add.collider(platforms, enemy);



                       // set bounds so the camera won't go outside the game world
                       this.cameras.main.setBounds(
                           0,
                           0,
                           map.widthInPixels,
                           map.heightInPixels
                       );
                       // make the camera follow the player
                       this.cameras.main.startFollow(player);

                       // set background color, so the sky is not black
                       //this.cameras.main.setBackgroundColor('#ccccff');

                       /// SOUNDS

                       // sound effects
                       soundbite = this.sound.add("bite");
                       soundcough = this.sound.add("cough");
    soundobstacle = this.sound.add("cough"); // for testing
    soundemergency = this.sound.add("emergency");
    soundgame = this.sound.add("game");
    soundphone = this.sound.add("phone");
    soundantidote = this.sound.add("antidote");
    soundmom = this.sound.add("mom");

    soundgame.loop = true;
    soundgame.play();


    /// sparkle






    // setTimeout(function () { soundphone.play(); }, 15000 ); // play when near


                       //this.sfxbomb = this.sound.add("bomb");
                   }
        

        function update() {
            
            if (phonecallanswer) {
                return;
            }
            
            if (gameOver) {
                return;
            }

            if (cursors.left.isDown) {
                player.setVelocityX(-200);

                player.anims.play("left", true);
            } else if (cursors.right.isDown) {
                player.setVelocityX(200);

                player.anims.play("right", true);
            } else {
                player.setVelocityX(0);
                player.anims.play("turn");
            }

            if (
                (cursors.space.isDown || cursors.up.isDown) &&
                player.body.onFloor()
            ) {
                player.setVelocityY(-350);
                player.setGravityY(200);
            }

            //// add a score for extra Life OKK
            if (score >= 500) {
                console.log("add a life and delete score");
                score -= 500;
                //tint the color depending on the current score
                life += 1;
                
                scoreTextLife.setText("<3: " + life, { visibility: "visible" });
                
                console.log("score", score);
                console.log("life", life);

            } 

            console.log("life score", life);

        }

        /// star is pizza pieces now

        // add hearts and big pizza pieces and make a life score 


function collectStar(player, star) {
			soundbite.play();

            star.disableBody(true, true);

            //  Add and update the score
            score += 50;
            scoreText.setText("Score: " + score);

            if (stars.countActive(true) === 0) {
                //  A new batch of stars to collect
                stars.children.iterate(function (child) {
                    child.enableBody(true, child.x, 0, true, true);
                });

                let x =
                    player.x < 400
                        ? Phaser.Math.Between(400, 800)
                        : Phaser.Math.Between(0, 400);

                let bomb = bombs.create(x, 16, "bomb");
                bomb.setBounce(0.8);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                bomb.allowGravity = false;
            }
        }


function socialContact(player, enemy) {
    console.log("collision happened!");
// add sound make the same as 
    // enemy.disableBody(true, true); // cann be people
    // add effect: 
    player.setTint(0x7cc233);
    score -= 50;

}

// collision has to happen once!
/*
function getPhoneCall(player, phone) {
    soundphone.stop();
    this.physics.pause();
    phone.destroy();

    phonecallanswer = true;

    if (phonecallanswer) {
         soundmom.play();
         soundphone.stop();
         let phonescreen = this.physics.add.image(400, 320, "phonescreen");

         phonescreen.setScrollFactor(0);
         phonescreen.setInteractive();

         console.log("phonescreen", phonescreen);

         phonescreen.on(
             "pointerdown",
             function () {
                 console.log("mouse is down!");
                 //text.setText("Game OVER");
                 this.scene.restart();
                 phonecallanswer = false;
                 console.log("this", this);
                 return;
             },
             this
         );
    }
           
}
*/

function playerWins(player, antidote) {
    // add fancy effect!!
    soundantidote.play();
    score += 100000;
    scoreText.setText("Score: " + score);
    // antidote.disableBody(true, true);
    player.setVelocity(0, 0);
    // set a winning screen!
    this.physics.pause();
    winner = true;

    if (winner) {
    soundgame.stop();

    let endscreen = this.physics.add.image(400, 320, "winner");
    endscreen.setScrollFactor(0);
    endscreen.setInteractive();

    console.log("gameoverscreen", endscreen);

    endscreen.on(
        "pointerdown",
        function () {
            console.log("mouse is down on ending!");
            console.log("this", this);
            console.log("gameOver", gameOver);
            winner = false;
            soundantidote.stop();
            this.scene.restart("game");
            return;
        },
        this
    );

    return;
}


}
        /*
        
function playerCollide(player, obstacle) {
    score -= 10;
    scoreText.setText("Score: " + score);

    player.setVelocity(0, 0);
    player.setX(100);
    player.setY(300);
    player.play("right", true);
    player.setAlpha(0);
   /// make the player lose some score 
}
*/

function playerCough(player, obstacles){
        soundcough.play();
}


function playerPhone(player, phone) {
    soundphone.play();
}

function hitBomb(player, bomb) {
    soundcough.play();

    console.log("life", life);
            
    if (life >= 1) {
        life--;
        scoreTextLife.setText("<3:" + life);

        player.anims.play("turn");

        /// it works add a cool effect

        // make the a bit green
        return;
    } else {

          player.setTint(0x7cc233);

          // here you can change the color or whatever should happen

          player.anims.play("turn");

          gameOver = true;

    }
          
    // add a game over screen

    if (gameOver) {
        soundemergency.play();
        soundgame.stop();

                              this.physics.pause(); // apparently stays pause when restarted

                              let gameoverscreen = this.physics.add.image(
                                  400,
                                  320,
                                  "gameover"
                              );
                              gameoverscreen.setScrollFactor(0);
                              gameoverscreen.setInteractive();

                              console.log("gameoverscreen", gameoverscreen);

                              gameoverscreen.on(
                                  "pointerdown",
                                  function () {
                                      console.log("mouse is down!");
                                      console.log("this", this);
                                      this.scene.restart("game");
                                      console.log("gameOver", gameOver);                                         
                                      gameOver = false;
                                      soundemergency.stop();
                                      return;
                                  },
                                  this
                              );

                              return;
                          }

}


//// reset player

/*
function resetPlayer(player, obstacles) {
    player.setTint(0x7cc233);
    console.log("resetPlayer running");
    console.log("obstacles", obstacles);
    this.physics.pause(); 
            // player.reset(200, 600); // postion of the player
            };
*/
