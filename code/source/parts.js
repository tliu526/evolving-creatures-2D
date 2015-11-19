/*
Contains the "object" abstractions of the required components to build creatures. Currently there are
four components:

-mass
-springs (distance joints)
-muscles (motorized distance joints) TODO
-walls 
*/
function Component(options) {
    this.x =           options.x          || 0;
    this.y =           options.y          || 0;
    this.angle =       options.angle      || 0;
    this.fill =        options.fill       || 0x000000;
    this.density =     options.density    || 0.5;
    this.restitution = options.restitution || 0.2;
    this.friction =    options.friction   || 0.8;
    this.isStatic =    options.isStatic   || false;
 //   this.pixi =        new PIXI.Graphics();
    
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

function Mass(options) {
    Component.call(this, options);

 
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
	fixDef.density = this.density;
	fixDef.friction = this.friction;
	fixDef.restitution = this.restitution;
    fixDef.filter.groupIndex = GROUP_MASS;
	fixDef.shape = new b2CircleShape(this.r / SCALE);
	this.body.CreateFixture(fixDef);
    }

    //TODO better toString function?
    Mass.prototype.toString = function(){
        return JSON.stringify(Mass);
}
}
Mass.prototype = Component;


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
    
    this.body = world.CreateBody(bodyDef);

    this.addToWorld = function() {
	var fixDef = new b2FixtureDef;
	fixDef.density = this.density         || 1.0;
	fixDef.friction = this.friction       || 0.5;
	fixDef.restitution = this.restitution || 0.2;
	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(this.width / (2*SCALE), this.height / (2*SCALE));
	this.body.CreateFixture(fixDef);
    }

}
Wall.prototype = Component;

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

	var dist_joint = new b2DistanceJointDef();
	dist_joint.bodyA = this.massA.body;
	dist_joint.bodyB = this.massB.body;
	dist_joint.localAnchorA = new b2Vec2(0,0);
	dist_joint.localAnchorB = new b2Vec2(0,0);

	//console.log("rest length " + options.restLength);

	dist_joint.rest_length = options.restLength;
	dist_joint.dampingRatio = options.damping;
	dist_joint.frequencyHz = options.frequency;
	dist_joint.collideConnected = true;

	this.addToWorld = function() {
		this.joint = world.CreateJoint(dist_joint);
	}

    //TODO tweak the mutation values so that they're reasonable, add Gaussian noise
    this.mutate = function() {
        var rand = Math.floor(Math.random() * 3);
        switch(rand){
            case 0:
            this.joint.SetDampingRatio(this.joint.GetDampingRatio()*2*Math.random());
            break;
            case 1:
            this.joint.SetFrequency(this.joint.GetFrequency()*2*Math.random());
            break;
            case 2:
            this.joint.SetLength(this.joint.GetLength()*2*Math.random());
            break;
            default:
            break;
        }

        console.log("Spring mutated");
    }

}
Spring.prototype = Component;

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

    this.addToWorld = function() {
       this.joint = world.CreateJoint(prism_joint);
    }

    //TODO tweak the mutation values so that they're reasonable, add Gaussian noise
    this.mutate = function() {
        var rand = Math.floor(Math.random() * 4);
        switch(rand){
            case 0:
            this.joint.SetMaxMotorForce(this.joint.GetMotorForce()*4*Math.random());
            break;
            case 1:
            this.joint.SetLimits(this.joint.GetLowerLimit()*2*Math.random(),this.joint.GetUpperLimit());
            break;
            case 2:
            this.joint.SetLimits(this.joint.GetLowerLimit(), this.joint.GetUpperLimit()*2*Math.random());
            break;
            case 3:
            this.joint.SetMotorSpeed(this.joint.GetMotorSpeed()*2*Math.random());
            break;
            default:
            break;
        }
        console.log("Muscle mutated");
    }
}
Muscle.prototype = Component;