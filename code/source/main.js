var visWorld;
var ga;

function onLoad() {
    var creatureOptions = {
	massLowerLimit : 10,
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
		if(xCenter < (cameraLoc.x + visWorld[i].canvas.width*0.25)){
			dx = xCenter - (cameraLoc.x + visWorld[i].canvas.width*0.25); 
		}
		else if(xCenter > (cameraLoc.x + visWorld[i].canvas.width*.75)) {
			dx = xCenter - (cameraLoc.x + visWorld[i].canvas.width*0.75);
		}
        if(dx){
        	visWorld[i].cameraLocation.x += dx;
        	visWorld[i].cameraLocation.x = clamp(visWorld[i].cameraLocation.x, 0, Infinity);
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
<<<<<<< HEAD
	visWorld[i].draw();
=======
	visWorld[i].ctx.fillText(visWorld[i].label, 10, 10);

	//draw bounding box
	/*
	var creature = ga.curPop[i];
	var bounds = creature.getBoundingBox();
	visWorld[i].ctx.strokeStyle = "red";
	visWorld[i].ctx.rect(bounds.xLow, bounds.yLow, bounds.xHigh - bounds.xLow, bounds.yHigh - bounds.yLow);
	visWorld[i].ctx.stroke();

	visWorld[i].ctx.strokeStyle = "blue";
	visWorld[i].ctx.beginPath();
	visWorld[i].ctx.moveTo(3*visWorld[i].groundHeight, 0);
	visWorld[i].ctx.lineTo(3*visWorld[i].groundHeight, visWorld[i].canvas.height);
	visWorld[i].ctx.stroke();
	*/
>>>>>>> 20dd95a97313031e9b702c03c17f8ec34fc37fb5
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