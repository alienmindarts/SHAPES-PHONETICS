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
            
            // Desenha vogais se existirem
            const vogaisDados = grelhaVogais.get(`${x},${y}`);
            if (vogaisDados) {
                this.desenharVogais(this.ctx, x, yCorrigido, vogaisDados, this.tamanhoCelula);
            }
        }
    }
    
    /**
     * Desenha as vogais associadas a um bloco como triângulos recortados
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {number} x - Coordenada X lógica do bloco (índice da coluna)
     * @param {number} y - Coordenada Y lógica do bloco (índice da linha, já corrigida para o sistema de coordenadas do canvas)
     * @param {Object} dadosVogais - Objeto contendo arrays de vogais anteriores e posteriores
     * @param {number} tamanhoCelula - Tamanho de cada bloco em pixels
     */
    desenharVogais(ctx, x, y, dadosVogais, tamanhoCelula) {
        const px = x * tamanhoCelula;
        const py = y * tamanhoCelula;
        const s = tamanhoCelula;
        const centerX = px + s / 2;
        const centerY = py + s / 2;
        
        // Obtém a cor de fundo do canvas
        const bgColor = getComputedStyle(this.canvas).backgroundColor;
        ctx.fillStyle = bgColor;
        
        // Função auxiliar para desenhar um triângulo dado três pontos
        const desenharTriangulo = (x1, y1, x2, y2, x3, y3) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fill();
        };
        
        // Desenha vogais anteriores (apontam para o centro)
        for (const vogal of dadosVogais.anteriores) {
            switch (vogal) {
                case 'A': // Baixo: (px, py+s), (px+s, py+s), centro
                    desenharTriangulo(px, py + s, px + s, py + s, centerX, centerY);
                    break;
                case 'E': // Esquerda: (px, py), (px, py+s), centro
                    desenharTriangulo(px, py, px, py + s, centerX, centerY);
                    break;
                case 'I': // Cima: (px, py), (px+s, py), centro
                    desenharTriangulo(px, py, px + s, py, centerX, centerY);
                    break;
                case 'O': // Direita: (px+s, py), (px+s, py+s), centro
                    desenharTriangulo(px + s, py, px + s, py + s, centerX, centerY);
                    break;
            }
        }
        
        // Desenha vogais posteriores (cantos)
        for (const vogal of dadosVogais.posteriores) {
            switch (vogal) {
                case 'A': // Baixo -> Canto Inferior Direito: (px + s/2, py + s), (px + s, py + s/2), vértice (px + s, py + s)
                    desenharTriangulo(px + s/2, py + s, px + s, py + s/2, px + s, py + s);
                    break;
                case 'E': // Esquerda -> Canto Superior Esquerdo: (px + s/2, py), (px, py + s/2), vértice (px, py)
                    desenharTriangulo(px + s/2, py, px, py + s/2, px, py);
                    break;
                case 'I': // Cima -> Canto Superior Direito: (px + s/2, py), (px + s, py + s/2), vértice (px + s, py)
                    desenharTriangulo(px + s/2, py, px + s, py + s/2, px + s, py);
                    break;
                case 'O': // Direita -> Canto Inferior Esquerdo: (px, py + s/2), (px + s/2, py + s), vértice (px, py + s)
                    desenharTriangulo(px, py + s/2, px + s/2, py + s, px, py + s);
                    break;
            }
        }
    }
}