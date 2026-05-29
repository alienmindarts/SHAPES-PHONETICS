const fs = require('fs');

// A mesma função recursiva, mas otimizada para correr no Node
function gerarPoliominos(n) {
    if (n === 1) return [[[0, 0]]];
    
    const anteriores = gerarPoliominos(n - 1);
    const novos = new Set();
    const resultado = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    anteriores.forEach(peca => {
        peca.forEach(([x, y]) => {
            dirs.forEach(([dx, dy]) => {
                const nx = x + dx, ny = y + dy;
                
                if (!peca.some(([px, py]) => px === nx && py === ny)) {
                    let novaPeca = [...peca, [nx, ny]];
                    
                    const minX = Math.min(...novaPeca.map(p => p[0]));
                    const minY = Math.min(...novaPeca.map(p => p[1]));
                    novaPeca = novaPeca.map(([px, py]) => [px - minX, py - minY]);
                    
                    novaPeca.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
                    
                    const hash = JSON.stringify(novaPeca);
                    if (!novos.has(hash)) {
                        novos.add(hash);
                        resultado.push(novaPeca);
                    }
                }
            });
        });
    });
    return resultado;
}

console.log("A iniciar a geração de poliominós...");
const DicionarioCompleto = {};

// Agora sim, vamos até ao 9!
for (let i = 1; i <= 9; i++) {
    console.log(`A calcular para o número ${i}... (pode demorar uns segundos para o 8 e 9)`);
    DicionarioCompleto[i] = gerarPoliominos(i);
    console.log(`-> Encontradas ${DicionarioCompleto[i].length} variantes únicas.`);
}

console.log("A escrever o ficheiro estático...");

// Escreve diretamente um módulo ES6 pronto a usar pelo teu site
const outputJS = `export const Dicionario = ${JSON.stringify(DicionarioCompleto)};`;
fs.writeFileSync('Dicionario.js', outputJS);

console.log("Concluído! O ficheiro 'Dicionario.js' está pronto.");