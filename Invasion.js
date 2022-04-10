/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/////////////////////////////////////////////////
/*
      
TODO:
    indicate hero cooldown on board
    indicate ammunition status
    indicate cooldown status

known bugs: 

 */
////////////////////////////////////////////////////

var DEBUG = {
    FPS: true,
    BUTTONS: false,
    SETTING: true,
    VERBOSE: false,
    PAINT_TRAIL: false,
    invincible: false,
    INF_LIVES: false,
    G: [],
    A: [],
    dx: [],
    dy: []
};
var INI = {
    base_speed: 128.0,
    //max_speed: 160.0,
    max_speed: 200.0,
    min_speed: 0.0,
    //acceleration: 100.0,
    acceleration: 200.0,
    canon_step: 5,
    start_speed: 750.0,
    max_bullet_speed: 1000.0,
    min_bullet_speed: 500.0,
    bullet_speed_step: 50.0,
    checkDX: 130,
    G: 1250,
    A: 20,
    calcG: 290,
    sprite_width: 48,
    tank_cooldown: 3,
    plane_cooldown: 2,
    //HERO_cooldown: 1,
    HERO_cooldown: 0.1,
    parachute_speed: 100.0,
    landing_offset: 4,
    scores: {
        hut: 10,
        tank: 100,
        plane: 1000,
        help: -500,
        parachute: -50,
        box: 0,
    }
};
var PRG = {
    VERSION: "0.11.00",
    NAME: "Invasion",
    YEAR: "2022",
    CSS: "color: #239AFF;",
    INIT() {
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        console.log(`${PRG.NAME} ${PRG.VERSION} by Lovro Selic, (c) C00lSch00l ${PRG.YEAR} on ${navigator.userAgent}`);
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        $("#title").html(PRG.NAME);
        $("#version").html(`${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> C00lSch00l ${PRG.YEAR}`);
        $("input#toggleAbout").val("About " + PRG.NAME);
        $("#about fieldset legend").append(" " + PRG.NAME + " ");

        ENGINE.autostart = true;
        ENGINE.start = PRG.start;
        ENGINE.readyCall = GAME.setup;
        ENGINE.setSpriteSheetSize(48);
        ENGINE.init();
    },
    setup() {
        console.log("PRG.setup");
        if (DEBUG.SETTING) {
            $('#debug').show();
        } else $('#debug').hide();
        $("#engine_version").html(ENGINE.VERSION);
        $("#grid_version").html(GRID.VERSION);
        $("#terrain_version").html(TERRAIN.VERSION);
        $("#lib_version").html(LIB.VERSION);
        $("#IA_version").html(IAM.version);

        $("#toggleHelp").click(function () {
            $("#help").toggle(400);
        });
        $("#toggleAbout").click(function () {
            $("#about").toggle(400);
        });

        //boxes
        ENGINE.gameWIDTH = 1280;
        ENGINE.gameHEIGHT = 720;
        ENGINE.titleHEIGHT = 60;
        ENGINE.titleWIDTH = ENGINE.gameWIDTH;
        ENGINE.bottomHEIGHT = 32;
        ENGINE.bottomWIDTH = ENGINE.gameWIDTH;
        ENGINE.scoreWIDTH = ENGINE.gameWIDTH;
        ENGINE.scoreHEIGHT = 64;
        ENGINE.checkProximity = false;
        ENGINE.checkIntersection = false;
        ENGINE.setCollisionsafe(49);

        $("#bottom").css("margin-top", ENGINE.gameHEIGHT + ENGINE.titleHEIGHT + ENGINE.bottomHEIGHT + ENGINE.scoreHEIGHT);

        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);
        ENGINE.addBOX("TITLE", ENGINE.titleWIDTH, ENGINE.titleHEIGHT, ["title", "hiscore"], null);
        ENGINE.addBOX("SCORE", ENGINE.scoreWIDTH, ENGINE.scoreHEIGHT, ["score_background", "canon_load", "score"], null);
        ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["background", "backplane2", "backplane1", "foreplane", "decor",
            "actors", "explosion", "text", "FPS", "button", "click"], null);
        ENGINE.addBOX("DOWN", ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT, ["bottom", "bottomText"], null);
    },
    start() {
        console.log(PRG.NAME + " started.");
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");

        $("#startGame").addClass("hidden");
        $(document).keypress(function (event) {
            if (event.which === 32 || event.which === 13) {
                event.preventDefault();
            }
        });
        TITLE.startTitle();
    }
};
class Explosion {
    constructor(grid) {
        this.grid = grid;
        this.layer = 'explosion';
        this.moveState = new MoveState(grid, NOWAY);
        this.actor = new ACTOR("Explosion", grid.x, grid.y, "linear", ASSET.Explosion);
    }
    draw(map) {
        ENGINE.spriteDraw(this.layer, this.actor.x - map.getPosition(), this.actor.y, this.actor.sprite());
        ENGINE.layersToClear.add("explosion");
    }
}
class GeneralBallisticObject {
    constructor(position, dir, speed, friendly = false) {
        this.position = position;
        this.dir = dir;
        this.speed = speed;
        this.friendly = friendly;
    }
    explode() {
        DESTRUCTION_ANIMATION.add(new Explosion(this.position));
        AUDIO.Explosion.play();
    }
    collisionBackground(map) {
        let X = Math.round(this.position.x);
        let planePosition = map.getPosition();
        if (X < 0 || X - planePosition < -48 || X > planePosition + ENGINE.gameWIDTH || X >= map.DATA.map.length - 1) {
            PROFILE_BALLISTIC.remove(this.id);
            return;
        }
        let backgroundHeight = map.DATA.map[X];
        if (Math.round(this.position.y) > backgroundHeight) {
            PROFILE_BALLISTIC.remove(this.id);
            this.explode();
        }
    }
    collisionEntity(map) {
        let X = Math.round(this.position.x);
        let IA = map.profile_actor_IA;
        let ids = IA.unroll(new Grid(X, 0));
        if (ids.length) {
            for (let id of ids) {
                let obj = PROFILE_ACTORS.show(id);
                if (obj !== null && obj.checkHit(this)) {
                    PROFILE_BALLISTIC.remove(this.id);
                    if (id !== HERO.id) PROFILE_ACTORS.remove(id);
                    obj.explode();
                    GAME.addScore(obj.score);
                }
            }
        }
    }
    draw(map) {
        ENGINE.spriteDraw('actors', this.position.x - map.getPosition(), this.position.y, this.getSprite());
        ENGINE.layersToClear.add("actors");
    }
}
class Bomb extends GeneralBallisticObject {
    constructor(position, dir, speed, friendly = false) {
        super(position, dir, speed, friendly);
        this.actor = new Rotating_ACTOR('Bomb');
        this.name = 'Bomb';
        this.rotSpeed = 2 / 16;
        this.setAngle(0.0);
    }
    setAngle(a) {
        this.angle = Math.min(a, 90.0);
        this.actor.setAngle(180 - Math.round(this.angle));
    }
    addAngle(a) {
        let A = this.angle + a;
        this.setAngle(A);
    }
    rotate(lapsedTime) {
        this.addAngle(lapsedTime * this.rotSpeed);
    }
    move(lapsedTime) {
        let timeDelta = lapsedTime / 1000;
        let x = this.speed.x * this.dir.x * timeDelta;
        let y = this.speed.y * this.dir.y * timeDelta;
        this.position = this.position.add(new FP_Vector(x, y));
        this.rotate(lapsedTime);
        this.speed.y = this.speed.y + INI.G * timeDelta;
        this.speed.x = Math.max(0, this.speed.x - INI.A * timeDelta);
        if (this.position.x - MAP[GAME.level].map.planes[0].getPosition() < 0) {
            PROFILE_BALLISTIC.remove(this.id);
        }
    }
    getSprite() {
        return this.actor.sprite();
    }
}
class Ballistic extends GeneralBallisticObject {
    constructor(position, dir, speed, friendly = false) {
        super(position, dir, speed, friendly);
        this.actor = new ACTOR('Cannonball');
        this.name = 'Bullet';
    }
    getSprite() {
        return SPRITE.Cannonball;
    }
    move(lapsedTime) {
        let timeDelta = lapsedTime / 1000;
        let x = this.speed.x * this.dir.x * timeDelta;
        let y = this.speed.y * this.dir.y * timeDelta - 0.5 * INI.G * timeDelta ** 2;
        this.speed.y = this.speed.y + (Math.sign(this.dir.y) || 1) * INI.G * timeDelta;
        this.position = this.position.add(new FP_Vector(x, y));
        if (this.position.x - MAP[GAME.level].map.planes[0].getPosition() < 0 ||
            this.position.x >= MAP[GAME.level].map.planes[0].DATA.map.length - 1) {
            PROFILE_BALLISTIC.remove(this.id);
        }
    }
}
class Entity {
    constructor(grid, friendly = true) {
        this.y = grid.y;
        this.moveState = new _1D_MoveState(grid.x, 0);
        this.friendly = friendly;
    }
    visible(position) {
        return this.moveState.x + this.actor.width > position && this.moveState.x - this.actor.width < position + ENGINE.gameWIDTH;
    }
    checkHit(ballistic) {
        if (ballistic.friendly && this.friendly) return false;
        let top = ballistic.position.y + ballistic.actor.height / 2 > this.top;
        let bottom = ballistic.position.y - ballistic.actor.height / 2 < this.bottom;
        return top && bottom;
    }
    checkHitHeightPoint(heightPoint) {
        let top = heightPoint > this.top;
        let bottom = heightPoint < this.bottom;
        return top && bottom;
    }
    explode() {
        DESTRUCTION_ANIMATION.add(new Explosion(new Grid(this.moveState.x, this.y - this.actor.height / 2)));
        AUDIO.Explosion.play();
    }
    move() {
        return;
    }
    collisionBackground() {
        return;
    }
    collisionToActors(map) {
        return;
    }
    draw(map) {
        let position = map.getPosition();
        if (this.visible(position)) {
            ENGINE.drawBottomCenter('actors', this.moveState.x - position, this.y, this.actor.sprite());
            ENGINE.layersToClear.add("actors");
        }
    }
    checkHitActor(other) {
        return other.bottom >= this.top && other.top <= this.bottom;
    }
}
class Hut extends Entity {
    constructor(grid) {
        super(grid);
        this.actor = new ACTOR('Hut');
        this.top = this.y - this.actor.height;
        this.bottom = ENGINE.gameHEIGHT;
        this.score = INI.scores.hut;
        this.name = "Hut";
    }
}
class Tree extends Entity {
    constructor(grid) {
        super(grid);
        let tree = `tree${RND(1, 8)}`;
        this.actor = new ACTOR(tree);
    }
    draw(map) {
        let position = map.getPosition();
        if (this.visible(position)) {
            ENGINE.drawBottomCenter('decor', this.moveState.x - position, this.y, this.actor.sprite());
            ENGINE.layersToClear.add("decor");
        }
    }
}
class Box extends Entity {
    constructor(grid, friendly) {
        super(grid, friendly);
        this.actor = new ACTOR('Box');
        this.top = this.y - this.actor.height;
        this.bottom = ENGINE.gameHEIGHT;
        this.score = INI.scores.box;
        this.name = "Box";
    }
    pick() {
        console.log("picking up box");
        //cont
        //add audio
    }
}
class GeneralActor {
    constructor(x, dir = -1, friendly = true) {
        this.moveState = new _1D_MoveState(x, dir);
        this.friendly = friendly;
        this.ignoreByManager = false;
        this.timer = null;
    }
    visible(position) {
        return this.moveState.x + this.actor.width > position && this.moveState.x - this.actor.width < position + ENGINE.gameWIDTH;
    }
    onBoard(position) {
        return this.moveState.x + this.actor.width < position + ENGINE.gameWIDTH;
    }
    checkHit(ballistic) {
        if (ballistic.friendly && this.friendly) return false;
        let top = ballistic.position.y + ballistic.actor.height / 2 > this.top;
        let bottom = ballistic.position.y - ballistic.actor.height / 2 < this.bottom;
        return top && bottom;
    }
    checkHitActor(other) {
        return other.bottom >= this.top && other.top <= this.bottom;
    }
    checkHitHeightPoint(heightPoint) {
        let top = heightPoint > this.top;
        let bottom = heightPoint < this.bottom;
        return top && bottom;
    }
    explode() {
        DESTRUCTION_ANIMATION.add(new Explosion(new Grid(this.moveState.x, this.y - this.actor.height / 2)));
        AUDIO.Explosion.play();
    }
    set() {
        let forePlane = MAP[GAME.level].map.planes[0];
        let planePosition = forePlane.getPosition();
        this.LEFT = Math.round(this.moveState.x - this.width / 2 - planePosition);
        this.top = this.bottom - this.height;
        this.y = Math.round((this.top + this.bottom) / 2);
        this.actor.setDraw(this.LEFT, this.bottom);
    }
    draw(map) {
        let position = map.getPosition();
        if (this.visible(position)) {
            ENGINE.drawBottomLeft('actors', this.actor.drawX, this.actor.drawY, this.actor.sprite());
        }
    }
    collisionBackground() {
        return;
    }
    collisionToActors(map) {
        if (!this.friendly) return;
        let IA = map.profile_actor_IA;
        let ids = IA.unroll(new Grid(Math.max(0, Math.round(this.moveState.x - this.width / 2)), 0)); 
        ids.removeValueOnce(this.id);
        ids.removeValueOnce(HERO.id); 
        if (ids.length) {
            for (let id of ids) {
                let obj = PROFILE_ACTORS.show(id);
                if (this.friendly && obj.friendly) continue;
                if (obj.checkHitActor(this)) {
                    //console.log(this.name, this.id, ".......hits", obj.name, obj.id);
                    PROFILE_ACTORS.remove(id);
                    obj.explode();
                }
            }
        }
        return;
    }
}
class Parachute extends GeneralActor {
    constructor(x, dir, friendly) {
        super(x, dir, friendly);
        this.name = "Parachute";
        this.score = INI.scores.parachute;
        this.actor = new Static_ACTOR("Parachute");
        this.width = SPRITE[this.actor.name].width;
        this.height = SPRITE[this.actor.name].height;
        this.bottom = 64;
        this.set();
    }
    move(lapsedTime) {
        this.bottom += lapsedTime * INI.parachute_speed / 1000;
        this.set();
    }
    collisionBackground(map) {
        let X = Math.round(this.moveState.x);
        let position = map.getPosition();
        if (X + this.width - position < 0) {
            PROFILE_ACTORS.remove(this.id);
            //console.log(this.name, this.id, "out left, silently removed");
        }
        let backgroundHeight = map.DATA.map[X];
        if (Math.round(this.bottom) - INI.landing_offset > backgroundHeight) {
            PROFILE_ACTORS.remove(this.id);
            this.land(X, backgroundHeight);
        }
    }
    land(X, backgroundHeight) {
        //console.log('parachute landed');
        PROFILE_ACTORS.add(new Box(new Grid(X, backgroundHeight + INI.landing_offset), false));
    }
}
class HelpPlane extends GeneralActor {
    constructor(x, dir, friendly) {
        super(x, dir, friendly);
        this.name = "Help";
        this.score = INI.scores.help;
        this.speed = 250.0;
        this.actor = new Static_ACTOR("HelpPlane");
        this.width = SPRITE[this.actor.name].width;
        this.height = SPRITE[this.actor.name].height;
        this.bottom = 0;
        this.maxY = 32;
        this.canShoot = true;
        this.set();
    }
    move(lapsedTime) {
        if (this.bottom < this.maxY) {
            this.bottom += lapsedTime * 12.0 / 1000;
            this.bottom = Math.min(this.bottom, this.maxY);
        }
        this.moved = lapsedTime * this.speed / 1000;
        this.moveState.move(this.moved);
        this.set();
        let forePlane = MAP[GAME.level].map.planes[0];
        let position = forePlane.getPosition();
        if (this.moveState.x >= MAP[GAME.level].map.planes[0].DATA.map.length - 1 || this.moveState.x - this.width - position > ENGINE.gameWIDTH) {
            PROFILE_ACTORS.remove(this.id);
        }
        let trigger = this.moveState.x - position;
        if (trigger > ENGINE.gameWIDTH * 0.6 && this.canShoot) {
            this.dropParachute();
        }
    }
    dropParachute() {
        //console.log("dropping parachute");
        this.canShoot = false;
        PROFILE_ACTORS.add(new Parachute(Math.round(this.moveState.x), 0, false));
    }
}
class AirPlane extends GeneralActor {
    constructor(x) {
        super(x);
        this.score = INI.scores.plane;
        this.canShoot = true;
        this.name = "Plane";
        this.speed = 200.0;
        let plane = RND(1, 11);
        this.actor = new Static_ACTOR(`Plane${plane}`);
        this.width = SPRITE[this.actor.name].width;
        this.height = SPRITE[this.actor.name].height;
        const minY = Math.round(0.1 * ENGINE.gameHEIGHT);
        const maxY = Math.round(0.5 * ENGINE.gameHEIGHT);
        this.bottom = RND(minY, maxY);
        this.set();
    }
    move(lapsedTime) {
        this.moved = lapsedTime * this.speed / 1000;
        this.moveState.move(this.moved);
        this.set();
        let forePlane = MAP[GAME.level].map.planes[0];
        let position = forePlane.getPosition();
        if (this.moveState.x + this.actor.width < position) {
            PROFILE_ACTORS.remove(this.id);
        }
        let ready = this.getShootingSolution(forePlane, position);
        if (ready && this.canShoot) {
            this.shoot();
        }
    }
    getShootingSolution(forePlane, position) {
        const TOLERANCE = 36;
        if (!this.canShoot) return false;
        let trigger = this.moveState.x - position;
        if (trigger < ENGINE.gameWIDTH / 3) {
            let landingX = Math.round(this.moveState.x - INI.checkDX);
            if (landingX < 0) {
                this.canShoot = false;
                return false;
            }
            let heightAtLanding = forePlane.DATA.map[landingX];
            let DY = heightAtLanding - (this.bottom + SPRITE.Bomb_00.height / 2);
            let requiredTime = Math.sqrt(2 * DY / INI.calcG);
            let HeroDisplacement = (HERO.speed * requiredTime) / 2;
            let possibleHeroPosition = HERO.moveState.x + HeroDisplacement;
            let check = landingX - possibleHeroPosition;
            if (check < 0) {
                this.canShoot = false;
                return false;
            }
            if (check > TOLERANCE) return false;
            return true;
        }
        return false;
    }
    setBombPosition() {
        this.bombX = Math.round(this.moveState.x);
        this.bombY = this.bottom + SPRITE.Bomb_00.height / 2;
    }
    shoot() {
        this.canShoot = false;
        this.timer = new CountDown(`${this.name}${this.id}-${Date.now()}`, RND(INI.plane_cooldown - 1, INI.plane_cooldown + 1), this.release.bind(this));
        this.setBombPosition();
        let bomb = new FP_Grid(this.bombX, this.bombY);
        let dir = new FP_Vector(-1, 1);
        let speed = new FP_Vector(this.speed, 0);
        PROFILE_BALLISTIC.add(new Bomb(bomb, dir, speed, true));
    }
    release() {
        this.canShoot = true;
    }
}
class Tank extends GeneralActor {
    constructor(x) {
        super(x);
        this.LEFT_AXIS = 8;
        this.actor = new Rotating_ACTOR("BlueTank");
        this.width = SPRITE[this.actor.name].width;
        this.height = SPRITE[this.actor.name].height;
        this.speed = 80.0;
        this.bottom = ENGINE.gameHEIGHT;
        this.name = "BlueTank";
        this.score = INI.scores.tank;
        this.canonAngle = 0;
        this.canonOffX = 24;
        this.canonOffY = 20;
        this.canonX = null;
        this.canonY = null;
        this.bulletSpeed = INI.max_bullet_speed;
        this.canShoot = true;
        let forePlane = MAP[GAME.level].map.planes[0];
        let position = forePlane.getPosition();
        this.setAngle(forePlane, position);
        this.setBarrel(position);
    }
    release() {
        this.canShoot = true;
    }
    draw(map) {
        let position = map.getPosition();
        if (this.visible(position)) {
            ENGINE.drawBottomRight('actors', this.canonX, this.canonY, SPRITE[`CevLeft_${this.canonAngle + this.actor.angle}`]);
            ENGINE.drawBottomLeft('actors', this.actor.drawX, this.actor.drawY + 2, this.actor.sprite());
        }
    }
    move(lapsedTime) {
        this.actor.updateAnimation(lapsedTime * this.speed / INI.base_speed);
        this.moved = lapsedTime * this.speed / 1000;
        this.moveState.move(this.moved);
        let forePlane = MAP[GAME.level].map.planes[0];
        let planePosition = forePlane.getPosition();
        this.setAngle(forePlane, planePosition);
        let ready = this.getShootingSolution(forePlane, planePosition);
        this.setBarrel(planePosition);
        if (ready && this.canShoot) {
            this.shoot();
        }
    }
    calcBulletPosition() {
        this.bulletX = Math.round(this.canonRootX - this.width * 0.98 * Math.cos(Math.radians(this.actor.angle + this.canonAngle)));
        this.bulletY = Math.round(this.canonRootY - this.width * 0.98 * Math.sin(Math.radians(this.actor.angle + this.canonAngle)));
    }
    shoot() {
        this.canShoot = false;
        this.timer = new CountDown(`${this.name}${this.id}-${Date.now()}`, RND(INI.tank_cooldown - 1, INI.tank_cooldown + 1), this.release.bind(this));
        this.calcBulletPosition();
        let origin = new FP_Grid(this.canonRootX, this.canonRootY);
        let bullet = new FP_Grid(this.bulletX, this.bulletY);
        let dir = origin.direction(bullet);
        let speed = new FP_Vector(this.bulletSpeed, this.bulletSpeed);
        PROFILE_BALLISTIC.add(new Ballistic(bullet, dir, speed, true));
    }
    getShootingSolution(forePlane, position) {
        if (!this.onBoard(position)) return false;
        let ready = true;
        const maxAngle = 70;
        const minAngle = 10;
        const minPower = 300;
        let TX = Math.round(this.moveState.x);
        let HX = HERO.moveState.getX();
        let landing = TX - HX;
        let TY = forePlane.DATA.map[TX];
        let HY = forePlane.DATA.map[HX];
        let DY = HY - TY;
        let [maxHill, index] = TERRAIN.sampleMin(forePlane.DATA.map, HX, TX, 10);

        if (TY <= maxHill) {
            maxHill = TY;
            index = TX;
        } else if (HY <= maxHill) {
            maxHill = HY;
            index = HX;
        }

        let DX = index - TX;
        let ANGLE = null;
        let solutions = [];
        if (maxHill < TY && maxHill < HY) {
            maxHill -= 36;
            ANGLE = Math.degrees(Math.asin((maxHill - TY) / DX));
        } else {
            ANGLE = Math.degrees(Math.asin(-DY / landing));
            let requiredSpeed = Math.sqrt(landing * INI.G / 2);
            if (this.actor.angle <= ANGLE &&
                requiredSpeed < INI.max_bullet_speed &&
                landing < 500 &&
                this.actor.angle + 60 >= ANGLE) {
                solutions.push(new FiringSolution(round5(ANGLE + 2), requiredSpeed, true));
            }
        }

        for (let angle = Math.min(maxAngle, round5(this.actor.angle + 60));
            angle >= Math.max(round5(ANGLE + 2.51), round5(this.actor.angle + 2.51), minAngle);
            angle -= 5) {
            let range = Math.floor(landing - (DY / Math.tan(Math.radians(angle))));
            if (range <= 0) continue;
            let requiredSpeed = Math.floor(Math.sqrt((INI.G * range) / (2 * Math.cos(Math.radians(angle)))));
            if (requiredSpeed > INI.max_bullet_speed || requiredSpeed < minPower) continue;
            solutions.push(new FiringSolution(angle, requiredSpeed, false));
        }
        if (solutions.length === 0) return false;

        let solution = FiringSolution.closest(solutions, this.actor.angle, this.canonAngle);
        this.bulletSpeed = solution.power;
        let goalDifference = solution.angle - this.actor.angle - this.canonAngle;
        if (Math.abs(goalDifference) < 5) goalDifference = 0;
        if (goalDifference === 0) return true;
        if (goalDifference < 0 && this.canonAngle === 0) return false;
        if (goalDifference > 0 && this.canonAngle === 60) return false;
        if (goalDifference !== 0) {
            ready = false;
            this.canonAngle += Math.sign(goalDifference) * 5;
        }
        return ready;
    }
    setBarrel(planePosition) {
        let canonY = this.actor.drawY + 4 - this.canonOffY;
        let canonX = this.actor.drawX + this.canonOffX;
        this.canonRootX = canonX;
        this.canonRootY = canonY;
        let F = this.height / this.width;

        if (this.actor.angle < 0) {
            canonY -= Math.sin((Math.radians(this.actor.angle))) * this.height / 2;
            canonX += Math.sin((Math.radians(this.actor.angle))) * this.height / 2;
            this.canonRootX = canonX;
            this.canonRootY += Math.sin(Math.radians(this.actor.angle)) * HERO.height / 2;
            canonY += Math.sin(Math.radians(this.actor.angle)) * Math.sin(Math.radians(this.canonAngle)) * this.height;
        }
        if (this.actor.angle > 0) {
            canonY -= Math.sin(Math.radians(this.actor.angle)) * this.height / 2;
            canonX += Math.sin(Math.radians(this.actor.angle)) * this.height / 2 * F;
            this.canonRootX = canonX;
            this.canonRootY = canonY;
        }
        if (this.actor.angle + this.canonAngle > 90) {
            canonX += Math.sin(Math.radians(this.actor.angle + this.canonAngle - 90)) * this.height;
            canonY += Math.sin(Math.radians(this.actor.angle + this.canonAngle - 90)) * this.height / 2 * F;
        }

        this.canonX = Math.round(canonX);
        this.canonY = Math.round(canonY);
        this.canonRootX = Math.round(this.canonRootX + planePosition);
        this.canonRootY = Math.round(this.canonRootY);
    }
    setAngle(forePlane, planePosition) {
        this.LEFT = Math.round(this.moveState.x - this.width / 2 - planePosition);
        let left_axis_y = forePlane.DATA.map[this.LEFT + this.LEFT_AXIS + planePosition];
        let right_axis_y = forePlane.DATA.map[this.LEFT + this.width + planePosition];
        this.top = left_axis_y - this.actor.height;
        this.y = left_axis_y;
        this.centerHeightRight = right_axis_y - this.height / 2;
        let tan = (right_axis_y - left_axis_y) / (this.width - this.LEFT_AXIS);
        let angle = Math.round(Math.degrees(Math.atan(tan)));
        this.actor.setAngle(angle);
        let shiftY = 0;
        if (angle > 0) {
            shiftY = Math.sin(Math.radians(angle)) * this.height;
        }
        this.actor.setDraw(this.LEFT, left_axis_y + shiftY);
    }
}
class FiringSolution {
    constructor(angle, power, direct = false) {
        this.angle = angle;
        this.power = roundN(power, 5);
        this.direct = direct;
    }
    static closest(solutions, tank_angle, barrel_angle) {
        let diff = Infinity;
        let index = -1;
        let currentAngle = tank_angle + barrel_angle;
        for (let i = 0; i < solutions.length; i++) {
            if (solutions[i].direct) return solutions[i];
            let thisDiff = Math.abs(currentAngle - solutions[i].angle);
            if (thisDiff < diff) {
                diff = thisDiff;
                index = i;
            }
        }
        return solutions[index];
    }
}
var HERO = {
    startInit() {
        this.name = "HERO";
        this.LEFT = 32;
        this.LEFT_AXIS = 8;
        let y = Math.floor(TERRAIN.INI.planes_max[0] * ENGINE.gameHEIGHT);
        this.actor = new Rotating_ACTOR("Tank", this.LEFT, y, 30);
        this.width = SPRITE[this.actor.name].width;
        this.height = SPRITE[this.actor.name].height;
        this.canonAngle = 0;
        this.canonOffX = 24;
        this.canonOffY = 20;
        this.canonX = null;
        this.canonY = null;
        this.bulletSpeed = null;
        this.ignoreByManager = true;
        this.bottom = ENGINE.gameHEIGHT;
        this.speed = 0;
        this.bulletSpeed = INI.start_speed;
        this.moveState = new _1D_MoveState(Math.floor(LEFT + this.width / 2), 1);
        this.score = 0;
        this.cooldown = INI.HERO_cooldown;
        this.release();
        this.friendly = false;
        console.log("HERO", HERO);
    },
    release() {
        this.canShoot = true;
    },
    draw() {
        ENGINE.drawBottomLeft('actors', HERO.canonX, HERO.canonY, SPRITE[`Cev_${HERO.canonAngle + HERO.actor.angle}`]);
        ENGINE.drawBottomLeft('actors', HERO.actor.drawX, HERO.actor.drawY + 2, HERO.actor.sprite());
        ENGINE.layersToClear.add("actors");
    },
    move(time) {
        HERO.actor.updateAnimation(time * HERO.speed / INI.base_speed);
        let forePlane = MAP[GAME.level].map.planes[0];
        let planePosition = forePlane.getPosition();
        let x = Math.floor(this.LEFT + this.width / 2) + planePosition;
        this.moveState.setX(x);
        let left_axis_y = forePlane.DATA.map[this.LEFT + this.LEFT_AXIS + planePosition];
        this.y = left_axis_y;
        let right_axis_y = forePlane.DATA.map[this.LEFT + this.width + planePosition];
        HERO.centerHeightRight = right_axis_y - HERO.height / 2;
        this.top = left_axis_y - this.actor.height;
        let tan = (right_axis_y - left_axis_y) / (this.width - this.LEFT_AXIS);
        let angle = Math.round(Math.degrees(Math.atan(tan)));
        HERO.actor.setAngle(angle);
        this.actor.setPosition(HERO.LEFT, left_axis_y);
        let shiftY = 0;
        if (angle > 0) {
            shiftY = Math.sin(Math.radians(angle)) * HERO.height;
        }
        this.actor.setDraw(HERO.LEFT, left_axis_y + shiftY);
        HERO.positionRight = this.LEFT + this.width + planePosition;
        if (HERO.positionRight >= forePlane.planeLimits.rightStop) {
            GAME.levelEnd();
        }

        let canonY = HERO.actor.drawY + 4 - HERO.canonOffY;
        let canonX = HERO.actor.drawX + HERO.canonOffX;
        HERO.canonRootX = canonX;
        HERO.canonRootY = canonY;
        let F = HERO.height / HERO.width;
        if (HERO.actor.angle < 0) {
            canonY += Math.sin((Math.radians(HERO.actor.angle))) * HERO.height / 2;
            canonX += Math.sin((Math.radians(HERO.actor.angle))) * HERO.height / 2 * F;
            HERO.canonRootX = canonX;
            HERO.canonRootY = canonY;
        }
        if (HERO.actor.angle > 0) {
            canonY += Math.sin(Math.radians(HERO.actor.angle)) * HERO.height / 2;
            canonX += Math.sin(Math.radians(HERO.actor.angle)) * HERO.height / 2 * F;
            HERO.canonRootX = canonX;
            HERO.canonRootY -= Math.sin(Math.radians(HERO.actor.angle)) * HERO.height / 2 * F;
            canonY += Math.sin(Math.radians(HERO.actor.angle)) * Math.sin(Math.radians(HERO.canonAngle)) * HERO.height;
        }
        if (HERO.actor.angle + HERO.canonAngle < -90) {
            canonX += Math.sin(Math.radians(HERO.actor.angle + HERO.canonAngle + 90)) * HERO.height;
            canonY += -Math.sin(Math.radians(HERO.actor.angle + HERO.canonAngle + 90)) * HERO.height / 2 * F;
        }

        HERO.canonX = Math.round(canonX);
        HERO.canonY = Math.round(canonY);
        HERO.canonRootX = Math.round(HERO.canonRootX + planePosition);
        HERO.canonRootY = Math.round(HERO.canonRootY);

        HERO.collisionToActors(planePosition);
    },
    collisionToActors() {
        let IA = MAP[GAME.level].map.planes[0].profile_actor_IA;
        let ids = IA.unroll(new Grid(HERO.positionRight, 0));
        ids.removeValueOnce(this.id);
        if (ids.length) {
            for (let id of ids) {
                let obj = PROFILE_ACTORS.show(id);
                if (obj.checkHitHeightPoint(HERO.centerHeightRight)) {
                    console.log(".......HERO hit", obj.name, obj.id);
                    if (obj.name === 'Box') {
                        obj.pick();
                        PROFILE_ACTORS.remove(id);
                    } else {
                        PROFILE_ACTORS.remove(id);
                        obj.explode();
                        GAME.addScore(obj.score);
                        HERO.die();
                    }
                }
            }
        }
    },
    accelerate(dir, time) {
        let dv = INI.acceleration * time / 1000;
        HERO.speed += dir * dv;
        HERO.speed = Math.min(HERO.speed, INI.max_speed);
        HERO.speed = Math.max(HERO.speed, INI.min_speed);
    },
    shoot() {
        if (!this.canShoot) return;
        this.canShoot = false;
        this.timer = new CountDown(`HERO_cooldown`, this.cooldown, this.release.bind(this));
        HERO.bulletX = Math.round(HERO.canonRootX + HERO.width * 0.98 * Math.cos(Math.radians(HERO.actor.angle + HERO.canonAngle)));
        HERO.bulletY = Math.round(HERO.canonRootY + HERO.width * 0.98 * Math.sin(Math.radians(HERO.actor.angle + HERO.canonAngle)));
        let origin = new FP_Grid(HERO.canonRootX, HERO.canonRootY);
        let bullet = new FP_Grid(HERO.bulletX, HERO.bulletY);
        let dir = origin.direction(bullet);
        let speed = new FP_Vector(HERO.bulletSpeed, HERO.bulletSpeed);
        PROFILE_BALLISTIC.add(new Ballistic(bullet, dir, speed));
    },
    die() {
        console.warn("...HERO dies...   (not yet implemented)");
    },
    checkHit(ballistic) {
        let top = ballistic.position.y + ballistic.actor.height / 2 > this.top;
        let bottom = ballistic.position.y - ballistic.actor.height / 2 < this.bottom;
        return top && bottom;
    },
    explode() {
        DESTRUCTION_ANIMATION.add(new Explosion(new Grid(this.moveState.x, this.y - this.actor.height / 2)));
        AUDIO.Explosion.play();
        this.die();
    }
};
var GAME = {
    start() {
        console.log("GAME started");
        if (AUDIO.Title) {
            AUDIO.Title.pause();
            AUDIO.Title.currentTime = 0;
        }
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");
        ENGINE.hideMouse();
        GAME.extraLife = SCORE.extraLife.clone();

        $("#pause").prop("disabled", false);
        $("#pause").off();
        GAME.paused = false;

        let GameRD = new RenderData("Alien", 60, "#DDD", "text", "#000", 2, 2, 2);
        ENGINE.TEXT.setRD(GameRD);
        ENGINE.watchVisibility(GAME.lostFocus);
        ENGINE.GAME.start(16);
        GAME.prepareForRestart();
        GAME.completed = false;
        GAME.won = false;
        GAME.level = 1;
        GAME.score = 0;
        GAME.lives = 3;
        HERO.startInit();
        GAME.fps = new FPS_measurement();
        GAME.levelStart();
    },
    levelStart() {
        console.log("starting level", GAME.level);
        GAME.initLevel(GAME.level);
        GAME.continueLevel(GAME.level);
    },
    initLevel(level) {
        console.log("init level", level);
        MAP.create(level, GAME.planes);
        PROFILE_BALLISTIC.init(MAP[level].map.planes[0]);
        DESTRUCTION_ANIMATION.init(MAP[level].map.planes[0]);
        PROFILE_ACTORS.init(MAP[level].map.planes[0]);
        DECOR.init(MAP[level].map.planes[0]);

        PROFILE_ACTORS.add(HERO);
        SPAWN.spawn(level);
    },
    continueLevel(level) {
        console.log("game continues on level", level);
        GAME.levelExecute(level);
    },
    levelExecute(level) {
        console.log("level", level, "executes");
        GAME.drawFirstFrame(level);
        GAME.resume();
    },
    levelEnd() {
        //SPEECH.speak("Good job!");
        GAME.levelCompleted = true;
        ENGINE.TEXT.centeredText("LEVEL COMPLETED", ENGINE.gameWIDTH, ENGINE.gameHEIGHT / 4);
        ENGINE.GAME.ANIMATION.stop();
        //TITLE.endLevel();
        //ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.nextLevel, "enter"));
    },
    nextLevel() {
        GAME.level++;
        GAME.levelCompleted = false;
        ENGINE.GAME.ANIMATION.waitThen(GAME.levelStart, 2);
    },
    run(lapsedTime) {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.respond(lapsedTime);
        MAP[GAME.level].map.movePlanes(lapsedTime, HERO.speed);
        PROFILE_BALLISTIC.manage(lapsedTime);
        DESTRUCTION_ANIMATION.manage(lapsedTime);
        PROFILE_ACTORS.manage(lapsedTime);
        HERO.move(lapsedTime);

        ENGINE.TIMERS.update();
        GAME.frameDraw(lapsedTime);
    },
    deadRun(lapsedTime) {
        //DESTRUCTION_ANIMATION.manage(lapsedTime);
        GAME.deadFrameDraw(lapsedTime);
    },
    deadFrameDraw(lapsedTime) {
        ENGINE.clearLayerStack();
    },
    frameDraw(lapsedTime) {
        ENGINE.clearLayerStack();
        TERRAIN.drawParallaxSlice(MAP[GAME.level].map, ENGINE.gameWIDTH);
        GAME.planes.forEach(ENGINE.layersToClear.add, ENGINE.layersToClear);

        DECOR.draw();
        PROFILE_ACTORS.draw();
        PROFILE_BALLISTIC.draw();
        HERO.draw();
        DESTRUCTION_ANIMATION.draw(lapsedTime);

        TITLE.canon_load();

        if (DEBUG.FPS) {
            GAME.FPS(lapsedTime);
        }
    },
    drawFirstFrame(level) {
        TITLE.firstFrame();
        GAME.PAINT.sky();
        TERRAIN.drawParallaxSlice(MAP[level].map, ENGINE.gameWIDTH);
        GAME.planes.forEach(ENGINE.layersToClear.add, ENGINE.layersToClear);
    },
    prepareForRestart() {
        ENGINE.TIMERS.clear();
    },
    setup() {
        console.time("gameSetup");
        console.group("setup");
        console.log("GAME SETUP started");
        $("#buttons").prepend("<input type='button' id='startGame' value='Start Game'>");
        $("#startGame").prop("disabled", true);
        GAME.planes = ["foreplane", "backplane1", "backplane2"];
        $("#conv").remove();
        console.timeEnd("gameSetup");
        console.groupEnd("setup");
    },
    setTitle() {
        const text = GAME.generateTitleText();
        const RD = new RenderData("Adore", 16, "#0E0", "bottomText");
        const SQ = new Square(0, 0, LAYER.bottomText.canvas.width, LAYER.bottomText.canvas.height);
        GAME.movingText = new MovingText(text, 4, RD, SQ);
    },
    generateTitleText() {
        let text = `${PRG.NAME} ${PRG.VERSION
            }, a game by Lovro Selic, ${"\u00A9"} C00LSch00L ${PRG.YEAR
            }. Title screen graphics by Trina Selic. Music: 'Determination' written and performed by LaughingSkull, ${"\u00A9"
            } 2007 Lovro Selic. `;
        text += "     ENGINE, SPEECH, GRID, MAZE, AI and GAME code by Lovro Selic using JavaScript. ";
        text = text.split("").join(String.fromCharCode(8202));
        return text;
    },
    runTitle() {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.movingText.process();
        GAME.titleFrameDraw();
    },
    titleFrameDraw() {
        GAME.movingText.draw();
    },
    lostFocus() {
        if (GAME.paused || false) return;
        GAME.clickPause();
    },
    clickPause() {
        if (false || GAME.levelCompleted) return;
        $("#pause").trigger("click");
        ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
    },
    pause() {
        if (GAME.paused) return;
        if (false || GAME.levelCompleted) return;
        console.log("%cGAME paused.", PRG.CSS);
        $("#pause").prop("value", "Resume Game [F4]");
        $("#pause").off("click", GAME.pause);
        $("#pause").on("click", GAME.resume);
        ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.clickPause, "F4"));
        ENGINE.TEXT.centeredText("Game Paused", ENGINE.gameWIDTH, ENGINE.gameHEIGHT / 2);
        GAME.paused = true;
        ENGINE.TIMERS.stop();
    },
    resume() {
        console.log("%cGAME resumed.", PRG.CSS);
        $("#pause").prop("value", "Pause Game [F4]");
        $("#pause").off("click", GAME.resume);
        $("#pause").on("click", GAME.pause);
        ENGINE.clearLayer("text");
        ENGINE.TIMERS.start();
        ENGINE.GAME.ANIMATION.resetTimer();
        ENGINE.GAME.ANIMATION.next(GAME.run);
        GAME.paused = false;
    },
    respond(lapsedTime) {
        if (false) return;
        var map = ENGINE.GAME.keymap;

        if (map[ENGINE.KEY.map.F4]) {
            $("#pause").trigger("click");
            ENGINE.TIMERS.display();
            ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
        }
        if (map[ENGINE.KEY.map.F9]) {
            //if (DEBUG.BUTTONS) DEBUG.finishLevel();
        }
        if (map[ENGINE.KEY.map.ctrl]) {
            HERO.shoot();
            ENGINE.GAME.keymap[ENGINE.KEY.map.ctrl] = false;
        }
        if (map[ENGINE.KEY.map.left]) {
            HERO.accelerate(-1, lapsedTime);
            return;
        }
        if (map[ENGINE.KEY.map.right]) {
            HERO.accelerate(1, lapsedTime);
            return;
        }
        if (map[ENGINE.KEY.map.up]) {
            HERO.canonAngle -= INI.canon_step;
            HERO.canonAngle = Math.max(HERO.canonAngle, -60);
            ENGINE.GAME.keymap[ENGINE.KEY.map.up] = false;
            return;
        }
        if (map[ENGINE.KEY.map.down]) {
            HERO.canonAngle += INI.canon_step;
            HERO.canonAngle = Math.min(HERO.canonAngle, 0);
            ENGINE.GAME.keymap[ENGINE.KEY.map.down] = false;
            return;
        }
        if (map[ENGINE.KEY.map.Q]) {
            HERO.bulletSpeed += INI.bullet_speed_step;
            HERO.bulletSpeed = Math.min(HERO.bulletSpeed, INI.max_bullet_speed);
            ENGINE.GAME.keymap[ENGINE.KEY.map.Q] = false;
            return;
        }
        if (map[ENGINE.KEY.map.A]) {
            HERO.bulletSpeed -= INI.bullet_speed_step;
            HERO.bulletSpeed = Math.max(HERO.bulletSpeed, INI.min_bullet_speed);
            ENGINE.GAME.keymap[ENGINE.KEY.map.A] = false;
            return;
        }
        return;
    },
    FPS(lapsedTime) {
        let CTX = LAYER.FPS;
        CTX.fillStyle = "black";
        ENGINE.clearLayer("FPS");
        let fps = 1000 / lapsedTime || 0;
        GAME.fps.update(fps);
        CTX.fillText(GAME.fps.getFps(), 5, 10);
    },
    endLaugh() {
        ENGINE.GAME.ANIMATION.stop();
        GAME.lives--;
        if (GAME.lives < 0 && !DEBUG.INF_LIVES) {
            console.log("GAME OVER");
            TITLE.gameOver();
            GAME.end();
        } else {
            GAME.continueLevel(GAME.level);
        }
    },
    end() {
        ENGINE.showMouse();
        AUDIO.Death.onended = GAME.checkScore;
        AUDIO.Death.play();
    },
    checkScore() {
        SCORE.checkScore(GAME.score);
        SCORE.hiScore();
        TITLE.startTitle();
    },
    addScore(score) {
        GAME.score += score;
        GAME.score = Math.max(0, GAME.score);
        TITLE.score();
    },
    PAINT: {
        sky() {
            let CTX = LAYER.background;
            let grad = CTX.createLinearGradient(0, 0, 0, ENGINE.gameHEIGHT);
            grad.addColorStop("0", "#C7E7FB");
            grad.addColorStop("0.1", "#BAE2FB");
            grad.addColorStop("0.2", "#B3DFFB");
            grad.addColorStop("0.6", "#ABDCFB");
            grad.addColorStop("1.0", "#4CC4EC");
            CTX.fillStyle = grad;
            CTX.fillRect(0, 0, ENGINE.gameWIDTH, ENGINE.gameHEIGHT);
        }
    },
};
var TITLE = {
    firstFrame() {
        TITLE.clearAllLayers();
        TITLE.topBackground();
        TITLE.bottomBackground();
        TITLE.scoreBackground();
        TITLE.titlePlot();
        TITLE.bottom();
        TITLE.hiScore();
        TITLE.canon_load();
        TITLE.score();
    },
    startTitle() {
        /*
        $("#pause").prop("disabled", true);
        if (AUDIO.Title) AUDIO.Title.play();
        TITLE.clearAllLayers();
        TITLE.blackBackgrounds();
        TITLE.titlePlot();
        ENGINE.draw("background", 0, 0, TEXTURE.GhostRun2_cover);
        $("#DOWN")[0].scrollIntoView();

        ENGINE.topCanvas = ENGINE.getCanvasName("ROOM");
        TITLE.drawButtons();
        GAME.setTitle();
        ENGINE.GAME.start(16);
        ENGINE.GAME.ANIMATION.next(GAME.runTitle);
        */
        GAME.start();
    },
    clearAllLayers() {
        ENGINE.layersToClear = new Set(["text", "actors", "explosion", "button", "title"]);
        ENGINE.clearLayerStack();
    },
    blackBackgrounds() {
        this.topBackground();
        this.bottomBackground();
        ENGINE.fillLayer("background", "#000");
        TITLE.scoreBackground();
    },
    scoreBackground() {
        ENGINE.fillLayer("score_background", "#222");
    },
    topBackground() {
        var CTX = LAYER.title;
        CTX.fillStyle = "#000";
        CTX.roundRect(0, 0, ENGINE.titleWIDTH, ENGINE.titleHEIGHT,
            { upperLeft: 20, upperRight: 20, lowerLeft: 0, lowerRight: 0 },
            true, true);
    },
    bottomBackground() {
        var CTX = LAYER.bottom;
        CTX.fillStyle = "#000";
        CTX.roundRect(0, 0, ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT,
            { upperLeft: 0, upperRight: 0, lowerLeft: 20, lowerRight: 20 },
            true, true);
    },
    sideBackground() {
        ENGINE.fillLayer("sideback", "#000");
    },
    bottom() {
        this.bottomVersion();
    },
    bottomVersion() {
        ENGINE.clearLayer("bottomText");
        let CTX = LAYER.bottomText;
        CTX.textAlign = "center";
        var x = ENGINE.bottomWIDTH / 2;
        var y = ENGINE.bottomHEIGHT / 2;
        CTX.font = "13px Consolas";
        CTX.fillStyle = "#88F";
        CTX.shadowOffsetX = 0;
        CTX.shadowOffsetY = 0;
        CTX.shadowBlur = 0;
        CTX.shadowColor = "#cec967";
        CTX.fillText("Version " + PRG.VERSION + " by Lovro Selič", x, y);
    },
    titlePlot() {
        let CTX = LAYER.title;
        let fs = 42;
        CTX.font = fs + "px Alien";
        CTX.textAlign = "left";
        let txt = CTX.measureText(PRG.NAME);
        let x = 24;
        let y = fs + 10;
        let gx = x - txt.width / 2;
        let gy = y - fs;
        let grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
        grad.addColorStop("0", "#DDD");
        grad.addColorStop("0.1", "#EEE");
        grad.addColorStop("0.2", "#DDD");
        grad.addColorStop("0.3", "#AAA");
        grad.addColorStop("0.4", "#999");
        grad.addColorStop("0.5", "#666");
        grad.addColorStop("0.6", "#555");
        grad.addColorStop("0.7", "#777");
        grad.addColorStop("0.8", "#AAA");
        grad.addColorStop("0.9", "#CCC");
        grad.addColorStop("1", "#EEE");
        CTX.fillStyle = grad;
        GAME.grad = grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText(PRG.NAME, x, y);
    },
    drawButtons() {
        ENGINE.clearLayer("button");
        FORM.BUTTON.POOL.clear();
        let x = 36;
        let y = 720;
        let w = 166;
        let h = 24;
        let startBA = new Area(x, y, w, h);
        let buttonColors = new ColorInfo("#F00", "#A00", "#222", "#666", 13);
        let musicColors = new ColorInfo("#0E0", "#090", "#222", "#666", 13);
        FORM.BUTTON.POOL.push(new Button("Start game", startBA, buttonColors, GAME.start));
        x += 1.2 * w;
        let music = new Area(x, y, w, h);
        FORM.BUTTON.POOL.push(new Button("Play title music", music, musicColors, TITLE.music));
        FORM.BUTTON.draw();
        $(ENGINE.topCanvas).on("mousemove", { layer: ENGINE.topCanvas }, ENGINE.mouseOver);
        $(ENGINE.topCanvas).on("click", { layer: ENGINE.topCanvas }, ENGINE.mouseClick);
    },
    music() {
        AUDIO.Title.play();
    },
    hiScore() {
        var CTX = LAYER.hiscore;
        var fs = 16;
        CTX.font = fs + "px Alien";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.textAlign = "left";
        var x = ENGINE.scoreWIDTH - 420;
        var y = ENGINE.scoreHEIGHT - fs;
        var index = SCORE.SCORE.name[0].indexOf("&nbsp");
        var HS;
        if (index > 0) {
            HS = SCORE.SCORE.name[0].substring(0, SCORE.SCORE.name[0].indexOf("&nbsp"));
        } else {
            HS = SCORE.SCORE.name[0];
        }
        var text = "HISCORE: " + SCORE.SCORE.value[0].toString().padStart(6, "0") + " by " + HS;
        CTX.fillText(text, x, y);
    },
    score() {
        ENGINE.clearLayer("score");
        var CTX = LAYER.score;
        var fs = 16;
        CTX.font = fs + "px Alien";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.textAlign = "left";
        var x = ENGINE.scoreWIDTH - 200;
        let y = ENGINE.scoreHEIGHT / 2;
        CTX.fillText(`SCORE: ${GAME.score.toString().padStart(6, "0")}`, x, y);

        if (GAME.score >= GAME.extraLife[0]) {
            GAME.lives++;
            GAME.extraLife.shift();
            TITLE.lives();
        }
    },
    lives() { },
    canon_load() {
        ENGINE.clearLayer("canon_load");
        let CTX = LAYER.canon_load;
        let style = "#E12";
        if (HERO.canShoot) {
            style = "#DEA";
        }
        CTX.fillStyle = style;
        CTX.strokeStyle = style;
        let x = 24;
        let fs = 14;
        let y = 1.5 * fs;
        CTX.font = fs + "px Alien";
        CTX.textAlign = "left";
        CTX.fillText("Load:", x, y);
        const w = 100;
        const h = 24;
        y += 5;
        CTX.fillRect(x, y, w * HERO.bulletSpeed / INI.max_bullet_speed, h);
        CTX.strokeRect(x, y, w, h);
    },
    gameOver() {
        ENGINE.clearLayer("text");
        var CTX = LAYER.text;
        CTX.textAlign = "center";
        var x = ENGINE.gameWIDTH / 2;
        var y = ENGINE.gameHEIGHT / 2;
        var fs = 64;
        CTX.font = fs + "px Arcade";
        var txt = CTX.measureText("GAME OVER");
        var gx = x - txt.width / 2;
        var gy = y - fs;
        var grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
        grad.addColorStop("0", "#DDD");
        grad.addColorStop("0.1", "#EEE");
        grad.addColorStop("0.2", "#DDD");
        grad.addColorStop("0.3", "#CCC");
        grad.addColorStop("0.4", "#BBB");
        grad.addColorStop("0.5", "#AAA");
        grad.addColorStop("0.6", "#BBB");
        grad.addColorStop("0.7", "#CCC");
        grad.addColorStop("0.8", "#DDD");
        grad.addColorStop("0.9", "#EEE");
        grad.addColorStop("1", "#DDD");
        CTX.fillStyle = grad;
        CTX.shadowColor = "#FFF";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText("GAME OVER", x, y);
    },
    endLevel() {

    },
};

// -- main --
$(function () {
    PRG.INIT();
    //SPEECH.init();
    PRG.setup();
    ENGINE.LOAD.preload();
    SCORE.init("SC", "GhostRun", 10, 2500);
    SCORE.loadHS();
    SCORE.hiScore();
    SCORE.extraLife = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, Infinity];
});