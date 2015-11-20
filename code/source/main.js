function onLoad() {
   // _window = new Window(400, 300, 0x1099bb);

    world = new b2World(new b2Vec2(0, 10), false);
    canvas = document.getElementById("c");
    var ctx = canvas.getContext("2d");
    canvas.addEventListener("click", onClick);
    //instantiate the creature
    creature = generateRandomCreature();
    //creature.addToWorld();

    var creature2 = generateRandomCreature();
    //creature2.addToWorld();

    var new_creature = crossover(creature, creature2);
    new_creature.addToWorld();

    //add boundaries
    var boundary_options = {
        width : 10,
        height: 10,
    }
    addRightWall(boundary_options);
    addLeftWall(boundary_options);
    addGround(boundary_options);


    //set up debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);
};
    
function onGraphics() {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();

    requestAnimFrame(onGraphics);
}

function onClick() {
    creature.pointMutation();
}

onLoad();
requestAnimFrame(onGraphics);