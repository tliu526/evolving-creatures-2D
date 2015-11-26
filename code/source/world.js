/*
Allows us to make multiple words with different parameters
-hasWalls: boolean value for walls on sides of world
-hasGround: boolean value for ground
-wallWidth: width of walls
-groundHeight: height of ground from bottom of canvas
-elementID: identifier for canvas
*/
function World(options) {
    this.b2world = new b2World(new b2Vec2(0, 10), false);
    this.canvas = document.getElementById(options.elementID);
    this.ctx = this.canvas.getContext("2d");
    this.components = [];

    this.hasWalls = options.hasWalls;
    this.hasGround = options.hasGround;
    
    this.wallWidth    = options.wallWidth    || 0;
    this.groundHeight = options.groundHeight || 0;

    var boundary_options = {
        width      : this.wallWidth,
        height     : this.groundHeight,
	world      : this
    }

    if (this.hasWalls) {
	addRightWall(boundary_options);
	addLeftWall(boundary_options);
    }

    if (this.hasGround) {
	addGround(boundary_options);
    }
    
    this.debugDraw = new b2DebugDraw();
    this.debugDraw.SetSprite(this.ctx);
    this.debugDraw.SetDrawScale(SCALE);
    this.debugDraw.SetFillAlpha(0.3);
    this.debugDraw.SetLineThickness(1.0);
    this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.b2world.SetDebugDraw(this.debugDraw);
}