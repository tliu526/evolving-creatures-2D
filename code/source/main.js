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

    //creature = generateRandomCreature(creatureOptions);
    //creature.addToWorld(visWorld);

    //distFitness(creature);

    //var creature2 = generateRandomCreature(creatureOptions);
    //creature2.addToWorld(visWorld);

    //var new_creature = crossover(creature, creature2);
    //new_creature.addToWorld(visWorld);

	//requestAnimFrame(onGraphics(world));

};
function onGraphics() {
    for (var i = 0; i < 4; i++) {
	visWorld[i].ctx.save();
	visWorld[i].ctx.clearRect(0,0,visWorld[i].canvas.width,visWorld[i].canvas.height);
	visWorld[i].b2world.Step(1/60, 10, 10);
	visWorld[i].b2world.ClearForces();
	visWorld[i].b2world.DrawDebugData();
	visWorld[i].ctx.restore();
	visWorld[i].ctx.fillText(visWorld[i].label, 10, 10);
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
    wallWidth    : SCALE / 3.0,
    groundHeight : SCALE / 3.0
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