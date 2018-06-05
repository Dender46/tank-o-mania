// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events,
  Constraint = Matter.Constraint,
  Composite = Matter.Composite;

const KEY_SPACE = 32;
const KEY_A = 65;
const KEY_D = 68;

// ----- WHEELS -----
const wSize = 16;
const wCount = 5;
const wSpace = wSize * 2.3;
const wx = width / 2;
const wy = height / 2;
const wCenter = Math.floor(wCount / 2);

const wheelOptions = {
  restitution: 0.2,
  density: 0.01,
  render: {
    fillStyle: '#111',
    strokeStyle: '#333',
    lineWidth: 6,
    opacity: 0.8
  }
}

var wheels = [];

for (let i = -wCenter; i < wCount - wCenter; i++) {
  let wheel = Bodies.polygon(wx + i * wSpace, wy, 10, wSize, wheelOptions)
  wheels.push(wheel)
  World.add(engine.world, [wheel]);
}

// ----- HULL WITH JUMP SENSOR -----
const lowerHull = Bodies.rectangle(wx, wy - 30, wSpace * wCount, 20, {
  density: 0.01,
  render: {
    fillStyle: '#111',
    strokeStyle: '#333',
    lineWidth: 6
  }
});

const jumpSensor = Bodies.rectangle(wx, wy, wCount * wSpace, 70, {
  isSensor: true,
  density: 0.000001,
  label: 'jumpSensor',
  render: {
    opacity: 0.1
  }
});

World.add(engine.world, [
  jumpSensor, lowerHull,

  // connect lowerHull to wheels
  Constraint.create({ bodyA: wheels[0], bodyB: lowerHull, render: {visible: false} }),
  Constraint.create({ bodyA: wheels[4], bodyB: lowerHull, render: {visible: false} }),

  // connect jumpSensor to lowerHull
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    length: 0.001, render: {visible: false},
    pointA: {x: 90, y: 0},
    pointB: {x: 90, y: -20}
  }),
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    length: 0.001, render: {visible: false},
    pointA: {x: -90, y: 0},
    pointB: {x: -90, y: -20},
  })
]);

// Connecting wheels all together
for (let i = 0; i < wCount - 1; i++) {
  World.add(engine.world, [
    Constraint.create({ bodyA: wheels[i], bodyB: wheels[i+1], render: {strokeStyle: '#a02b2b'}})
  ]);
}
for (let i = 0; i < wCount / 2; i++) {
  World.add(engine.world, [
    Constraint.create({ bodyA: wheels[i], bodyB: wheels[wCount-i-1], render: {visible: false}})
  ]);
}

// ----- TERRAIN -----
World.add(engine.world, [
  Bodies.trapezoid(170, height-170, 240, 80, 0.5, {isStatic: true, label: 'Terrain'}),

]);

// ----- JUMPING -----
var allowJump = false;
  
Events.on(engine, 'collisionStart', event => {
  let pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB.label == 'Terrain' ||
      pairs[i].bodyB == jumpSensor && pairs[i].bodyA.label == 'Terrain') {
      allowJump = true;
      console.log()
    }
  }
});

Events.on(engine, 'collisionEnd', event => {
  let pairs = event.source.pairs.collisionActive;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB.label == 'Terrain' ||
      pairs[i].bodyB == jumpSensor && pairs[i].bodyA.label == 'Terrain') {
      allowJump = true;
      break;
    } else {
      allowJump = false;
    }
  }
});

var angVel = 0.1;
var horVel = 0.22;
var verVel = 0.4;

document.addEventListener('keydown', function (e) {
  if (allowJump && e.keyCode == KEY_SPACE)
    Body.applyForce(lowerHull, lowerHull.position, { x: 0, y: (-verVel * wCount) });

  if (e.keyCode == KEY_A) {
    Body.applyForce(lowerHull, lowerHull.position, { x: -horVel, y: 0 });
    for (let i = 0; i < 5; i++)
      Body.setAngularVelocity(wheels[i], -angVel)
  }
  
  if (e.keyCode == KEY_D) {
    Body.applyForce(lowerHull, lowerHull.position, { x: horVel, y: 0 });
    for (let i = 0; i < wheels.length; i++)
      Body.setAngularVelocity(wheels[i], angVel)
  }
});