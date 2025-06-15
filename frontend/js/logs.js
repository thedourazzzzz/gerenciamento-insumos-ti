// Função para carregar o conteúdo da aba de logs
async function loadLogsContent(containerDiv) {
    containerDiv.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-4">Logs de Movimentações</h2>

            <!-- Filtros -->
            <form id="logsFilterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="form-group">
                    <label for="tipo" class="form-label">Tipo de Operação</label>
                    <select id="tipo" name="tipo" class="form-input">
                        <option value="">Todos</option>
                        <option value="usuario">Usuário</option>
                        <option value="produto">Produto</option>
                        <option value="ativo">Ativo</option>
                        <option value="descritivo">Descritivo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="usuario" class="form-label">Usuário</label>
                    <input type="text" id="usuario" name="usuario" class="form-input" placeholder="Digite o usuário">
                </div>
                <div class="form-group">
                    <label for="acao" class="form-label">Ação</label>
                    <select id="acao" name="acao" class="form-input">
                        <option value="">Todas</option>
                        <option value="criar">Criar</option>
                        <option value="editar">Editar</option>
                        <option value="deletar">Deletar</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="adicionar_quantidade">Adicionar Quantidade</option>
                        <option value="remover_quantidade">Remover Quantidade</option>
                        <option value="importar_csv">Importar CSV</option>
                        <option value="alterar_status">Alterar Status</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="dataInicio" class="form-label">Data Início</label>
                    <input type="datetime-local" id="dataInicio" name="dataInicio" class="form-input">
                </div>
                <div class="form-group">
                    <label for="dataFim" class="form-label">Data Fim</label>
                    <input type="datetime-local" id="dataFim" name="dataFim" class="form-input">
                </div>
                <div class="form-group flex items-end">
                    <button type="submit" class="btn btn-primary w-full">
                        <i class="fas fa-search mr-2"></i>
                        Buscar
                    </button>
                </div>
            </form>

            <!-- Ações -->
            <div class="flex justify-end mb-4">
                ${dashboardState.isAdmin ? `
                    <button id="exportLogsBtn" class="btn btn-secondary">
                        <i class="fas fa-download mr-2"></i>
                        Exportar Logs
                    </button>
                ` : ''}
            </div>

            <!-- Lista de Logs -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Tipo</th>
                                <th>Ação</th>
                                <th>Usuário</th>
                                <th>Descrição</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody id="logsTableBody">
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <div class="spinner mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="logsPagination" class="flex items-center justify-between px-4 py-3 border-t">
                    <div class="flex items-center">
                        <span class="text-sm text-gray-700">
                            Mostrando <span id="currentPageStart">0</span> - <span id="currentPageEnd">0</span>
                            de <span id="totalLogs">0</span> logs
                        </span>
                    </div>
                    <div class="flex space-x-2">
                        <button id="prevPageBtn" class="btn btn-secondary" disabled>
                            <i class="fas fa-chevron-left mr-2"></i>
                            Anterior
                        </button>
                        <button id="nextPageBtn" class="btn btn-secondary" disabled>
                            Próxima
                            <i class="fas fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Setup dos event listeners
    setupLogsHandlers();
    
    // Carregar logs iniciais
    await loadLogs();
}

// Estado local
const logsState = {
    currentPage: 1,
    totalPages: 1,
    filters: {}
};

// Configurar handlers
function setupLogsHandlers() {
    // Formulário de filtros
    const filterForm = document.getElementById('logsFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            logsState.currentPage = 1;
            await loadLogs();
        });
    }

    // Botão de exportação
    const exportBtn = document.getElementById('exportLogsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLogs);
    }

    // Botões de paginação
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (logsState.currentPage > 1) {
            logsState.currentPage--;
            loadLogs();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        if (logsState.currentPage < logsState.totalPages) {
            logsState.currentPage++;
            loadLogs();
        }
    });
}

// Carregar logs
async function loadLogs() {
    try {
        // Construir query string com filtros e paginação
        const filterForm = document.getElementById('logsFilterForm');
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }

        params.append('pagina', logsState.currentPage);
        params.append('limite', 50);

        const result = await dashboardUtils.fetchAuth(`/logs?${params.toString()}`);
        
        // Atualizar estado
        logsState.totalPages = result.paginas;

        // Atualizar tabela
        const tbody = document.getElementById('logsTableBody');
        
        if (result.logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        Nenhum log encontrado
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = result.logs.map(log => `
                <tr>
                    <td class="px-6 py-4">${new Date(log.timestamp).toLocaleString()}</td>
                    <td class="px-6 py-4">
                        <span class="badge ${getLogTypeBadgeClass(log.tipo)}">
                            ${log.tipo}
                        </span>
                    </td>
                    <td class="px-6 py-4">${log.acao}</td>
                    <td class="px-6 py-4">${log.usuario}</td>
                    <td class="px-6 py-4">${log.descricao}</td>
                    <td class="px-6 py-4">
                        ${log.detalhes ? `
                            <button onclick="showLogDetails(${JSON.stringify(log.detalhes)})" 
                                    class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');
        }

        // Atualizar paginação
        updatePagination(result);

    } catch (error) {
        dashboardUtils.showError('Erro ao carregar logs: ' + error.message);
    }
}

// Atualizar informações de paginação
function updatePagination(result) {
    const start = (logsState.currentPage - 1) * 50 + 1;
    const end = Math.min(start + 49, result.total);

    document.getElementById('currentPageStart').textContent = start;
    document.getElementById('currentPageEnd').textContent = end;
    document.getElementById('totalLogs').textContent = result.total;

    document.getElementById('prevPageBtn').disabled = logsState.currentPage === 1;
    document.getElementById('nextPageBtn').disabled = logsState.currentPage === result.paginas;
}

// Mostrar detalhes do log
function showLogDetails(details) {
    const formattedDetails = JSON.stringify(details, null, 2)
        .replace(/[{}"]/g, '')
        .replace(/,/g, '')
        .replace(/:/g, ': ')
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
        .join('\n');

    const modalContent = `
        <div class="space-y-4">
            <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
${formattedDetails}
            </pre>
            <div class="flex justify-end">
                <button class="btn btn-secondary modal-close">Fechar</button>
            </div>
        </div>
    `;

    dashboardUtils.showModal('Detalhes do Log', modalContent);
}

// Exportar logs
async function exportLogs() {
    try {
        const filterForm = document.getElementById('logsFilterForm');
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }

        const response = await dashboardUtils.fetchAuth(`/logs/exportar?${params.toString()}`);
        
        // Criar arquivo para download
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        dashboardUtils.showSuccess('Logs exportados com sucesso');
    } catch (error) {
        dashboardUtils.showError('Erro ao exportar logs: ' + error.message);
    }
}

// Utilitário para classes do badge de tipo
function getLogTypeBadgeClass(tipo) {
    switch (tipo) {
        case 'usuario':
            return 'badge-info';
        case 'produto':
            return 'badge-success';
        case 'ativo':
            return 'badge-warning';
        case 'descritivo':
            return 'badge-danger';
        default:
            return 'badge-secondary';
    }
}

// Exportar função para o dashboard
window.loadLogsContent = loadLogsContent;
