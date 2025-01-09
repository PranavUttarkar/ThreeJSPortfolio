import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update renderer size
    renderer.setSize(width, height);

    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

// Call resizeCanvas immediately after initializing the scene
resizeCanvas();

// Add resize listener to keep the canvas updated
window.addEventListener('resize', resizeCanvas);

camera.position.setZ(5);
camera.position.setX(4);
camera.position.setY(-0.5);

renderer.setPixelRatio(window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);
let lastScrollY = window.scrollY; // Store the last scroll position

renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);

//Prevents uninted scene rotation on mobile devices
// Variable Check if the user is on a mobile device
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Disable rotation on mobile devices
if (isMobile) {
    controls.enableRotate = false;  // Disable rotation
    controls.enableZoom = true;     // Allow zoom (optional)
    controls.enablePan = true;      // Allow panning (optional)
} else {
    controls.enableRotate = true;   // Enable rotation on non-mobile devices
    controls.enableZoom = true;     // Allow zoom
    controls.enablePan = true;      // Allow panning
}

  
//Adds Earth and Its texture and Map
const earthTexture = new THREE.TextureLoader().load('earth.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
    normalMap: normalTexture,
  })
);


// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



const directionalLight = new THREE.AmbientLight( 0xffffff, 1.75 );
scene.add( directionalLight );

earth.position.set(0, 0, 1)
scene.add(earth)

// Generates Light Emitting Spheres which are mapped randomly through the scene
function addStar(){
    
    const geometry = new THREE.SphereGeometry(.43, 24, 24)
    const material = new THREE.MeshStandardMaterial({color: 0xfffff});
    const star = new THREE.Mesh( geometry, material);
    // const pointLight = new THREE.PointLight(0xffffff, 1500);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x, y, z);
    // pointLight.position.set(x, y, z);
    scene.add(star);

}
Array(300).fill().forEach(addStar)



// //Adds ISS Model
const loader = new GLTFLoader();
// loader.load(
//     './ISS.glb', 
//     (gltf) => {
//         const ISS = gltf.scene;
//         scene.add(ISS); 
//         ISS.position.set(20, 20, 200); 
//     },
//     undefined,
//     (error) => {
//         console.error('Error loading the ISS model:', error);
//     }
// );

// Adds Skills Billboard
let Billboard; 
loader.load(
    './Billboard.glb', 
    (gltf) => {
        Billboard = gltf.scene; 
        scene.add(Billboard); 
        Billboard.position.set(10, -50, 15); 
        Billboard.scale.set(0.1, 0.1, 0.1);
        Billboard.rotateY(Math.PI / 2); 
    },
    undefined,
    (error) => {
        console.error('Error loading the Billboard model:', error);
    }
);


// Adds Aggie Agenda CLipboard
let clipboard;
loader.load(
    './clipboard.glb', 
    (gltf) => {
        clipboard = gltf.scene;
        scene.add(clipboard); 
        clipboard.position.set(18, 0, 300); 
        clipboard.scale.set(15, 15, 15);
        clipboard.rotateY(180);
    },
    undefined,
    (error) => {
        console.error('Error loading the clipboard model:', error);
    }
);
const boardLight = new THREE.PointLight(0xffffff, 10); //Lights for Billboard
boardLight.position.set(18, 0, 305);
scene.add(boardLight);


//Adds Phone
let phone;
loader.load(
    './phone.glb', 
    (gltf) => {
        phone = gltf.scene;
        scene.add(phone); 
        phone.position.set(28, 0, 465); 
        phone.scale.set(10, 10, 8);
        phone.rotateY(260);
    },
    undefined,
    (error) => {
        console.error('Error loading the phone model:', error);
    }
);
const phoneLight = new THREE.SpotLight(0xffffff, 300);
phoneLight.position.set(28, 0, 485);
scene.add(phoneLight);

//Adds Car
let car;
loader.load(
    './car.glb', 
    (gltf) => {
        car = gltf.scene;
        scene.add(car); 
        car.position.set(18, 0, 400); 
        car.scale.set(5, 5, 5);
    },
    undefined,
    (error) => {
        console.error('Error loading the car model:', error);
    }
);


//Added Headlights to Car
const headLight = new THREE.PointLight(0xffffff, 100);
headLight.position.set(13.5, -0.5, 413);
const headLight2 = new THREE.PointLight(0xffffff, 100);
headLight2.position.set(20.5, -0.5, 413);
scene.add(headLight, headLight2);



function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    lastScrollY = window.scrollY;

    // Rotate the earth 
    earth.rotation.x += 0.00005;
    earth.rotation.y += 0.00075;
    earth.rotation.z += 0.0005;

    // Camera movement logic
    camera.position.z = t * -0.1;
    camera.rotation.y = t * -0.02;
}

document.body.onscroll = moveCamera;
moveCamera();



function animate(){
    requestAnimationFrame(animate);
    controls.update();

    renderer.render(scene, camera);
}
animate()

  