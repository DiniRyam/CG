import * as THREE from './js/three.module.js';

// Função para criar a cena principal, câmera e renderizador
export function criarCena() {
    const cena = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    

    const renderizador = new THREE.WebGLRenderer();
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);

   
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
    });

    return { cena, camera, renderizador };
}


export function adicionarTerreno(cena) {
    const texturaTerreno = new THREE.TextureLoader().load('./texturas/grama.jpg');
    texturaTerreno.wrapS = THREE.RepeatWrapping;
    texturaTerreno.wrapT = THREE.RepeatWrapping;
    texturaTerreno.repeat.set(20, 20);

    const geometriaTerreno = new THREE.CircleGeometry(100, 100);
    const materialTerreno = new THREE.MeshBasicMaterial({ map: texturaTerreno });
    const terreno = new THREE.Mesh(geometriaTerreno, materialTerreno);
    
    terreno.rotation.x = -Math.PI / 2; 
    terreno.position.y = 0;
    cena.add(terreno);

    return terreno;
}

export function adicionarPista(cena) {
    const raioExternoX = 90, raioInternoX = 70;
    const raioExternoZ = 30, raioInternoZ = 20;
    const segmentos = 100;

    const criarPontos = (raioX, raioZ) => {
        return Array.from({ length: segmentos + 1 }, (_, i) => {
            const angulo = (i / segmentos) * Math.PI * 2;
            return new THREE.Vector2(Math.cos(angulo) * raioX, Math.sin(angulo) * raioZ);
        });
    };

    const pontosInternos = criarPontos(raioInternoX, raioInternoZ);
    const pontosExternos = criarPontos(raioExternoX, raioExternoZ).reverse();
    
    const formaPista = new THREE.Shape([...pontosExternos, ...pontosInternos]);
    
    
    const texturaPista = new THREE.TextureLoader().load('./texturas/asfalto.jpg');
    texturaPista.wrapS = THREE.RepeatWrapping;
    texturaPista.wrapT = THREE.RepeatWrapping;
    texturaPista.repeat.set(0.1, 0.1);  // Ajuste de repetição da textura

    const materialPista = new THREE.MeshBasicMaterial({
        map: texturaPista, 
        side: THREE.DoubleSide
    });
    const geometriaPista = new THREE.ShapeGeometry(formaPista);
    
    const pista = new THREE.Mesh(geometriaPista, materialPista);
    pista.rotation.x = -Math.PI / 2;
    pista.position.y = 0.01;
    
    cena.add(pista);

    return pista;
}

export function adicionarCarro(cena) {
    const carro = new THREE.Group();

    // Rodas traseira e dianteira
    const rodaTraseira = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 3.1, 32),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    rodaTraseira.rotation.z = Math.PI / 2;
    rodaTraseira.position.set(0, 0, -1.5);
    carro.add(rodaTraseira);

    const rodaDianteira = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 3.1, 32),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    rodaDianteira.rotation.z = Math.PI / 2;
    rodaDianteira.position.set(0, 0, 1.5);
    carro.add(rodaDianteira);

    // Corpo principal do carro
    const corpoPrincipal = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 5),
        new THREE.MeshBasicMaterial({ color: 0xa52523 })
    );
    corpoPrincipal.position.set(0, 0.5, 0);
    carro.add(corpoPrincipal);

    // Cabine do carro
    const cabine = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    cabine.position.set(0, 1.3, -0.4);
    carro.add(cabine);

    carro.position.set(0, 0.5, 0);
    cena.add(carro);

    return carro;
}

// Função para criar a árvore com texturas (copiada do outro código)
export function criarArvore(cena) {
    const arvore = new THREE.Group();
    const loader = new THREE.TextureLoader();

    const texturaTronco = loader.load('./texturas/tronco.jpg');
    const tronco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 5),
        new THREE.MeshBasicMaterial({ map: texturaTronco })
    );
    tronco.position.y = 2.5;
    arvore.add(tronco);

    const texturaFolhas = loader.load('./texturas/folhas.jpg');
    const materialFolhas = new THREE.MeshBasicMaterial({ map: texturaFolhas });

    for (let i = 0; i < 25; i++) {
        const folha = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 2.5), materialFolhas);

        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const raio = 2;
        const sinPhi = Math.sin(phi);

        folha.position.set(
            raio * sinPhi * Math.cos(theta),
            raio * sinPhi * Math.sin(theta) + 6,
            raio * Math.cos(phi)
        );
        arvore.add(folha);
    }

    cena.add(arvore);
    return arvore;   
}

// Função para criar a garagem no centro do terreno
export function adicionarGaragem(cena) {
    const garagem = new THREE.Group();
    const loader = new THREE.TextureLoader();

    // Carregar texturas
    const texturaParedes = loader.load('./texturas/parede.jpg');
    texturaParedes.wrapS = THREE.RepeatWrapping;
    texturaParedes.wrapT = THREE.RepeatWrapping;
    texturaParedes.repeat.set(5,5);

    const texturaTeto = loader.load('./texturas/telhado.jpg');
    texturaTeto.wrapS = THREE.RepeatWrapping;
    texturaTeto.repeat.set(5);

    const texturaPiso = loader.load('./texturas/piso.jpg');
    texturaPiso.wrapS = THREE.RepeatWrapping;
    texturaPiso.wrapT = THREE.RepeatWrapping;
    texturaPiso.repeat.set(3,2);

    // Paredes: esquerda, direita e fundo (com textura)
    const materialParede = new THREE.MeshBasicMaterial({ map: texturaParedes });

    const paredeEsquerda = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 1), materialParede);
    paredeEsquerda.position.set(0, 4, -8);  // Ajuste de posição

    const paredeDireita = paredeEsquerda.clone();
    paredeDireita.position.set(0, 4, 8);  // Ajuste de posição

    const paredeFundo = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 16.99), materialParede);
    paredeFundo.position.set(9.501, 4, 0);  // Ajuste de posição

    // Teto (com textura)
    const materialTeto = new THREE.MeshBasicMaterial({ map: texturaTeto });
    const teto = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 25), materialTeto);
    teto.position.set(-1, 7.77, 0);  // Ajuste de posição
    teto.rotation.y = Math.PI / 2;

    // Piso (com textura)
    const materialPiso = new THREE.MeshBasicMaterial({ map: texturaPiso });
    const piso = new THREE.Mesh(new THREE.BoxGeometry(30, 0.001, 15), materialPiso);
    piso.position.set(-5, 0.001, 0);  // Ajuste de posição

    // Adicionar componentes ao grupo garagem
    garagem.add(paredeEsquerda);
    garagem.add(paredeDireita);
    garagem.add(paredeFundo);
    garagem.add(teto);
    garagem.add(piso);

    // Posicionar a garagem no centro da cena
    garagem.position.set(0, 0, 0);
    garagem.rotation.y = (Math.PI / 2);

    // Adicionar a garagem à cena
    cena.add(garagem);

    return garagem;
}

export function criarSol(cena) {
    // Criar o sol
    const sunTexture = new THREE.TextureLoader().load('./texturas/sol.jpg'); // Caminho da textura
    const sol = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshStandardMaterial({ map: sunTexture, emissive: 0xffff00 })
    );

    // Criar a luz pontual
    const pointLight = new THREE.PointLight(0xffffff, 50000, 10000);
    //pointLight.castShadow = true; // Habilitar sombras na luz

    // Adicionar o sol e a luz à cena
    cena.add(sol);
    cena.add(pointLight);

    // Retornar tanto o sol quanto a luz
    return { sun: sol, pointLight: pointLight };
}