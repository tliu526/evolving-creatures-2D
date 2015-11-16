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

    var connected = new Array(masses.length * masses.length);
    for(var i = 0; i < connected.length; i++) {
	connected[i] = false;
    }

    for(var i = 0; i < 20; i++) {
	
	iA = Math.floor(Math.random()*masses.length);
	iB = Math.floor(Math.random()*masses.length);
        while (iA == iB 
	       || connected[iA + masses.length * iB] 
	       || connected[iB + masses.length * iA]) {
            iB = Math.floor(Math.random()*masses.length);
        }

	connected[iA + masses.length * iB] = true;
	connected[iB + masses.length * iA] = true;

        var bA = masses[iB]
        var bB = masses[iA]

	
	if (Math.random() < 0.5) {
	    var spring_options = {
		bodyA : bA,             
		bodyB : bB,
		restLength : Math.random()*50 + 15,
		damping : Math.random() / 2.0,
		frequency : Math.random()*50
	    }
	    
	    var spring = new Spring(spring_options);
	    spring.addToWorld();
	} else {
	    theta = Math.random()*Math.PI*2;

	    var muscle_options = {
		bodyA : bA,             
		bodyB : bB,
		lowerLimit : 0,
		upperLimit : Math.random()*1.5 + 1.0,
		motorSpeed : Math.random()*4.0 + 1.0,
		maxMotorForce: Math.random()*300.0 + 200.0,
		axis : new b2Vec2(Math.cos(theta), Math.sin(theta))
	    }
	    
	    var muscle = new Muscle(muscle_options);
	    muscle.addToWorld();
	}
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