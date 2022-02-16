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
        //textures: ["Grass", "GreyRock","DarkGreyRock"],
        colors: ["#0E0", '#444', '#888'],
    },
    create(level, plane_layers) {
        let W = ENGINE.gameWIDTH * MAP[level].width;
        let H = ENGINE.gameHEIGHT;
        let map = TERRAIN.createClassic(W, H, plane_layers, MAP[GAME.level].textures, MAP[GAME.level].colors);
        MAP[level].map = map;
        MAP[level].map.staticPoints = MAP.findStatic(map);
        //MAP.spawnHuts(level);
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
                //staticPoints.push(new StaticPoint(index, midheight));
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
    spawn(level) {
        this.spawnHuts(level);
    },
    spawnHuts(level) {
        console.group("+++++++++++++++++");
        let map = MAP[level].map;
        let positions = map.staticPoints.removeRandomPool(MAP[level].huts);
        console.log("spawning huts", map);
        console.log(positions);
        for (let pos of positions) {
            PROFILE_ACTORS.add(new Hut(new Grid(pos.index, pos.midHeight)));
            console.log(pos);
        }
        console.log(PROFILE_ACTORS.POOL);
        console.groupEnd("+++++++++++++++++");
    },
};