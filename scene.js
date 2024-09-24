import * as THREE from './js/three.module.js';

// Função para criar a cena principal, câmera e renderizador
export function createScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar luz para melhor visualização
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10).normalize();
    scene.add(light);

    // Função para ajustar o tamanho da tela
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

// Função para adicionar o plano verde (redondo) ao cenário
export function addGroundToScene(scene) {
    const geometry = new THREE.CircleGeometry(50, 100);  // Plano redondo
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;  // Deixar o plano horizontal
    ground.position.y = 0;
    scene.add(ground);
    return ground;
}

// Função para adicionar a pista em formato de 8 alongado ao cenário
export function addTrackToScene(scene) {
    const shape = new THREE.Shape();

    // Desenhar a curva no formato de 8 simples
    shape.moveTo(-30, 0);  // Começo da parte esquerda
    shape.quadraticCurveTo(-30, 30, 0, 30);  // Curva para cima, indo para o meio
    shape.quadraticCurveTo(30, 30, 30, 0);   // Curva descendo para a direita
    shape.quadraticCurveTo(30, -30, 0, -30); // Curva para baixo
    shape.quadraticCurveTo(-30, -30, -30, 0); // Curva subindo para o ponto inicial

    const extrudeSettings = {
        depth: 0.1,  // Altura da pista
        bevelEnabled: false
    };

    // Gerar a geometria da pista
    const trackGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Criar material azul para a pista
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    // Criar o objeto Mesh da pista
    const track = new THREE.Mesh(trackGeometry, trackMaterial);

    // Ajustar a rotação e elevação para não se misturar com o cenário
    track.rotation.x = Math.PI / 2;  // Deixar a pista plana no plano horizontal
    track.position.y = 0.01;  // Elevar ligeiramente para evitar que se misture com o chão

    // Adicionar a pista à cena
    scene.add(track);

    return track;
}



// Função para adicionar o carro ao cenário (retângulo vermelho)
export function addCarToScene(scene) {
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);  // Carro retangular
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // Cor vermelha
    const car = new THREE.Mesh(carGeometry, carMaterial);

    car.position.set(-20, 0.5, 0);  // Definir posição inicial
    scene.add(car);
    return car;
}

