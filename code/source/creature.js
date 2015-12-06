//pre: masses is a list of mass objects (vertices), connections are springs/muscles
function Creature(masses, connections) {
    this.fitness = -1;
    this.connections = connections;
    this.masses = masses;	

    this.startingPositions = [];

    this.type = "Creature";
    this.id = creature_id;
    creature_id++;
    
    this.generation = -1;
    this.parentA    = -1;
    this.parentB    = -1;
    
    this.addToWorld = function(world) {	
    	world.creature = this;
    	for (var i = 0; i < masses.length; i++) {
    		masses[i].addToWorld(world);
    		for (var j = 0; j < i; j++) {
    			if (connections[i + masses.length * j] != false) {
    				connections[i + masses.length * j].addToWorld(world);
    			}
    		}
    	}
    	
	//var bounds = this.getBoundingBox();
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
function graft(creatureA, creatureB, canSwitchOrder) {
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
	
	if (i <= cross_ptA) {
	    for (var j = i + 1; j <= cross_ptA; j++) {
		//Assume properly setup adjacency matrix
		if (connectionsA[i + massesA.length * j] != false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsA[i + massesA.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    } 
	} else {
	    var iB1 = i - cross_ptA + cross_ptB - 1;
	    for (var iB2 = iB1 + 1; iB2 < massesB.length; iB2++) {	
		//Assume properly setup adjacency matrix
		if (connectionsB[iB1 + massesB.length * iB2] != false) {
		    i1 = i;
		    i2 = iB2 + cross_ptA - cross_ptB + 1;
		    joint = connectionsB[iB1 + massesB.length * iB2];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
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
    return creat;
}

/*
  Performs a two point crossover between creatures A and B and returns a new creature
*/
function crossover(creatureA, creatureB, canSwitchOrder) {
    if (canSwitchOrder && Math.random < 0.5) {
	var temp = creatureA;
	creatureA = creatureB;
	creatureB = temp;
    }

    var cross_ptA;
    var cross_ptB;
    var minLength = Math.min(creatureA.masses.length, creatureB.masses.length);

    if (minLength < 4) {
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
		    && connectionsB[i + massesB.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsA[i + massesA.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    } 
	} else {
	    //connectiong going left of current node to before cross_ptA
	    for (j = 0; j < cross_ptA; j++) {
		if (connectionsB[i + massesB.length * j] != false
		    && connectionsB[i + massesB.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsB[i + massesB.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    } 

	    //connections going right of current node
	    for (var j = i + 1; j < minLength; j++) {	
		//Assume properly setup adjacency matrix
		if ((connectionsB[i + massesB.length * j] != false)
		    && connectionsB[i + massesB.length * j] == false) {
		    i1 = i;
		    i2 = j;
		    joint = connectionsB[i + massesB.length * j];
		    new_connections = copyJoint(i1, i2, joint, new_masses, new_connections);
		}
	    }
	}
    } //END FOR

    var creat = new Creature(new_masses, new_connections);
    creat.parentA = creatureA.id;
    creat.parentB = creatureB.id;
    return creat;
}

function copyJoint(x, y, joint, masses, connections) {
    var new_joint;
        
    var options = {
    	massA : masses[x],
    	massB : masses[y]
    }
    
    if (joint.type.charAt(0) == "S") {
	options.restLength = joint.rest_length;
	options.damping = joint.dampingRatio;
	options.frequency = joint.frequencyHz;
	
	new_joint = new Spring(options);
    } else {
	options.lowerLimit = joint.lowerTranslation;
	options.upperLimit = joint.upperTranslation;
	options.motorSpeed = joint.motorSpeed;
	options.maxMotorForce = joint.maxMotorForce;
	
	new_joint = new Muscle(options);
    }
    
    connections[x + masses.length * y] = new_joint;
    connections[y + masses.length * x] = new_joint;

    return connections;
}