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
    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

var SCALE = 30;

var _window;
var stage, renderer;
var world;
var shapes = [];

var rainbow = [0xFF0000, 0xFF8C00, 0xFFD700, 0x32CD32, 0x0000FF, 0x8A2BE2];

function onLoad() {
    _window = new Window(400, 300, 0x1099bb);

    stage = new PIXI.Container();
    stage.interactive = true;
    stage.on('click', onClick);
    stage.on('tap', onClick);

    renderer = PIXI.autoDetectRenderer(_window.width, _window.height, 
				       {backgroundColor : _window.color});
    document.body.appendChild(renderer.view);

    world = new b2World(new b2Vec2(0, 10), false);

    for (i = 0; i < 5; i++) {
	shapes.push(new Circle(Math.random()*_window.width, 
			       Math.random()*_window.height / (2*SCALE),
			       Math.random()*50 + 5,
			       rainbow[Math.floor(Math.random()*rainbow.length)],
			       false));
	shapes[i].addToWorld();
	stage.addChild(shapes[i].pixi);
    }

    addRightWall();
    addLeftWall();
    addGround();
}

function onGraphics() {
    world.Step(1 / 60, 10, 10);
    world.ClearForces();

    for (i = 0; i < shapes.length; i++) {
	shapes[i].update();
	shapes[i].draw();
    }

    requestAnimationFrame(onGraphics);
    renderer.render(stage);
}

function onClick() {
    for (i = 0; i < shapes.length; i++) {
	if (!shapes[i].isStatic) {
	    shapes[i].fill = rainbow[Math.floor(Math.random()*rainbow.length)];
	    shapes[i].body.SetPosition(new b2Vec2(Math.random()*_window.width / SCALE,  Math.random()*_window.height / (2*SCALE)));
	    shapes[i].update();
	}
    }
}

function addRightWall() {
    shapes.push(new Rect(_window.width - 0.01*_window.width,
			 0,
			 0.01*_window.width,
			 _window.height,
			 0x000000,
			 true));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function addLeftWall() {
    shapes.push(new Rect(0,
			 0,
			 0.01*_window.width,
			 _window.height,
			 0x000000,
			 true));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function addGround() {
    shapes.push(new Rect(0,
			 _window.height - 0.01*_window.width,
			 _window.width,
			 0.01*_window.width,
			 0x000000,
			 true));
    shapes[shapes.length-1].addToWorld();
    stage.addChild(shapes[shapes.length-1].pixi);
}

function Window(width, height, color) {
    this.width = width;
    this.height = height;
    this.color = color;
}

function Circle(x, y, r, fill, isStatic) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.fill = fill;
    this.isStatic = isStatic;
    this.pixi = new PIXI.Graphics();

    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }
    bodyDef.position.x = this.x / SCALE;
    bodyDef.position.y = this.x / SCALE;
    
    this.body = world.CreateBody(bodyDef);
    
    this.addToWorld = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	fixDef.shape = new b2CircleShape(this.r / SCALE);
	this.body.CreateFixture(fixDef);
    }

    this.update = function() {
	if (!this.isStatic) {
	    this.x = this.body.GetPosition().x * SCALE;
	    this.y = this.body.GetPosition().y * SCALE;
	}
    }

    this.draw = function() {
	this.pixi.clear();
	this.pixi.lineStyle(0);
	this.pixi.beginFill(this.fill);
	this.pixi.drawCircle(this.x, this.y, this.r);
	this.pixi.endFill();	
    };
}

function Rect(x, y, width, height, fill, isStatic) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fill = fill;
    this.isStatic = isStatic;
    this.pixi = new PIXI.Graphics();

    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }
    bodyDef.position.x = (this.x + this.width / 2) / SCALE;
    bodyDef.position.y = (this.y + this.height / 2) / SCALE;
    
    this.body = world.CreateBody(bodyDef);    
    
    this.addToWorld = function() {

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	fixDef.shape= new b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / (2*SCALE), this.height / (2*SCALE));
	this.body.CreateFixture(fixDef);
    }

    this.update = function() {
	if (!this.isStatic) {
	    this.x = this.body.GetPosition().x * SCALE;
	    this.y = this.body.GetPosition().y * SCALE;
	}
    }

    this.draw = function() {
	this.pixi.clear();
	this.pixi.lineStyle(0);
	this.pixi.beginFill(this.fill);
	this.pixi.drawRect(this.x, this.y, this.width, this.height);
	this.pixi.endFill();	
    };
}

/*****************************************************/
onLoad();
onGraphics();