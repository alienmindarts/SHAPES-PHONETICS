export class Renderizador {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tamanhoCelula = 25; // Tamanho de cada bloco (pixel lógico)
        
        // Cores para distinguir as peças (0 a 9)
        this.coresPadrao = [
            '#FFFFFF', '#FF3366', '#33CCFF', '#FF9933', '#33FF99', 
            '#CC33FF', '#FFFF33', '#FF3333', '#3333FF', '#33FF33'
        ];
        
        // Cores personalizadas (se definidas pelo usuário)
        this.coresPersonalizadas = {};
    }
    
    /**
     * Exporta o conteúdo do canvas como PNG
     * @returns {string} URL de dados da imagem PNG
     */
    exportarPNG() {
        return this.canvas.toDataURL('image/png');
    }
    
    /**
     * Exporta o conteúdo do canvas como JPEG
     * @param {number} qualidade - Qualidade da imagem (0.1 a 1.0), padrão 0.92
     * @returns {string} URL de dados da imagem JPEG
     */
    exportarJPEG(qualidade = 0.92) {
        return this.canvas.toDataURL('image/jpeg', qualidade);
    }
    
    /**
     * Exporta o conteúdo como SVG
     * @param {Map} grelha - Mapa de coordenadas para informações das peças
     * @param {Map} grelhaVogais - Mapa de coordenadas para vogais
     * @param {number} maxHeight - Altura máxima
     * @returns {string} String SVG
     */
    exportarSVG(grelha, grelhaVogais, maxHeight) {
        const largura = this.canvas.width;
        const altura = this.canvas.height;
        const tamanhoCelula = this.tamanhoCelula;
        
        const bgColor = getComputedStyle(this.canvas).backgroundColor || '#222222';
        
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">
<rect width="${largura}" height="${altura}" fill="${bgColor}"/>`;
        
        for (const [chave, info] of grelha.entries()) {
            const [x, y] = chave.split(',').map(Number);
            const numero = info.numero;
            const idCor = info.idCor;
            
            const yCorrigido = (maxHeight - 1) - y;
            const coordX = x * tamanhoCelula;
            const coordY = yCorrigido * tamanhoCelula;
            const s = tamanhoCelula;
            
            const cor = this.obterCor(idCor);
            
            if (numero === 0) {
                const x1 = coordX;
                const y1 = coordY;
                const x2 = coordX + s;
                const y2 = coordY + s;
                svg += `<polygon points="${x1},${y1} ${x2},${y1} ${x1},${y2}" fill="${cor}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
            } else {
                svg += `<rect x="${coordX}" y="${coordY}" width="${s}" height="${s}" fill="${cor}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
            }
            
            const vogaisDados = grelhaVogais.get(chave);
            if (vogaisDados) {
                svg += this.desenharVogaisSVG(x, yCorrigido, vogaisDados, tamanhoCelula, bgColor);
            }
        }
        
        svg += '</svg>';
        return svg;
    }
    
    /**
     * Desenha vogais como polígonos SVG
     */
    desenharVogaisSVG(x, y, dadosVogais, tamanhoCelula, bgColor) {
        let svg = '';
        const px = x * tamanhoCelula;
        const py = y * tamanhoCelula;
        const s = tamanhoCelula;
        const centerX = px + s / 2;
        const centerY = py + s / 2;
        
        for (let i = 0; i < dadosVogais.anteriores.length; i++) {
            const vogal = dadosVogais.anteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            let pontos = '';
            
            switch (vogal) {
                case 'A':
                    pontos = `${px},${py + s} ${px + s},${py + s} ${centerX},${centerY}`;
                    break;
                case 'E':
                    pontos = `${px},${py} ${px},${py + s} ${centerX},${centerY}`;
                    break;
                case 'I':
                    pontos = `${px},${py} ${px + s},${py} ${centerX},${centerY}`;
                    break;
                case 'O':
                    pontos = `${px + s},${py} ${px + s},${py + s} ${centerX},${centerY}`;
                    break;
            }
            svg += `<polygon points="${pontos}" fill="${bgColor}" fill-opacity="${1 - alpha}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
        }
        
        for (let i = 0; i < dadosVogais.posteriores.length; i++) {
            const vogal = dadosVogais.posteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            let pontos = '';
            
            switch (vogal) {
                case 'A':
                    pontos = `${px + s/2},${py} ${px},${py + s/2} ${px},${py}`;
                    break;
                case 'E':
                    pontos = `${px + s/2},${py} ${px + s},${py + s/2} ${px + s},${py}`;
                    break;
                case 'I':
                    pontos = `${px},${py + s/2} ${px + s/2},${py + s} ${px},${py + s}`;
                    break;
                case 'O':
                    pontos = `${px + s/2},${py + s} ${px + s},${py + s/2} ${px + s},${py + s}`;
                    break;
            }
            svg += `<polygon points="${pontos}" fill="${bgColor}" fill-opacity="${1 - alpha}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
        }
        
        return svg;
    }
    
    /**
     * Faz download de um arquivo com os dados fornecidos
     */
    fazerDownload(dados, nomeArquivo, tipoMime) {
        const link = document.createElement('a');
        link.download = nomeArquivo;
        link.href = tipoMime === 'image/svg+xml' 
            ? 'data:' + tipoMime + ';charset=utf-8,' + encodeURIComponent(dados)
            : dados;
        link.click();
    }
    
    /**
     * Define as cores personalizadas para os algarismos
     * @param {Object} cores - Objeto mapeando algarismos (0-9) para cores hexadecimais
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
        if (this.coresPersonalizadas[idCor]) {
            return this.coresPersonalizadas[idCor];
        }
        return this.coresPadrao[idCor % this.coresPadrao.length];
    }

    redimensionar(larguraMaxima, maxHeight) {
        // Ajusta fisicamente o canvas para caber toda a palavra gerada
        this.canvas.width = (larguraMaxima + 2) * this.tamanhoCelula;
        this.canvas.height = maxHeight * this.tamanhoCelula;
    }

    desenhar(grelha, grelhaVogais, maxHeight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const [chave, info] of grelha.entries()) {
            const [x, y] = chave.split(',').map(Number);
            const numero = info.numero;
            const idCor = info.idCor;
            
            // Desenha com offset no Y para as peças ficarem assentes no fundo do canvas
            const yCorrigido = (maxHeight - 1) - y;

            const coordX = x * this.tamanhoCelula;
            const coordY = yCorrigido * this.tamanhoCelula;
            const s = this.tamanhoCelula;

            this.ctx.fillStyle = this.obterCor(idCor);
            
            if (numero === 0) {
                const px = coordX;
                const py = coordY;
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px + s, py);
                this.ctx.lineTo(px, py + s);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillRect(coordX, coordY, this.tamanhoCelula, this.tamanhoCelula);
            }
            
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
        
        // Desenha vogais anteriores (apontam para o centro) com transparência conforme ordem
        for (let i = 0; i < dadosVogais.anteriores.length; i++) {
            const vogal = dadosVogais.anteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            ctx.globalAlpha = alpha;
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
        
        // Desenha vogais posteriores (cantos) - com posições trocadas conforme solicitado, com transparência conforme ordem
        for (let i = 0; i < dadosVogais.posteriores.length; i++) {
            const vogal = dadosVogais.posteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            ctx.globalAlpha = alpha;
            switch (vogal) {
                case 'A': // Agora desenha onde o E estava: Canto Superior Esquerdo
                    desenharTriangulo(px + s/2, py, px, py + s/2, px, py);
                    break;
                case 'E': // Agora desenha onde o I estava: Canto Superior Direito
                    desenharTriangulo(px + s/2, py, px + s, py + s/2, px + s, py);
                    break;
                case 'I': // Agora desenha onde o O estava: Canto Inferior Esquerdo
                    desenharTriangulo(px, py + s/2, px + s/2, py + s, px, py + s);
                    break;
                case 'O': // Agora desenha onde o A estava: Canto Inferior Direito
                    desenharTriangulo(px + s/2, py + s, px + s, py + s/2, px + s, py + s);
                    break;
            }
        }
        
        ctx.globalAlpha = 1.0; // reset alpha
    }
}