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


function generateRandomCreature() {
    var masses = [];
    var connections = [];


    for(var i = 0; i < 10; i++){
        var mass_options = {
            x           : Math.random()*(canvas.width-50) + 50,
            y           : ((Math.random()*canvas.height) / 2),
            density     : 1.0,
            restitution : 0.2,
            friction    : 0.5,
            isStatic    : false
        }
        var mass = new Mass(mass_options);
        components.push(mass);
        masses.push(mass);
    }

    var connected = new Array(masses.length * masses.length);
    for(var i = 0; i < connected.length; i++) {
    connected[i] = false;
    }

    for(var i = 0; i < 20; i++) {
    
       iA = Math.floor(Math.random()*masses.length);
       iB = Math.floor(Math.random()*masses.length);
       while (iA == iB 
        || connected[iA + masses.length * iB] 
        || connected[iB + masses.length * iA]) {
        iB = Math.floor(Math.random()*masses.length);
    }

    connected[iA + masses.length * iB] = true;
    connected[iB + masses.length * iA] = true;

        var mA = masses[iB]
        var mB = masses[iA]

    
    if (Math.random() < 0.5) {
        var spring_options = {
        massA : mA,             
        massB : mB,
        restLength : Math.random()*50 + 15,
        damping : Math.random() / 2.0,
        frequency : Math.random()*50
        }
        
        var spring = new Spring(spring_options);
        connections.push(spring);
    } else {
        theta = Math.random()*Math.PI*2;

        var muscle_options = {
          massA : mA,             
          massB : mB,
          lowerLimit : 0,
          upperLimit : Math.random()*1.5 + 1.0,
          motorSpeed : Math.random()*4.0 + 1.0,
          maxMotorForce: Math.random()*300.0 + 200.0,
          axis : new b2Vec2(Math.cos(theta), Math.sin(theta))
      }

        var muscle = new Muscle(muscle_options);
        connections.push(muscle);
    }
    }
    return new Creature(masses, connections)
}
