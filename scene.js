import * as THREE from './js/three.module.js';

// Função para criar a cena principal, câmera e renderizador
export function criarCena() {
    const cena = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderizador = new THREE.WebGLRenderer();
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderizador.domElement);
    renderizador.shadowMap.enabled = true;
   
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
    });

    return { cena, camera, renderizador };
}


export function adicionarTerreno(cena) {
    // Carregar a textura do terreno
    const texturaTerreno = new THREE.TextureLoader().load('./texturas/grama.jpg');
    texturaTerreno.wrapS = THREE.RepeatWrapping;
    texturaTerreno.wrapT = THREE.RepeatWrapping;
    texturaTerreno.repeat.set(20, 20);

    // Criar a geometria e o material do terreno
    const geometriaTerreno = new THREE.CircleGeometry(100, 100);
    const materialTerreno = new THREE.MeshStandardMaterial({ map: texturaTerreno });
    materialTerreno.receiveShadow = true;

    // Criar a malha do terreno
    const terreno = new THREE.Mesh(geometriaTerreno, materialTerreno);
    terreno.rotation.x = -Math.PI / 2;
    terreno.position.y = 0;
    terreno.receiveShadow = true;

    // Adicionar o terreno à cena
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

    const materialPista = new THREE.MeshStandardMaterial({
        map: texturaPista,
        side: THREE.DoubleSide
    });
    materialPista.receiveShadow = true;

    const geometriaPista = new THREE.ShapeGeometry(formaPista);

    const pista = new THREE.Mesh(geometriaPista, materialPista);
    pista.rotation.x = -Math.PI / 2;
    pista.position.y = 0.01;
    pista.receiveShadow = true;

    cena.add(pista);

    return pista;
}


export function adicionarCarro(cena) {
    const carro = new THREE.Group();

    // Rodas traseira e dianteira
    const criarRoda = (x, y, z) => {
        const geometriaRoda = new THREE.CylinderGeometry(0.5, 0.5, 3.1, 32);
        const materialRoda = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const roda = new THREE.Mesh(geometriaRoda, materialRoda);
        roda.rotation.z = Math.PI / 2;
        roda.position.set(x, y, z);
        roda.castShadow = true;
        return roda;
    };
    const rodaTraseira = criarRoda(0, 0, -1.5);
    const rodaDianteira = criarRoda(0, 0, 1.5);
    carro.add(rodaTraseira);
    carro.add(rodaDianteira);

    // Corpo principal do carro
    const corpoPrincipal = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 5),
        new THREE.MeshStandardMaterial({ color: 0xa52523 })
    );
    corpoPrincipal.position.set(0, 0.5, 0);
    corpoPrincipal.castShadow = true;
    carro.add(corpoPrincipal);

    // Cabine do carro
    const cabine = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1, 3),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    cabine.position.set(0, 1.3, -0.4);
    cabine.castShadow = true;
    carro.add(cabine);

    // Adicionando faróis dianteiros
    const criarFarolDianteiro = (x, y, z) => {
        const materialFarol = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const farol = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), materialFarol);
        farol.position.set(x, y, z);        
        return farol;
    };
    const farolDianteiroEsquerdo = criarFarolDianteiro(-1, 0.8, 2.5);
    const farolDianteiroDireito = criarFarolDianteiro(1, 0.8, 2.5);
    carro.add(farolDianteiroEsquerdo);
    carro.add(farolDianteiroDireito);

    const criarLuzDianteira = (x, y, z, targetX) => {
        const luzDianteira = new THREE.SpotLight(0xffffff, 80, 100, 0.5, 0.5, 1.5);
        luzDianteira.position.set(x, y, z);
        luzDianteira.castShadow = true;
        luzDianteira.target.position.set(targetX, y, 50);
        cena.add(luzDianteira.target);
        return luzDianteira;
    };
    const luzDianteiraEsquerda = criarLuzDianteira(-1, 0.8, 2.8, -1);
    const luzDianteiraDireita = criarLuzDianteira(1, 0.8, 2.8, 1);
    carro.add(luzDianteiraEsquerda);
    carro.add(luzDianteiraDireita);

    // Adicionando faróis traseiros
    const criarFarolTraseiro = (x, y, z) => {
        const materialFarol = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const farol = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), materialFarol);
        farol.position.set(x, y, z);
        return farol;
    };
    const farolTraseiroEsquerdo = criarFarolTraseiro(-1, 0.8, -2.5);
    const farolTraseiroDireito = criarFarolTraseiro(1, 0.8, -2.5);
    carro.add(farolTraseiroEsquerdo);
    carro.add(farolTraseiroDireito);

    const criarLuzTraseira = (x, y, z) => {
        const luzTraseira = new THREE.PointLight(0xff0000, 0.5, 20);
        luzTraseira.position.set(x, y, z);
        return luzTraseira;
    };
    const luzTraseiraEsquerda = criarLuzTraseira(-1, 0.8, -2.8);
    const luzTraseiraDireita = criarLuzTraseira(1, 0.8, -2.8);
    carro.add(luzTraseiraEsquerda);
    carro.add(luzTraseiraDireita);

    carro.position.set(0, 0.5, 0);
    cena.add(carro);

    return carro;
}


// Função para criar a árvore com texturas
export function criarArvore(cena) {
    const arvore = new THREE.Group();
    const loader = new THREE.TextureLoader();

    // Carregar a textura do tronco
    const texturaTronco = loader.load('./texturas/tronco.jpg');
    const tronco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 5),
        new THREE.MeshStandardMaterial({ map: texturaTronco })
    );
    tronco.position.y = 2.5;
    tronco.castShadow = true;
    tronco.receiveShadow = true;
    arvore.add(tronco);

    // Carregar a textura das folhas
    const texturaFolhas = loader.load('./texturas/folhas.jpg');
    const materialFolhas = new THREE.MeshStandardMaterial({ map: texturaFolhas });

    // Criar e adicionar folhas à árvore
    for (let i = 0; i < 20; i++) {
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
        folha.castShadow = true;
        folha.receiveShadow = true;
        arvore.add(folha);
    }

    // Adicionar a árvore à cena
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
    texturaParedes.repeat.set(5, 5);

    const texturaTeto = loader.load('./texturas/telhado.jpg');
    texturaTeto.wrapS = THREE.RepeatWrapping;
    texturaTeto.repeat.set(5);

    const texturaPiso = loader.load('./texturas/piso.jpg');
    texturaPiso.wrapS = THREE.RepeatWrapping;
    texturaPiso.wrapT = THREE.RepeatWrapping;
    texturaPiso.repeat.set(3, 2);

    // Criar paredes: esquerda, direita e fundo (com textura)
    const materialParede = new THREE.MeshStandardMaterial({ map: texturaParedes });

    const paredeEsquerda = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 1), materialParede);
    paredeEsquerda.position.set(0, 4, -8);
    paredeEsquerda.castShadow = true;
    paredeEsquerda.receiveShadow = true;

    const paredeDireita = paredeEsquerda.clone();
    paredeDireita.position.set(0, 4, 8);
    paredeDireita.castShadow = true;
    paredeDireita.receiveShadow = true;

    const paredeFundo = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 16.99), materialParede);
    paredeFundo.position.set(9.501, 4, 0);
    paredeFundo.castShadow = true;

    // Criar teto (com textura)
    const materialTeto = new THREE.MeshStandardMaterial({ map: texturaTeto });
    const teto = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 25), materialTeto);
    teto.position.set(-1, 7.7, 0);
    teto.rotation.y = Math.PI / 2;
    teto.castShadow = true;
    teto.receiveShadow = true;

    // Criar piso (com textura)
    const materialPiso = new THREE.MeshStandardMaterial({ map: texturaPiso });
    const piso = new THREE.Mesh(new THREE.BoxGeometry(30, 0.001, 15), materialPiso);
    piso.position.set(-5, 0.001, 0);
    piso.receiveShadow = true;

    // Criar a lâmpada fluorescente como um cilindro
    const lampadaGeometria = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
    const lampadaMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lampada = new THREE.Mesh(lampadaGeometria, lampadaMaterial);
    lampada.position.set(0, 7.6, 0);
    lampada.rotation.z = Math.PI / 2;

    // Adicionar ponto de luz na lâmpada
    const pontoLuz = new THREE.PointLight(0xffffff, 70, 100);
    pontoLuz.position.set(0, 6, 0);
    pontoLuz.castShadow = true;

    // Adicionar componentes ao grupo garagem
    garagem.add(paredeEsquerda);
    garagem.add(paredeDireita);
    garagem.add(paredeFundo);
    garagem.add(teto);
    garagem.add(piso);
    garagem.add(lampada);
    garagem.add(pontoLuz);

    // Posicionar a garagem no centro da cena
    garagem.position.set(0, 0, 0);
    garagem.rotation.y = Math.PI / 2;

    // Adicionar a garagem à cena
    cena.add(garagem);

    return garagem;
}


export function criarSol(cena) {
    // Carregar a textura do sol
    const texturaSol = new THREE.TextureLoader().load('./texturas/sol.jpg');

    // Criar a geometria e o material do sol
    const geometriaSol = new THREE.SphereGeometry(5, 32, 32);
    const materialSol = new THREE.MeshStandardMaterial({ map: texturaSol, emissive: 0xffff00 });
    const sol = new THREE.Mesh(geometriaSol, materialSol);

    // Criar a luz pontual
    const luzPontual = new THREE.PointLight(0xffffff, 1, 500);
    luzPontual.position.set(0, 50, 0);
    luzPontual.castShadow = true; // Habilitar sombras na luz

    // Adicionar o sol e a luz à cena
    cena.add(sol);
    cena.add(luzPontual);

    // Retornar tanto o sol quanto a luz
    return { sol: sol, luzPontual: luzPontual };
}


export function adicionarParedao(cena) {
    const paredao = new THREE.Group();

    // Função para criar cilindros (rodas)
    const createCylinder = (x, y, z) => {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(x, y, z);
        cylinder.rotation.z = Math.PI / 2;
        cylinder.castShadow = true;
        return cylinder;
    };

    // Criar rodas
    const wheel1 = createCylinder(-1.5, 0.5, 0);
    const wheel2 = createCylinder(1.5, 0.5, 0);
    paredao.add(wheel1, wheel2);

    // Criar a base do reboque (retângulo marrom)
    const texturaBase = new THREE.TextureLoader().load('./texturas/base.jpg');
    const baseGeometry = new THREE.BoxGeometry(4.1, 0.51, 1.1);
    const baseMaterial = new THREE.MeshStandardMaterial({ map: texturaBase });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.6, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    paredao.add(base);

    // Criar o som (retângulo branco)
    const texturaSom = new THREE.TextureLoader().load('./texturas/caixa.jpg');
    const soundGeometry = new THREE.BoxGeometry(4, 1.5, 1);
    const soundMaterial = new THREE.MeshStandardMaterial({ map: texturaSom });
    const sound = new THREE.Mesh(soundGeometry, soundMaterial);
    sound.position.set(0, 1.5, 0);
    sound.castShadow = true;
    sound.receiveShadow = true;
    paredao.add(sound);

    // Função para criar os graves (cilindros pretos)
    const createSpeaker = (x, y, z) => {
        const texturaAltoFalante = new THREE.TextureLoader().load('./texturas/falante.jpg');
        const geometry = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32);
        const material = new THREE.MeshStandardMaterial({ map: texturaAltoFalante });
        const speaker = new THREE.Mesh(geometry, material);
        speaker.position.set(x, y, z);
        speaker.rotation.x = Math.PI / 2;
        speaker.castShadow = true;
        return speaker;
    };

    // Adicionar os dois graves
    const speaker1 = createSpeaker(-1.2, 1.5, -0.41); //direita
    const speaker2 = createSpeaker(1.2, 1.5, -0.41); //esquerda
    paredao.add(speaker1, speaker2);

    // Função para criar faróis traseiros (luzes de freio)
    const createBrakeLight = (x, y, z) => {
        const geometry = new THREE.BoxGeometry(0.2, 0.5, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const brakeLight = new THREE.Mesh(geometry, material);
        brakeLight.position.set(x, y, z);
        brakeLight.castShadow = true;
        return brakeLight;
    };

    const brakeLight1 = createBrakeLight(-1.2, 0.6, -0.51);
    const brakeLight2 = createBrakeLight(1.2, 0.6, -0.51);
    brakeLight1.rotation.z = Math.PI / 2;
    brakeLight2.rotation.z = Math.PI / 2;
    paredao.add(brakeLight1);
    paredao.add(brakeLight2);

    // Adicionar pontos de luz vermelha
    const light1 = new THREE.PointLight(0xff0000, 0.3, 10);
    light1.position.set(-1.2, 0.6, -0.51);
    const light2 = new THREE.PointLight(0xff0000, 0.3, 10);
    light2.position.set(1.2, 0.6, -0.51);
    paredao.add(light1);
    paredao.add(light2);

    // Configurar a posição e rotação do paredão
    paredao.position.set(5, 0, 4);
    paredao.rotation.y = Math.PI / 2;
    paredao.castShadow = true;
    paredao.receiveShadow = true;
    cena.add(paredao);

    return paredao;
}


// Função para configurar o som
export function configurarSom(camera, paredao) {
    // Criar o AudioListener e adicionar à câmera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Criar o PositionalAudio
    const sound = new THREE.PositionalAudio(listener);

    // Carregar a música
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./musica/musica.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setLoop(true);
    });

    // Adicionar o som ao paredão
    paredao.add(sound);

    return sound;
}
