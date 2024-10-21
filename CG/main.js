import { criarCena, adicionarCarro, adicionarPista, adicionarTerreno } from './scene.js';

const { cena, camera, renderizador } = criarCena();

// "Banco de dados" para armazenar os elementos do projeto
const bancoDeDados = {
    terreno: null,
    trilha: null,
    carro: null,
};


bancoDeDados.terreno = adicionarTerreno(cena);

bancoDeDados.trilha = adicionarPista(cena);

bancoDeDados.carro = adicionarCarro(cena);


// Variáveis para controle do carro
let velocidadeCarro = 0;
let direcaoCarro = 0;
const velocidadeMaximaCarro = 0.2;
const velocidadeRotacaoCarro = 0.03;
const distanciaCamera = 8;


const teclas = {
    cima: false,
    esquerda: false,
    direita: false,
};

document.addEventListener('keydown', (evento) => {
    if (evento.code === 'ArrowUp') teclas.cima = true;
    if (evento.code === 'ArrowLeft') teclas.esquerda = true;
    if (evento.code === 'ArrowRight') teclas.direita = true;
});

document.addEventListener('keyup', (evento) => {
    if (evento.code === 'ArrowUp') teclas.cima = false;
    if (evento.code === 'ArrowLeft') teclas.esquerda = false;
    if (evento.code === 'ArrowRight') teclas.direita = false;
});

// controle da câmera com o mouse
let mouseApertado = false;
let rotacaoInicial = 0;
let rotacaoCamera = 0;
const limiteRotacaoCamera = Math.PI / 4.5; // limite de rotação de 45 graus para cada lado
const velocidadeRotacaoMouse = 0.002; 


document.addEventListener('mousedown', (evento) => {
    mouseApertado = true;
    rotacaoInicial = evento.clientX;
});


document.addEventListener('mouseup', () => {
    mouseApertado = false;
    rotacaoCamera = 0; 
});


document.addEventListener('mousemove', (evento) => {
    if (mouseApertado) {
        const deltaX = evento.clientX - rotacaoInicial;
        rotacaoCamera = deltaX * velocidadeRotacaoMouse;

        // Limitar a rotação da câmera dentro do limite definido
        rotacaoCamera = Math.max(-limiteRotacaoCamera, Math.min(limiteRotacaoCamera, rotacaoCamera));
    }
});


function animar() {
    requestAnimationFrame(animar);

    // Controle de aceleração do carro
    if (teclas.cima) {
        velocidadeCarro = Math.min(velocidadeMaximaCarro, velocidadeCarro + 0.01);
    } else {
        velocidadeCarro = Math.max(0, velocidadeCarro - 0.02);
    }

    // Controle de rotação do carro
    if (teclas.esquerda) {
        direcaoCarro += velocidadeRotacaoCarro;
    }
    if (teclas.direita) {
        direcaoCarro -= velocidadeRotacaoCarro;
    }

  
    if (bancoDeDados.carro) {
        const novaPosicaoX = bancoDeDados.carro.position.x + Math.sin(direcaoCarro) * velocidadeCarro;
        const novaPosicaoZ = bancoDeDados.carro.position.z + Math.cos(direcaoCarro) * velocidadeCarro;
        const dist = Math.sqrt(novaPosicaoX * novaPosicaoX + novaPosicaoZ * novaPosicaoZ);

        if (dist <= 97.5) {
            bancoDeDados.carro.position.x = novaPosicaoX;
            bancoDeDados.carro.position.z = novaPosicaoZ;
        }

        bancoDeDados.carro.rotation.y = direcaoCarro;

        // Atualizar a posição da câmera com rotação limitada ao redor do carro
        if (mouseApertado) {
            // Apenas rotaciona ao redor do carro no eixo Y (horizontalmente)
            camera.position.set(
                bancoDeDados.carro.position.x - Math.sin(direcaoCarro + rotacaoCamera) * distanciaCamera,
                bancoDeDados.carro.position.y + 3, 
                bancoDeDados.carro.position.z - Math.cos(direcaoCarro + rotacaoCamera) * distanciaCamera
            );
        } else {
            // Voltar à posição padrão da câmera em relação ao carro
            camera.position.set(
                bancoDeDados.carro.position.x - Math.sin(direcaoCarro) * distanciaCamera,
                bancoDeDados.carro.position.y + 3,
                bancoDeDados.carro.position.z - Math.cos(direcaoCarro) * distanciaCamera
            );
        }

        camera.lookAt(bancoDeDados.carro.position);
    }

    renderizador.render(cena, camera);
}

animar();
