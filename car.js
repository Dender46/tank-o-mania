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
  render: {
    fillStyle: '#000',
    strokeStyle: '#333',
    lineWidth: 7,
    opacity: 0.8
  }
}

var wheels = [];

for (let i = -wCenter; i < wCount - wCenter; i++) {
  let wheel = Bodies.polygon(wx + i * wSpace, wy, 12, wSize, wheelOptions)
  wheels.push(wheel)
  World.add(engine.world, [wheel]);
}

// center wheel attached to hull
var lowerHull = Bodies.rectangle(wx, wy - 30, wSpace * wCount, 20);
World.add(engine.world, [
  lowerHull,
  Constraint.create({
    bodyA: wheels[0],
    bodyB: lowerHull
  }),
  Constraint.create({
    bodyA: wheels[4],
    bodyB: lowerHull
  })
])

// Connecting wheels all together
for (let i = 0; i < wCount - 1; i++) {
  World.add(engine.world, [
    Constraint.create({
      bodyA: wheels[i],
      bodyB: wheels[i + 1]
    })
  ])
}
for (let i = 0; i < wCount / 2; i++) {
  World.add(engine.world, [
    Constraint.create({
      bodyA: wheels[i],
      bodyB: wheels[wCount - i - 1],
      render: {
        visible: false
      }
    })
  ])
}

// TERRAIN
World.add(engine.world, [
  Bodies.trapezoid(170, height-170, 240, 80, 0.5, {isStatic: true}),

])

// ------------------
//      JUMPING
// ------------------
var allowJump = false;
  
// Events.on(engine, 'collisionStart', event => {
//   let pairs = event.pairs;
//   for (let i = 0; i < pairs.length; i++) {
//     if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB == floor ||
//       pairs[i].bodyB == jumpSensor && pairs[i].bodyA == floor) {
//       allowJump = true;
//     }
//   }
// });

// Events.on(engine, 'collisionEnd', event => {
//   let pairs = event.source.pairs.collisionActive;
//   for (let i = 0; i < pairs.length; i++) {
//     if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB == floor ||
//       pairs[i].bodyB == jumpSensor && pairs[i].bodyA == floor) {
//       allowJump = true;
//       break;
//     } else {
//       allowJump = false;
//     }
//   }
// });

var rotation = 0.1

document.addEventListener('keydown', function (e) {
  if (allowJump && e.keyCode == KEY_SPACE)
    Body.applyForce(ws[wCenter], ws[wCenter].position, {
      x: 0,
      y: (-0.025 * wCount)
    });
  if (e.keyCode == KEY_A) {
    for (let i = 0; i < 5; i++) {
      Body.setAngularVelocity(wheels[i], -0.5)
      Body.applyForce(wheels[i], wheels[i].position, {
          x: -0.002,
          y: 0
        })
      }
    }
    if (e.keyCode == KEY_D) {
      for (let i = 0; i < wheels.length; i++) {
        Body.setAngularVelocity(wheels[i], 0.5)
      Body.applyForce(wheels[i], wheels[i].position, {
        x: 0.002,
        y: 0
      })
    }
  }
});