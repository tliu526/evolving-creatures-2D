var visWorld;
var creature;
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
        popSize : 100,
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

    

    
	
	//    requestAnimFrame(onGraphics(world));

};
function onGraphics() {
    //for debugging, speeding up simulations
    //for(var i = 0; i < 2; i++){
        visWorld.b2world.Step(1/60, 10, 10);
        visWorld.b2world.ClearForces();
    //}
    visWorld.b2world.DrawDebugData();
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
    wallWidth    : 10,
    groundHeight : 10,
    elementID    : "c"
    };

    if(ga.next()){
        document.getElementById("generation").innerHTML = "Generation: " + ga.curGen; 
        curTime = 0;
        visWorld = new World(options);
        creature = ga.curPop[0];

        creature.addToWorld(visWorld);
        console.log(distFitness(creature));
        setTimeout(simulate, SIMULATION_TIME*1000);
    }
}

onLoad();
simulate();
requestAnimFrame(onGraphics);