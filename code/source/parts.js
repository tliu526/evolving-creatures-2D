/*
Contains the "object" abstractions of the required components to build creatures. Currently there are
four components:

-mass
-springs (distance joints)
-muscles (motorized distance joints) TODO
-walls 
*/
function Component(options) {
    this.x =           options.x        || 0;
    this.y =           options.y        || 0;
    this.isStatic =    options.isStatic || false;
    this.angle =       0;
    this.fill =        0x000000;
    this.density =     0.5;
    this.restitution = 0.2;
    this.friction =    0.8;
    this.scale =       30;
    if (options) {
	this.options = options;
	if (options.angle)       this.angle =       options.angle;
	if (options.fill)        this.fill =        options.fill;
	if (options.density)     this.density =     options.density;
	if (options.restitution) this.restitution = options.restitution;
	if (options.friction)    this.friction =    options.friction;
	if (options.scale)       this.scale = options.scale;
    }

    this.drawToWorld = function(world) {}
}
function Mass(options) {
    Component.call(this, options);

    this.type = "Mass";
    this.id = mass_id;
    mass_id++;

    this.r = 0.2;
    if (options.r) this.r = options.r;

    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }

    bodyDef.position.x = this.x;
    bodyDef.position.y = this.y;
    
    this.addToWorld = function(world) {
	this.body = world.b2world.CreateBody(bodyDef);

	var fixDef = new b2FixtureDef;
	fixDef.density = this.density;
	fixDef.friction = this.friction;
	fixDef.restitution = this.restitution;
	fixDef.filter.groupIndex = GROUP_MASS;
	fixDef.shape = new b2CircleShape(this.r);
	this.body.CreateFixture(fixDef);

	world.components.push(this);
    }

    this.drawToWorld = function(world) {
	var ctx = world.ctx;
	var scale = world.scale;
	var pos = this.body.GetPosition();
	var xShift = world.camera.x;
	var yShift = world.camera.y;
	var grd = ctx.createRadialGradient(pos.x * scale - xShift, 
					   pos.y * scale - yShift,
					   0, 
					   pos.x * scale - xShift, 
					   pos.y * scale - yShift, 
					   this.r * scale);

	grd.addColorStop(0, "rgba(1, 1, 1, 0.3)");
	grd.addColorStop(1,"rgba(153, 179, 255, 0.3)");

	ctx.strokeStyle = "rgba(153, 179, 255, 1.0)";
	ctx.fillStyle   = grd;

	ctx.beginPath();
	ctx.arc(pos.x * scale - xShift, pos.y * scale - yShift, this.r * scale, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
    }

    //TODO figure out why stringify is generating cyclic objects
    Mass.prototype.toString = function(){
        return this.id;
        //console.log(this);
        //return "Mass: " + JSON.stringify(this);
    }
}
//Mass.prototype = Component;


function Wall(options){
    Component.call(this, options);

    this.width =  0.4;
    this.height = 0.4;

    if (options.width)  this.width =  options.width;
    if (options.height) this.height = options.height;
    
    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }

    bodyDef.position.x = (this.x + this.width / 2);
    bodyDef.position.y = (this.y + this.height / 2);
    
    this.addToWorld = function(world) {
	this.body = world.b2world.CreateBody(bodyDef);

	var fixDef = new b2FixtureDef;
	fixDef.density = this.density         || 1.0;
	fixDef.friction = this.friction       || 0.5;
	fixDef.restitution = this.restitution || 0.2;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / (2), this.height / (2));
	this.body.CreateFixture(fixDef);

	world.components.push(this);
    }

    this.drawToWorld = function(world) {
	var ctx = world.ctx;
	var scale = world.scale;
	var xShift = world.camera.x;
	var yShift = world.camera.y;

	ctx.strokeStyle = "rgba(0, 255, 0, 1.0)";
	ctx.fillStyle   = "rgba(153, 255, 179, 0.3)";

	ctx.fillRect(this.x * scale - xShift, this.y * scale - yShift, this.width * scale, this.height * scale);
	ctx.rect(this.x * scale - xShift, this.y * scale - yShift, this.width * scale, this.height * scale);
	ctx.stroke();
    }
}
//Wall.prototype = Component;

/*
params REQUIRED:
- bodyA
- bodyB
- restLength
- damping [0,1]
- frequency
*/
function Spring(options){
    Component.call(this, options);
    
    this.massA = options.massA;
    this.massB = options.massB;
    this.type = "Spring";
    this.id = spring_id;
    spring_id++;

    this.rest_length = options.restLength;
    this.dampingRatio = options.damping;
    this.frequencyHz = options.frequency;
    
    this.addToWorld = function(world) {
	var dist_joint = new b2DistanceJointDef();

	dist_joint.bodyA = this.massA.body;
	dist_joint.bodyB = this.massB.body;
	dist_joint.localAnchorA = new b2Vec2(0,0);
	dist_joint.localAnchorB = new b2Vec2(0,0);
	dist_joint.rest_length = options.restLength;
	dist_joint.dampingRatio = options.damping;
	dist_joint.frequencyHz = options.frequency;
	dist_joint.collideConnected = true;

	this.joint = world.b2world.CreateJoint(dist_joint);

	world.components.push(this);
    }

    this.drawToWorld = function(world) {
	var ctx = world.ctx;
	var scale = world.scale;
	var A = this.massA.body.GetPosition();
	var B = this.massB.body.GetPosition();
	var xShift = world.camera.x;
	var yShift = world.camera.y;

	ctx.strokeStyle = "rgba(0, 0, 255, 1.0)";
	ctx.fillStyle   = "rgba(0, 0, 255, 0.3)";

	ctx.beginPath();
	ctx.moveTo(A.x * scale - xShift, A.y * scale - yShift);
	ctx.lineTo(B.x * scale - xShift, B.y * scale - yShift);

	ctx.stroke();
	ctx.fill();
    }

    //TODO tweak the mutation values so that they're reasonable, add Gaussian noise
    this.mutate = function() {
        var rand = Math.floor(Math.random() * 3);
        switch(rand){
	case 0:
            this.dampingRatio *= 2*Math.random();
            break;
	case 1:
            this.frequency *= 2*Math.random();
            break;
	case 2:
            this.rest_length *= 2*Math.random();
            break;
	default:
            break;
        }
    }

    //TODO better toString function?
    Spring.prototype.toString = function(){
        return this.id;
        //return "Spring: " + JSON.stringify(this);
    }
}
//Spring.prototype = Component;

/*
params REQUIRED:
- bodyA
- bodyB
- axis
- lowerLimit
- upperLimit
- motorSpeed
- maxMotorForce
*/
function Muscle(options){
    Component.call(this, options);

    this.massA = options.massA;
    this.massB = options.massB;
    this.type = "Muscle";
    this.id = muscle_id;
    muscle_id++;

    this.lowerTranslation = options.lowerLimit;
    this.upperTranslation = options.upperLimit;
    this.motorSpeed = options.motorSpeed;
    this.maxMotorForce = options.maxMotorForce;

    this.addToWorld = function(world) {
	var prism_joint = new b2PrismaticJointDef();

	prism_joint.bodyA = this.massA.body;
	prism_joint.bodyB = this.massB.body;
	prism_joint.localAnchorA = new b2Vec2(0,0);
	prism_joint.localAnchorB = new b2Vec2(0,0);
	prism_joint.axis = options.axis;
	prism_joint.enableLimit = true;
	prism_joint.lowerTranslation = options.lowerLimit;
	prism_joint.upperTranslation = options.upperLimit;
	prism_joint.motorSpeed = options.motorSpeed;
	prism_joint.maxMotorForce = options.maxMotorForce;
	prism_joint.enableMotor = true;
	prism_joint.collideConnected = true;
	
	this.joint = world.b2world.CreateJoint(prism_joint);

	world.components.push(this);
    }

    this.drawToWorld = function(world) {
	var ctx = world.ctx;
	var scale = world.scale;
	var A = this.massA.body.GetPosition();
	var B = this.massB.body.GetPosition();
	var xShift = world.camera.x;
	var yShift = world.camera.y;

	ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
	ctx.fillStyle = "rgba(255, 0, 0, 0.3)";

	ctx.beginPath();
	ctx.moveTo(A.x * scale - xShift, A.y * scale - yShift);
	ctx.lineTo(B.x * scale - xShift, B.y * scale - yShift);

	ctx.stroke();
	ctx.fill();
    }

    //TODO tweak the mutation values so that they're reasonable, add Gaussian noise
    this.mutate = function() {
        var rand = Math.floor(Math.random() * 4);
        switch(rand){
	case 0:
            this.maxMotorForce *= 4*Math.random();
            break;
	case 1:
            this.lowerTranslation *= 2*Math.random();
            break;
	case 2:
            this.upperTranslation *= (2*Math.random() + 1)*this.lowerTranslation;
            break;
	case 3:
            this.motorSpeed *= 2*Math.random();
            break;
	default:
            break;
        }
    }

    //TODO better toString function?
    Muscle.prototype.toString = function(){
        return this.id;
        //return "Muscle: " + JSON.stringify(this);
    }
}
//Muscle.prototype = Component;