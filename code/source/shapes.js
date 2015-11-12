function Shape(options) {
    this.x =          options.x        || 0;
    this.y =          options.y        || 0;
    this.angle =      options.angle    || 0;
    this.fill =       options.fill     || 0xFFFFFF;
    this.isStatic =   options.isStatic;
    this.pixi =       new PIXI.Graphics();
    
    this.update = function(options) {
	if (!this.isStatic) {
	    this.x =       options.x || this.x;
	    this.y =       options.y || this.y;
	    this.angle =   options.angle || this.angle;
	    this.fill =    options.fill || this.fill;
	    this.body.SetPosition(new b2Vec2(this.x / SCALE, this.y / SCALE));
	}
    }
}

function Circle(options) {
    Shape.call(this, options);

    this.r = options.r || 5;

    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }

    bodyDef.position.x = this.x / SCALE;
    bodyDef.position.y = this.y / SCALE;
    
    this.body = world.CreateBody(bodyDef);

    this.addToWorld = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	fixDef.shape = new b2CircleShape(this.r / SCALE);
	this.body.CreateFixture(fixDef);
    }

    this.draw = function() {
	this.pixi.clear();
	this.pixi.lineStyle(0);
	this.pixi.beginFill(this.fill);
	this.pixi.drawCircle(this.x, this.y, this.r);
	this.pixi.endFill();	
    };
}
Circle.prototype = Shape;

function Rect(options) {
    Shape.call(this, options);

    this.width =  options.width   || 10;
    this.height = options.height  || 10;
    
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

    this.draw = function() {
	this.pixi.clear();
	this.pixi.lineStyle(0);
	this.pixi.beginFill(this.fill);
	this.pixi.drawRect(this.x, this.y, this.width, this.height);
	this.pixi.endFill();	
    };
}
Rect.prototype = Shape;