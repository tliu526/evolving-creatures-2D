/*
Contains all of the functions required for running a genetic algorithm on the creatures.
*/

/*
Can be treated as an iterator-like object. Currently uses the Sims method of selection (survival ratio).
*/
function GA(ga_options, creature_options){
	this.maxGen = ga_options.maxGen;
	this.popSize = ga_options.popSize;
	this.mutRate = ga_options.mutRate;
	this.crossRate = ga_options.crossRate;
	this.survRatio = ga_options.survRatio;
	this.fitness = ga_options.fitness;

	this.creatureOptions = creature_options;
	
	this.curGen = 0;
	this.curPop = [];
	this.cutOff = Math.floor(this.popSize * this.survRatio);
	for(var i = 0; i < this.popSize; i++){
	    var creat = generateRandomCreature(this.creatureOptions);
	    creat.generation = this.curGen;
	    this.curPop.push(creat);
	}

	//can use a genetic algorithm like an iterator
	this.next = function(){
		if (this.curGen == this.maxGen){
			return false;
		}
		
		var survivors;
		this.runSimulation();

		survivors = this.curPop.slice(0, this.cutOff);
		this.curPop = survivors.slice() // init new population with survivors
		
		//mutation
		for (var i = 0; i < this.curPop.length; i++){
		    if(Math.random() < this.mutRate){
			this.curPop[i].pointMutation();
		    }
		}
		
		//crossover, TODO weight by relative fitness
		while(this.curPop.length < this.popSize){
		    //parents

		    var p1 = getRandomInt(0, survivors.length);
		    var p2 = getRandomInt(0, survivors.length);
		    var creat = crossover(survivors[p1], survivors[p2]);
		    creat.generation = this.curGen;
		    this.curPop.push(creat)
		}
		

		//printCurrentGen(this.curPop);

		this.curGen += 1;
		return true;
	};
	

	//sorts by fitness, best to worst
	this.runSimulation = function() {
		var fitFunc = this.fitness;
		var oldPop = this.curPop;

		for(i = 0; i < oldPop.length; i++){
			fitFunc(oldPop[i]);
			//console.log("Fitness: "  + (i/oldPop.length * 100) + "% complete");
		}

		oldPop.sort(function (a,b) {
			return b.fitness - a.fitness;
		});

		this.curPop = oldPop;
		return oldPop;
	}
}

function distFitness(creature){
    var start = 50;
    
    var options = {
    	hasWalls     : false,
    	hasGround    : false,
    	isDistTest   : true,
    	wallWidth    : SCALE / 3.0,
    	groundHeight : SCALE / 3.0,
    	elementID    : "c1"
    }
    var test_world = new World(options);
    
    creature.addToWorld(test_world);
    var bounds = creature.getBoundingBox();

    // translate so bounding box against floor and has middle on start    
    var dx = start - (bounds.xHigh - bounds.xLow) / 2.0; //TODO normalize this
    var dy = test_world.canvas.height - bounds.yHigh;
    if (groundHeight) dy -= 2 * groundHeight;
    
    creature.translate(dx, dy);

    creature.setAsStartingPosition();
    
    var fitness = 0;
    var lastLeft = 0;
    //simulate the creature
    for (i = 0; i < (SIMULATION_TIME * 60); i++){
    	test_world.b2world.Step(1/60, 10, 10);
    	test_world.b2world.ClearForces();
	// penalize by width of box
	var bounds = creature.getBoundingBox();
	var curLeft = (bounds.xHigh - bounds.xLow) / 2.0;
	fitness += (curLeft - lastLeft) / (0.001 * (bounds.xHigh - bounds.xLow) / SCALE + (SIMULATION_TIME * 60 / i));
	lastLeft = curLeft;
    }
    
    creature.fitness = fitness;
    return fitness;
}