console.log("%cMAP for Invasion loaded.", "color: #888");
var MAP = {
    1: {
        width: 6,
        textures: ["Grass", "Mountain4", "Mountain1"],
        colors: ["#0E0", '#444', '#888'],
    },
    create(level, plane_layers) {
        console.log("MAP creating level", level, arguments);
        let W = ENGINE.gameWIDTH * MAP[level].width;
        let H = ENGINE.gameHEIGHT;
        let map = TERRAIN.createClassic(W, H, plane_layers, MAP[GAME.level].textures, MAP[GAME.level].colors);
        MAP[level].map = map;
        console.log("MAP", MAP[level]);
        TERRAIN.drawParallax(map);


    }
};
