/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

class PlaneLimits {
    constructor(width = null, wawelength = 64, drawMaxHeight = null, drawMinHeight = null, open = false, leftStop = 0, rightStop = null) {

        if (width === null || drawMaxHeight === null || drawMinHeight === null) {
            throw "ConstructionLimits: Required arguments not provided!";
        }
        this.width = width;
        this.leftStop = leftStop;
        this.rightStop = rightStop || this.width;
        this.open = open;
        this.WL = wawelength;
        this.drawMaxHeight = Math.floor(drawMaxHeight);
        this.drawMinHeight = Math.floor(drawMinHeight);
        this.mid = Math.floor((this.drawMaxHeight + this.drawMinHeight) / 2);
        this.amp = this.drawMaxHeight - this.drawMinHeight;
    }
}

class Plane {
    constructor(layer = null, texture = null, complex = false, limits = null, constLimits = null, speedFactor = null) {
        /**
         * complex: has multiple arrays
         * not complex. only heightMap
         */
        if (layer === null || texture === null || limits === null || constLimits === null || speedFactor === null) {
            console.log(arguments);
            throw "Plane constructor: Required arguments not provided!";
        }
        this.layer = layer;
        this.CTX = LAYER[this.layer];
        //this.speed = speed;
        this.PlaneLimits = limits;
        this.ConstuctionLimits = constLimits;
        this.complex = complex;
        this.texture = texture;
        this.speedFactor = speedFactor;
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

class PSNG {
    constructor() {
        this.M = 4294967296;
        this.A = 1664525;
        this.C = 1;
        this.Z = Math.floor(Math.random() * this.M);
    }
    next() {
        this.Z = (this.A * this.Z + this.C) % this.M;
        return this.Z / this.M - 0.5;
    }
}
class PerlinNoise {
    constructor(planeLimits, divisor = 1) {
        this.planeLimits = planeLimits;
        this.divisor = divisor;
        this.x = 0;
        this.psng = new PSNG();
        this.a = this.psng.next();
        this.b = this.psng.next();
        if (this.planeLimits.open) {
            this.a = 0.5;
            this.b = 0.5;
        }
        this.pos = [];
        while (this.x < this.planeLimits.width) {
            if (this.x % (this.planeLimits.WL / this.divisor) === 0) {
                this.a = this.b;
                if (this.planeLimits.open &&
                    (this.x < this.planeLimits.WL / this.divisor || this.planeLimits.width - this.x <= 2 * (this.planeLimits.WL / this.divisor))) {
                    this.b = 0.5;
                } else {
                    this.b = this.psng.next();
                }
                this.pos.push(this.a * this.planeLimits.amp / (this.divisor ** PERLIN.INI.divisor_exponent));
            } else {
                this.pos.push(this.interpolate() * this.planeLimits.amp / (this.divisor ** PERLIN.INI.divisor_exponent));
            }
            this.x++;
        }
    }
    interpolate() {
        let ft = Math.PI * ((this.x % (this.planeLimits.WL / this.divisor)) / (this.planeLimits.WL / this.divisor));
        let f = (1 - Math.cos(ft)) * 0.5;
        return this.a * (1 - f) + this.b * f;
    }
    smoothStep() {
        let t = (this.x % (this.planeLimits.WL / this.divisor)) / (this.planeLimits.WL / this.divisor);
        let f = 6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3;
        return this.a * (1 - f) + this.b * f;
    }
    get() {
        return Uint16Array.from(this.pos.map(x => Math.round(x + this.planeLimits.mid)));
    }
}

var PERLIN = {
    CSS: "color: #2ACBE8",
    INI: {
        divisor_base: 2,
        divisor_exponent: 2.1,
    },
    drawLine(CTX, data, color = "#000") {
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.stroke();
    },
    drawShape(CTX, data, color) {
        CTX.fillStyle = color;
        CTX.strokeStyle = color;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.lineTo(CTX.canvas.width - 1, CTX.canvas.height - 1);
        CTX.lineTo(0, CTX.canvas.height - 1);
        CTX.lineTo(0, data[0]);
        CTX.closePath();
        CTX.stroke();
        CTX.fill();
    },
    generateNoise(planeLimits, octaves) {
        let results = [];
        for (let i = 0; i < octaves; i++) {
            let divisor = PERLIN.INI.divisor_base ** i;
            let perlin = new PerlinNoise(planeLimits, divisor);
            results.push(perlin.pos);
        }
        return results;
    },
    combineNoise(perlins) {
        let LN = perlins[0].length;
        let summed = [];
        for (let i = 0; i < LN; i++) {
            let total = 0;
            for (let j = 0; j < perlins.length; j++) {
                total += perlins[j][i];
            }
            summed.push(total);
        }
        return summed;
    },
    getNoise(planeLimits, octaves) {
        let noise = this.combineNoise(this.generateNoise(planeLimits, octaves));
        return Uint16Array.from(noise.map(x => x + planeLimits.mid));
    }
};

var TERRAIN = {
    VERSION: "0.01.00 DEV",
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
        back_planes_min: [0.25, 0.5],
        speed_factor: [1.0, 0.5, 0.25],
    },
    createClassic(width, height, plane_layers, textures) {
        console.log("TERRAIN createClassic", arguments);
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
            CL.push(BCL);
        }
        console.log(CL);
        let planes = [];
        for (let i = 0; i < TERRAIN.INI.all_planes; i++) {
            let plane = new Plane(plane_layers[i], TEXTURE[textures[i]], TERRAIN.INI.complexity[i], PL, CL[i], TERRAIN.INI.speed_factor[i]);
            planes.push(plane);
        }
        console.log("Planes", planes);

        let parralax = new Parallax(planes);
        console.log('parralax', parralax);
    },
    renderPlane(plane) { }
};

//END
console.log(`%c${TERRAIN.NAME} ${TERRAIN.VERSION} loaded.`, TERRAIN.CSS);