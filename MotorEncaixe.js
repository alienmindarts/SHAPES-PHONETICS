import { Dicionario } from './Dicionario.js';

export class MotorEncaixe {
    constructor() {
        this.grelha = new Map(); // Guarda "x,y" e o ID da cor
        this.xMaxGlobal = -1;
    }

    limpar() {
        this.grelha.clear();
        this.xMaxGlobal = -1;
    }

    calcularDimensoes(coords) {
        const xs = coords.map(p => p[0]);
        const ys = coords.map(p => p[1]);
        return {
            altura: Math.max(...ys) - Math.min(...ys) + 1,
            largura: Math.max(...xs) - Math.min(...xs) + 1,
            xMax: Math.max(...xs)
        };
    }

    moverPeca(coords, offsetX, offsetY) {
        return coords.map(([x, y]) => [x + offsetX, y + offsetY]);
    }

    temColisao(coords) {
        for (const [x, y] of coords) {
            // Verifica limites e espaços já ocupados
            if (y < 0) return true; 
            if (this.grelha.has(`${x},${y}`)) return true; 
        }
        return false;
    }

    colocarNumero(numero, maxHeight, prng, idCor) {
        const variantes = Dicionario[numero];
        if (!variantes) return false;

        const solucoesValidas = [];
        
        // Permite recuar até 8 casas para preencher buracos (se for um 9)
        const offsetMinimo = this.xMaxGlobal === -1 ? 0 : Math.max(0, this.xMaxGlobal - numero); 

        for (const variante of variantes) {
            const dim = this.calcularDimensoes(variante);
            
            // Regra do Slider: Rejeita se quebrar a altura máxima
            if (dim.altura > maxHeight) continue;

            // Tenta encaixar no espaço
            for (let x = offsetMinimo; x <= this.xMaxGlobal + 1; x++) {
                for (let y = 0; y <= maxHeight - dim.altura; y++) {
                    const pecaTestada = this.moverPeca(variante, x, y);
                    const xMaxAtual = x + dim.xMax;

                    // A Regra de Ouro: Xmax(B) >= Xmax(A) + 1
                    if (this.xMaxGlobal === -1 || xMaxAtual >= this.xMaxGlobal + 1) {
                        if (!this.temColisao(pecaTestada)) {
                            solucoesValidas.push({ coords: pecaTestada, xMaxAtual });
                        }
                    }
                }
            }
        }

        if (solucoesValidas.length === 0) return false;

        // Passa a seed pelas soluções possíveis e escolhe uma
        const escolhida = prng.pick(solucoesValidas);

        escolhida.coords.forEach(([x, y]) => {
            this.grelha.set(`${x},${y}`, idCor);
        });

        this.xMaxGlobal = escolhida.xMaxAtual;
        return true;
    }
}