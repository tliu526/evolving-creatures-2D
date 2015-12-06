/*
Allows us to make multiple words with different parameters
-hasWalls: boolean value for walls on sides of world
-hasGround: boolean value for ground
-wallWidth: width of walls
-groundHeight: height of ground from bottom of canvas
-elementID: identifier for canvas
*/
function World(options) {
    this.scale = 30;
    this.wallWidth    = 0.4;
    this.groundHeight = 0.4;
    this.label = "";
    this.components = [];
    this.background = new Image();
    this.background.src = "../data-files/gamebackground.jpg";

    if (options) {
	if (options.elementID) {
	    this.canvas = document.getElementById(options.elementID);
	    this.canvas.addEventListener('click', onClick, false);
	    this.ctx = this.canvas.getContext("2d");
	    this.scale = this.canvas.width / 15;
	}
	if (options.scale) this.scale = options.scale;
	if (options.wallWidth) this.wallWidth = options.wallWidth;
	if (options.groundHeight) this.groundHeight = options.groundHeight;
    }

    this.isDistTest    = options.isDistTest || false;
    this.hasRightWall  = options.hasWalls   || false;
    this.hasLeftWall   = options.hasWalls   || this.isDistTest;
    this.hasGround     = options.hasGround  || this.isDistTest;

    this.b2world = new b2World(new b2Vec2(0, this.scale / 3), false);    

    this.creature;

    this.camera = {
        x  : 0,
        y  : 0,
        dx : 0,
        dy : 0,
    }

    var boundary_options = {
        width      : this.wallWidth,
        height     : this.groundHeight,
	scale      : this.scale,
        world      : this
    }

    if (this.hasRightWall) addRightWall(boundary_options);
    if (this.hasLeftWall)  addLeftWall(boundary_options);
    if (this.hasGround)    addGround(boundary_options);

    this.step = function(framerate) {
	this.camera.x += this.camera.dx 
	this.camera.y += this.camera.dy 
	this.camera.x = clamp(this.camera.x, 0, 100000);
    }

    this.draw = function() {
	this.ctx.drawImage(this.background, -this.camera.x % this.canvas.width, 0);
	this.ctx.drawImage(this.background, this.canvas.width - (-this.camera.x % this.canvas.width), 0);

	for (var i = 0; i < this.components.length; i++) {
	    this.components[i].drawToWorld(this);
	}

	this.ctx.strokeStyle = "black";
	this.ctx.fillStyle = "black";
	this.ctx.fillText(this.label, 10, 10);
    }
}