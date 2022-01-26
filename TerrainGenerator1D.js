/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

class PlaneLimits {
    constructor(width = null, wawelength = 64, drawMaxHeight = null, drawMinHeight = null, open = false, leftStop = 0, rightStop = null) {

        if (width === null || drawMaxHeight === null || drawMinHeight === null) {
            throw "PlaneLimits: Required arguments not provided!";
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
    constructor(map = null, planeLimits = null, layer = null, texture = null, speedFactor = null, color = "#000") {
        if (map === null || layer === null || texture === null || speedFactor === null) {
            console.log(arguments);
            throw "Plane constructor: Required arguments not provided!";
        }
        this.DATA = {};
        this.DATA.map = map;
        this.layer = layer;
        this.CTX = LAYER[this.layer];
        this.planeLimits = planeLimits;
        this.texture = texture;
        this.speedFactor = speedFactor;
        this.color = color;
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
    INI: {
        divisor_base: 2,
        divisor_exponent: 2.1,
    },
    drawLine(CTX, plane) {
        CTX.strokeStyle = plane.color;
        let data = plane.DATA.map;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.stroke();
    },
    drawShape(plane) {
        let CTX = plane.CTX;
        CTX.fillStyle = plane.color;
        let data = plane.DATA.map;
        CTX.beginPath();
        CTX.moveTo(0, data[0]);
        for (let i = 1; i < data.length; i++) {
            CTX.lineTo(i, data[i]);
        }
        CTX.lineTo(CTX.canvas.width - 1, CTX.canvas.height - 1);
        CTX.lineTo(0, CTX.canvas.height - 1);
        CTX.lineTo(0, data[0]);
        CTX.closePath();
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
    CSS: "color: #2ACBE8",
    NAME: "TerrainGenerator1d",
    INI: {
        planes: 3,
        planes_max: [0.95, 0.7, 0.5],
        planes_min: [0.5, 0.3, 0.15],
        speed_factor: [1.0, 0.5, 0.25],
        WL: [256, 96, 64],
        open: [true, false, false],
        octaves: [1, 4, 3]
    },
    createClassic(W, H, plane_layers, textures, colors) {
        let planes = [];
        for (let i = 0; i < TERRAIN.INI.planes; i++) {
            let PL = new PlaneLimits(W, TERRAIN.INI.WL[i], TERRAIN.INI.planes_max[i] * H, TERRAIN.INI.planes_min[i] * H, TERRAIN.INI.open[0]);
            let Noise = PERLIN.getNoise(PL, TERRAIN.INI.octaves[i]);
            let plane = new Plane(Noise, PL, plane_layers[i], textures[i], TERRAIN.INI.speed_factor[i], colors[i]);
            planes.push(plane);
        }
        let px = new Parallax(planes);
        return px;
        //TERRAIN.drawParallax(px);
    },
    drawParallax(px) {
        for (let pl of px.planes) {
            PERLIN.drawShape(pl);
        }
    }
};

//END
console.log(`%c${TERRAIN.NAME} ${TERRAIN.VERSION} loaded.`, TERRAIN.CSS);