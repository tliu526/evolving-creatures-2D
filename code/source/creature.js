//pre: masses is a list of mass objects (vertices), connections are springs/muscles
function Creature(masses, connections) {
	this.map = {};
	for (i = 0; i < masses.length; i++){
		//add to our map of vertices, initialize empty adjacency list
		this.map[masses[i]] = [];
	}

	for (i = 0; i < connections.length; i++){
		//springs and muscles are our "edges"
		var edge = connections[i];
		this.map[edge.massA].push(edge);
		this.map[edge.massB].push(edge);
	}
	console.log(connections);

	this.components = masses.concat(connections);

	this.addToWorld = function() {
		for(i = 0; i < this.components.length; i++){
			this.components[i].addToWorld();
		}
	}

	this.pointMutation = function() {
		connections[Math.floor(Math.random()*connections.length)].mutate();
	}
}

// don't want creatures with extraneous parts
// given array of nodes, nodes, and adjacency table edges
// returns array of indices of nodes
// that make the largest connected component
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
	console.log(groups[i]);
	if (groups[i].length > result.length) {
	    result = groups[i];
	}
    }

    return result;
}

// breadth first search
// returns array of indices of vertices connected to source 
// source is an index of array of nodes
// nodes is array of masses
// edges is an adjacency table
// visited is an array the length of nodes indicating whether 
// the corresponding node has been visited 
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