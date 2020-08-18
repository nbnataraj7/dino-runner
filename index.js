(function () {

    //CONTSTANTS
    let DEFAULT_SPEED = 5; //5 pixels per second something like that, we'll see.
    let dino = null; //Global dino object
    let CONTROLS = {
        TOP: 87,
        BOTTOM: 83,
        JUMP: 32
    }
    let ACTION_TIMEOUT = 500; //timeout for any character action such as jump, duck in ms
    let context = null;
    let runningDinos = [];
    let jumpingDinos = [];
    let backgroundSprite = null;
    let distance = 0;
    let DINO_STATES = {
        RUNNING: 0,
        ASCENDING: 1,
        DUCKING: 2,
        DEAD: 4,
        DESCENDING: 5
    };
    let MAX_JUMP_ELEVATION = 120;
    let JUMP_STEP = 10;

    function Dino(speed) {
        this.speed = speed || DEFAULT_SPEED;
        this.state = DINO_STATES.RUNNING;
        this.jumpState = 0;
        this.runningState = 0;
        this.deadState = 0;
        this.duckState = 0;
        this.elevation = 0;
    }

    Dino.prototype.jump = function () {
        //Initiate jump sequence
        if (this.state == DINO_STATES.ASCENDING || this.state == DINO_STATES.DESCENDING || this.state == DINO_STATES.DEAD) {
            return;
        }
        this.state = DINO_STATES.ASCENDING;
    }

    Dino.prototype.duck = function () {
        //Initiate duck sequence
        if (this.state == DINO_STATES.DUCKING || this.state == DINO_STATES.DEAD) {
            return;
        }
        this.state = DINO_STATES.DUCKING;
        setTimeout(() => {
            this.state = DINO_STATES.RUNNING;
        }, ACTION_TIMEOUT);
    }

    Dino.prototype.die = function () {
        this.state = DINO_STATES.DEAD;
    }

    Dino.prototype.isRunning = function () {
        return this.state === DINO_STATES.RUNNING;
    }

    Dino.prototype.isJumping = function () {
        return this.state === DINO_STATES.ASCENDING || DINO_STATES.DESCENDING;
    }

    Dino.prototype.isDead = function () {
        return this.state === DINO_STATES.DEAD;
    }

    Dino.prototype.isDucking = function () {
        return this.state === DINO_STATES.DUCKING;
    }

    Dino.prototype.getRunningState = function () {
        this.runningState = this.runningState + 0.3;
        return (this.runningState) % 8;
    }

    Dino.prototype.getJumpingState = function () {
        this.jumpState = this.jumpState + 0.3;
        return (this.jumpState) % 12;
    }

    Dino.prototype.getElevation = function () {
        return this.elevation;
    }

    Dino.prototype.setElevation = function (elev) {
        this.elevation = elev;
    }

    Dino.prototype.getState = function () {
        return this.state;
    }

    Dino.prototype.setState = function (state) {
        this.state = state;
    }

    function init() {
        loadAssets().then(() => {
            buildCanvas();
            dino = new Dino(DEFAULT_SPEED);
            context = document.getElementById("mycanvas").getContext("2d");
            attachEvents();
            render();
        });
    }

    function buildCanvas() {
        var canvas = document.getElementById("mycanvas");
        let width = document.getElementsByClassName("container")[0].getBoundingClientRect().width;
        canvas.setAttribute("height", 500);
        canvas.setAttribute("width", width - 100);
    }

    function attachEvents() {
        window.addEventListener("keydown", ev => {
            switch (ev.keyCode) {
                case CONTROLS.JUMP:
                case CONTROLS.TOP:
                    console.log("Dino jumps");
                    dino.jump();
                    break;
                case CONTROLS.BOTTOM:
                    console.log("Dino ducks");
                    dino.duck();
                    break;
            }
        });
    }

    /**
     * @description returns true if dino has collided with an object
     */
    function hasCollisionOccured() {
        //TODO
        return false;
    }

    function gameOver() {
        console.log("Game over");
    }

    /**
     * @description render objects in the canvas
     */
    function render() {
        drawScene();
        drawCharacters();
        drawObstacles();
        window.requestAnimationFrame(function () {
            if (!hasCollisionOccured()) {
                render();
            }
            else {
                gameOver();
            }
        });
    }

    /**
     * draws the landscape and renders the necessary assets
     */
    function drawScene() {
        let width = document.getElementsByClassName("container")[0].getBoundingClientRect().width;
        distance = (--distance) % width;
        let cx = 0;
        let cy = 0;
        let sx = 0;
        let sy = 50;
        let swidth = width;
        let sheight = 17;
        context.drawImage(backgroundSprite, (distance - 900) % width, 0);
        context.drawImage(backgroundSprite, (distance) % width, 0);
        context.drawImage(backgroundSprite, (distance + 900) % width, 0);
        context.drawImage(backgroundSprite, (distance + 1800) % width, 0);
        context.drawImage(backgroundSprite, (distance + 1800 + 900) % width, 0);
    }

    function drawCharacters() {
        //Draw dino
        if (dino.isRunning()) {
            context.drawImage(runningDinos[Math.floor(dino.getRunningState())], 0, 400, 150, 100);
        }
        else if (dino.isJumping()) {
            let curr_elev = dino.getElevation();
            if (dino.getState() == DINO_STATES.ASCENDING) {
                curr_elev = Math.min(curr_elev + JUMP_STEP, MAX_JUMP_ELEVATION);
                if (curr_elev == MAX_JUMP_ELEVATION) {
                    dino.setState(DINO_STATES.DESCENDING);
                }
            }
            else {
                curr_elev = Math.max(0, curr_elev - JUMP_STEP);
                if (curr_elev == 0) {
                    dino.setState(DINO_STATES.RUNNING);
                }
            }
            dino.setElevation(curr_elev);
            context.drawImage(jumpingDinos[Math.floor(dino.getJumpingState())], 0, (400 - curr_elev), 150, 100);
        }
        else {
            //TODO;
        }
    }

    function drawObstacles() {

    }

    function loadAssets() {
        let assetPromises = [];
        //Download background
        assetPromises.push(new Promise((resolve) => {
            let img = new Image();
            img.src = './assets/background.png';
            img.addEventListener("load", () => {
                backgroundSprite = img;
                resolve();
            });
        }));
        //Download running dinos
        for (let i = 0; i < 8; i++) {
            assetPromises.push(new Promise(function (resolve) {
                let img = new Image();
                img.addEventListener("load", () => {
                    runningDinos[i] = img;
                    resolve();
                });
                img.src = `./assets/dinos/Run_${i + 1}.png`;
            }));
        }
        //Download jumping dinos
        for (let i = 0; i < 12; i++) {
            assetPromises.push(new Promise(function (resolve) {
                let img = new Image();
                img.addEventListener("load", () => {
                    jumpingDinos[i] = img;
                    resolve();
                });
                img.src = `./assets/dinos/Jump_${i + 1}.png`;
            }));
        }

        return Promise.all(assetPromises);
    }

    init();
})();