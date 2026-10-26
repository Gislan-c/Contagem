const estado = {
    lugares: {},
    contagemAreas: { ld:0, centro:0, le:0 },
    extras: {
        salab: 0, audioVideo: 0, videoLsb: 0, tribuna: 0, emPe: 0, zoom: 0, externa: 0
    },
    ls: { ouvintes: 0, surdos: 0 }
};

const areas = {
    ld: { filas: 10, lugares: 3, prefixo: 'LD' },
    centro: { 
        filas: 10, 
        lugaresPorFila: fila => fila === 10 ? 5 : 7,
        temCadeiraDupla: fila => fila === 10,
        prefixo: 'C'
    },
    le: { filas: 6, lugares: 3, prefixo: 'LE' }
};

function montar() {
    for (const [chave, cfg] of Object.entries(areas)) {
        const container = document.getElementById(chave);
        container.innerHTML = '';

        for (let fila = 1; fila <= cfg.filas; fila++) {
            const divFila = document.createElement('div');
            divFila.className = 'fileira';
            divFila.innerHTML = `
                <span class="f-num">F${fila}</span>
                <div class="lugares"></div>
                <span class="contagem-fileira" id="cnt-fila-${cfg.prefixo}-${fila}">0</span>
            `;
            const lugaresDiv = divFila.querySelector('.lugares');
            
            const qtdLugares = cfg.lugares || cfg.lugaresPorFila(fila);

            for (let lugar = 1; lugar <= qtdLugares; lugar++) {
                const id = `${cfg.prefixo}-${fila}-${lugar}`;
                if (estado.lugares[id] === undefined) estado.lugares[id] = false;

                const el = document.createElement('div');
                el.dataset.id = id;
                el.textContent = lugar;
                el.className = 'lugar vago';
                el.onclick = () => alternar(id);
                lugaresDiv.appendChild(el);
            }
            
            if (chave === 'centro' && cfg.temCadeiraDupla(fila)) {
                const idDupla = `${cfg.prefixo}-${fila}-dupla`;
                if (estado.lugares[idDupla] === undefined) estado.lugares[idDupla] = false;
                
                const elDupla = document.createElement('div');
                elDupla.dataset.id = idDupla;
                elDupla.textContent = 'Dupla';
                elDupla.className = 'lugar vago obeso';
                elDupla.onclick = () => alternar(idDupla);
                lugaresDiv.appendChild(elDupla);
            }

            container.appendChild(divFila);
        }
    }
    atualizarVisualizacao();
}

function alternar(id) {
    estado.lugares[id] = !estado.lugares[id];
    atualizarVisualizacao();
    salvar();
}

function atualizarVisualizacao() {
    document.querySelectorAll('.lugar').forEach(el => {
        const id = el.dataset.id;
        el.classList.toggle('vago', !estado.lugares[id]);
        el.classList.toggle('ocupado', estado.lugares[id]);
    });

    for (const [chave, cfg] of Object.entries(areas)) {
        let totalArea = 0;
        for (let fila = 1; fila <= cfg.filas; fila++) {
            let contFila = 0;
            const qtdLugares = cfg.lugares || cfg.lugaresPorFila(fila);
            
            for (let lugar = 1; lugar <= qtdLugares; lugar++) {
                const id = `${cfg.prefixo}-${fila}-${lugar}`;
                if (estado.lugares[id]) contFila++;
            }
            if (chave === 'centro' && cfg.temCadeiraDupla && cfg.temCadeiraDupla(fila)) {
                const idDupla = `${cfg.prefixo}-${fila}-dupla`;
                if (estado.lugares[idDupla]) contFila++;
            }
            
            document.getElementById(`cnt-fila-${cfg.prefixo}-${fila}`).textContent = contFila;
            totalArea += contFila;
        }
        estado.contagemAreas[chave] = totalArea;
    }

    atualizar();
}

function atualizar() {
    estado.extras.salab = parseInt(document.getElementById('cnt-salab').value) || 0;
    estado.extras.audioVideo = parseInt(document.getElementById('cnt-audio-video').value) || 0;
    estado.extras.videoLsb = parseInt(document.getElementById('cnt-video-lsb').value) || 0;
    estado.extras.tribuna = parseInt(document.getElementById('cnt-tribuna').value) || 0;
    estado.extras.emPe = parseInt(document.getElementById('cnt-pe').value) || 0;
    estado.extras.zoom = parseInt(document.getElementById('cnt-zoom').value) || 0;
    estado.extras.externa = parseInt(document.getElementById('cnt-externa').value) || 0;

    document.getElementById('resq-le').textContent = estado.contagemAreas.le;
    document.getElementById('resq-centro').textContent = estado.contagemAreas.centro;
    document.getElementById('resq-ld').textContent = estado.contagemAreas.ld;
    document.getElementById('resq-salab').textContent = estado.extras.salab;
    document.getElementById('resq-tribuna').textContent = estado.extras.tribuna;
    document.getElementById('resq-pe').textContent = estado.extras.emPe;
    document.getElementById('resq-av').textContent = estado.extras.audioVideo;
    document.getElementById('resq-vlsb').textContent = estado.extras.videoLsb;
    document.getElementById('resq-ext').textContent = estado.extras.externa;
    document.getElementById('resq-zoom').textContent = estado.extras.zoom;

    const totalPortugues = estado.contagemAreas.le + estado.contagemAreas.centro +
        estado.contagemAreas.ld + estado.extras.salab + estado.extras.tribuna +
        estado.extras.emPe + estado.extras.audioVideo + estado.extras.videoLsb +
        estado.extras.externa + estado.extras.zoom;
    
    document.getElementById('resq-pt-total').textContent = totalPortugues;

    atualizarResumo();
}

function atualizarResumo() {
    estado.ls.ouvintes = parseInt(document.getElementById('ls-ouvintes').value) || 0;
    estado.ls.surdos = parseInt(document.getElementById('ls-surdos').value) || 0;
    
    const totalPortugues = parseInt(document.getElementById('resq-pt-total').textContent) || 0;
    const somaGeral = totalPortugues + estado.ls.ouvintes + estado.ls.surdos;
    
    document.getElementById('soma-geral').textContent = somaGeral;
    salvar();
}

function formatarData() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function gerarMensagem() {
    const data = formatarData();
    const totalGeral = document.getElementById('soma-geral').textContent;
    const texto = `Assistência total hoje (${data}) foi de ${totalGeral} pessoas.`;
    
    document.getElementById('texto-mensagem').textContent = texto;
    document.getElementById('caixa-mensagem').classList.add('mostrar');
    document.getElementById('aviso-copiado').style.display = 'none';
}

function copiarMensagem() {
    const texto = document.getElementById('texto-mensagem').textContent;
    if (!texto) {
        alert('Gere a mensagem primeiro!');
        return;
    }
    
    navigator.clipboard.writeText(texto)
        .then(() => {
            document.getElementById('aviso-copiado').style.display = 'inline';
            setTimeout(() => {
                document.getElementById('aviso-copiado').style.display = 'none';
            }, 3000);
        })
        .catch(() => {
            const temp = document.createElement('textarea');
            temp.value = texto;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            document.getElementById('aviso-copiado').style.display = 'inline';
            setTimeout(() => {
                document.getElementById('aviso-copiado').style.display = 'none';
            }, 3000);
        });
}

function salvar() {
    localStorage.setItem('contagem-assistencia', JSON.stringify(estado));
}

function carregar() {
    const dados = localStorage.getItem('contagem-assistencia');
    if (dados) {
        const salvo = JSON.parse(dados);
        Object.assign(estado, salvo);
        document.getElementById('cnt-salab').value = estado.extras.salab;
        document.getElementById('cnt-audio-video').value = estado.extras.audioVideo;
        document.getElementById('cnt-video-lsb').value = estado.extras.videoLsb;
        document.getElementById('cnt-tribuna').value = estado.extras.tribuna;
        document.getElementById('cnt-pe').value = estado.extras.emPe;
        document.getElementById('cnt-zoom').value = estado.extras.zoom;
        document.getElementById('cnt-externa').value = estado.extras.externa;
        document.getElementById('ls-ouvintes').value = estado.ls.ouvintes;
        document.getElementById('ls-surdos').value = estado.ls.surdos;
    }
}

function reiniciar() {
    if (confirm('Apagar TODA a contagem e começar do zero?')) {
        localStorage.removeItem('contagem-assistencia');
        estado.lugares = {};
        estado.contagemAreas = { ld:0, centro:0, le:0 };
        estado.extras = { salab:0, audioVideo:0, videoLsb:0, tribuna:0, emPe:0, zoom:0, externa:0 };
        estado.ls = { ouvintes:0, surdos:0 };
        
        document.getElementById('cnt-salab').value = 0;
        document.getElementById('cnt-audio-video').value = 0;
        document.getElementById('cnt-video-lsb').value = 0;
        document.getElementById('cnt-tribuna').value = 0;
        document.getElementById('cnt-pe').value = 0;
        document.getElementById('cnt-zoom').value = 0;
        document.getElementById('cnt-externa').value = 0;
        document.getElementById('ls-ouvintes').value = 0;
        document.getElementById('ls-surdos').value = 0;
        document.getElementById('caixa-mensagem').classList.remove('mostrar');
        
        montar();
    }
}

carregar();
montar();
atualizar();