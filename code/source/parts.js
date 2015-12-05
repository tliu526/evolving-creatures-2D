/*
Contains the "object" abstractions of the required components to build creatures. Currently there are
four components:

-mass
-springs (distance joints)
-muscles (motorized distance joints) TODO
-walls 
*/
function Component(options) {
    this.options = options;//.slice();
  
    this.x =           options.x          || 0;
    this.y =           options.y          || 0;
    this.angle =       options.angle      || 0;
    this.fill =        options.fill       || 0x000000;
    this.density =     options.density    || 0.5;
    this.restitution = options.restitution || 0.2;
    this.friction =    options.friction   || 0.8;
    this.isStatic =    options.isStatic   || false;
    
    this.update = function(options) {
     if (!this.isStatic) {
         this.x =       options.x || this.x;
         this.y =       options.y || this.y;
         this.angle =   options.angle || this.angle;
         this.fill =    options.fill || this.fill;
	 if (this.body) {
	     this.body.SetPosition(new b2Vec2(this.x / SCALE, this.y / SCALE));
	 }
     }
    }
}

function Mass(options) {
    Component.call(this, options);
    this.options = options;
    this.r = options.r || 5;

    var bodyDef = new b2BodyDef;
    if (this.isStatic == true) {
	bodyDef.type = b2Body.b2_staticBody;
    } else {
	bodyDef.type = b2Body.b2_dynamicBody;
    }

    bodyDef.position.x = this.x / SCALE;
    bodyDef.position.y = this.y / SCALE;
    
    this.type = "Mass";
    this.id = mass_id;
    mass_id++;
    
    this.addToWorld = function(world) {
	this.body = world.b2world.CreateBody(bodyDef);

	var fixDef = new b2FixtureDef;
	fixDef.density = this.density;
	fixDef.friction = this.friction;
	fixDef.restitution = this.restitution;
	fixDef.filter.groupIndex = GROUP_MASS;
	fixDef.shape = new b2CircleShape(this.r / SCALE);
	//fixDef.shape = new b2PolygonShape();
	//fixDef.shape.SetAsBox(this.r/SCALE, this.r/SCALE);
	this.body.CreateFixture(fixDef);
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
    

    this.addToWorld = function(world) {
	this.body = world.b2world.CreateBody(bodyDef);

	var fixDef = new b2FixtureDef;
	fixDef.density = this.density         || 1.0;
	fixDef.friction = this.friction       || 0.5;
	fixDef.restitution = this.restitution || 0.2;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / (2*SCALE), this.height / (2*SCALE));
	this.body.CreateFixture(fixDef);
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
	
	// FIGURE OUT WHAT THESE MEAN
	prism_joint.enableLimit = true;
	prism_joint.lowerTranslation = options.lowerLimit;
	prism_joint.upperTranslation = options.upperLimit;
	prism_joint.motorSpeed = options.motorSpeed;
	prism_joint.maxMotorForce = options.maxMotorForce;
	prism_joint.enableMotor = true;
	prism_joint.collideConnected = true;
	
	this.joint = world.b2world.CreateJoint(prism_joint);
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