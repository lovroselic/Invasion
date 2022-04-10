console.log("%cMAP for Invasion loaded.", "color: #888");
class StaticPoint {
    constructor(index, midHeight) {
        this.index = index;
        this.midHeight = midHeight;
    }
}
var MAP = {
    1: {
        width: 6,
        huts: 25,
        textures: ["Grass", "DarkGreyRock", "GreyRock"],
        colors: ["#0E0", '#444', '#888'],
        tank_spawn: 10,
        plane_spawn: 20,
        help_spawn: 20,
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
        this.spawnTank();
        this.spawnPlane();
        this.spawnHelp();
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
        let map = MAP[GAME.level].map;
        let position = map.planes[0].getPosition();
        const timerId = 'tankSpawn';
        let offset = 48;
        let x = position + ENGINE.gameWIDTH + offset;
        if (x >= map.planes[0].planeLimits.rightStop) {
            console.log("spawning tanks terminated");
            return;
        }
        PROFILE_ACTORS.add(new Tank(x));
        SPAWN.tankTimer = new CountDown(timerId, RND(MAP[GAME.level].tank_spawn - 1, MAP[GAME.level].tank_spawn + 1), SPAWN.spawnTank);
    },
    spawnPlane() {
        let map = MAP[GAME.level].map;
        let position = map.planes[0].getPosition();
        const timerId = 'planeSpawn';
        let offset = 64;
        let x = position + ENGINE.gameWIDTH + offset;
        if (x >= map.planes[0].planeLimits.rightStop) {
            console.log("spawning planes terminated");
            return;
        }
        PROFILE_ACTORS.add(new AirPlane(x));
        SPAWN.planeTimer = new CountDown(timerId, RND(MAP[GAME.level].plane_spawn - 2, MAP[GAME.level].plane_spawn + 2), SPAWN.spawnPlane);
    },
    spawnHelp() {
        let map = MAP[GAME.level].map;
        let x = map.planes[0].getPosition();
        if (x >= map.planes[0].planeLimits.rightStop - ENGINE.gameWIDTH) {
            console.log("spawning help terminated");
            return;
        }
        const timerId = 'helpSpawn';
        PROFILE_ACTORS.add(new HelpPlane(x, 1, false));
        SPAWN.planeTimer = new CountDown(timerId, RND(MAP[GAME.level].help_spawn - 2, MAP[GAME.level].help_spawn + 2), SPAWN.spawnHelp);
    }
};