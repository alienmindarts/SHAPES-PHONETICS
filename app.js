import { SeededRandom } from './PRNG.js';
import { MotorEncaixe } from './MotorEncaixe.js';
import { Renderizador } from './Renderizador.js';
import { Fonetico } from './Fonetico.js';

const motor = new MotorEncaixe();
const renderizador = new Renderizador('canvas');

const inputNumeros = document.getElementById('inputNumeros');
const inputSeed = document.getElementById('inputSeed');
const sliderAltura = document.getElementById('sliderAltura');
const valAltura = document.getElementById('valAltura');
const canvasBackground = document.getElementById('canvasBackground');

// Color picker inputs
const colorPickers = {};
for (let i = 0; i <= 9; i++) {
    colorPickers[i] = document.getElementById(`color${i}`);
}

// Alternating color controls
const toggleAlternarCores = document.getElementById('toggleAlternarCores');
const sliderNumCores = document.getElementById('sliderNumCores');
const valNumCores = document.getElementById('valNumCores');

let framePendente = false;

function atualizar() {
    // Obtém o texto de entrada (pode conter letras e números)
    const textoInput = inputNumeros.value;
    const seed = parseInt(inputSeed.value) || 0;
    const maxHeight = parseInt(sliderAltura.value);
    const usarPaternAlternado = toggleAlternarCores.checked;
    const numCoresPatern = parseInt(sliderNumCores.value);
    
    valAltura.textContent = maxHeight;
    valNumCores.textContent = numCoresPatern;
    
    // Set canvas background color
    renderizador.canvas.style.backgroundColor = canvasBackground.value;
    
    // Get current colors from pickers
    const coresPersonalizadas = {};
    for (let i = 0; i <= 9; i++) {
        coresPersonalizadas[i] = colorPickers[i].value;
    }
    
    const prng = new SeededRandom(seed);
    motor.limpar();
    
    // Analisa o texto de entrada para obter blocos de consoantes e vogais
    const blocos = Fonetico.converterTexto(textoInput);
    
    blocos.forEach((bloco, indice) => {
        let idCor;
        if (usarPaternAlternado) {
            // Use position-based coloring with alternating pattern
            idCor = indice % numCoresPatern; // Colors 0 through numCoresPatern-1
        } else {
            // Use original digit-based coloring (consoante do bloco)
            idCor = parseInt(bloco.consoante);
        }
        
        // Converte a consoante (string) para número para usar como numero da peça
        const numero = parseInt(bloco.consoante);
        
        // Passa as vogais anteriores e posteriores para o motor
        motor.colocarNumero(numero, maxHeight, prng, idCor, bloco.vogaisAnteriores, bloco.vogaisPosteriores);
    });
    
    // Pass custom colors to renderer
    renderizador.definirCoresPersonalizadas(coresPersonalizadas);
    renderizador.redimensionar(motor.xMaxGlobal + 1, maxHeight);
    // Note: Now we pass the grelhaVogais which contains vowel objects
    renderizador.desenhar(motor.grelha, motor.grelhaVogais, maxHeight);
}

// Escuta as alterações nos controlos
const inputs = [inputNumeros, inputSeed, sliderAltura, sliderNumCores, toggleAlternarCores, canvasBackground, ...Object.values(colorPickers)];
inputs.forEach(el => {
    el.addEventListener('input', () => {
        if (!framePendente) {
            framePendente = true;
            requestAnimationFrame(() => {
                atualizar();
                framePendente = false;
            });
        }
    });
});

// Arranca na primeira vez
atualizar();