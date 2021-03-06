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
	this.graftRate = ga_options.graftRate;
	this.crossRate = ga_options.crossRate;
	this.survRatio = ga_options.survRatio;
	this.fitness = ga_options.fitness;
	this.enableOrgans = ga_options.enableOrgans;


	this.creatureOptions = creature_options;
	this.creatureOptions.hasOrgans = this.enableOrgans;
	this.curAvg = 0;
	this.curGen = 0;
	this.curPop = [];
	this.cutOff = Math.floor(this.popSize * this.survRatio);
	for(var i = 0; i < this.popSize; i++){
	    var creat = generateRandomCreature(this.creatureOptions);
	    creat.generation = this.curGen;
	    if (this.enableOrgans) creat.ensureOrgan();
	    this.curPop.push(creat);
	}

	//can use a genetic algorithm like an iterator
	this.next = function(){
		if (this.curGen == this.maxGen){
			return false;
		}



		var survivors;
		survivors = this.curPop.slice(0, this.cutOff);
		this.curPop = survivors.slice(); // init new population with survivors
				
		var weights = this.weightPop(survivors);


		//grafting, more fit creatures mate more
		while(this.curPop.length < this.popSize) {
		    var rand = Math.random();
		    var creat;

		    if ((rand < (this.graftRate + this.crossRate + this.tonyCrossRate)) 
			&& (survivors.length > 1)) {
		    	var p1 = getRandomInt(0, weights.length);
		    	var p2 = getRandomInt(0, weights.length);

			if (rand < this.graftRate) {
			    creat = graft(survivors[weights[p1]], survivors[weights[p2]], true, this.enableOrgans);
			} else {
			    if (rand < this.graftRate + this.crossRate) { 
				creat = crossover(survivors[weights[p1]], survivors[weights[p2]], true, this.enableOrgans);
			    } else {
				creat = tonyCrossover(survivors[weights[p1]], survivors[weights[p2]], true, this.enableOrgans);
			    }
			}
		    } else {
		    	creat = generateRandomCreature(this.creatureOptions);
		    }
		    
		    if (this.enableOrgans) creat.ensureOrgan();
		    creat.generation = this.curGen;
		    this.curPop.push(creat);
		}

		//mutation
		for (var i = 0; i < this.curPop.length; i++){
		    if(Math.random() < this.mutRate){
			this.curPop[i].pointMutation();
		    }
		}

		this.runSimulation();		
		this.curGen += 1;

		SIMULATION_TIME += 0.01;

		return true;
	};
	
	//generates a list of indices weighted each creature's relative fitness
	this.weightPop = function(pop){
		var totWeight = 0;

		for(var i = 0; i < pop.length; i++){
			totWeight += clamp(pop[i].fitness, 0, Infinity);
		}

		var indices = [];

		for(var i = 0; i < pop.length; i++){
			var numEntries = Math.floor((pop[i].fitness/totWeight) * 100);
			numEntries = clamp(numEntries, 1, 20); //to prevent over-dominance
			for (var n = 0; n < numEntries; n++){
				indices.push(i);
			}
		}
		return indices;
	}

	//sorts by fitness, best to worst
	this.runSimulation = function() {
		var fitFunc = this.fitness;
		var oldPop = this.curPop;
		
		var progress = 0;
		var target = this.curGen + 10;

		var sum = 0;
		for(i = 0; i < oldPop.length; i++){
			fitFunc(oldPop[i]);
			sum += oldPop[i].fitness;
			//if (i % (oldPop.length / 20) == 0) progress = 100 * i / oldPop.length; 
		}
	       
		this.curAvg = sum / oldPop.length;

		oldPop.sort(function (a,b) {
			return b.fitness - a.fitness;
		});

		this.curPop = oldPop;
		return oldPop;
	}
}

//encourages movement to the right in time period
function distFitness(creature){
    var options = {
    	hasWalls     : false,
    	hasGround    : false,
    	isDistTest   : true,
    	elementID    : "c1"
    }

    var test_world = new World(options);
    
    creature.addToWorld(test_world);
    creature.resetPosition();
    var bounds = creature.getBoundingBox();

    // translate so bounding box against floor and has middle on start    
    var start = 2 * test_world.wallWidth;
    var dx = start - bounds.xLow; 
    var dy = test_world.canvas.height / test_world.scale - bounds.yHigh;
    if (test_world.groundHeight) dy -= test_world.groundHeight;
    dy -= 2;
    creature.translate(dx, dy);

    creature.setAsStartingPosition();
    //creature.curHits = 0;

    var fitness = 0;
    var lastLeft = 0;

    //simulate the creature
    var i;
    for (i = 0; i < (SIMULATION_TIME * 60); i++){
    	test_world.b2world.Step(1/60, 10, 10);
    	test_world.b2world.ClearForces();
	creature.updateHealth(test_world);
	
	// penalize by width of box
	// penalize for being too high too
	if (i % 30 == 0) {
	    var bounds = creature.getBoundingBox();
	    var curLeft = bounds.xLow;
	    //var curLeft = creature.getMeanX();
	    //var curLeft = (bounds.xHigh - bounds.xLow) / 2 + bounds.xLow
	    var penalize = 0;
	    penalize +=  (bounds.xHigh - bounds.xLow);
	    penalize += (bounds.yHigh - bounds.yLow);
	    if (bounds.yLow < 0) fitness -= 60;
	    if (bounds.yHigh < 0) fitness -= 60;
	    if (Math.abs(penalize + (SIMULATION_TIME * 60 / i)) > 0.0001) {
		if (curLeft > lastLeft) {
		    fitness += curLeft / (penalize + (SIMULATION_TIME * 60 / i));
		} else {
		    fitness += 0.1 * curLeft / (penalize + (SIMULATION_TIME * 60 / i));
		}
	    }
	    lastLeft = curLeft;
	}
    }
    
    if (!creature.alive) fitness -= 50;
    
    if (isNaN(fitness)) {
	creature.fitness = -1000;
    } else {
	creature.fitness = fitness;
    }
    return creature.fitness;
}

function targetFitness(creature, target){
    /*    var options = {
    	hasWalls     : false,
    	hasGround    : false,
    	isDistTest   : true,
    	elementID    : "c1"
    }

    var test_world = new World(options);
    
    creature.addToWorld(test_world);
    creature.resetPosition();
    var bounds = creature.getBoundingBox();

    // translate so bounding box against floor and has middle on start    
    var start = 2 * test_world.wallWidth;
    var dx = start - bounds.xLow; //TODO normalize this
    var dy = test_world.canvas.height / test_world.scale - bounds.yHigh;
    if (groundHeight) dy -= test_world.groundHeight;
    creature.translate(dx, dy);

    creature.setAsStartingPosition();

    var fitness = 0;
    var lastLeft = 0;
    //simulate the creature
    var i;
    /*
    setTimeout(function(){
    	console.log("timed out");
    	i = SIMULATION_TIME * 60;
    	return;
    }, SIMULATION_TIME*1000);
	*/
    /*
    for (i = 0; i < (SIMULATION_TIME * 60) && creature.alive; i++){
    	test_world.b2world.Step(1/60, 10, 10);
    	test_world.b2world.ClearForces();
	
	creature.updateHealth();
	
	// penalize by width of box
	// penalize for being too high too
	if (i % 30 == 0) {
	    var bounds = creature.getBoundingBox();
	    var curLeft = bounds.xLow;
	    //var curLeft = creature.getMeanX();
	    //var curLeft = (bounds.xHigh - bounds.xLow) / 2 + bounds.xLow
	    var penalize = 0;
	    penalize += (bounds.xHigh - bounds.xLow);
	    penalize += (bounds.yHigh - bounds.yLow);
	    if (bounds.yLow < 0) penalize += 100;
	    if (curLeft > lastLeft) {
		if (i != 0) {
		    fitness += curLeft / (penalize + (SIMULATION_TIME * 60 / i));
		}
	    } else {
		if (i != 0) {
		    fitness += 0.1 * curLeft / (penalize + (SIMULATION_TIME * 60 / i));
		}
	    }
	    lastLeft = curLeft;
	    
	    if (bounds.xLow > target){
		break;
	    }
	}
    }

    //penalize for not reaching target in the allotted simulation time
    fitness -= target - bounds.xLow;
    //penalize too many masses
    fitness -= 0.1*(Math.pow(creature.masses.length, 2));
    //give bonus for speed
    var timeDiff = (SIMULATION_TIME * 60) - i;
    fitness += 0.5*timeDiff;

    creature.fitness = fitness;

    return fitness;
*/
}