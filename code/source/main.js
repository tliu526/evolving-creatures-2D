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
	var options = {
	    x        : Math.random()*_window.width,
	    y        : Math.random()*_window.height / 2,
	    r        : Math.random()*50 + 5,
	    fill     : rainbow[Math.floor(Math.random()*rainbow.length)],
	    isStatic : false
	}
	
	shapes.push(new Circle(options));
	shapes[i].addToWorld();
	stage.addChild(shapes[i].pixi);
    }

    var options = {
	width  : 4,
	height : 4
    }

    addRightWall(options);
    addLeftWall(options);
    addGround(options);
}

function onGraphics() {
    world.Step(1 / 60, 10, 10);
    world.ClearForces();

    for (i = 0; i < shapes.length; i++) {
	var options = {
	    x : SCALE * shapes[i].body.GetPosition().x,
	    y : SCALE * shapes[i].body.GetPosition().y
	}

	shapes[i].update(options);
	shapes[i].draw();
    }

    requestAnimationFrame(onGraphics);
    renderer.render(stage);
}

function onClick() {
    for (i = 0; i < shapes.length; i++) {
	if (!shapes[i].isStatic) {
	    var options;
	    options.fill = rainbow[Math.floor(Math.random()*rainbow.length)];
	    option.x = Math.random()*_window.width;
	    option.y = Math.random()*_window.height / (2*SCALE);

	    shapes[i].update(options);
	}
    }
}

/*****************************************************/
onLoad();
onGraphics();