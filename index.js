lucide.createIcons();

/* 1. THREE.JS QUANTUM NEURAL MATRIX ENGINE */
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const nodeCount = 160;
const nodeGeo = new THREE.BufferGeometry();
const nodePos = new Float32Array(nodeCount * 3);
const nodeVelocities = [];

for (let i = 0; i < nodeCount; i++) {
  const i3 = i * 3;
  nodePos[i3] = (Math.random() - 0.5) * 35;
  nodePos[i3 + 1] = (Math.random() - 0.5) * 35;
  nodePos[i3 + 2] = (Math.random() - 0.5) * 20;

  nodeVelocities.push({
    x: (Math.random() - 0.5) * 0.015,
    y: (Math.random() - 0.5) * 0.015,
    z: (Math.random() - 0.5) * 0.015,
  });
}

nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));

const nodeMat = new THREE.PointsMaterial({
  color: 0xf59e0b,
  size: 0.28,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});

const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
scene.add(nodesMesh);

const lineMat = new THREE.LineBasicMaterial({
  color: 0x06b6d4,
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending,
});

let linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat);
scene.add(linesMesh);

const amberLight = new THREE.PointLight(0xf59e0b, 3, 40);
amberLight.position.set(12, 12, 10);
scene.add(amberLight);

const cyanLight = new THREE.PointLight(0x06b6d4, 3, 40);
cyanLight.position.set(-12, -12, 10);
scene.add(cyanLight);

let mouseX = 0,
  mouseY = 0;
let targetX = 0,
  targetY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();

function updateNeuralNetwork() {
  const positions = nodesMesh.geometry.attributes.position.array;
  const linePositions = [];

  for (let i = 0; i < nodeCount; i++) {
    const i3 = i * 3;
    positions[i3] += nodeVelocities[i].x;
    positions[i3 + 1] += nodeVelocities[i].y;
    positions[i3 + 2] += nodeVelocities[i].z;

    if (Math.abs(positions[i3]) > 18) nodeVelocities[i].x *= -1;
    if (Math.abs(positions[i3 + 1]) > 18) nodeVelocities[i].y *= -1;
    if (Math.abs(positions[i3 + 2]) > 10) nodeVelocities[i].z *= -1;

    for (let j = i + 1; j < nodeCount; j++) {
      const j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3 + 1] - positions[j3 + 1];
      const dz = positions[i3 + 2] - positions[j3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 4.2) {
        linePositions.push(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        linePositions.push(positions[j3], positions[j3 + 1], positions[j3 + 2]);
      }
    }
  }

  nodesMesh.geometry.attributes.position.needsUpdate = true;

  scene.remove(linesMesh);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );
  linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(linesMesh);
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  updateNeuralNetwork();

  targetX += (mouseX - targetX) * 0.04;
  targetY += (mouseY - targetY) * 0.04;

  nodesMesh.rotation.y = time * 0.04 + targetX * 0.25;
  nodesMesh.rotation.x = time * 0.02 + targetY * 0.25;
  linesMesh.rotation.y = nodesMesh.rotation.y;
  linesMesh.rotation.x = nodesMesh.rotation.x;

  amberLight.position.x = Math.sin(time * 0.5) * 15;
  cyanLight.position.y = Math.cos(time * 0.5) * 15;

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* 2. MAGNETIC 3D TILT EFFECT */
const tiltCards = document.querySelectorAll(".tilt-card");
tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
  });
});

/* 3. GSAP REVEALS (FIXED VISIBILITY ISSUE) */
window.addEventListener("load", () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-content > *", {
    opacity: 0,
    y: 40,
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  gsap.from(".capacity-card", {
    scrollTrigger: {
      trigger: "#capacities",
      start: "top 85%",
      toggleActions: "play none none none",
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out",
    clearProps: "all",
  });

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
});

// Interactive Value Calculator Logic
function calculateTimeSaved(hoursSpent) {
  const hoursSaved = Math.round(hoursSpent * 0.65);
  document.getElementById('hours-saved').innerText = `${hoursSaved} hrs/week saved`;
}