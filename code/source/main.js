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
	xBound : 2,
	yBound : 2
    }

    var gaOptions = {
        maxGen : 100,
        popSize : 100,
        mutRate : 0.0,
        graftRate : 0.0,
        crossRate : 0.8,
        survRatio : 0.4,
        fitness : distFitness
    };

    ga = new GA(gaOptions, creatureOptions);
};

function onGraphics() {
    for (var i = 0; i < 4; i++) {
	visWorld[i].ctx.save();
	visWorld[i].ctx.clearRect(0,0,visWorld[i].canvas.width,visWorld[i].canvas.height);
	
	visWorld[i].update();
	visWorld[i].ctx.translate(-visWorld[i].camera.x, 0);	
	visWorld[i].b2world.Step(1/60, 10, 10);
	visWorld[i].b2world.ClearForces();
	visWorld[i].ctx.restore();
	visWorld[i].draw();


    }
    
    requestAnimFrame(onGraphics);
}

function onClick() {
	paused = !paused;
	simulate();
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

	    //our normal display
	    
	    for (var i = 0; i < 4; i++) {
	    	options.elementID = String("c" + i);
	    	visWorld[i] = new World(options);

	    	var creature = ga.curPop[i];
		/*	var str = creature.stringify();
	       
	    	var creature2 = unstringifyCreature(str);

	    	creature2.addToWorld(visWorld[i]);
	    	creature2.resetPosition();
		*/
		    creature.addToWorld(visWorld[i]);
		    creature.resetPosition();

		    visWorld[i].label = String("Fitness: " + creature.fitness);
		}
	    

	    /*
	    //for debugging stringify
	    for(var i = 0; i < 3; i += 2){
	    	   var options1 = {
	    	   	hasWalls     : false,
	    	   	hasGround    : false,
	    	   	isDistTest   : true,
	    	   	wallWidth    : 0.4,
	    	   	groundHeight : 0.4
	    	   };

	    	   var options2 = {
	    	   	hasWalls     : false,
	    	   	hasGround    : false,
	    	   	isDistTest   : true,
	    	   	wallWidth    : 0.4,
	    	   	groundHeight : 0.4
	    	   };

	    	options1.elementID = String("c" + i);
	    	options2.elementID = String("c" + (i+1));

	    	visWorld[i] = new World(options1);
	    	visWorld[i+1] = new World(options2);

	    	var creature = ga.curPop[i];
	    	var str = creature.stringify();
	    	console.log(str);
	    	var creature2 = unstringifyCreature(str);

		    creature.addToWorld(visWorld[i]);
		    creature.resetPosition();

	    	creature2.addToWorld(visWorld[i+1]);
	    	creature2.resetPosition();
	    	visWorld[i].label = String("Fitness: " + creature.fitness);
	    	visWorld[i+1].label = String("Fitness: " + creature2.fitness);



	    	/*
	    	var creatureOptions = JSON.parse(str);
	    	var massOptions = creatureOptions.massOptions;
	    	
	    	var massIds = [];
	    	for(var id in massOptions){
	    		if(massOptions.hasOwnProperty(id)){
	    			massIds.push(id);
	    		}
	    	}

	    	var connectOptions = creatureOptions.connectionOptions;
	    	var connectIds = [];
	    	for (var j = 0; j < connectOptions.length; j++){
	    		var opt = JSON.parse(connectOptions[j]);
	    		if(opt){
	    			var id = opt["massA"];
	    			if(connectIds.indexOf(id) == -1){	  
	    				connectIds.push(id);
	    			}
	    			id = opt["massB"];
	    			if(connectIds.indexOf(id) == -1){	  
	    				connectIds.push(id);
	    			}
	    		}
	    	}

	    	console.log(connectIds);
	    	console.log(massIds);
	    	*/


	    //   }



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