var visWorld;

function onLoad() {
    var options = {
	hasWalls     : true,
	hasGround    : true,
	wallWidth    : 10,
	groundHeight : 10,
	elementID    : "c"
    }
    visWorld = new World(options);

    
    var creatureOptions = {
	massLowerLimit : 10,
	massUpperLimit : 12,
	edgeLowerProportion : 0.5,
	edgeUpperProportion : 0.8,
	probMuscle : 0.8,
	xBound : 3,
	yBound : 3
    }

    var creature = generateRandomCreature(creatureOptions);
    creature.addToWorld(visWorld)

    //speedFitness(creature);

    //var creature2 = generateRandomCreature();
    //creature2.addToWorld();

    //var new_creature = crossover(creature, creature2);
    //new_creature.addToWorld();
	
	//    requestAnimFrame(onGraphics(world));

};
    
function onGraphics() {
    visWorld.b2world.Step(1 / 60, 10, 10);
    visWorld.b2world.DrawDebugData();
    visWorld.b2world.ClearForces();

    requestAnimFrame(onGraphics);
}

function onClick() {
    creature.pointMutation();
}

onLoad();
requestAnimFrame(onGraphics);