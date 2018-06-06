let w = window.innerWidth;
let h = window.innerHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);

const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(100));

const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 10000);
camera.position.set(400, 400, 400);
camera.lookAt(scene.position);
const controls = new THREE.OrbitControls(camera);

controls.maxDistance = 900;

const light = new THREE.PointLight(0xffffff, 5, 1000);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5, 1000);
scene.add(ambientLight);

document.body.appendChild(renderer.domElement);
const loader = new THREE.ObjectLoader();

loader.load('./assets/sun.json', (object) => {
  object.scale.x = 0.5;
  object.scale.y = 0.5;
  object.scale.z = 0.5;
  scene.add(object);
});

const starsGeometry = new THREE.SphereGeometry(1000, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
const starsTexture = new THREE.TextureLoader().load('./assets/stars.jpg');
const starsMaterial = new THREE.MeshBasicMaterial({
  map: starsTexture,
  side: THREE.BackSide
});
const stars = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(stars);

const particlesMaterial = new THREE.PointCloudMaterial({
  color: 0xffffcc
});

const particlesGeometry = new THREE.Geometry();

let particleX, particleY, particleZ;

for (let i = 0; i < 5000; i++) {
  particleX = (Math.random() * 800) - 400;
  particleY = (Math.random() * 800) - 400;
  particleZ = (Math.random() * 800) - 400;

  particlesGeometry.vertices.push(new THREE.Vector3(particleX, particleY, particleZ));
}

const particleCloud = new THREE.PointCloud(particlesGeometry, particlesMaterial);
scene.add(particleCloud);

const solSystem = [];
const rings = [];

const createPlanet = (radius, texturePath, xPos, yPos, zPos, scene, planetName) => {
  const geometry = new THREE.SphereGeometry(radius, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
  const texture = new THREE.TextureLoader().load(texturePath);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    bumpScale: 0.05
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(xPos, yPos, zPos);
  scene.add(planet);
  createOrbitRings(xPos);
  const loader = new THREE.FontLoader();
  let textMesh;
  loader.load('./vendor/three.js-master/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry(planetName, {
      font: font,
      size: 2,
      height: 1,
    });

    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(xPos - 5, yPos + 10, zPos);
    scene.add(textMesh);
    solSystem.push({
      planet,
      x: xPos,
      y: yPos,
      z: zPos,
      text: textMesh
    });
  });
}

const createOrbitRings = (radius) => {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(radius, radius + 0.1, 2 * 32, 5, Math.PI * 2, Math.PI * 2),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    }));
  mesh.position.set(0, 0, 0);
  mesh.rotateX(Math.PI / 2);
  scene.add(mesh);
}

const createRings = (radius, texturePath, xPos, yPos, zPos, rotateX, scene) => {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(1.05 * radius, 2 * radius, 2 * 32, 5, Math.PI * 2, Math.PI * 2),
    new THREE.MeshBasicMaterial({
      color: 0xbebebe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    }));
  mesh.position.set(xPos, yPos, zPos);
  mesh.rotateX(rotateX);
  scene.add(mesh);
  rings.push({
    ring: mesh,
    x: xPos,
    y: yPos,
    z: zPos
  });
}

createPlanet(0.25, './assets/mercury.jpg', 10.8, 0, 10.8, scene, 'Mercury');
createPlanet(0.6, './assets/venus.jpg', -15.8, 0, 15.8, scene, 'Venus');
createPlanet(0.63, './assets/earth.jpg', 19.9, 0, -19.9, scene, 'Earth');
createPlanet(0.33, './assets/mars.jpg', -27.8, 0, 27.8, scene, 'Mars');
createPlanet(7, './assets/jupiter.jpg', 82.9, 0, 82.9, scene, 'Jupiter');
createPlanet(5.9, './assets/saturn.jpg', -129.3, 0, 129.3, scene, 'Saturn');
createPlanet(2.5, './assets/uranus.jpg', 162.1, 0, 162.1, scene, 'Uranus');
createPlanet(2.46, './assets/neptune.jpg', -254.5, 0, 254.5, scene, 'Neptune');
createPlanet(0.12, './assets/pluto.jpg', -305, 0, 305, scene, 'Pluto');
createRings(5.9, './assets/saturn-rings.png', -129.3, 0, 129.3, Math.PI / 3, scene);

const gui = new dat.GUI();
const appClass = function () {
  this.speed = 0.001;
}
const appInstance = new appClass();
const controller = gui.add(appInstance, 'speed', 0, 0.01);
let counter = 0;

const updateParticles = () => {
  particlesGeometry.vertices.forEach(particle => {
    let dX, dY, dZ;
    dX = Math.random() * 0.1 - 0.05;
    dY = Math.random() * 0.1 - 0.05;
    dZ = Math.random() * 0.1 - 0.05;

    particle.add(new THREE.Vector3(dX, dY, dZ));
  });

  particlesGeometry.verticesNeedUpdate = true;
};

const render = () => {
  solSystem.forEach(item => {
    item.planet.rotation.y += 0.01;
    item.planet.position.set(item.x * Math.sin(counter), 0, item.z * Math.cos(counter));
    item.text.position.set(item.x * Math.sin(counter) - 5, item.y + 10, item.z * Math.cos(counter));
  });
  rings.forEach(item => {
    item.ring.rotation.z += 0.01;
    item.ring.position.set(item.x * Math.sin(counter), 0, item.z * Math.cos(counter));
  });
  counter += appInstance.speed;

  updateParticles();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();