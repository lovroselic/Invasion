//Assets for GhostRun2
console.log("Assets for template ready.");

var LoadTextures = [
    { srcName: "grass1.png", name: "Grass" },
    { srcName: "GreyRock.jpg", name: "GreyRock" },
    { srcName: "DarkRock.png", name: "DarkRock" },
    { srcName: "DarkGreyRock.jpg", name: "DarkGreyRock" },
];
var LoadSprites = [
    { srcName: "Cannonball12-2.png", name: "Cannonball" },
    //{ srcName: "Cannonball12.png", name: "Cannonball" },
];
var LoadSequences = [];
var LoadSheets = [];
var LoadRotated = [
    { srcName: "cevSilver.png", name: "Cev", rotate: { first: -150, last: 90, step: 1 } },
    //{ srcName: "cev.png", name: "Cev", rotate: { first: -150, last: 90, step: 1 } },
];
var LoadPacks = [];
var LoadExtWasm = [];
var LoadAudio = [
];
var ExtendSheetTag = [];
var LoadSheetSequences = [
    { srcName: "tank.png", count: 3, name: "Tank" },
    { srcName: "Explosion2.png", name: "Explosion", type: "png", count: 23 },
];
var LoadFonts = [
    { srcName: "C64_Pro-STYLE.ttf", name: "C64" },
    { srcName: "CosmicAlien.ttf", name: "Alien" },
];

//////////////////Preprocess data ////////////////////////////
var AssetNamesToRotate = ["Tank"];