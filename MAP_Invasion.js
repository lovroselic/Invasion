console.log("%cMAP for Invasion loaded.", "color: #888");
var MAP = {
    1:{
        width: 1,
        textures: [],
    },
    create(level,plane_layers){
        console.log("MAP creating level", level);
        let width = ENGINE.gameWIDTH * MAP[level].width;
        TERRAIN.createClassic(width, ENGINE.gameHEIGHT, plane_layers, MAP[level].textures);
    }
};
