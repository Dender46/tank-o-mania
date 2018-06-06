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

const RED = '#c02942';

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
    fillStyle: '#161616',
    strokeStyle: '#333',
    lineWidth: 6
  }
}

var wheels = [];

for (let i = -wCenter; i < wCount - wCenter; i++) {
  let wheel = Bodies.polygon(wx + i * wSpace, wy, 10, wSize, wheelOptions)
  wheels.push(wheel)
  World.add(engine.world, [wheel]);
}
// Connecting wheels all together
for (let i = 0; i < wCount - 1; i++) {
  World.add(engine.world, [
    Constraint.create({ bodyA: wheels[i], bodyB: wheels[i+1], render: {strokeStyle: RED, lineWidth: 3}})
  ]);
}
for (let i = 0; i < wCount / 2; i++) {
  World.add(engine.world, [
    Constraint.create({ bodyA: wheels[i], bodyB: wheels[wCount-i-1], render: {visible: false}})
  ]);
}

// ----- HULL -----
var hullRenderOptions = {
  fillStyle: '#111',
  strokeStyle: '#333',
  lineWidth: 6
}

const lowerHull = Bodies.trapezoid(wx, wy - 30, wSpace * wCount, 20, 0.1, {
  density: 0.01, chamfer: {radius: 1}, render: hullRenderOptions
});
var group = Body.nextGroup(true);
const upperHull = Bodies.trapezoid(wx, wy - 60, 115, 40, 0.1, {
  density: 0.000000000001, chamfer: {radius: [1, 10, 10, 1]}, render: hullRenderOptions,
  collisionFilter: {group: group}
});

// ----- JUMPSENSOR -----
const jumpSensor = Bodies.rectangle(wx, wy, wCount * wSpace, 70, {
  isSensor: true,
  density: 0.000001,
  label: 'jumpSensor',
  render: { visible: false }
});

// ----- BARREL -----
const barrel = Bodies.rectangle(wx, wy - 100, 12, 120, {
  density: 0.000000000001, collisionFilter: {group: group}, render: hullRenderOptions
})

World.add(engine.world, [
  jumpSensor, barrel, lowerHull, upperHull,

  // 1. connect lowerHull to wheels
  Constraint.create({ bodyA: wheels[0], bodyB: lowerHull, render: {visible: false} }),
  Constraint.create({ bodyA: wheels[4], bodyB: lowerHull, render: {visible: false} }),
  // 2. connect upperHull to wheels
  Constraint.create({ bodyA: wheels[0], bodyB: upperHull, render: {visible: false} }),
  Constraint.create({ bodyA: wheels[4], bodyB: upperHull, render: {visible: false} }),

  // 3. connect jumpSensor to lowerHull
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    length: 0.001, render: {visible: false},
    pointA: {x: -90, y: 0},
    pointB: {x: -90, y: -20}
  }),
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    length: 0.001, render: {visible: false},
    pointA: {x: 90, y: 0},
    pointB: {x: 90, y: -20}
  }),
  
  // 4. connect upperHull to lowerHull
  Constraint.create({ bodyA: lowerHull, bodyB: upperHull,
    render: {strokeStyle: RED, anchors: false, lineWidth: 3},
    pointA: {x: -40, y: 0},
    pointB: {x: -40, y: 0},
  }),

  // 5. connect barrel to upperHull
  Constraint.create({ bodyA: barrel, bodyB: upperHull,
    render: {strokeStyle: '#181818', lineWidth: 5},
    pointA: {x: 0, y: 50},
    pointB: {x: 0, y: 10},
  })
]);


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
var horVelMax = 4;

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