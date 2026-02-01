import * as THREE from 'three';

// --- НАЛАШТУВАННЯ СЦЕНИ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Світло (Сонце буде світити з центру)
const sunLight = new THREE.PointLight(0xffffff, 100, 500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x222222)); // Слабке фонове світло

// --- ДАНІ ПЛАНЕТ ---
const planetsData = [
    { name: "Сонце", color: 0xffcc00, size: 2, dist: 0, info: "Зірка в центрі нашої системи.", details: "Температура поверхні: 5,500°C" },
    { name: "Земля", color: 0x2255ff, size: 0.8, dist: 6, info: "Наш дім.", details: "Населення: ~8 млрд. Кисень: 21%" },
    { name: "Марс", color: 0xff4422, size: 0.6, dist: 10, info: "Червона планета.", details: "День триває 24г 37хв. Велетенські каньйони." }
];

const planetMeshes = [];

// Створення об'єктів
planetsData.forEach(data => {
    const geo = new THREE.SphereGeometry(data.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ 
        color: data.color,
        emissive: data.name === "Сонце" ? data.color : 0x000000,
        emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.dist;
    mesh.userData = data;
    scene.add(mesh);
    planetMeshes.push(mesh);
});

camera.position.z = 15;
camera.position.y = 5;
camera.lookAt(0,0,0);

// --- ІНТЕРАКТИВ ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const p = intersects[0].object;
        focusPlanet(p);
    }
});

function focusPlanet(planet) {
    const data = planet.userData;
    
    // Плавний переліт камери за допомогою GSAP
    gsap.to(camera.position, {
        x: planet.position.x,
        y: planet.position.y + 1,
        z: planet.position.z + 4,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(planet.position)
    });

    // Вивід тексту
    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-desc').innerText = data.info;
    document.getElementById('p-details').innerText = data.details;
    document.getElementById('info-card').classList.add('active');
}

document.getElementById('back-btn').onclick = () => {
    gsap.to(camera.position, { x: 0, y: 5, z: 15, duration: 1.5 });
    document.getElementById('info-card').classList.remove('active');
};

// --- АНІМАЦІЯ ---
function animate() {
    requestAnimationFrame(animate);
    planetMeshes.forEach(p => {
        p.rotation.y += 0.005; // Планети крутяться навколо осі
    });
    renderer.render(scene, camera);
}
animate();

// Ресайз вікна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
