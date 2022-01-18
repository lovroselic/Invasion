/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

class PlaneLimits {
    constructor(width = null, leftStop = 0, rightStop = null, bidirectional = false) {
        this.leftStop = leftStop;
        this.rightStop = rightStop;
        this.bidirectional = bidirectional;
        this.width = width;
    }
}
class ConstructionLimits {
    constructor(maxSlope = null, drawMaxHeight = null, drawMinHeight = 0) {
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