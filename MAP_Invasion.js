console.log("%cMAP for Invasion loaded.", "color: #888");
var MAP = {
    1: {
        width: 4,
        textures: ["Grass", "Mountain4", "Mountain1"],
    },
    create(level, plane_layers) {
        console.log("MAP creating level", level, arguments);
        let W = ENGINE.gameWIDTH * MAP[level].width;
        let H = ENGINE.gameHEIGHT;

        //back2
        let BackPlane2 = new PlaneLimits(W, 64, 0.5 * H, 0.15 * H);
        let Back2PN = PERLIN.getNoise(BackPlane2, 3);

        //back1
        let BackPlane1 = new PlaneLimits(W, 96, 0.7 * H, 0.3 * H);
        let Back1PN = PERLIN.getNoise(BackPlane1, 3);

        //fore
        let ForePlane = new PlaneLimits(W, 256, 0.95 * H, 0.5 * H, true);
        let ForePerlinNoise = PERLIN.getNoise(ForePlane, 1);

        PERLIN.drawShape(LAYER.background2, Back2PN, '#888');
        PERLIN.drawShape(LAYER.background2, Back1PN, '#444');
        PERLIN.drawShape(LAYER.background2, ForePerlinNoise, "#0E0");
    }
};
