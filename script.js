document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO TEMA DARK/LIGHT ---
    const themeSwitch = document.getElementById('checkbox');
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    
    const aplicarTema = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);
        themeSwitch.checked = isDark;
        metaThemeColor.setAttribute('content', isDark ? '#000000' : '#F2F2F7');
    };
    
    themeSwitch.addEventListener('change', function() {
        localStorage.setItem('darkMode', this.checked);
        aplicarTema(this.checked);
    });

    const darkModeSalvo = localStorage.getItem('darkMode') === 'true';
    aplicarTema(darkModeSalvo);

    // --- SELETORES DO DOM ---
    const listaContasEl = document.getElementById('lista-contas');
    const modalConta = document.getElementById('modal-conta');
    const modalCategorias = document.getElementById('modal-categorias');
    const modalSalario = document.getElementById('modal-salario');
    const formConta = document.getElementById('form-conta');
    const formCategoria = document.getElementById('form-nova-categoria');
    const formSalario = document.getElementById('form-salario');
    
    // --- ESTRUTURA DE DADOS (COM ÍCONES NAS CATEGORIAS) ---
    const categoriasPadrao = [
        { id: 'moradia', nome: 'Moradia', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
        { id: 'alimentacao', nome: 'Alimentação', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
        { id: 'transporte', nome: 'Transporte', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect><line x1="1" y1="8" x2="23" y2="8"></line><line x1="8" y1="12" x2="8" y2="12"></line><line x1="12" y1="12" x2="12" y2="12"></line><line x1="16" y1="12" x2="16" y2="12"></line></svg>' },
        { id: 'lazer', nome: 'Lazer', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
        { id: 'saude', nome: 'Saúde', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' },
        { id: 'contas', nome: 'Contas Fixas', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' },
        { id: 'compras', nome: 'Compras', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
    ];
    
    let contas = JSON.parse(localStorage.getItem('contas')) || [];
    let categorias = JSON.parse(localStorage.getItem('categorias')) || categoriasPadrao;
    let salario = JSON.parse(localStorage.getItem('salario')) || 0;
    let contaEmEdicao = null;
    let logoBase64 = null;
    
    // --- FUNÇÕES AUXILIARES ---
    const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const salvarDados = () => {
        localStorage.setItem('contas', JSON.stringify(contas));
        localStorage.setItem('categorias', JSON.stringify(categorias));
        localStorage.setItem('salario', JSON.stringify(salario));
    };

    // --- FUNÇÕES DE ABERTURA DOS MODAIS ---
    function abrirModalConta(conta = null) {
        formConta.reset();
        logoBase64 = null;
        const logoPreview = document.getElementById('logo-preview');
        logoPreview.style.display = 'none';
        logoPreview.src = '';
        if (conta) {
            contaEmEdicao = conta;
            document.getElementById('modal-conta-titulo').textContent = 'Editar Conta';
            document.getElementById('conta-id').value = conta.id;
            document.getElementById('conta-nome').value = conta.nome;
            document.getElementById('conta-valor').value = conta.valor;
            document.getElementById('conta-vencimento').value = conta.vencimento;
            document.getElementById('conta-categoria').value = conta.categoria;
            if (conta.logo) { logoPreview.src = conta.logo; logoPreview.style.display = 'block'; }
        } else {
            contaEmEdicao = null;
            document.getElementById('modal-conta-titulo').textContent = 'Nova Conta';
        }
        modalConta.classList.add('show');
    }
    function abrirModalCategorias() { modalCategorias.classList.add('show'); }
    function abrirModalSalario() { document.getElementById('salario-valor').value = salario > 0 ? salario : ''; modalSalario.classList.add('show'); }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const atualizarDashboard = () => {
        const totalAPagar = contas.filter(c => c.status === 'pendente').reduce((acc, conta) => acc + conta.valor, 0);
        const balanco = salario - totalAPagar;
        document.getElementById('display-salario').textContent = formatarMoeda(salario);
        document.getElementById('display-total-a-pagar').textContent = formatarMoeda(totalAPagar);
        document.getElementById('display-balanco').textContent = formatarMoeda(balanco);
        const balancoEl = document.getElementById('display-balanco');
        balancoEl.style.color = balanco < 0 ? 'var(--danger-color)' : 'var(--success-color)';
    };

    const renderizarContas = () => {
        listaContasEl.innerHTML = '';
        const filtroCat = document.getElementById('filtro-categoria').value;
        const filtroStat = document.getElementById('filtro-status').value;
        const contasFiltradas = contas.filter(conta => (filtroCat === 'todas' || conta.categoria === filtroCat) && (filtroStat === 'todas' || conta.status === filtroStat));

        if (contasFiltradas.length === 0) {
            listaContasEl.innerHTML = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap-off"><polyline points="12.41 6.75 13 2 10.57 4.92"></polyline><polyline points="18.57 12.91 21 10 15.66 10"></polyline><polyline points="8 8 3 14 12 14 11 22 16 16"></polyline><line x1="1" y1="1" x2="23" y2="23"></line></svg><p>Nenhuma conta por aqui.</p><button id="btn-nova-conta-empty">Adicionar primeira conta</button></div>`;
            atualizarDashboard();
            return;
        }

        contasFiltradas.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)).forEach(conta => {
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            const vencimento = new Date(conta.vencimento);
            const isVencida = vencimento < hoje && conta.status === 'pendente';
            const card = document.createElement('div');
            card.className = `conta-card ${conta.status} ${isVencida ? 'vencida' : ''}`;
            
            const categoriaObj = categorias.find(cat => cat.id === conta.categoria) || { nome: 'Sem Categoria', icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>' };
            const logoSrc = conta.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(conta.nome.charAt(0))}&background=random&color=fff&bold=true`;
            
            const iconPendente = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
            const iconPaga = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            const iconEditar = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            const iconApagar = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

            card.innerHTML = `
                <div class="card-col-logo"><img src="${logoSrc}" alt="Logo" class="logo-empresa"></div>
                <div class="card-col-info">
                    <h3>${conta.nome}</h3>
                    <div class="categoria-info">${categoriaObj.icone}<span>${categoriaObj.nome}</span></div>
                    <p class="data-vencimento">Vence: ${new Date(conta.vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                </div>
                <div class="card-col-valor">
                    <div class="conta-valor">${formatarMoeda(conta.valor)}</div>
                    <div class="conta-acoes">
                        <button class="btn-pagar" title="${conta.status === 'paga' ? 'Marcar como Pendente' : 'Marcar como Paga'}" data-id="${conta.id}">${conta.status === 'paga' ? iconPendente : iconPaga}</button>
                        <button class="btn-editar" title="Editar Conta" data-id="${conta.id}">${iconEditar}</button>
                        <button class="btn-apagar" title="Apagar Conta" data-id="${conta.id}">${iconApagar}</button>
                    </div>
                </div>
            `;
            listaContasEl.appendChild(card);
        });
        atualizarDashboard();
    };

    const renderizarCategorias = () => {
        const selectCategoria = document.getElementById('conta-categoria');
        const filtroCategoria = document.getElementById('filtro-categoria');
        const listaCategoriasEl = document.getElementById('lista-categorias');
        selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
        filtroCategoria.innerHTML = '<option value="todas">Todas as Categorias</option>';
        listaCategoriasEl.innerHTML = '';
        categorias.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(cat => {
            selectCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
            filtroCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
            const li = document.createElement('li');
            li.innerHTML = `<div class="categoria-item">${cat.icone}<span>${cat.nome}</span></div><button class="btn-excluir-cat" data-id="${cat.id}">Excluir</button>`;
            listaCategoriasEl.appendChild(li);
        });
    };
    
    // --- MANIPULADORES DE EVENTOS ---
    document.body.addEventListener('click', (e) => {
        const targetId = e.target.closest('button')?.id;
        if (targetId === 'btn-nova-conta' || targetId === 'btn-nova-conta-empty') abrirModalConta();
        else if (targetId === 'btn-gerenciar-categorias') abrirModalCategorias();
        else if (targetId === 'btn-gerenciar-salario') abrirModalSalario();
    });

    document.querySelectorAll('.modal .close-btn').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal').classList.remove('show')));
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });

    formConta.addEventListener('submit', (e) => {
        e.preventDefault();
        const contaData = { id: contaEmEdicao ? contaEmEdicao.id : Date.now(), nome: document.getElementById('conta-nome').value, valor: parseFloat(document.getElementById('conta-valor').value), categoria: document.getElementById('conta-categoria').value, vencimento: document.getElementById('conta-vencimento').value, status: contaEmEdicao ? contaEmEdicao.status : 'pendente', logo: logoBase64 || (contaEmEdicao ? contaEmEdicao.logo : null) };
        if (contaEmEdicao) contas = contas.map(c => c.id === contaEmEdicao.id ? contaData : c);
        else contas.push(contaData);
        salvarDados();
        renderizarContas();
        modalConta.classList.remove('show');
    });

    formCategoria.addEventListener('submit', (e) => {
        e.preventDefault();
        const nomeCategoria = document.getElementById('nova-categoria-nome').value.trim();
        if (nomeCategoria && !categorias.some(cat => cat.nome.toLowerCase() === nomeCategoria.toLowerCase())) {
            const novoId = nomeCategoria.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const novaCategoria = { id: novoId, nome: nomeCategoria, icone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' };
            categorias.push(novaCategoria);
            salvarDados();
            renderizarCategorias();
            formCategoria.reset();
        } else { alert('Nome de categoria inválido ou já existente.'); }
    });

    formSalario.addEventListener('submit', (e) => { e.preventDefault(); salario = parseFloat(document.getElementById('salario-valor').value) || 0; salvarDados(); atualizarDashboard(); modalSalario.classList.remove('show'); });

    listaContasEl.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const id = parseInt(button.dataset.id);
        if (isNaN(id)) return;
        const conta = contas.find(c => c.id === id);
        if (!conta) return;

        if (button.classList.contains('btn-pagar')) conta.status = conta.status === 'paga' ? 'pendente' : 'paga';
        else if (button.classList.contains('btn-apagar')) { if (confirm('Tem certeza que deseja apagar esta conta?')) contas = contas.filter(c => c.id !== id); }
        else if (button.classList.contains('btn-editar')) { abrirModalConta(conta); return; }
        salvarDados();
        renderizarContas();
    });
    
    document.getElementById('lista-categorias').addEventListener('click', (e) => {
        const button = e.target.closest('button.btn-excluir-cat');
        if (button) {
            const catIdParaExcluir = button.dataset.id;
            if (contas.some(c => c.categoria === catIdParaExcluir)) { alert('Não é possível excluir uma categoria em uso.'); return; }
            if (confirm('Tem certeza que deseja excluir esta categoria?')) { categorias = categorias.filter(cat => cat.id !== catIdParaExcluir); salvarDados(); renderizarCategorias(); }
        }
    });

    document.getElementById('filtro-categoria').addEventListener('change', renderizarContas);
    document.getElementById('filtro-status').addEventListener('change', renderizarContas);
    document.getElementById('conta-logo').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => { logoBase64 = event.target.result; const preview = document.getElementById('logo-preview'); preview.src = logoBase64; preview.style.display = 'block'; };
            reader.readAsDataURL(file);
        }
    });
    
    // --- INICIALIZAÇÃO ---
    renderizarCategorias();
    renderizarContas();
});

// --- REGISTRO DO SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => { console.log('SW ok:', registration.scope); }, err => { console.error('SW falhou:', err); });
  });
}