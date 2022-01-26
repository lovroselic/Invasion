console.log("%cMAP for Invasion loaded.", "color: #888");
var MAP = {
    1: {
        width: 6,
        textures: ["Grass", "DarkGreyRock", "GreyRock"],
        //textures: ["Grass", "GreyRock","DarkGreyRock"],
        colors: ["#0E0", '#444', '#888'],
    },
    create(level, plane_layers) {
        let W = ENGINE.gameWIDTH * MAP[level].width;
        let H = ENGINE.gameHEIGHT;
        let map = TERRAIN.createClassic(W, H, plane_layers, MAP[GAME.level].textures, MAP[GAME.level].colors);
        MAP[level].map = map;
    }
};
