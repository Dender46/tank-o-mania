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
const wx = width / 1.5;
const wy = height / 1.3;
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

const lowerHull = Bodies.trapezoid(wx, wy - 30, wSpace * wCount, 20, 0.07, {
  density: 0.01, collisionFilter: {group: group}, chamfer: {radius: 1}, render: hullRenderOptions
});
var group = Body.nextGroup(true);
const upperHull = Bodies.trapezoid(wx, wy - 60, 115, 40, 0.1, {
  density: 0.000001, chamfer: {radius: [1, 10, 10, 1]}, render: hullRenderOptions,
  collisionFilter: {group: group}
});

// ----- JUMPSENSOR -----
const jumpSensor = Bodies.rectangle(wx, wy, wCount * wSpace, 70, {
  isSensor: true, density: 0.00000000001, label: 'jumpSensor',
  render: {visible: false}
});

// ----- BARREL -----
const barrelJoint = Bodies.rectangle(wx, wy - 70, 10, 40, {
  density: 0.0000000001, collisionFilter: {group: group}, render: {visible: false}
});
const barrel = Bodies.rectangle(wx, wy - 110, 10, 120, {
  density: 0.0000000000001, isSensor: true, render: hullRenderOptions
});
const projArea = Bodies.trapezoid(wx, wy - 170, 15, 20, -0.1, {
  density: 0.000000000000000001, isSensor: true, render: hullRenderOptions
})

World.add(engine.world, [
  jumpSensor,
  lowerHull, 
  
  barrel,
  projArea,
  upperHull,
  barrelJoint,

  // 1. connect lowerHull to wheels
  Constraint.create({ bodyA: wheels[0], bodyB: lowerHull, render: {visible: false} }),
  Constraint.create({ bodyA: wheels[4], bodyB: lowerHull, render: {visible: false} }),
  // 2. connect upperHull to wheels
  Constraint.create({ bodyA: wheels[0], bodyB: upperHull, render: {visible: false} }),
  Constraint.create({ bodyA: wheels[4], bodyB: upperHull, render: {visible: false} }),

  // 3. connect jumpSensor to lowerHull
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    pointA: {x: -90, y: 10}, pointB: {x: -90, y: -20}, render: {visible: false}
  }),
  Constraint.create({ bodyA: lowerHull, bodyB: jumpSensor,
    pointA: {x: 90, y: 10}, pointB: {x: 90, y: -20}, render: {visible: false}
  }),
  
  // 4. connect upperHull to lowerHull
  Constraint.create({ bodyA: lowerHull, bodyB: upperHull,
    pointA: {x: -40, y: 0}, pointB: {x: -40, y: 0}, render: {visible: false}
  }),
  Constraint.create({ bodyA: lowerHull, bodyB: upperHull,
    pointA: {x: 40, y: 0}, pointB: {x: -40, y: 0}, render: {visible: false}
  }),

  // 5. connect barrelJoint to upperHull
  Constraint.create({ bodyA: upperHull, bodyB: barrelJoint,
    render: {strokeStyle: '#181818', lineWidth: 5}, pointA: {x: 0, y: -10}
  }),

  // 6. connect barrel to barrelJoint
  Constraint.create({ bodyA: barrel, bodyB: barrelJoint,
    pointA: {x: 0, y: 55}, pointB: {x: 0, y: 15}, render: {visible: false}
  }),
  Constraint.create({ bodyA: barrel, bodyB: barrelJoint,
    pointA: {x: 0, y: 25}, pointB: {x: 0, y: -15}, render: {visible: false}
  }),

  // 7. connect shooting area to barrel
  Constraint.create({ bodyA: projArea, bodyB: barrel,
    pointA: {x: 7, y: 5}, pointB: {x: 7, y: -55}, render: {visible: false}
  }),
  Constraint.create({ bodyA: projArea, bodyB: barrel,
    pointA: {x: -7, y: 5}, pointB: {x: -7, y: -55}, render: {visible: false}
  }),
]);


// ----- TERRAIN -----
World.add(engine.world, [
  Bodies.trapezoid(170, height/1.5, 240, 200, 0.3, {isStatic: true, label: 'Terrain'}),
  Bodies.trapezoid(500, height/1.3, 240, 120, 0.3, {isStatic: true, label: 'Terrain'}),
  Bodies.trapezoid(500, height/3.2, 120, 50, -0.1, {isStatic: true, label: 'Terrain'}),

]);

// ----- JUMPING -----
var allowJump = false;
  
Events.on(engine, 'collisionStart', event => {
  let pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].bodyA == jumpSensor && pairs[i].bodyB.label == 'Terrain' ||
      pairs[i].bodyB == jumpSensor && pairs[i].bodyA.label == 'Terrain') {
      allowJump = true;
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

// ----- ROTATING BARRELL -----
var pos = barrelJoint.position;
Events.on(engine, 'beforeUpdate', function() {
  let mPos = mouse.position;
  let hullPos = lowerHull.position;
  angle = Math.atan2(mPos.y - pos.y, mPos.x - pos.x) + 1.57;
  Body.setAngle(barrelJoint, angle);
})

// ----- PROJECTILES -----
function createProjectile(x, y) {
  let proj = Bodies.rectangle(x, y, 18, 18, {
    render: {fillStyle: '#ffb83d', opacity: 0.8}
  });
  World.add(engine.world, [proj]);

  let mPos = mouse.position;
  angle = Math.atan2(mPos.y - pos.y, mPos.x - pos.x);
  Body.setAngle(proj, angle);
  Body.applyForce(proj, proj.position, {x: Math.cos(angle) / 40, y: Math.sin(angle) / 40})
}

var limitShooting = 5;

Events.on(engine, 'beforeUpdate', function() {
  if (mouse.button == 0) {
    if (Math.floor(engine.timing.timestamp % 500 / 100) == 0 && limitShooting > 5) {
      createProjectile(projArea.position.x, projArea.position.y)
      limitShooting = 0;
    }
    limitShooting++;
  }
}, false);



var angVel = 0.1;
var horVel = 0.22;
var verVel = 0.5;
var horVelMax = 4;

document.addEventListener('keydown', function (e) {
  if (allowJump && e.keyCode == KEY_SPACE)
    Body.applyForce(lowerHull, lowerHull.position, {x: 0, y: (-verVel * wCount)});

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