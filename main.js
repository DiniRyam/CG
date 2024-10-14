import * as THREE from './js/three.module.js';

// Função para criar a câmera, cena e renderização
function createScene() {

    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 60; 
    
    // Câmera ortográfica para criar efeito isométrico
    const camera = new THREE.OrthographicCamera(
        -d * aspect, // Esquerda
        d * aspect,  // Direita
        d,           // Cima
        -d,          // Baixo
        -200,        // perto
        200         // longe
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return { scene, camera, renderer };
}

// o chão
function addGroundToScene(scene) {
    const groundTexture = new THREE.TextureLoader().load('grama.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(20, 20);

    // chão redondo
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(100, 100),
        new THREE.MeshBasicMaterial({ map: groundTexture })
    );
    
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = 0;
    scene.add(ground);
}

function createOvalTrack(scene) {
    const trackShape = new THREE.Shape();

    const outerRadiusX = 90; // externo x
    const innerRadiusX = 70; // interno x
    const innerRadiusZ = 20; // interno z  
    const outerRadiusZ = 30; // externo z
    const segments = 100;    // retas que formam a pista


    const innerPoints = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * innerRadiusX;
        const z = Math.sin(angle) * innerRadiusZ;
        innerPoints.push(new THREE.Vector2(x, z));
    }

    const outerPoints = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * outerRadiusX;
        const z = Math.sin(angle) * outerRadiusZ;
        outerPoints.push(new THREE.Vector2(x, z));
    }
    
    trackShape.setFromPoints(outerPoints.reverse().concat(innerPoints));


    const textureLoader = new THREE.TextureLoader();
    const trackTexture = textureLoader.load(texturePath);


    trackTexture.wrapS = THREE.RepeatWrapping;
    trackTexture.wrapT = THREE.RepeatWrapping;
    trackTexture.repeat.set(4, 4);

    const trackMaterial = new THREE.MeshBasicMaterial({ map: trackTexture, side: THREE.DoubleSide });

    const trackGeometry = new THREE.ShapeGeometry(trackShape);
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2; 
    track.position.y = 0.01;
    scene.add(track);
}

// o carro
function addCarToScene(scene) {
    const car = new THREE.Group();

    const backWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 3.1, 32),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0, -1.5);
    car.add(backWheel);

    const frontWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 3.1, 32),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0, 1.5);
    car.add(frontWheel);

    const main = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 5),
        new THREE.MeshBasicMaterial({ color: 0xa52523 })
    );
    
    main.position.set(0, 0.5, 0);
    car.add(main);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    
    cabin.position.set(0, 1.3, -0.4); 
    car.add(cabin);

    car.position.set(0, 0.5, 0);
    scene.add(car);

    return car;
}

// os controles
function animate(car, camera, renderer, scene) {

    let carSpeed = 0;
    let carDirection = 0;
    const carMaxSpeed = 0.25;
    const carTurnSpeed = 0.05;
    
    const keys = {
        up: false,
        left: false,
        right: false,
    };

    document.addEventListener('keydown', (event) => {
        if (event.code === 'ArrowUp') keys.up = true;
        if (event.code === 'ArrowLeft') keys.left = true;
        if (event.code === 'ArrowRight') keys.right = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.code === 'ArrowUp') keys.up = false;
        if (event.code === 'ArrowLeft') keys.left = false;
        if (event.code === 'ArrowRight') keys.right = false;
    });

    function update() {
        requestAnimationFrame(update);

        if (keys.up) {
            carSpeed = Math.min(carMaxSpeed, carSpeed + 0.2);
        } else {
            carSpeed = Math.max(0, carSpeed - 0.2); 
        }

        if (keys.left) {
            carDirection += carTurnSpeed;
        }
        if (keys.right) {
            carDirection -= carTurnSpeed;
        }

        car.position.x += Math.sin(carDirection) * carSpeed;
        car.position.z += Math.cos(carDirection) * carSpeed;

        let dist = Math.sqrt(car.position.x * car.position.x + car.position.z * car.position.z );
        if (dist > 97.5){
            car.position.x -= Math.sin(carDirection) * carSpeed;
            car.position.z -= Math.cos(carDirection) * carSpeed;    
        }

        car.rotation.y = carDirection;

        camera.position.x = 50;
        camera.position.y = 30;
        camera.position.z = 20 ;

        camera.lookAt(0,0);

        renderer.render(scene, camera);
    }

    update(); 
}


const { scene, camera, renderer } = createScene();
addGroundToScene(scene);
const texturePath = 'estrada.jpg';
createOvalTrack(scene); 
const car = addCarToScene(scene);
animate(car, camera, renderer, scene);