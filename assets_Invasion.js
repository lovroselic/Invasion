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
    { srcName: "SmallHut.png", name: "Hut" },
    { srcName: "spruce.png", name: "tree1" },
    { srcName: "leaftree1.png", name: "tree2" },
    { srcName: "leaftree2.png", name: "tree3" },
    { srcName: "tree4.png", name: "tree4" },
    { srcName: "tree5.png", name: "tree5" },
    { srcName: "tree6.png", name: "tree6" },
    { srcName: "tree7.png", name: "tree7" },
    { srcName: "tree8.png", name: "tree8" },
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
    { srcName: "Explosion1.mp3", name: "Explosion" },
];
var ExtendSheetTag = [];
var LoadSheetSequences = [
    { srcName: "Explosion2.png", name: "Explosion", type: "png", count: 23 },
];
var LoadRotatedSheetSequences = [
    { srcName: "tank.png", count: 3, name: "Tank", rotate: { first: -90, last: 90, step: 1 } },
    { srcName: "BlueTank.png", count: 3, name: "BlueTank", rotate: { first: -90, last: 90, step: 1 } },
];
var LoadFonts = [
    { srcName: "C64_Pro-STYLE.ttf", name: "C64" },
    { srcName: "CosmicAlien.ttf", name: "Alien" },
];

//////////////////Preprocess data ////////////////////////////
var AssetNamesToRotate = ["Tank"];