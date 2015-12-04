//pre: masses is a list of mass objects (vertices), connections are springs/muscles
function Creature(masses, connections) {
    //this.map = {};
	this.connections = connections;
	this.masses = masses;

	/*
	for (var i = 0; i < masses.length; i++){
		//add to our map of vertices, initialize empty adjacency list
		this.map[masses[i]] = [];
	}

	for (var i = 0; i < connections.length; i++){
		//springs and muscles are our "edges"
		var edge = connections[i];
		this.map[edge.massA].push(edge);
		this.map[edge.massB].push(edge);
	}
	*/
	
	this.components = [];

	for (var i = 0; i < masses.length; i++) {
		this.components.push(masses[i]);
		for (var j = 0; j < i; j++) {
		    if (connections[i + masses.length * j] != false) {
			this.components.push(connections[i + masses.length * j]);
		    }
		}
	}

	this.addToWorld = function(world) {
	  
	    for (var i = 0; i < this.components.length; i++){
		this.components[i].addToWorld(world);
	    }
	    var bounds = this.getBoundingBox();
	}

	this.translate = function(dx, dy) {
	    for (var i = 0; i < masses.length; i++) {
	    	mass = masses[i]
	    	pos = mass.body.GetPosition();
	    	mass.body.SetPosition(new b2Vec2(pos.x + dx / SCALE, pos.y + dy / SCALE));
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
		xLow   : 0,
		xHigh  : 0,
		yLow   : 0,
		yHigh  : 0
	    }
	    
	    for (var i = 0; i < this.masses.length; i++) {
		var mass  = this.masses[i];
		var r     = mass.r;
		var x     = mass.body.GetPosition().x*SCALE;
		var y     = mass.body.GetPosition().y*SCALE;
		
		if (x + r > bounds.xHigh) bounds.xHigh = x + r;
		if (x - r > bounds.xLow)  bounds.xLow  = x - r;
		if (y + r > bounds.yHigh) bounds.yHigh = y + r;
		if (y - r > bounds.yLow)  bounds.yLow  = y - r;
	    }	    
	    return bounds;
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
//TODO still needs to be fixed, sometimes generates badness
function crossover(creatureA, creatureB) {
	//console.log("top of crossover");
	//slice is used to copy
	var massesA = creatureA.masses.slice();
	var massesB = creatureB.masses.slice();

	var connectionsA = creatureA.connections.slice();
	var connectionsB = creatureB.connections.slice();

	var cross_ptA = Math.floor(Math.random()*(massesA.length-1))+1; //range of [1, masses.length-1]
	var cross_ptB = Math.floor(Math.random()*(massesB.length-1)); //range of [0, masses.length-2]

	var new_masses = [];

	for(i = 0; i <= cross_ptA; i++){
	    new_masses.push(new Mass(massesA[i].options));
	}

	for(i = cross_ptB; i < massesB.length; i++){
	    new_masses.push(new Mass(massesB[i].options));
	}

	//var all_connections = creatureA.connections.slice().concat(creatureB.connections.slice());
	
	var new_connections = new Array(new_masses.length * new_masses.length);

	// Setup adjacency matrix
	for(var i = 0; i < new_connections.length; i++) {
	    new_connections[i] = false;
	}

	//copy connecting edges
	for (i = 0; i < new_masses.length; i++){
	    if (i <= cross_ptA) {
	    	for (var j = i + 1; j < new_masses.length; j++) {
		        //Assume properly setup adjacency matrix
		        if ((j < massesA.length) && (connectionsA[i + massesA.length * j] != false)) {

		        	var joint = connectionsA[i + massesA.length * j];
			        //console.log(joint);
			        var id = joint.id;

			        var new_joint;

			        var options = {
			        	massA : new_masses[i],
			        	massB : new_masses[j]
			        }
			    
			        if (id.charAt(0) == "S") {
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

			        new_connections[i + new_masses.length * j] = new_joint;
			        new_connections[j + new_masses.length * i] = new_joint;
			    }
			}
		} 
/*
	    else {
		// i > cross_ptA
		// index in massB = i - cross_ptA + cross+ptB - 1
		var iB = i - cross_ptA + cross_ptB - 1;
		for (var iA = 0; iA <= cross_ptA; iA++) {  
		    //Assume properly setup adjacency matrix
		    if ((iB > (cross_ptB - cross_ptA + iA)) && (connectionsB[iB + massesB.length * (cross_ptB - cross_ptA + iA)] != false)) {

		    //console.log("ConnectionsB size: " + connectionsB.length);
		    //console.log("index: " + (iB + massesB.length * (cross_ptB - cross_ptA + iA)));
			var joint = connectionsB[iB + massesB.length * (cross_ptB - cross_ptA + iA)];


			console.log(joint);
			var id = joint.id;
			
			var new_joint;

			var options = {
			    massA : new_masses[iA],
			    massB : new_masses[iB]
			}
			    
			if (id.charAt(0) == "S") {
			    options.restLength = joint.rest_length;
			    options.damping = joint.dampingRation;
			    options.frequency = joint.frequencyHz;
			    
			    new_joint = new Spring(options);
			} else {
			    options.lowerLimit = joint.lowerTranslation;
			    options.upperLimit = joint.upperTranslation;
			    options.motorSpeed = joint.motorSpeed;
			    options.maxMotorForce = joint.maxMotorForce;

			    new_joint = new Muscle(options);
			}

			new_connections[iA + new_masses.length * i] = new_joint;
			new_connections[i + new_masses.length * iA] = new_joint;
		    }
		}
		for (var j = i + 1; j < new_masses.length; j++) {
		    //Assume properly setup adjacency matrix
		    if ((j < massesA.length) && (connectionsA[i + massesA.length * j] != false)) {

			var joint = connectionsA[i + massesA.length * j];
			console.log(joint);
			var id = joint.id;
			
			var new_joint;

			var options = {
			    massA : new_masses[i],
			    massB : new_masses[j]
			}
			    
			if (id.charAt(0) == "S") {
			    options.restLength = joint.rest_length;
			    options.damping = joint.dampingRation;
			    options.frequency = joint.frequencyHz;
			    
			    new_joint = new Spring(options);
			} else {
			    options.lowerLimit = joint.lowerTranslation;
			    options.upperLimit = joint.upperTranslation;
			    options.motorSpeed = joint.motorSpeed;
			    options.maxMotorForce = joint.maxMotorForce;

			    new_joint = new Muscle(options);
			}

			new_connections[i + new_masses.length * j] = new_joint;
			new_connections[j + new_masses.length * i] = new_joint;
		    }
		}
	    }
	    */
	    /*
		var e = new_connections[i];

		console.log("e: " + e);		
		console.log("mA: " + massesA[cross_ptA]);
		console.log("mB: " + massesA[cross_ptB]);
	
		if(e.massA.toString() == massesB[cross_ptB].toString()){
			e.massA = massesA[cross_ptA];
			console.log("crossed");
		}
		else if(e.massB.toString() == massesB[cross_ptB].toString()){
			e.massB = massesA[cross_ptA];
			console.log("crossed");
		}
	    */
	}

	return new Creature(new_masses, new_connections);
}