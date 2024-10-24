import { criarCena, adicionarCarro, adicionarPista, adicionarTerreno, criarArvore, adicionarGaragem, criarSol, adicionarParedao, configurarSom } from './scene.js';

const { cena, camera, renderizador } = criarCena();

// "Banco de dados" para armazenar os elementos do projeto
const bancoDeDados = {
    terreno: null,
    trilha: null,
    carro: null,
    garagem: null,
    paredao: null,
    arvores: [],
};

bancoDeDados.terreno = adicionarTerreno(cena);
bancoDeDados.trilha = adicionarPista(cena);
bancoDeDados.carro = adicionarCarro(cena);
bancoDeDados.garagem = adicionarGaragem(cena);
bancoDeDados.paredao = adicionarParedao(cena);
const { sol, luzPontual } = criarSol(cena);
const sound = configurarSom(camera, bancoDeDados.paredao);

// Definir os limites da pista (baseados na elipse da pista)
const raioExternoX = 91;
const raioExternoZ = 31;
const raioTerreno = 100;
const numArvores = 50; // Número de árvores a serem geradas

// Função para verificar se o ponto está fora da elipse da pista
function estaForaDaPista(x, z, raioExternoX, raioExternoZ) {
    return (x * x) / (raioExternoX * raioExternoX) + (z * z) / (raioExternoZ * raioExternoZ) > 1;
}

// Função para gerar árvores dentro do terreno, mas fora da pista
function gerarArvoresAoRedorDaPista() {
    for (let i = 0; i < numArvores; i++) {
        let posicaoValida = false;
        let x, z;
        while (!posicaoValida) {
            // Gerar posição aleatória dentro do terreno
            const angulo = Math.random() * 2 * Math.PI;
            const distancia = Math.random() * raioTerreno; // Dentro do terreno

            // Converter coordenadas polares para x e z
            x = distancia * Math.cos(angulo);
            z = distancia * Math.sin(angulo);

            // Verificar se a árvore está fora da elipse da pista
            if (estaForaDaPista(x, z, raioExternoX, raioExternoZ)) {
                posicaoValida = true; // A posição é válida se estiver fora da pista e dentro do terreno
            }
        }

        // Criar e posicionar a árvore
        const arvore = criarArvore(cena);
        arvore.position.set(x, 0, z); // Posicionar a árvore fora da elipse, mas dentro do terreno
        bancoDeDados.arvores.push(arvore);
        cena.add(arvore); // Corrigido para adicionar a árvore corretamente à cena
    }
}

// Chamar a função para gerar as árvores ao redor da pista, mas dentro do terreno
gerarArvoresAoRedorDaPista();

// Variáveis para controle do carro
let velocidadeCarro = 0;
let direcaoCarro = 0;
const velocidadeMaximaCarro = 0.3;
const velocidadeRotacaoCarro = 0.03;
const distanciaCamera = 10;

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

/// Controle da câmera com o mouse
let mouseApertado = false;
let rotacaoInicial = 0;
let rotacaoCamera = 0;
const limiteRotacaoCamera = Math.PI; 
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

let isPlaying = false;

document.addEventListener('keydown', (evento) => {
    if (evento.code === 'Space') {
        if (isPlaying) {
            sound.stop();
        } else {
            sound.play();
        }
        isPlaying = !isPlaying;
    }
});

function verificarColisao(car, obj) {
    const distancia = car.position.distanceTo(obj.position);
    return distancia < 2; // Ajuste conforme necessário
}

let reboqueEngatado = false;

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

        // Atualizar a posição do carro
        bancoDeDados.carro.position.x = novaPosicaoX;
        bancoDeDados.carro.position.z = novaPosicaoZ;

        bancoDeDados.carro.rotation.y = direcaoCarro;

        // Atualizar a posição da câmera com rotação limitada ao redor do carro
        if (mouseApertado) {
            // Apenas rotaciona ao redor do carro no eixo Y (horizontalmente)
            camera.position.x = bancoDeDados.carro.position.x - Math.sin(direcaoCarro + rotacaoCamera) * distanciaCamera;
            camera.position.z = bancoDeDados.carro.position.z - Math.cos(direcaoCarro + rotacaoCamera) * distanciaCamera;
        } else {
            // Câmera segue diretamente atrás do carro
            camera.position.x = bancoDeDados.carro.position.x - Math.sin(direcaoCarro) * distanciaCamera;
            camera.position.z = bancoDeDados.carro.position.z - Math.cos(direcaoCarro) * distanciaCamera;
        }
        camera.position.y = bancoDeDados.carro.position.y + 3;
        camera.lookAt(bancoDeDados.carro.position);
    }

    const angle = performance.now() * 0.00005; //velocidadde do sol
    const radius = 200;

    // Atualizar a posição do sol para orbitar ao redor do centro (0, 0, 0)
    sol.position.set(
        radius * Math.sin(angle),
        //20, 
        radius * Math.cos(angle), 
        20
    );

    luzPontual.position.copy(sol.position);

    sol.position.copy(sol.position);
    if (sol.position.y < -2) {
        luzPontual.intensity = 0;
    } else {
        luzPontual.intensity = 90000;
    }

    // Atualizar a rotação e posição dos faróis dianteiros
    const targetOffset = 50;
    bancoDeDados.carro.children.forEach(child => {
        if (child.isSpotLight) {
            child.target.position.set(
                bancoDeDados.carro.position.x + targetOffset * Math.sin(bancoDeDados.carro.rotation.y),
                0.3,
                bancoDeDados.carro.position.z + targetOffset * Math.cos(bancoDeDados.carro.rotation.y)
            );
        }
    });

    // Verificar colisão do carro com o paredão e engatar se necessário
    if (!reboqueEngatado && verificarColisao(bancoDeDados.carro, bancoDeDados.paredao)) {
        reboqueEngatado = true;
    }

    // Mover o paredão se estiver engatado
    if (reboqueEngatado) {
        const distanciaFixa = 3.2; // Distância fixa atrás do carro

        // Calcular a posição desejada do paredão
        const posX = bancoDeDados.carro.position.x - Math.sin(bancoDeDados.carro.rotation.y) * distanciaFixa;
        const posZ = bancoDeDados.carro.position.z - Math.cos(bancoDeDados.carro.rotation.y) * distanciaFixa;
    
        // Atualizar a posição do paredão diretamente para acompanhar o carro
        bancoDeDados.paredao.position.set(posX, 0, posZ);
    
        // Manter a mesma rotação do carro
        bancoDeDados.paredao.rotation.y = bancoDeDados.carro.rotation.y;
    }

    renderizador.render(cena, camera);
}

animar();
