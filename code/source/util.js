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
var masses = [];
var connections = [];

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

