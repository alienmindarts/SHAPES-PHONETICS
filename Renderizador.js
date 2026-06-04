export class Renderizador {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tamanhoCelula = 25;
        this.arredondamento = 0;
        
        this.coresPadrao = [
            '#FFFFFF', '#FF3366', '#33CCFF', '#FF9933', '#33FF99', 
            '#CC33FF', '#FFFF33', '#FF3333', '#3333FF', '#33FF33'
        ];
        
        this.coresPersonalizadas = {};
    }
    
    exportarPNG() {
        return this.canvas.toDataURL('image/png');
    }
    
    exportarJPEG(qualidade = 0.92) {
        return this.canvas.toDataURL('image/jpeg', qualidade);
    }
    
    exportarSVG(grelha, grelhaVogais, maxHeight) {
        const largura = this.canvas.width;
        const altura = this.canvas.height;
        const tamanhoCelula = this.tamanhoCelula;
        const arredondamento = this.arredondamento;
        
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
            } else if (arredondamento >= 100) {
                svg += `<circle cx="${coordX + s/2}" cy="${coordY + s/2}" r="${s/2}" fill="${cor}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
            } else if (arredondamento > 0) {
                const raio = (s / 2) * (arredondamento / 100);
                svg += `<rect x="${coordX}" y="${coordY}" width="${s}" height="${s}" rx="${raio}" fill="${cor}" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>`;
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
    
    fazerDownload(dados, nomeArquivo, tipoMime) {
        const link = document.createElement('a');
        link.download = nomeArquivo;
        link.href = tipoMime === 'image/svg+xml' 
            ? 'data:' + tipoMime + ';charset=utf-8,' + encodeURIComponent(dados)
            : dados;
        link.click();
    }
    
    definirCoresPersonalizadas(cores) {
        this.coresPersonalizadas = cores;
    }
    
    setArredondamento(valor) {
        this.arredondamento = valor;
    }
    
    obterCor(idCor) {
        if (this.coresPersonalizadas[idCor]) {
            return this.coresPersonalizadas[idCor];
        }
        return this.coresPadrao[idCor % this.coresPadrao.length];
    }

    redimensionar(larguraMaxima, maxHeight) {
        this.canvas.width = (larguraMaxima + 2) * this.tamanhoCelula;
        this.canvas.height = maxHeight * this.tamanhoCelula;
    }

    desenhar(grelha, grelhaVogais, maxHeight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const [chave, info] of grelha.entries()) {
            const [x, y] = chave.split(',').map(Number);
            const numero = info.numero;
            const idCor = info.idCor;
            
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
            } else if (this.arredondamento >= 100) {
                this.ctx.beginPath();
                this.ctx.arc(coordX + s/2, coordY + s/2, s/2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (this.arredondamento > 0) {
                const raio = (s / 2) * (this.arredondamento / 100);
                this.ctx.beginPath();
                this.ctx.moveTo(coordX + raio, coordY);
                this.ctx.lineTo(coordX + s - raio, coordY);
                this.ctx.arcTo(coordX + s, coordY, coordX + s, coordY + raio, raio);
                this.ctx.lineTo(coordX + s, coordY + s - raio);
                this.ctx.arcTo(coordX + s, coordY + s, coordX + s - raio, coordY + s, raio);
                this.ctx.lineTo(coordX + raio, coordY + s);
                this.ctx.arcTo(coordX, coordY + s, coordX, coordY + s - raio, raio);
                this.ctx.lineTo(coordX, coordY + raio);
                this.ctx.arcTo(coordX, coordY, coordX + raio, coordY, raio);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillRect(coordX, coordY, this.tamanhoCelula, this.tamanhoCelula);
            }
            
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.lineWidth = 2;
            if (this.arredondamento >= 100) {
                this.ctx.beginPath();
                this.ctx.arc(coordX + s/2, coordY + s/2, s/2, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (this.arredondamento > 0) {
                const raio = (s / 2) * (this.arredondamento / 100);
                this.ctx.beginPath();
                this.ctx.moveTo(coordX + raio, coordY);
                this.ctx.lineTo(coordX + s - raio, coordY);
                this.ctx.arcTo(coordX + s, coordY, coordX + s, coordY + raio, raio);
                this.ctx.lineTo(coordX + s, coordY + s - raio);
                this.ctx.arcTo(coordX + s, coordY + s, coordX + s - raio, coordY + s, raio);
                this.ctx.lineTo(coordX + raio, coordY + s);
                this.ctx.arcTo(coordX, coordY + s, coordX, coordY + s - raio, raio);
                this.ctx.lineTo(coordX, coordY + raio);
                this.ctx.arcTo(coordX, coordY, coordX + raio, coordY, raio);
                this.ctx.closePath();
                this.ctx.stroke();
            } else {
                this.ctx.strokeRect(coordX, coordY, this.tamanhoCelula, this.tamanhoCelula);
            }

            const vogaisDados = grelhaVogais.get(`${x},${y}`);
            if (vogaisDados) {
                this.desenharVogais(this.ctx, x, yCorrigido, vogaisDados, this.tamanhoCelula);
            }
        }
    }
    
    desenharVogais(ctx, x, y, dadosVogais, tamanhoCelula) {
        const px = x * tamanhoCelula;
        const py = y * tamanhoCelula;
        const s = tamanhoCelula;
        const centerX = px + s / 2;
        const centerY = py + s / 2;
        
        const bgColor = getComputedStyle(this.canvas).backgroundColor;
        ctx.fillStyle = bgColor;
        
        const desenharTriangulo = (x1, y1, x2, y2, x3, y3) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fill();
        };
        
        for (let i = 0; i < dadosVogais.anteriores.length; i++) {
            const vogal = dadosVogais.anteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            ctx.globalAlpha = alpha;
            switch (vogal) {
                case 'A':
                    desenharTriangulo(px, py + s, px + s, py + s, centerX, centerY);
                    break;
                case 'E':
                    desenharTriangulo(px, py, px, py + s, centerX, centerY);
                    break;
                case 'I':
                    desenharTriangulo(px, py, px + s, py, centerX, centerY);
                    break;
                case 'O':
                    desenharTriangulo(px + s, py, px + s, py + s, centerX, centerY);
                    break;
            }
        }
        
        for (let i = 0; i < dadosVogais.posteriores.length; i++) {
            const vogal = dadosVogais.posteriores[i];
            const alpha = Math.max(0, 1 - i * 0.25);
            ctx.globalAlpha = alpha;
            switch (vogal) {
                case 'A':
                    desenharTriangulo(px + s/2, py, px, py + s/2, px, py);
                    break;
                case 'E':
                    desenharTriangulo(px + s/2, py, px + s, py + s/2, px + s, py);
                    break;
                case 'I':
                    desenharTriangulo(px, py + s/2, px + s/2, py + s, px, py + s);
                    break;
                case 'O':
                    desenharTriangulo(px + s/2, py + s, px + s, py + s/2, px + s, py + s);
                    break;
            }
        }
        
        ctx.globalAlpha = 1.0;
    }
}