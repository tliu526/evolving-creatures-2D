//pre: masses is a list of mass objects (vertices), connections are springs/muscles
function Creature(masses, connections){
	var map = {};
	for (i = 0; i < masses.length; i++){
		//add to our map of vertices, initialize empty adjacency list
		map[masses[i]] = [];
	}

	for (i = 0; i < connections.length; i++){
		//springs and muscles are our "edges"
		var edge = connections[i];
		map[edge.massA].push(edge);
		map[edge.massB].push(edge);
	}
	console.log(connections);

	var components = masses.concat(connections);


	this.addToWorld = function() {
		for(i = 0; i < components.length; i++){
			components[i].addToWorld();
		}
	}

	this.pointMutation = function() {
		//TODO (Tony)
	}
}