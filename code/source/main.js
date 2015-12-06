var visWorld;
var ga;

function onLoad() {
    var creatureOptions = {
	massLowerLimit : 4,
	massUpperLimit : 12,
	edgeLowerProportion : 0.7,
	edgeUpperProportion : 0.9,
	probMuscle : 0.8,
	xBound : 3,
	yBound : 3
    }

    var gaOptions = {
        maxGen : 50,
        popSize : 50,
        mutRate : 0.5,
        graftRate : 0.3,
        crossRate : 0.3,
        survRatio : 0.25,
        fitness : distFitness
    };

    ga = new GA(gaOptions, creatureOptions);
};

function onGraphics() {
    for (var i = 0; i < 4; i++) {
	visWorld[i].ctx.save();
	visWorld[i].ctx.clearRect(0,0,visWorld[i].canvas.width,visWorld[i].canvas.height);
	
	var creature = visWorld[i].creature;
	if(creature){
	    var bounds = creature.getBoundingBox();
	    var xCenter = (bounds.xLow + bounds.xHigh) / 2;
	    var dx;
	    var dy;
	    var cameraLoc = visWorld[i].cameraLocation;
	    if(bounds.xLow * visWorld[i].scale < (cameraLoc.x + visWorld[i].canvas.width*0.25)){
		dx = bounds.xLow * visWorld[i].scale - (cameraLoc.x + visWorld[i].canvas.width*0.25); 
	    }

	    if(bounds.xHigh * visWorld[i].scale > (cameraLoc.x + visWorld[i].canvas.width*.75)) {
		dx = bounds.xHigh * visWorld[i].scale - (cameraLoc.x + visWorld[i].canvas.width*0.75); 
	    }
	    if(dx){
        	visWorld[i].cameraLocation.x += 2 * dx;
        	visWorld[i].cameraLocation.x = clamp(visWorld[i].cameraLocation.x, 0, 100000);
	    }
	    /*
	      if(dy){
	      visWorld[i].ctx.translate(dy, 0);
	      visWorld[i].cameraLocation.y += dy;
	      }
	    */
	}

	visWorld[i].ctx.translate(-visWorld[i].cameraLocation.x, 0);
	
	visWorld[i].b2world.Step(1/60, 10, 10);
	visWorld[i].b2world.ClearForces();
	visWorld[i].ctx.restore();
	visWorld[i].draw();
    }
    requestAnimFrame(onGraphics);
}

function onClick() {
    //TODO add skip generation here
}

function simulate() {
    var options = {
	hasWalls     : false,
	hasGround    : false,
	isDistTest   : true,
	wallWidth    : 0.4,
	groundHeight : 0.4
    };

    if(ga.next()){
        document.getElementById("generation").innerHTML = "Generation: " + ga.curGen; 
        curTime = 0;

	visWorld = new Array(4);
	
	for (var i = 0; i < 4; i++) {
	    options.elementID = String("c" + i);
	    visWorld[i] = new World(options);

	    var creature = ga.curPop[i];
	    creature.addToWorld(visWorld[i]);
	    creature.resetPosition();
	    visWorld[i].label = String("Fitness: " + creature.fitness);
	}

        //console.log(distFitness(creature));
        //setTimeout(simulate, SIMULATION_TIME*500);
        setTimeout(simulate, SIMULATION_TIME*1000);
    }
}

onLoad();
simulate();
requestAnimFrame(onGraphics);