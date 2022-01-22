/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

class PlaneLimits {
    constructor(width = null, leftStop = 0, rightStop = null, open = true) {
        /**
         * open: if true you could move out of bounds, if right stop not set
         * open: if false, bounds not required, steepness will keep hero in the world
         * left, right stop: cant move object acis over the boundary, assumption: object (hero) has at least one ax
         */

        this.width = width;
        this.leftStop = leftStop;
        this.rightStop = rightStop || this.width;
        this.open = open;
    }
}
class ConstructionLimits {
    constructor(maxSlope = null, drawMaxHeight = null, drawMinHeight = null) {
        /**
         * maxSlope: max slope that can be generated
         * min, max height: don't generate above, below this limit
         */
        if (maxSlope === null || drawMaxHeight === null || drawMinHeight === null) {
            throw "ConstructionLimits: Required arguments not provided!";
        }
        this.maxSlope = maxSlope;
        this.drawMaxHeight = drawMaxHeight;
        this.drawMinHeight = drawMinHeight;
    }
}
class Plane {
    constructor(layer = null,  texture = null, complex = false, limits = null, constLimits = null) {
        /**
         * complex: has multiple arrays
         * not complex. only heightMap
         */
        if (layer === null  || texture === null || limits === null || constLimits === null) {
            throw "Plane constructor: Required arguments not provided!";
        }
        this.layer = layer;
        this.CTX = LAYER[this.layer];
        //this.speed = speed;
        this.PlaneLimits = limits;
        this.ConstuctionLimits = constLimits;
        this.complex = complex;
        this.texture = texture;
        this.DATA = {};
        this.DATA.heightMap = new Uint16Array(this.PlaneLimits.width);
        if (this.complex) {
            //this.DATA.featureMap = new Uint8Array(this.PlaneLimits.width);
            //this.DATA.featureDepth = new Uint8Array(this.PlaneLimits.width);
            //this.DATA.featureAbove = new Uint8Array(this.PlaneLimits.width);
            //this.DATA.decorationMap = new Uint8Array(this.PlaneLimits.width);
            //this.DATA.decorationDepth = new Uint8Array(this.PlaneLimits.width);
            //this.DATA.decorationAbove = new Uint8Array(this.PlaneLimits.width);
        }
    }
}
class Parallax {
    constructor(planes) {
        this.planes = planes;
    }
}

var TERRAIN = {
    VERSION: "0.00.01 DEV",
    CSS: "color: #8A2BE2",
    NAME: "TerrainGenerator1d",
    INI: {
        back_planes: 2,
        all_planes: 3,
        complexity: [true, false, false],
        back_slope_limit: 80,
        fore_slope_limit: 45,
        fore_plane_max: 0.50,
        fore_plane_min: 0.05,
        back_planes_max: [0.8, 0.99],
        back_planes_min: [0.3, 0.6],
    },
    createClassic(width, height, plane_layers, textures) {
        console.log("TERRAIN createClassic");
        let PL = new PlaneLimits(width);
        console.log(PL);
        let foreCL = new ConstructionLimits(TERRAIN.INI.fore_slope_limit,
            Math.floor(height - height * TERRAIN.INI.fore_plane_max),
            Math.floor(height - height * TERRAIN.INI.fore_plane_min));
        console.log(foreCL);
        let CL = [foreCL];
        for (let i = 0; i < TERRAIN.INI.back_planes; i++) {
            let BCL = new ConstructionLimits(TERRAIN.INI.back_slope_limit,
                Math.floor(height - height * TERRAIN.INI.back_planes_max[i]),
                Math.floor(height - height * TERRAIN.INI.back_planes_min[i]));
            //console.log(BCL);
            CL.push(BCL);
        }
        console.log(CL);
        let planes = [];
        for (let i = 0; i < TERRAIN.INI.all_planes; i++){
            let plane = new Plane(plane_layers[i], textures[i], TERRAIN.INI.complexity[i], PL, CL[i]);
            planes.push(plane);
        }
        console.log(planes);
    }
};

//END
console.log(`%c${TERRAIN.NAME} ${TERRAIN.VERSION} loaded.`, TERRAIN.CSS);