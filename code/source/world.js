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

    this.originalScale = this.scale;
    this.isDistTest    = options.isDistTest || false;
    this.hasRightWall  = options.hasWalls   || false;
    this.hasLeftWall   = options.hasWalls   || this.isDistTest;
    this.hasGround     = options.hasGround  || this.isDistTest;

    this.b2world = new b2World(new b2Vec2(0, 10), false);    

    this.creatures = [];

    this.camera = {
        x  : 0,
        y  : 0,
	trueX : 0,
	dtrueX : 0,
	zoomX : 0,
	zoomY : 0,
	dzoom : 0
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

    this.creatureBounds = function() {
	var bounds = {
	    xLow  : Infinity,
	    xHigh : -Infinity,
	    yLow   : Infinity,
	    yHigh  : -Infinity
	}
	
	for (var i = 0; i < this.creatures.length; i++) {
	    var next = this.creatures[i].getBoundingBox();
	    if (next.xHigh > bounds.xHigh) bounds.xHigh = next.xHigh;
	    if (next.xLow < bounds.xLow)  bounds.xLow  = next.xLow;
	    if (next.yHigh > bounds.yHigh) bounds.yHigh = next.yHigh;
	    if (next.yLow < bounds.yLow)  bounds.yLow  = next.yLow;
	}

	return bounds;
    }

    this.update = function() {
	var bounds = this.creatureBounds();
	var width = (bounds.xHigh - bounds.xLow);
	if(width > (this.canvas.width * 0.7 / this.scale)) {
	    var dzoom =  (width - this.canvas.width * 0.7 / this.scale); 
	    if (this.camera.dzoom < dzoom) this.camera.dzoom -= (dzoom - this.camera.dzoom) / 2; 
	}
	
	else {
	    if(width < (this.canvas.width * 0.60)
	       && this.camera.dzoom < 0) {
		this.camera.dzoom /= 8; 
		if (this.camera.dzoom > -0.05 
		    && this.camera.dzoom < 0.05) {
		    this.camera.dzoom = 0; 
		}
	    }	    
	}

	var oldScale = this.scale;
	this.scale += this.camera.dzoom;	
	this.camera.zoomY = this.canvas.height - this.canvas.height / this.originalScale * this.scale

	if (this.scale < oldScale) {	    
	    this.camera.zoomX = 0.5*(this.canvas.width - this.canvas.width / this.originalScale * this.scale);
	}	

	this.camera.x = this.camera.trueX*this.scale - this.camera.zoomX;
	this.camera.y = this.camera.zoomY;


	if(bounds.xHigh * this.scale > (this.camera.x + this.canvas.width * 0.75)) {
		    var dx = (bounds.xHigh  - (this.camera.x + this.canvas.width*0.75) / this.scale) / 2; 
		    if (this.camera.dtrueX < dx) this.camera.dtrueX += (dx - this.camera.dtrueX); 
	}
	
	else {
	    if(this.camera.dtrueX > 0) {
		this.camera.dtrueX /= 2; 
		if (this.camera.dtrueX < 0.05) this.camera.dtrueX = 0; 
	    }
	}
	

	
	this.camera.trueX += this.camera.dtrueX;
	this.camera.x = this.camera.trueX*this.scale - this.camera.zoomX;

    }

    this.draw = function() {
	this.update();
	//this.ctx.drawImage(this.background, -this.camera.x % this.background.width, 0);
	//this.ctx.drawImage(this.background, (-this.camera.x % this.background.width) + this.background.width, 0);
	//this.ctx.drawImage(this.background, (-this.camera.x % this.background.width) - this.background.width, 0);

	var x = -this.camera.x % this.scale;

	while (x < this.canvas.width) {
	    //draw line
	    this.ctx.lineWidth = this.scale / 16;
	    this.ctx.fillStyle   = "rgba(200, 200, 230, 0.3)";
	    this.ctx.strokeStyle   = "rgba(200, 200, 230, 0.3)";
	    this.ctx.fillRect(x, 0, 1, this.canvas.height);
	    this.ctx.stroke();

	    x += this.scale;
	} 

	var y = this.canvas.height

	while (y > 0) {
	    //draw line
	    this.ctx.lineWidth = this.scale / 16;
	    this.ctx.fillStyle   = "rgba(200, 200, 230, 0.3)";
	    this.ctx.strokeStyle   = "rgba(200, 200, 230, 0.3)";
	    this.ctx.fillRect(0, y, this.canvas.width, 1);
	    this.ctx.stroke();

	    y -= this.scale;
	} 

	for (var i = 0; i < this.components.length; i++) {
	    this.components[i].drawToWorld(this);
	}

	this.ctx.strokeStyle = "black";
	this.ctx.fillStyle = "black";
	this.ctx.fillText(this.label, 10, 10);
    }
}