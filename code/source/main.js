var visWorld;
var ga;
var paused = false;

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
        maxGen : 100,
        popSize : 20,
        mutRate : 0,
        graftRate : 0.3,
        crossRate : 0.3,
        survRatio : 0.25,
        fitness : distFitness
    };

    ga = new GA(gaOptions, creatureOptions);
};

function onGraphics() {
	if(!paused){
		for (var i = 0; i < 4; i++) {
			visWorld[i].ctx.save();
			visWorld[i].ctx.clearRect(0,0,visWorld[i].canvas.width,visWorld[i].canvas.height);

			var creature = visWorld[i].creature;
			if(creature){
				var bounds = creature.getBoundingBox();
				var xCenter = (bounds.xLow + bounds.xHigh) / 2;
				var camera = visWorld[i].camera;
	            /*
	            if(bounds.xLow * visWorld[i].scale < (cameraLoc.x + visWorld[i].canvas.width*0.25)){
		        dx = bounds.xLow * visWorld[i].scale - (cameraLoc.x + visWorld[i].canvas.width*0.25); 
		        }*/

		        if(bounds.xHigh * visWorld[i].scale > (camera.x + visWorld[i].canvas.width*.75)) {
		        	var dx = (bounds.xHigh * visWorld[i].scale - (camera.x + visWorld[i].canvas.width*0.75)) / 2; 
		        	if (camera.dx < dx) camera.dx += (dx - camera.dx) / 2; 
		        }

		        else if(bounds.xHigh * visWorld[i].scale < (camera.x + visWorld[i].canvas.width*.60)
		        	&& camera.dx > 0) {
		        	camera.dx /= 2; 
		        if (camera.dx < 0.05) camera.dx = 0; 
		    }


		    visWorld[i].step(1/60);

	        /*
	        if(dy){
	        visWorld[i].ctx.translate(dy, 0);
	        visWorld[i].cameraLocation.y += dy;
	        }
	        */
	        }

	        visWorld[i].ctx.translate(-visWorld[i].camera.x, 0);	
	        visWorld[i].b2world.Step(1/60, 10, 10);
	        visWorld[i].b2world.ClearForces();
	        visWorld[i].ctx.restore();
	        visWorld[i].draw();
	    }
	}

    requestAnimFrame(onGraphics);
}

function onClick() {
	paused = !paused;
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
	
	    //if (ga.curGen == 1 || ga.curGen % 5 == 0) {    
	    visWorld = new Array(4);
	    
	    for (var i = 0; i < 4; i++) {
	    	options.elementID = String("c" + i);
	    	visWorld[i] = new World(options);

	    	var creature = ga.curPop[i];

	    	var str = creature.stringify();
	    	var creature2 = unstringifyCreature(str);

	    	creature2.addToWorld(visWorld[i]);
	    	creature2.resetPosition();

		    //creature.addToWorld(visWorld[i]);
		    //creature.resetPosition();

		    visWorld[i].label = String("Fitness: " + creature.fitness);
	}
	    
	    //console.log(distFitness(creature));
	    //setTimeout(simulate, SIMULATION_TIME*500);
	    setTimeout(simulate, SIMULATION_TIME*1000);
	}
    /*    } else {
	setTimeout(simulate, SIMULATION_TIME*1000);
	//setTimeout(simulate, SIMULATION_TIME*0);
	}*/
}

onLoad();
simulate();
requestAnimFrame(onGraphics);