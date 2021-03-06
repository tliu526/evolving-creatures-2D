//pre: masses is a list of mass objects (vertices), connections are springs/muscles
function Creature(masses, connections) {
    this.fitness = -1;
    this.connections = connections;
    this.masses = masses;	
    this.drawBoundingBox = true;

    this.startingPositions = [];

    this.type = "Creature";
    this.id = creature_id;
    creature_id++;
    
    this.generation = -1;
    this.parentA    = -1;
    this.parentB    = -1;
    
    this.alive = true;

    this.prune = function() {
	var largest = largestConnectedGraph(this.masses, this.connections);
	if (largest.length < this.masses.length) {
	    var resultMasses = new Array(largest.length);
	    var resultConnections = new Array(largest.length * largest.length);

	    for (var i = 0; i < largest.length; i++) {
		resultMasses[i] = new Mass(this.masses[largest[i]].options);
	    }
	    
	    // Setup adjacency matrix
	    for(var i = 0; i < resultConnections.length; i++) {
		resultConnections[i] = false;
	    }
	    
	    for (var i = 0; i < largest.length; i++) {
		for (var j = 0; j < largest.length; j++) {
		    if(largest[j] < largest[i]){
			if (this.connections[largest[i] + this.masses.length * largest[j]] != false) {
			    var joint = this.connections[largest[i] + this.masses.length * largest[j]];
			    copyJoint(i, j, joint, resultMasses, resultConnections, false);
			}
		    } 
		}
	    }

	    this.masses = resultMasses;
	    this.connections = resultConnections;
	    this.startingPositions = [];
	} 
    }
    
    this.ensureOrgan = function() {
	var hasOrgan = false;
	for (var i = 0; i < this.masses.length; i++) {
	    if (this.masses[i].isOrgan) {
		hasOrgan = true;
		break;
	    }
	} 

	if (!hasOrgan && this.masses.length > 0) {
	    var i = getRandomInt(0, this.masses.length);
	    this.masses[i].isOrgan = true;
	    this.masses[i].maxHits = 5;
	    this.masses[i].curHits = 0;
	}
    }

    this.addToWorld = function(world) {	
    	world.creatures.push(this);
	world.components.push(this);
    	for (var i = 0; i < this.masses.length; i++) {
	    this.masses[i].addToWorld(world);
	}

    	for (var i = 0; i < this.masses.length; i++) {
	    for (var j = 0; j < i; j++) {
		if (this.connections[i + this.masses.length * j] != false) {
		    this.connections[i + this.masses.length * j].addToWorld(world);
		}
	    }
    	}
    }
    
    this.updateHealth = function(world) {
	var groundHeight = 
	world.canvas.height - 
	world.canvas.height / world.originalScale * world.scale + 
	world.canvas.height - world.originalScale * world.groundHeight;
	
	for (var i = 0; i < this.masses.length; i++) {
	    if (this.masses[i].isOrgan) {
		var eps = 0.5 * this.masses[i].r * world.scale;
		var y = (this.masses[i].body.GetPosition().y + this.masses[i].r) * world.scale + world.camera.y;
		//console.log(y + ", "+ groundHeight - eps);
		if (y > groundHeight - eps) {
		    this.masses[i].curHits += 1;
		    if (this.masses[i].curHits == this.masses[i].maxHits) this.alive = false;
		}
	    }
	}
    }

    this.resetHealth = function() {
	this.alive = true;
	for (var i = 0; i < this.masses.length; i++) {
	    if (this.masses[i].isOrgan) {
		this.masses[i].curHits = 0;
		this.masses[i].justHit = false;
		this.masses[i].countSinceLastHit = 0;
	    }
	}
    }

    this.drawToWorld = function(world) {
    	for (var i = 0; i < this.masses.length; i++) {
	    for (var j = 0; j < i; j++) {
		if (this.connections[i + this.masses.length * j] != false) {
		    this.connections[i + this.masses.length * j].drawToWorld(world);
		}
	    }
    	}

    	for (var i = 0; i < this.masses.length; i++) {
	    if (!this.masses[i].isOrgan) {
		this.masses[i].drawToWorld(world);
	    }
	}

    	for (var i = 0; i < this.masses.length; i++) {
	    if (this.masses[i].isOrgan) {
		this.masses[i].drawToWorld(world);
	    }
	}

	if (this.drawBoundingBox) {
	    var bounds = this.getBoundingBox();
	    var scale = world.scale;
	    var ctx = world.ctx;
	    ctx.restore();

	    ctx.lineWidth = scale / 16;
	    ctx.strokeStyle = "rgba(50, 50, 50, 0.5)";
	    ctx.strokeRect(bounds.xLow * scale - world.camera.x, bounds.yLow * scale + world.camera.y, (bounds.xHigh - bounds.xLow) * scale, (bounds.yHigh - bounds.yLow) * scale);
	    ctx.stroke();
	}
    }
    
    this.stringify = function() {
    	var mass_options = {};
    	var connection_options = [];
    	
    	var connections = this.connections;
    	var masses = this.masses;

    	var mass_ids = [];
    	var connection_ids = [];
    	

    	for (var i = 0; i < connections.length; i++){
    		if(connections[i]){
    			old_opt = connections[i].options;
    			//need to be careful about masses stored in options
    			var new_connection_opt = {};
    			for (var prop in old_opt){
    				if(old_opt.hasOwnProperty(prop)){
    					//console.log(prop);
    					//it is a mass, use its id as a key
    					if(prop.includes("mass")) {
    						var id = old_opt[prop].id;
    						new_connection_opt[prop] = id;
    						if (connection_ids.indexOf(id) == -1)
    							connection_ids.push(id);
    					}
    					else {
    						new_connection_opt[prop] = old_opt[prop];
    					}  					
    				}
    			}
    			connection_options.push(JSON.stringify(new_connection_opt));
    		}
    		else{
    			connection_options.push(JSON.stringify(connections[i]));
    		}
    	}

    	for (var i = 0; i < masses.length; i++){
    		mass_ids.push(masses[i].id);
    		mass_options[masses[i].id] = JSON.stringify(masses[i].options);
    	}

    	var string_options = {
    		massOptions : mass_options,
    		connectionOptions : connection_options,
    		id : this.id,
    		generation : this.generation,
    		parentA : this.parentA,
    		parentB : this.parentB,
    		fitness : this.fitness,
    		startingPositions : this.startingPositions
    	}

    	//console.log(mass_ids);
    	//console.log(connection_ids);


    	return JSON.stringify(string_options);
    }

    this.translate = function(dx, dy) {
    	for (var i = 0; i < this.masses.length; i++) {
    		mass = this.masses[i]
    		pos = mass.body.GetPosition();
    		mass.body.SetPosition(new b2Vec2(pos.x + dx, pos.y + dy));
    	}
    }
    
    this.pointMutation = function() {
    	var rand = Math.floor(Math.random()*this.connections.length);
    	if (this.connections[rand]) {
    		this.connections[rand].mutate();
    	}
    }
    
    this.getBoundingBox = function() {
    	var bounds = {
    		xLow   : Infinity,
    		xHigh  : -Infinity,
    		yLow   : Infinity,
    		yHigh  : -Infinity
    	}

    	for (var i = 0; i < this.masses.length; i++) {
    		var mass  = this.masses[i];
    		var r     = mass.r;
    		var x     = mass.body.GetPosition().x;
    		var y     = mass.body.GetPosition().y;

		if (mass.shape = "Square") {
		    r *= Math.sqrt(2);
		}

    		if (x + r > bounds.xHigh) bounds.xHigh = x + r;
    		if (x - r < bounds.xLow)  bounds.xLow  = x - r;
    		if (y + r > bounds.yHigh) bounds.yHigh = y + r;
    		if (y - r < bounds.yLow)  bounds.yLow  = y - r;
    	}	    
    	return bounds;
	}

    this.getMeanX = function() {
	var sum = 0;
	for (var i = 0; i < this.masses.length; i++) {
	    sum += this.masses[i].body.GetPosition().x;
	}	    
	return sum / this.masses.length;
    }

    this.setAsStartingPosition = function() {
	this.startingPositions = new Array(this.masses.length);
	for (var i = 0; i < this.masses.length; i++) {
	    var pos = this.masses[i].body.GetPosition();
	    this.startingPositions[i] = new b2Vec2(pos.x, pos.y);
	}
    }

    this.resetPosition = function() {
	for (var i = 0; i < this.startingPositions.length; i++) {
	    this.masses[i].body.SetPosition(this.startingPositions[i]);
	}
    }
}

// - don't want creatures with extraneous parts
// - given array of nodes, nodes, and adjacency table, edges
// - contents of adjacency table are either false or the joint 
//   that connects them, size n^2 where there are n nodes
// - returns array of indices of nodes
//   that make the largest connected component
function largestConnectedGraph(nodes, edges) {
    var groups = [];
    var visited = [];
    var numVisited = 0;

    for (var i = 0; i < nodes.length; i++) {
	visited.push(false);
    }

    while (numVisited < nodes.length) {
	var source = getRandomInt(0, nodes.length);
	while(visited[source]) {
	    source = getRandomInt(0, nodes.length);
	}

	var connected = connectedToSource(source, nodes, edges, visited);	
	groups.push(connected);
	
	for (var j = 0; j < connected.length; j++) {
	    visited[connected[j]] = true;
	    numVisited++;
	}
    }

    var result = [];
    for (var i = 0; i < groups.length; i++) {
	if (groups[i].length > result.length) {
	    result = groups[i];
	}
    }

    return result;
}

// - breadth first search
// - returns array of indices of vertices connected to source 
// - source is an index of array of nodes
// - nodes is array of masses
// - edges is an adjacency table
// - visited is an array the length of nodes indicating whether 
//   the corresponding node has been visited 
function connectedToSource(source, nodes, edges, visited) {
    var connected = [];
    var queue = [];
    queue.push(source);

    while (queue.length > 0) {
	var v = queue.shift();
	connected.push(v);

	if(!visited[v]) {
	    visited[v] = true;
	}
	
	var adjacent = [];
	for (var i = 0; i < nodes.length; ++i) {
	    if(edges[nodes.length * v + i] || edges[nodes.length * i + v]) {
		adjacent.push(i);
	    } 
	}

	for (var i = 0; i < adjacent.length; i++) {
	    next = adjacent[i];
	    if (!visited[next]) {
		queue.push(next);
		visited[next] = true
	    }
	}
    }

    return connected;
}

/*
Performs a single point crossover between creatures A and B and returns a new creature
*/
function graft(creatureA, creatureB, canSwitchOrder, hasOrgans) {
    if (canSwitchOrder && Math.random() < 0.5) {
	var temp = creatureA;
	creatureA = creatureB;
	creatureB = temp;
    }
    
    //console.log("top of crossover");
    //slice is used to copy
    var massesA = creatureA.masses.slice();
    var massesB = creatureB.masses.slice();
    
    var connectionsA = creatureA.connections.slice();
    var connectionsB = creatureB.connections.slice();
    
    var cross_ptA = Math.floor(Math.random()*(massesA.length-1))+1; //range of [1, masses.length-1]
    var cross_ptB = Math.floor(Math.random()*(massesB.length-1)); //range of [0, masses.length-2]
    
    var new_masses = [];
    
    for(var i = 0; i <= cross_ptA; i++){
	new_masses.push(new Mass(massesA[i].options));
    }
    
    for(var i = cross_ptB; i < massesB.length; i++){
	new_masses.push(new Mass(massesB[i].options));
    }
    
    //var all_connections = creatureA.connections.slice().concat(creatureB.connections.slice());
    
    var new_connections = new Array(new_masses.length * new_masses.length);
    
    // Setup adjacency matrix
    for(var i = 0; i < new_connections.length; i++) {
	new_connections[i] = false;
    }
    
    //copy connecting edges
    for (var i = 0; i < new_masses.length; i++){
	var i1;
	var i2;
	var joint;
	
	if (i < cross_ptA) {
	    for (var j = i + 1; j <= cross_ptA; j++) {
		//Assume properly setup adjacency matrix
		if (connectionsA[i + massesA.length * j] != false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsA[i + massesA.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		}
	    } 
	} else {
	    var iB1 = i - cross_ptA + cross_ptB;
	    for (var iB2 = iB1 + 1; iB2 < massesB.length; iB2++) {	
		//Assume properly setup adjacency matrix
		if (connectionsB[iB1 + massesB.length * iB2] != false) {
		    i1 = i;
		    i2 = iB2 + cross_ptA - cross_ptB + 1;
		    joint = connectionsB[iB1 + massesB.length * iB2];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		}
	    }
	}
    } //END FOR
    
    //need to connect nodes cross_ptA and cross_ptB by random new joint
    var options = {
	mA : new_masses[cross_ptA],
	mB : new_masses[cross_ptA + 1],
	probMuscle : 0.5
    }

    var joint = getRandomJoint(options);
    new_connections[cross_ptA + new_masses.length * (cross_ptA + 1)] = joint;
    new_connections[(cross_ptA + 1) + new_masses.length * cross_ptA] = joint;

    var creat = new Creature(new_masses, new_connections);
    creat.parentA = creatureA.id;
    creat.parentB = creatureB.id;
    creat.prune();
    if (hasOrgans) creat.ensureOrgan();
    return creat;
}

/*
  Performs a two point or one crossover between creatures A and B and returns a new creature
*/
function crossover(creatureA, creatureB, canSwitchOrder, hasOrgans) {
    if (canSwitchOrder && Math.random < 0.5) {
	var temp = creatureA;
	creatureA = creatureB;
	creatureB = temp;
    }

    var cross_ptA;
    var cross_ptB;
    var minLength = Math.min(creatureA.masses.length, creatureB.masses.length);
    var pSingle = 0.8;

    if (minLength < 4 || Math.random() < pSingle) {
	cross_ptA = 0;
	cross_ptB = getRandomInt(0, minLength);
    } else {		   
	cross_ptA = getRandomInt(1, minLength - 1);
	cross_ptB = getRandomInt(1, minLength - 1);
	var maxIter = minLength;
	var i = 0;
	
	while((i < maxIter) && Math.abs(cross_ptA - cross_ptB) < 2) {
	    cross_ptB = getRandomInt(1, minLength - 1);
	    i++;
	}
    }

    //slice is used to copy
    var massesA = creatureA.masses.slice();
    var massesB = creatureB.masses.slice();
    
    var connectionsA = creatureA.connections.slice();
    var connectionsB = creatureB.connections.slice();

    var new_masses = [];

    for (var i = 0; i < creatureA.masses.length; i++) {
	if (i < cross_ptA || i >= cross_ptB) {
	    new_masses.push(new Mass(massesA[i].options));
	} else {
	    console.log(i, massesB.length);
	    new_masses.push(new Mass(massesB[i].options));
	}
    }

    var new_connections = new Array(new_masses.length * new_masses.length);

    // Setup adjacency matrix
    for(var i = 0; i < new_connections.length; i++) {
	new_connections[i] = false;
    }

    //copy connecting edges
    for (var i = 0; i < new_masses.length; i++){
	var i1;
	var i2;
	var joint;
	
	if (i < cross_ptA || i >= cross_ptB) {
	    for (var j = i + 1; j < massesA.length; j++) {
		//Assume properly setup adjacency matrix
		if (connectionsA[i + massesA.length * j] != false
		    && new_connections[i + new_masses.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsA[i + massesA.length * j];
		    if (j >= cross_ptA && i < cross_ptB) {
			new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		    } else {
			new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		    }
		}
	    } 
	} else {
	    //connectiong going left of current node to before cross_ptA
	    for (j = 0; j < cross_ptA; j++) {
		if (connectionsB[i + massesB.length * j] != false
		    && new_connections[i + new_masses.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsB[i + massesB.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		}
	    } 

	    //connections going right of current node
	    for (var j = i + 1; j < minLength; j++) {	
		//Assume properly setup adjacency matrix
		if ((connectionsB[i + massesB.length * j] != false)
		    && new_connections[i + new_masses.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsB[i + massesB.length * j];
		    if (j >= cross_ptB) {
			new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, true);
		    } else {
			new_connections = copyJoint(i1, i2, joint, new_masses, new_connections, false);
		    }
		}
	    }
	}
    } //END FOR

    var creat = new Creature(new_masses, new_connections);
    creat.parentA = creatureA.id;
    creat.parentB = creatureB.id;
    creat.prune();
    if (hasOrgans) creat.ensureOrgan();
    return creat;
}

/*                                                                                                            
Performs a version of single point crossover between creatures A and B and returns a new creature    
*/
//TODO still needs to be fixed, sometimes generates badness                                                   
function tonyCrossover(creatureA, creatureB, canSwitchOrder, hasOrgans) {
    //console.log("top of crossover");                                                                    
    //slice is used to copy                                                                               
    if (canSwitchOrder && Math.random() < 0.5) {
	var temp = creatureA;
	creatureA = creatureB;
	creatureB = temp;
    } 

    var massesA = creatureA.masses.slice();
    var massesB = creatureB.masses.slice();
    
    var connectionsA = creatureA.connections.slice();
    var connectionsB = creatureB.connections.slice();
    
    var cross_ptA = Math.floor(Math.random()*(massesA.length-1))+1; //range of [1, masses.length-1]       
    var cross_ptB = Math.floor(Math.random()*(massesB.length-1)); //range of [0, masses.length-2]         
    
    var new_masses = [];
    
    for(var i = 0; i <= cross_ptA; i++){
	new_masses.push(new Mass(massesA[i].options));
    }
    
    for(var i = cross_ptB; i < massesB.length; i++){
	new_masses.push(new Mass(massesB[i].options));
    }
    
    //var all_connections = creatureA.connections.slice().concat(creatureB.connections.slice());          
    
    var new_connections = new Array(new_masses.length * new_masses.length);
    
    // Setup adjacency matrix                                                                             
    for(var i = 0; i < new_connections.length; i++) {
	new_connections[i] = false;
    }
    
    //copy connecting edges                                                                               
    for (var i = 0; i < new_masses.length; i++){
	var i1;
	var i2;
	var joint;
	
	if (i <= cross_ptA) {
	    for (var j = i + 1; j < new_masses.length; j++) {
		//Assume properly setup adjacency matrix                                                  
		if ((j < massesA.length) && (connectionsA[i + massesA.length * j] != false)) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsA[i + massesA.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    }
	} else {
	    // i > cross_ptA                                                                              
	    // index in massB = i - cross_ptA + cross+ptB - 1                                             
	    var iB = i - (cross_ptA + 1) + cross_ptB;
	    for (var iA = 0; iA <= cross_ptA; iA++) {
		//Assume properly setup adjacency matrix                                                  
		if (((iB - i + iA) >= 0) && (connectionsB[iB + massesB.length * (iB - i + iA)] != false)) 
		    {
                        i1 = iA;
                        i2 = i;
                        joint = connectionsB[iB + massesB.length * (iB - i + iA)];
                        new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
                    }
	    }
	    
	    for (var j = i + 1; j < new_masses.length; j++) {
		//Assume properly setup adjacency matrix                                                  
		if (connectionsB[iB + massesB.length * (iB - i + j)] != false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsB[iB + massesB.length * (iB - i + j)];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    }
	}
    } //END FOR                                                                                           
    
    var creat = new Creature(new_masses, new_connections);
    creat.parentA = creatureA.id;
    creat.parentB = creatureB.id;
    creat.prune();
    if (hasOrgans) creat.ensureOrgan();
    return creat;
}


function copyJoint(x, y, joint, masses, connections, resetLengths) {
    var new_joint;
    
    var options = {
    	massA : masses[x],
    	massB : masses[y]
    }
    
    if (joint.type.charAt(0) == "S") {
	options.restLength = joint.rest_length;
	options.damping = joint.dampingRatio;
	options.frequency = joint.frequencyHz;
	
	if (resetLengths) {
	    options.restLength = distance(options.massA.x, options.massA.y, options.massB.x, options.massB.y);
	}
	
	new_joint = new Spring(options);

    } else {
	options.lowerLimit = joint.lowerTranslation;
	options.upperLimit = joint.upperTranslation;
	options.motorSpeed = joint.motorSpeed;
	options.maxMotorForce = joint.maxMotorForce;
	
	if (resetLengths) {
	    var stretch = getRandom(0.1, 0.4);
	    options.lowerLimit = (1 - stretch) * distance(options.massA.x, options.massA.y, options.massB.x, options.massB.y);
	    options.upperLimit = (1 + stretch) * distance(options.massA.x, options.massA.y, options.massB.x, options.massB.y);
	}

	new_joint = new Muscle(options);
    }
    
    connections[x + masses.length * y] = new_joint;
    connections[y + masses.length * x] = new_joint;

    return connections;
}

//takes the JSON string from stringify and returns a new creature
function unstringifyCreature(str_options){
	creatureOptions = JSON.parse(str_options);
	var masses = [];
	var connections = [];

	//for keeping track of masses via their options
	var massMap = {};

	var massOptions = creatureOptions.massOptions;
	for(var id in massOptions){
		if(massOptions.hasOwnProperty(id)){
			var mass_opt = massOptions[id];

			var mass = new Mass(JSON.parse(mass_opt));
			massMap[id] = mass;
			masses.push(mass);
		}
	}

	var connectOptions = creatureOptions.connectionOptions;
	for (var i = 0; i < connectOptions.length; i++){
		var connectOpt = JSON.parse(connectOptions[i]);
		
		if(connectOpt != false){
			var options = connectOpt;

			//need to unpack the masses
			options["massA"] = massMap[JSON.parse(options["massA"])];
			options["massB"] = massMap[JSON.parse(options["massB"])];

			if(options["maxMotorForce"]){
				connections.push(new Muscle(options));
			}
			else {
				connections.push(new Spring(options));
			}
		}
		else {
			connections.push(connectOpt); //should be false
		}
	}

	//console.log(connections);
	//console.log(masses);
	var creature = new Creature(masses, connections);
	creature.fitness = creatureOptions.fitness;
	creature.startingPositions = creatureOptions.startingPositions;

	return creature;
}