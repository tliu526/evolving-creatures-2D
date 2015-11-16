function onLoad() {
   // _window = new Window(400, 300, 0x1099bb);

    world = new b2World(new b2Vec2(0, 10), false);
    canvas = document.getElementById("c");
    var ctx = canvas.getContext("2d");

    //add our masses to the world
    for(var i = 0; i < 10; i++){
        var mass_options = {
            x           : Math.random()*(canvas.width-50) + 50,
            y           : ((Math.random()*canvas.height) / 2),
            density     : 1.0,
            restitution : 0.2,
            friction    : 0.5,
            isStatic    : false
        }
        console.log("x: " + mass_options.x);
        console.log("y: " + mass_options.y);

        components.push(new Mass(mass_options));
        components[i].addToWorld();
    }

    for(var i = 0; i < 10; i++){

        var bA = masses[Math.floor(Math.random()*masses.length)]
        var bB = masses[Math.floor(Math.random()*masses.length)]
        while (bA == bB){
            bB = masses[Math.floor(Math.random()*masses.length)]
        }

        var spring_options = {
            bodyA : bA,             
            bodyB : bB,
            restLength : Math.random()*50 + 15,
            damping : Math.random() / 2.0,
            frequency : Math.random()*50
        }

        var spring = new Spring(spring_options);
        spring.addToWorld();
    }


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

onLoad();
requestAnimFrame(onGraphics);