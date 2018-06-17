// module aliases
var Engine = Matter.Engine,
		Render = Matter.Render,
    World  = Matter.World,
    Bodies = Matter.Bodies,
    Body   = Matter.Body,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;

var engine = Engine.create({
  positionIterations: 2,
  velocityIterations: 2
});

var render = Render.create({
	element: document.body,
	engine: engine,
  options: {
    // width: 1900,
    // height: 800,
    width: document.body.clientWidth,
	  height: document.body.clientHeight,
    wireframes: false,
    showMousePosition: true
  }
});

const width = render.options.width;
const height = render.options.height;

const floor = Bodies.rectangle(width/2, height/1.2, width, 50, {
  isStatic: true,
  density: 1,
  friction: 0.2,
  label: 'Terrain'
});

// Drag and drop
const mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.1,
    render: { visible: true, type: 'string', lineWidth: 1}
  }
})

World.add(engine.world, [
  mouseConstraint,
  floor
]);

render.mouse = mouse;

Engine.run(engine);
Render.run(render);