// changed every second in time with tweens
const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFFFF];
// possible areas for points to create convex hulls
const positions = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 }];


const clock = new THREE.Clock();
const asteroids = new THREE.Group();

let cores = [];

const giveOrTake = center => Math.random() * 100 + (center - 50);
const asteroidAt = ({ x, y, z }, multiplier) => {
    // randomly position 40 points for convex hull
    const geometry = new THREE.ConvexGeometry(Array.apply(0, Array(40)).map(
        () => new THREE.Vector3(giveOrTake(x), giveOrTake(y), giveOrTake(z))));

    const shape = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({ emissive: 0x141414 }));
    shape.position.set(x * multiplier, y * multiplier, z * multiplier);
    geometry.center();
    return shape;
};

// enumerate all possible angle transitions to choose from
const tweenForRotation = (axis, sign) => ring => new TWEEN.Tween(ring.rotation).
    to({ [axis]: sign + Math.PI / 4 }, 1000).
    easing(TWEEN.Easing.Back.In);
const asteroidTweens = {
    forwardX: tweenForRotation('x', '+'),
    backwardX: tweenForRotation('x', '-'),
    forwardY: tweenForRotation('y', '+'),
    backwardY: tweenForRotation('y', '-'),
    forwardZ: tweenForRotation('z', '+'),
    backwardZ: tweenForRotation('z', '-') };


let ring = 0;
const runTween = () => {
    const choice = Object.keys(asteroidTweens)[Math.floor(Math.random() * 6)];
    asteroidTweens[choice](asteroids.children[ring]).start();

    // change light color
    scene.children[0].color.setHex(colors[ring]);
    // change cores colors to match current light
    [2, 3, 4].map(core => {
        scene.children[core].material.color.setHex(colors[ring]);
    });

    // cycle through rings each tween, moving from the inside out
    ring = ring === asteroids.children.length - 1 ? 0 : ring + 1;
};

const createAsteroids = () => {
    // create 4 rings
    [200, 400, 600, 800].map(multiplier => {
        const ring = new THREE.Group();
        positions.map(pos => ring.add(asteroidAt(pos, multiplier)));
        asteroids.add(ring);
    });

    // offset each ring differently
    asteroids.children[0].rotateX(Math.PI / 4);
    asteroids.children[1].rotateX(Math.PI / 4);
    asteroids.children[1].rotateY(Math.PI / 4);
    asteroids.children[2].rotateY(Math.PI / 4);
    asteroids.children[2].rotateZ(Math.PI / 4);

    scene.add(asteroids);

    cores = [0.5, 1, 1.5].map(scale => {
        const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(50),
            new THREE.MeshBasicMaterial({ wireframe: true }));

        core.scale.multiplyScalar(scale);
        return core;
    });
    scene.add(...cores);

    runTween(scene);
    setInterval(runTween, 1000, scene);
};

const animate = () => {
    TWEEN.update();
    controls.update();

    const delta = clock.getDelta();
    asteroids.children.map((ring, index) => {
        ring.children.map((a, i) => {
            a.rotation.x += delta / (index + i);
            a.rotation.y += delta / (index + i);
        });
    });

    cores[0].rotation.x += delta;
    cores[1].rotation.y += delta;
    cores[2].rotation.z += delta;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

// three.js setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x272727);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(750, 750, 750);
camera.lookAt(scene.position);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
const controls = new THREE.OrbitControls(camera, renderer.domElement);

scene.add(new THREE.PointLight(0xD7D7D7, 1, 100000));

createAsteroids();

document.body.appendChild(renderer.domElement);
animate();
