console.log("%cMAP for Invasion loaded.", "color: #888");
class StaticPoint {
    constructor(index, midHeight) {
        this.index = index;
        this.midHeight = midHeight;
    }
}
var MAP = {
    createNewLevel(level) {
        if (!MAP.hasOwnProperty(level)) {
            MAP[level] = $.extend(true, {}, MAP[INI.final_level]);
        }
    },
    1: {
        width: 6,
        huts: 25,
        textures: ["Grass", "DarkGreyRock", "GreyRock"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 30,
        plane_spawn: 60,
        help_spawn: 10,
        ammunition: 1000 * 40,
    },
    2: {
        width: 6,
        huts: 25,
        textures: ["Sand", "Grass", "DarkGreyRock"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 25,
        plane_spawn: 40,
        help_spawn: 15,
        ammunition: 1000 * 35,
    },
    3: {
        width: 6,
        huts: 25,
        textures: ["Snow", "GreyRock", "DarkGreyRock"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 20,
        plane_spawn: 30,
        help_spawn: 20,
        ammunition: 1000 * 30,
    },
    4: {
        width: 6,
        huts: 25,
        textures: ["Grass", "DarkGreyRock", "Snow"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 15,
        plane_spawn: 25,
        help_spawn: 25,
        ammunition: 1000 * 30,
    },
    5: {
        width: 6,
        huts: 30,
        textures: ["Sand", "DarkGreyRock", "Snow"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 10,
        plane_spawn: 20,
        help_spawn: 30,
        ammunition: 1000 * 25,
    },
    6: {
        width: 6,
        huts: 30,
        textures: ["Grass", "DarkGreyRock", "Snow"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 10,
        plane_spawn: 18,
        help_spawn: 32,
        ammunition: 1000 * 25,
    },
    7: {
        width: 6,
        huts: 30,
        textures: ["GreyRock", "DarkGreyRock", "Grass"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 10,
        plane_spawn: 15,
        help_spawn: 35,
        ammunition: 1000 * 25,
        
    },
    8: {
        width: 6,
        huts: 32,
        textures: ["Grass", "DarkGreyRock", "Snow"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 10,
        plane_spawn: 12,
        help_spawn: 40,
        ammunition: 1000 * 25,
    },
    create(level, plane_layers) {
        let W = ENGINE.gameWIDTH * MAP[level].width;
        let H = ENGINE.gameHEIGHT;
        let map = TERRAIN.createClassic(W, H, plane_layers, MAP[GAME.level].textures, MAP[GAME.level].colors);
        MAP[level].map = map;
        MAP[level].map.staticPoints = MAP.findStatic(map);
        console.log('MAP[level].map', MAP[level].map);
    },
    findStatic(map) {
        const AngleLimit = 10.0;
        const DistancePadding = 2;
        const SearchStep = 0.25;
        let data = map.planes[0].DATA.map;
        let WL = map.planes[0].planeLimits.WL;
        let WindowSize = INI.sprite_width;
        let staticPoints = [];
        let LN = data.length;
        let index = WL;
        while (index < LN - WL) {
            let y1 = data[index];
            let y2 = data[index + WindowSize + 1];
            let angle = Math.degrees(Math.asin((y2 - y1) / WindowSize));
            if (Math.abs(angle) <= AngleLimit) {
                let midheight = data[Math.round(index + 0.5 * WindowSize)];
                midheight = Math.max(midheight, y1, y2);
                staticPoints.push(new StaticPoint(Math.round(index + 0.5 * WindowSize), midheight));
                index += Math.round(DistancePadding * WindowSize);
            } else {
                index += Math.round(SearchStep * WindowSize);
            }
        }
        return staticPoints;
    }
};
var SPAWN = {
    tankTimer: null,
    spawn(level) {
        this.spawnTrees(level);
        this.spawnHuts(level);
        this.spawnHelp();
        let wait = new CountDown('spawnDelay', 3, SPAWN.spawnEnemy);
    },
    spawnEnemy() {
        SPAWN.spawnTank();
        SPAWN.spawnPlane();
    },
    spawnHuts(level) {
        let map = MAP[level].map;
        let positions = map.staticPoints.removeRandomPool(MAP[level].huts);
        for (let pos of positions) {
            PROFILE_ACTORS.add(new Hut(new Grid(pos.index, pos.midHeight)));
        }
    },
    spawnTrees(level) {
        let map = MAP[level].map;
        let data = map.planes[0].DATA.map;
        let WL = map.planes[0].planeLimits.WL;
        let LN = data.length;
        const W = 24;
        const minTree = 1;
        const maxTree = 13;
        const minClearing = 5;
        const maxClearing = 23;
        let index = WL;
        let forest = coinFlip();
        while (index < LN - WL) {
            if (forest) {
                let treeN = RND(minTree, maxTree);
                for (let t = 0; t < treeN; t++) {
                    let midheight = data[index] + 2;
                    DECOR.add(new Tree(new Grid(index, midheight)));
                    index += W;
                }
            } else {
                index += RND(minClearing, maxClearing) * W;
            }
            forest = !forest;
        }
    },
    spawnTank() {
        if (HERO.dead) return;
        let map = MAP[GAME.level].map;
        let position = map.planes[0].getPosition();
        const timerId = 'tankSpawn';
        let offset = 48;
        let x = position + ENGINE.gameWIDTH + offset;
        if (x >= map.planes[0].planeLimits.rightStop) {
            return;
        }
        PROFILE_ACTORS.add(new Tank(x));
        SPAWN.tankTimer = new CountDown(timerId, RND(MAP[GAME.level].tank_spawn - 1, MAP[GAME.level].tank_spawn + 1), SPAWN.spawnTank);
    },
    spawnPlane() {
        if (HERO.dead) return;
        let map = MAP[GAME.level].map;
        let position = map.planes[0].getPosition();
        const timerId = 'planeSpawn';
        let offset = 64;
        let x = position + ENGINE.gameWIDTH + offset;
        if (x >= map.planes[0].planeLimits.rightStop) {
            return;
        }
        PROFILE_ACTORS.add(new AirPlane(x));
        SPAWN.planeTimer = new CountDown(timerId, RND(MAP[GAME.level].plane_spawn - 2, MAP[GAME.level].plane_spawn + 2), SPAWN.spawnPlane);
    },
    spawnHelp() {
        if (HERO.dead) return;
        let map = MAP[GAME.level].map;
        let x = map.planes[0].getPosition();
        if (x >= map.planes[0].planeLimits.rightStop - ENGINE.gameWIDTH) {
            return;
        }
        const timerId = 'helpSpawn';
        PROFILE_ACTORS.add(new HelpPlane(x, 1, false));
        SPAWN.planeTimer = new CountDown(timerId, RND(MAP[GAME.level].help_spawn - 2, MAP[GAME.level].help_spawn + 2), SPAWN.spawnHelp);
    }
};