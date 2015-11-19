var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body, 
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
    b2DistanceJointDef =  Box2D.Dynamics.Joints.b2DistanceJointDef,
    b2PrismaticJointDef =  Box2D.Dynamics.Joints.b2PrismaticJointDef;

var SCALE = 30;
//negative index means members of this group do not collide
var GROUP_MASS = -1;
//var _window;
var canvas;
var world;
var components = [];
var creature;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
  };
})();

function addRightWall(options) {
    options.width = options.width || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    options.width,
	height   :    canvas.height,
	x        :    canvas.width - options.width,
	y        :    0,
	isStatic :    true
    }
    components.push(new Wall(v));
    components[components.length-1].addToWorld();
    //stage.addChild(shapes[shapes.length-1].pixi);
}

function addLeftWall(options) {
    options.width = options.width || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    options.width,
	height   :    canvas.height,
	x        :    0,
	y        :    0,
	isStatic :    true
    }
    
    components.push(new Wall(v));
    components[components.length-1].addToWorld();
    //stage.addChild(shapes[shapes.length-1].pixi);
}

function addGround(options) {
    options.height = options.height || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    canvas.width,
	height   :    options.height,
	x        :    0,
	y        :    canvas.height - options.height,
	isStatic :    true
    }

    components.push(new Wall(v));
    components[components.length-1].addToWorld();
    //stage.addChild(shapes[shapes.length-1].pixi);
}

/*
params OPTIONAL:
- lower limit of number of masses
- upper limit of number of masses
- lower limit of number joints as 
  a proportion of total possible
- upper limit of number joints as 
  a proportion of total possible
*/
function generateRandomCreature(options) {
    var massLowerLimit = 4;
    var massUpperLimit = 10;
    var edgeLowerProportion = 0.4;
    var edgeUpperProportion = 0.7;
    var probMuscle = 0.6;

    if (options) {
	if (options.lowerLimit) masslowerLimit = options.lowerLimit; 
	if (options.upperLimit) massupperLimit = options.upperLimit; 
	if (options.lowerProportion) edgeLowerProportion = clamp(options.lowerProportion, 0, 1); 
	if (options.upperProportion) edgeUpperProportion = clamp(options.upperProportion, 0, 1); 
	if (options.probMuscle) probMuscle = clamp(options.probMuscle, 0, 1);
    }

    var masses = [];
 
    for(var i = 0; i < getRandomInt(massLowerLimit, massUpperLimit); i++){
        var mass_options = {
            x           : getRandomInt(50, 200),
            y           : getRandomInt(50, 200),
            density     : 1.0,
            restitution : 0.2,
            friction    : getRandom(0.5, 1),
            isStatic    : false
        }
        var mass = new Mass(mass_options);
        components.push(mass);
        masses.push(mass);
    }

    var strictUpperBound = masses.length * (masses.length - 1) / 2;
    var minEdges = Math.floor(edgeLowerProportion * strictUpperBound);
    var maxEdges = Math.floor(edgeUpperProportion * strictUpperBound);
    var connected = new Array(masses.length * masses.length);

    // Setup adjacency matrix
    for(var i = 0; i < connected.length; i++) {
	connected[i] = false;
    }
    
    for(var i = 0; i < getRandomInt(minEdges, maxEdges); i++) {
	// masses.length options for first mass
	// masses.length - 1 options for second mass
	// adding to iA mod masses.length guaruntees not picking same mass
	var iA = getRandomInt(0, masses.length);
	var iB = (iA + getRandomInt(1, masses.length)) % masses.length;
	while ((connected[iA + masses.length * iB] != false) 
	       || (connected[iB + masses.length * iA]!= false)) {
	    iB = (iA + getRandomInt(1, masses.length)) % masses.length;
	}
		
        var mA = masses[iB];
	var mB = masses[iA];
		
	if (getRandom(0, 1) >= probMuscle) {
	    var spring_options = {
		massA : mA,             
		massB : mB,
		restLength : distance(mA.x, mA.y, mB.x, mB.y),
		damping : getRandom(0.0, 0.5),
		frequency : getRandom(0.0, 1.0)
	    }
	    
	    var spring = new Spring(spring_options);
	    connected[iA + masses.length * iB] = spring;
	    connected[iB + masses.length * iA] = spring;

	} else {

	    var theta = getRandom(0.0, Math.PI*2);
	    var stretch = getRandom(0.0, 0.5);
	    
	    var muscle_options = {
		massA : mA,             
		massB : mB,
		lowerLimit : (1 - stretch) * distance(mA.x, mA.y, mB.x, mB.y) / SCALE,
		upperLimit : (1 + stretch) * distance(mA.x, mA.y, mB.x, mB.y) / SCALE,
		motorSpeed : getRandom(0.5, 2.0),
		maxMotorForce: getRandom(50.0, 200.0),
		axis : new b2Vec2(Math.cos(theta), Math.sin(theta))
	    }
	    
	    var muscle = new Muscle(muscle_options);
	    connected[iA + masses.length * iB] = muscle;
	    connected[iB + masses.length * iA] = muscle;
	}
    }

    var largest = largestConnectedGraph(masses, connected);
    if (largest.length < masses.length) {
       resultMasses = [];
       resultConnections = [];
	
       for (var i = 0; i < largest.length; i++) {
           resultMasses.push(masses[largest[i]]);
           for (var j = 0; j < largest[i]; j++) {
              if (connected[largest[i] + masses.length*j] != false) {
                  resultConnections.push(connected[largest[i] + masses.length*j]);
                  console.log(largest[i] + "," + j);
              }
            } 
        }
        return new Creature(resultMasses, resultConnections);
    } else {
	connections = [];

	for (var i = 0; i < masses.length; i++) {
	    for (var j = 0; j < i; j++) {
		if (connected[i + masses.length*j]) {
		    connections.push(connected[i + masses.length*j]);
		}
	    } 
	}

	return new Creature(masses, connections);
    }
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function clamp(v, min, max) {
    if (v < min) v = min;
    if (v > max) v = max;
    return v;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}