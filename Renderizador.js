export class Renderizador {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tamanhoCelula = 25; // Tamanho de cada bloco (pixel lógico)
        
        // Cores para distinguir as peças (1 a 9)
        this.coresPadrao = [
            '#FF3366', '#33CCFF', '#FF9933', '#33FF99', 
            '#CC33FF', '#FFFF33', '#FF3333', '#3333FF', '#33FF33'
        ];
        
        // Cores personalizadas (se definidas pelo usuário)
        this.coresPersonalizadas = {};
    }
    
    /**
     * Define as cores personalizadas para os algarismos
     * @param {Object} cores - Objeto mapeando algarismos (1-9) para cores hexadecimais
     */
    definirCoresPersonalizadas(cores) {
        this.coresPersonalizadas = cores;
    }
    
    /**
     * Obtém a cor para um determinado algarismo
     * @param {number} idCor - ID da cor (1-9)
     * @returns {string} Cor hexadecimal
     */
    obterCor(idCor) {
        // Retorna a cor personalizada se existir, senão a cor padrão
        if (this.coresPersonalizadas[idCor]) {
            return this.coresPersonalizadas[idCor];
        }
        return this.coresPadrao[(idCor - 1) % this.coresPadrao.length];
    }

    redimensionar(larguraMaxima, maxHeight) {
        // Ajusta fisicamente o canvas para caber toda a palavra gerada
        this.canvas.width = (larguraMaxima + 2) * this.tamanhoCelula;
        this.canvas.height = maxHeight * this.tamanhoCelula;
    }

    desenhar(grelha, grelhaVogais, maxHeight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const [chave, idCor] of grelha.entries()) {
            const [x, y] = chave.split(',').map(Number);
            
            // Desenha com offset no Y para as peças ficarem assentes no fundo do canvas
            const yCorrigido = (maxHeight - 1) - y;

            const coordX = x * this.tamanhoCelula;
            const coordY = yCorrigido * this.tamanhoCelula;

            this.ctx.fillStyle = this.obterCor(idCor);
            this.ctx.fillRect(coordX, coordY, this.tamanhoCelula, this.tamanhoCelula);
            
            // Borda interna para legibilidade (opcional)
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(coordX, coordY, this.tamanhoCelula, this.tamanhoCelula);
            
            // Desenha vogal se existir
            const vogal = grelhaVogais.get(`${x},${y}`);
            if (vogal) {
                this.desenharVogal(this.ctx, x, yCorrigido, vogal);
            }
        }
    }
    
    desenharVogal(ctx, x, y, vogal) {
        const cx = x * this.tamanhoCelula + (this.tamanhoCelula / 2);
        const cy = y * this.tamanhoCelula + (this.tamanhoCelula / 2);
        const t = this.tamanhoCelula;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        
        switch (vogal) {
            case 'A': // Baixo: Inferior Esquerdo, Inferior Direito, Centro
                ctx.moveTo(x * t, (y + 1) * t);
                ctx.lineTo((x + 1) * t, (y + 1) * t);
                ctx.lineTo(cx, cy);
                break;
            case 'E': // Esquerda: Superior Esquerdo, Inferior Esquerdo, Centro
                ctx.moveTo(x * t, y * t);
                ctx.lineTo(x * t, (y + 1) * t);
                ctx.lineTo(cx, cy);
                break;
            case 'I': // Cima: Superior Esquerdo, Superior Direito, Centro
                ctx.moveTo(x * t, y * t);
                ctx.lineTo((x + 1) * t, y * t);
                ctx.lineTo(cx, cy);
                break;
            case 'O': // Direita: Superior Direito, Inferior Direito, Centro
                ctx.moveTo((x + 1) * t, y * t);
                ctx.lineTo((x + 1) * t, (y + 1) * t);
                ctx.lineTo(cx, cy);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }
}