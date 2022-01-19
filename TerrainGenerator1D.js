/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

class PlaneLimits {
    constructor(width = null, leftStop = 0, rightStop = null, bidirectional = false, open = rrue) {
        /**
         * bidirectional: can move to right and also left
         * if bidirectinal false movement to the right only
         * open: if true you could move out of bounds, if right stop not set
         * open: if false, bounds not required, steepness will keep hero in the world
         * left, right stop: cant move object acis over the boundary, assumption: object (hero) has at leas on ax
         */
        this.leftStop = leftStop;
        this.rightStop = rightStop;
        this.bidirectional = bidirectional;
        this.width = width;
        this.open = open;
    }
}
class ConstructionLimits {
    constructor(maxSlope = null, drawMaxHeight = null, drawMinHeight = 0) {
        /**
         * maxSlope: max slope that can be generated
         * min, max height: don't generate above, below this limit
         */
        this.maxSlope = maxSlope;
        this.drawMaxHeight = drawMaxHeight;
        this.drawMinHeight = drawMinHeight;
    }
}
class Plane {
    constructor(layer, speed, multiTexture = true, limits = null, constLimits = null) {
        this.layer = layer;
        this.CTX = LAYER[this.layer];
        this.speed = speed;
        this.PlaneLimits = limits;
        this.ConstuctionLimits = constLimits;
    }
}

var TERRAIN = {
    VERSION: "0.00.1 DEV",
    CSS: "color: #8A2BE2",
    NAME: "TerrainGenerator1d",
    INI: {},
};

//END
console.log(`%c${TERRAIN.NAME} ${TERRAIN.VERSION} loaded.`, TERRAIN.CSS);