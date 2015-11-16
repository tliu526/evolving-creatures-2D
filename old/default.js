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
    b2DistanceJointDef =  Box2D.Dynamics.Joints.b2DistanceJointDef,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

var SCALE = 30;

var _window;
var stage, renderer;
var world;
var shapes = [];

var rainbow = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x0000FF, 0x8A2BE2];

function addRightWall(options) {
    options.width = options.width || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    options.width,
	height   :    _window.height,
	x        :    _window.width - options.width,
	y        :    0,
	isStatic :    true
    }
    shapes.push(new Rect(v));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function addLeftWall(options) {
    options.width = options.width || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    options.width,
	height   :    _window.height,
	x        :    0,
	y        :    0,
	isStatic :    true
    }

    shapes.push(new Rect(v));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function addGround(options) {
    options.height = options.height || 4;

    var v = {
	fill     :    options.fill  || 0x663300,
	width    :    _window.width,
	height   :    options.height,
	x        :    0,
	y        :    _window.height - options.height,
	isStatic :    true
    }

    shapes.push(new Rect(v));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function Window(width, height, color) {
    this.width = width;
    this.height = height;
    this.color = color;
}