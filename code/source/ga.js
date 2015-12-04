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
	    this.curPop.push(generateRandomCreature(this.creatureOptions));
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
	
		//stopgap until crossover is fixed
		while(this.curPop.length < this.popSize){
		    this.curPop.push(generateRandomCreature(this.creatureOptions));
		}
	
	/*	
		//crossover, TODO weight by relative fitness
		while(this.curPop.length < this.popSize){
		//parents
		var p1 = getRandomInt(0, survivors.length);
			var p2 = getRandomInt(0, survivors.length);
			
			console.log(survivors[p1].masses);
			console.log(survivors[p1].connections);

			this.curPop.push(crossover(survivors[p1], survivors[p2]))
			}
	*/	
		
		this.curGen += 1;
		return true;
	};
	

	//sorts by fitness, best to worst
	this.runSimulation = function() {
		var fitFunc = this.fitness;
		var oldPop = this.curPop;
		var mapped = oldPop.map(function(element, i){
			return {index: i, value: fitFunc(element)};
		});

		mapped.sort(function(a,b){
			return b.value - a.value;
		});

		var result = mapped.map(function(e){
			return oldPop[e.index];
		});

		this.curPop = result;
		return result;
	}
}

//- start and finish are values in meters from 0 where 
//  0 is the left of the screen
//- assume groundHeight is set to pixel hieght of ground 
//  off bottom of canvas
function speedFitness(creature) {
    var start = 50;

    var options = {
    	hasWalls     : true,
    	hasGround    : true,
    	wallWidth    : 10,
    	groundHeight : 10,
    	elementID    : "c"
    }
    var world = new World(options);
    var bounds = creature.getBoundingBox();
    
    console.log(bounds.xLow);
    
    // translate so bounding box touches start on the right
    // use pixel values for dx and dy
    dx = start - bounds.xHigh;
    dy = world.canvas.height - bounds.yLow;
    if (groundHeight) dy -= groundHeight;
    
    creature.translate(dx, dy);
    creature.addToWorld(world);
}

function distFitness(creature){
    var start = 50;
    
    var options = {
    	hasWalls     : false,
    	hasGround    : false,
    	isDistTest   : true,
    	wallWidth    : 10,
    	groundHeight : 10,
    	elementID    : "c"
    }
    var test_world = new World(options);
    
    creature.addToWorld(test_world);
    var bounds = creature.getBoundingBox();

    // translate so bounding box touches start on the right
    
    var dx = start; //TODO normalize this
    var dy = test_world.canvas.height - bounds.yLow;
    if (groundHeight) dy -= groundHeight;
    
    creature.translate(dx, dy);
    
    //simulate the creature
    for (i = 0; i < (SIMULATION_TIME * 60); i++){
    	test_world.b2world.Step(1/60, 10, 10);
    	test_world.b2world.ClearForces();
    }

    var min_x_dist = Infinity;
    for(i = 0; i < creature.masses.length; i++){
    	var x_pos = creature.masses[i].body.GetPosition().x;

    	if( x_pos < min_x_dist){
    		min_x_dist = x_pos;
    	}
    }

    //TODO a better measure than farthest x-distance traveled?
    return min_x_dist;
}