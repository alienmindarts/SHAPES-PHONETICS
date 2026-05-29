import { SeededRandom } from './PRNG.js';
import { MotorEncaixe } from './MotorEncaixe.js';
import { Renderizador } from './Renderizador.js';

const motor = new MotorEncaixe();
const renderizador = new Renderizador('canvas');

const inputNumeros = document.getElementById('inputNumeros');
const inputSeed = document.getElementById('inputSeed');
const sliderAltura = document.getElementById('sliderAltura');
const valAltura = document.getElementById('valAltura');

// Color picker inputs
const colorPickers = {};
for (let i = 1; i <= 9; i++) {
    colorPickers[i] = document.getElementById(`color${i}`);
}

let framePendente = false;

function atualizar() {
    // Filtra apenas números válidos (1 a 9 neste exemplo)
    const numeros = inputNumeros.value.split('').map(Number).filter(n => !isNaN(n) && n > 0 && n <= 9);
    const seed = parseInt(inputSeed.value) || 0;
    const maxHeight = parseInt(sliderAltura.value);
    
    valAltura.textContent = maxHeight;

    // Get current colors from pickers
    const coresPersonalizadas = {};
    for (let i = 1; i <= 9; i++) {
        coresPersonalizadas[i] = colorPickers[i].value;
    }

    const prng = new SeededRandom(seed);
    motor.limpar();

    numeros.forEach((numero) => {
        // O último parâmetro (numero) é usado como índice para a Cor no renderizador
        motor.colocarNumero(numero, maxHeight, prng, numero); 
    });

    // Pass custom colors to renderer
    renderizador.definirCoresPersonalizadas(coresPersonalizadas);
    renderizador.redimensionar(motor.xMaxGlobal + 1, maxHeight);
    renderizador.desenhar(motor.grelha, maxHeight);
}

// Escuta as alterações nos controlos
const inputs = [inputNumeros, inputSeed, sliderAltura, ...Object.values(colorPickers)];
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