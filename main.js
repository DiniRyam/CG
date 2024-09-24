import { createScene, addCarToScene, addTrackToScene, addGroundToScene } from './scene.js';

// Criar a cena principal
const { scene, camera, renderer } = createScene();

// "Banco de dados" para armazenar os elementos do projeto
const database = {
    ground: null,
    track: null,
    car: null,
};

// Adicionar o plano verde ao cenário
database.ground = addGroundToScene(scene);

// Adicionar a pista em formato de 8 alongado
database.track = addTrackToScene(scene);

// Adicionar o carro ao cenário
database.car = addCarToScene(scene);

// Variáveis para controle do carro
let carSpeed = 0;
let carDirection = 0;
const carMaxSpeed = 0.2;
const carTurnSpeed = 0.03;  // Ajustei a velocidade de rotação
const cameraDistance = 8;

// Função para capturar as teclas pressionadas
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

// Função de animação que move o carro e atualiza o cenário
function animate() {
    requestAnimationFrame(animate);

    // Controle de aceleração do carro
    if (keys.up) {
        carSpeed = Math.min(carMaxSpeed, carSpeed + 0.01); // Acelera
    } else {
        carSpeed = Math.max(0, carSpeed - 0.02); // Desacelera gradativamente
    }

    // Controle de rotação do carro
    if (keys.left) {
        carDirection += carTurnSpeed; // Rotaciona para a esquerda
    }
    
    if (keys.right) {
        carDirection -= carTurnSpeed; // Rotaciona para a direita
    }

    // Atualizar a posição do carro baseado na velocidade e direção
    if (database.car) {
        // Mover o carro para frente na direção que ele está apontando
        database.car.position.x += Math.sin(carDirection) * carSpeed;
        database.car.position.z += Math.cos(carDirection) * carSpeed;

        // Atualizar a rotação do carro para a direção do movimento
        database.car.rotation.y = carDirection;  // Gira o carro no eixo Y corretamente

        // Posicionar a câmera atrás do carro (terceira pessoa)
        camera.position.set(
            database.car.position.x - Math.sin(carDirection) * cameraDistance,
            database.car.position.y + 3,  // Elevação da câmera
            database.car.position.z - Math.cos(carDirection) * cameraDistance
        );
        camera.lookAt(database.car.position);
    }

    renderer.render(scene, camera);
}

animate();

