// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events,
  Constraint = Matter.Constraint,
  Composite = Matter.Composite,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse;

const KEY_SPACE = 32;
const KEY_A = 65;
const KEY_D = 68;

// ----------------------
//         WHEELS 
// ----------------------
let wSize = 16;
let wCount = 5;
let wSpace = wSize * 2.3;
let wx = width / 2;
let wy = height / 2;
let wCenter = Math.floor(wCount / 2);

let wheelOptions = {
  friction: 0.2,
  render: {
    fillStyle: '#000',
    strokeStyle: '#333',
    lineWidth: 7,
    opacity: 0.8
  }
}

var wheels = Composite.create();
let ws = wheels.bodies;
for (let i = -wCenter; i < wCount - wCenter; i++) {
  Composite.add(wheels, Bodies.polygon(wx + i * wSpace, wy, 12, wSize, wheelOptions))
}

for (let i = 0; i < wCount - 1; i++) {
  Composite.add(wheels, Constraint.create({
    bodyA: ws[i],
    bodyB: ws[i + 1]
  }));
}
// Composite.add(wheels, Constraint.create({
//   bodyA: ws[0],
//   bodyB: ws[wCount-1],
//   render: {
//     visible: false
//   }
// }));

for (let i = 0; i < wCount / 2; i++) {
  Composite.add(wheels, Constraint.create({
    bodyA: ws[i],
    bodyB: ws[wCount - i - 1],
    render: {
      visible: false
    }
  }));
}

var playerCenter = {
  x: ws[wCenter].position.x,
  y: ws[wCenter].position.y
}

var jumpSensor = Bodies.rectangle(
  playerCenter.x, playerCenter.y,
  wCount * wSpace / 1.5, wCount + wSpace * 1.5, {
    isSensor: true,
    density: 0.001,
    render: {
      opacity: 0.3,
    }
  });

World.add(engine.world, [
  wheels,
  jumpSensor,
  Constraint.create({
    bodyA: ws[wCenter / 2],
    bodyB: jumpSensor,
    pointB: {
      x: -(wCenter / 2) * wSpace - 0.0087,
      y: 0
    },
  }),
  Constraint.create({
    bodyA: ws[wCenter / 2 + wCenter],
    bodyB: jumpSensor,
    pointB: {
      x: (wCenter / 2) * wSpace + 0.0082,
      y: 0
    },
  })
]);

// ------------------
//      JUMPING
// ------------------
var allowJump = false;

Events.on(engine, 'collisionStart', event => {
  let pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB == floor ||
      pairs[i].bodyB == jumpSensor && pairs[i].bodyA == floor) {
      allowJump = true;
    }
  }
});

Events.on(engine, 'collisionEnd', event => {
  let pairs = event.source.pairs.collisionActive;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB == floor ||
      pairs[i].bodyB == jumpSensor && pairs[i].bodyA == floor) {
      allowJump = true;
      break;
    } else {
      allowJump = false;
    }
  }
});

var rotation = 0.1

document.addEventListener('keydown', function (e) {
  if (allowJump && e.keyCode == KEY_SPACE)
    Body.applyForce(ws[wCenter], ws[wCenter].position, {
      x: 0,
      y: (-0.025 * wCount)
    });
  if (e.keyCode == KEY_A) {
    let wh = wheels.bodies;
    for (let i = 0; i < wh.length; i++) {
      Body.applyForce(wh[i], wh[i].position, {
        x: -0.002,
        y: 0
      })
      Body.rotate(wh[i], -rotation)
    }
  }
  if (e.keyCode == KEY_D) {
    let wh = wheels.bodies;
    for (let i = 0; i < wh.length; i++) {
      Body.applyForce(wh[i], wh[i].position, {
        x: 0.002,
        y: 0
      })
      Body.rotate(wh[i], rotation)
    }
  }
});