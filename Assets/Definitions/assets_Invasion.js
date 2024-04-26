//Assets for Invasion
console.log("Assets for INVASION ready.");

LoadTextures = [
    { srcName: "Wall/DarkGreyRock.jpg", name: "DarkGreyRock" },
    { srcName: "Wall/DarkRock.jpg", name: "DarkRock" },
    { srcName: "Wall/Grass.jpg", name: "Grass" },
    { srcName: "Wall/GreyRock.jpg", name: "GreyRock" },
    { srcName: "Wall/Sand.jpg", name: "Sand" },
    { srcName: "Wall/Snow.jpg", name: "Snow" },
];

LoadSprites = [
    { srcName: "Items/B17.png", name: "HelpPlane" },
    { srcName: "Items/Box.png", name: "Box" },
    { srcName: "Items/BrokenTank.png", name: "BrokenTank" },
    { srcName: "Items/Cannonball.png", name: "Cannonball" },
    { srcName: "Items/Hut.png", name: "Hut" },
    { srcName: "Items/LittleTank.png", name: "LittleTank" },
    { srcName: "Items/Parachute.png", name: "Parachute" },
    { srcName: "Items/Plane1.png", name: "Plane1" },
    { srcName: "Items/Plane10.png", name: "Plane10" },
    { srcName: "Items/Plane11.png", name: "Plane11" },
    { srcName: "Items/Plane2.png", name: "Plane2" },
    { srcName: "Items/Plane3.png", name: "Plane3" },
    { srcName: "Items/Plane4.png", name: "Plane4" },
    { srcName: "Items/Plane5.png", name: "Plane5" },
    { srcName: "Items/Plane6.png", name: "Plane6" },
    { srcName: "Items/Plane7.png", name: "Plane7" },
    { srcName: "Items/Plane8.png", name: "Plane8" },
    { srcName: "Items/Plane9.png", name: "Plane9" },
    { srcName: "Items/tree1.png", name: "tree1" },
    { srcName: "Items/tree2.png", name: "tree2" },
    { srcName: "Items/tree3.png", name: "tree3" },
    { srcName: "Items/tree4.png", name: "tree4" },
    { srcName: "Items/tree5.png", name: "tree5" },
    { srcName: "Items/tree6.png", name: "tree6" },
    { srcName: "Items/tree7.png", name: "tree7" },
    { srcName: "Items/tree8.png", name: "tree8" },
];

LoadAudio = [
    { srcName: "Explosion1.mp3", name: "Explosion" },
    { srcName: "UseScroll.mp3", name: "PickBox" },
    { srcName: "Fuse.mp3", name: "FailShoot" },
    { srcName: "TankFiring.mp3", name: "Shoot" },
    { srcName: "Failed magic.mp3", name: "PowerEnd" },
    { srcName: "Black Dog's Chain - LaugingSkull.mp3", name: "Title" }
];

LoadSheetSequences = [
    { srcName: "Explosion2.png", name: "Explosion", type: "png", count: 23 },
];

LoadFonts = [
    { srcName: "C64_Pro-STYLE.ttf", name: "C64" },
    { srcName: "CosmicAlien.ttf", name: "Alien" },
];
LoadRotated = [
    { srcName: "cevSilver.png", name: "Cev", rotate: { first: -150, last: 90, step: 1 } },
    { srcName: "cevSilverLeft.png", name: "CevLeft", rotate: { first: -90, last: 150, step: 1 } },
];
LoadRotatedSheetSequences = [
    { srcName: "tank.png", count: 3, name: "Tank", rotate: { first: -90, last: 90, step: 1 } },
    { srcName: "BlueTank.png", count: 3, name: "BlueTank", rotate: { first: -90, last: 90, step: 1 } },
    { srcName: "bomb1.png", count: 1, name: "Bomb", rotate: { first: 0, last: 180, step: 1 } },
];
