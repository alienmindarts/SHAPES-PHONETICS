export class Fonetico {
    static converterTexto(texto) {
        if (typeof texto !== 'string') {
            return [];
        }

        // Passo 1: Normalização Base
        let s = texto.replace(/[çÇ]/g, '0');
        s = s.toUpperCase();
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Passo 2: Resolução de Dígrafos e Exceções
        // Aplicamos as substituições na ordem dada
        s = s.replace(/CH/g, '6');
        s = s.replace(/LH/g, '5');
        s = s.replace(/NH/g, '2');
        s = s.replace(/RR/g, '4');
        s = s.replace(/Y/g, 'I');
        s = s.replace(/U/g, 'O');
        s = s.replace(/CE/g, '0E');
        s = s.replace(/CI/g, '0I');
        s = s.replace(/GE/g, '6E');
        s = s.replace(/GI/g, '6I');

        // Passo 3: Mapeamento de Consoantes para Dígitos
        const mapaConsoantes = {
            S: '0', Z: '0',
            T: '1', D: '1',
            N: '2',
            M: '3',
            R: '4',
            L: '5',
            J: '6', X: '6',
            K: '7', Q: '7', C: '7', G: '7',
            F: '8', V: '8',
            P: '9', B: '9'
        };

        // Converte cada consoante restante (que não é vogal e não é dígito) para dígito
        s = [...s].map(char => {
            // Se for uma vogal (A, E, I, O) ou dígito, deixa como está
            if (/[AEIOU0-9]/.test(char)) {
                return char;
            }
            // Se for uma consoante no mapa, converte
            if (mapaConsoantes[char]) {
                return mapaConsoantes[char];
            }
            // Caso contrário (como H, W, etc.) deixa para ser filtrado no próximo passo
            return char;
        }).join('');

        // Passo 4: Filtragem Final
        // Mantém apenas dígitos (0-9) e vogais (A, E, I, O)
        s = s.replace(/[^0-9AEIOU]/g, '');

        // Agora, dividimos a string em blocos: cada bloco é ancorado por uma consoante (dígito)
        // e contém as vogais anteriores e posteriores a essa consoante.
        const blocos = [];
        let i = 0;
        const comprimento = s.length;

        // Coleta vogais iniciais (antes da primeira consoante)
        let vogaisAnteriores = [];
        while (i < comprimento && /[AEIOU]/.test(s[i])) {
            vogaisAnteriores.push(s[i]);
            i++;
        }

        // Processa cada consoante (dígito) e as vogais que a seguem até a próxima consoante ou fim
        while (i < comprimento) {
            // O caractere atual deve ser uma consoante (dígito)
            if (/[0-9]/.test(s[i])) {
                const consoante = s[i];
                i++;

                // Coleta vogais posteriores até a próxima consoante ou fim
                let vogaisPosteriores = [];
                while (i < comprimento && /[AEIOU]/.test(s[i])) {
                    vogaisPosteriores.push(s[i]);
                    i++;
                }

                blocos.push({
                    consoante: consoante,
                    vogaisAnteriores: vogaisAnteriores,
                    vogaisPosteriores: vogaisPosteriores
                });

                // Após processar um bloco, reseta as vogais anteriores para o próximo bloco
                // (as vogais que acabamos de processar como posteriores serão as anteriores do próximo bloco apenas se houver vogais entre consoantes?)
                // Na verdade, entre duas consoantes, não deve haver vogais porque nós filtramos tudo exceto dígitos e vogais.
                // E nós estamos consumindo vogais posteriores até a próxima consoante. Então, ao encontrar a próxima consoante,
                // as vogais que estavam entre elas já foram consumidas como posteriores do bloco anterior.
                // Portanto, para o próximo bloco, as vogais anteriores começam novamente como vazias.
                vogaisAnteriores = [];
            } else {
                // Este caso não deveria aconteer porque filtramos tudo exceto dígitos e vogais.
                // Mas por segurança, avançamos para evitar loop infinito.
                i++;
            }
        }

        return blocos;
    }
}