// Função para carregar o conteúdo da aba de ativos
async function loadAssetsContent(containerDiv) {
    // Verificar se é admin para algumas funcionalidades
    const isAdmin = dashboardState.isAdmin;

    containerDiv.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-4">Cadastro de Ativos</h2>

            <!-- Tabs de Importação e Cadastro Manual -->
            <div class="mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <button class="asset-tab-button mr-4 py-2 px-4 border-b-2 font-medium text-sm" data-tab="import">
                            <i class="fas fa-file-import mr-2"></i>
                            Importar CSV
                        </button>
                        <button class="asset-tab-button py-2 px-4 border-b-2 font-medium text-sm" data-tab="manual">
                            <i class="fas fa-edit mr-2"></i>
                            Cadastro Manual
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Conteúdo da Importação CSV -->
            <div id="importContent" class="asset-tab-content">
                <div class="max-w-xl mx-auto">
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-info-circle text-blue-400"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-blue-700">
                                    O arquivo CSV deve conter as seguintes colunas:
                                    <br>
                                    <code>nome,tipo,status,observacoes</code>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form id="importForm" class="space-y-4">
                        <div class="form-group">
                            <label for="csvFile" class="form-label">Arquivo CSV</label>
                            <input type="file" 
                                   id="csvFile" 
                                   name="arquivo" 
                                   accept=".csv"
                                   class="form-input"
                                   required>
                        </div>
                        <button type="submit" class="btn btn-primary w-full" ${!isAdmin ? 'disabled' : ''}>
                            <i class="fas fa-upload mr-2"></i>
                            Importar Arquivo
                        </button>
                    </form>

                    <!-- Resultado da Importação -->
                    <div id="importResult" class="mt-6 hidden">
                        <h3 class="font-semibold mb-2">Resultado da Importação:</h3>
                        <div id="importResultContent" class="space-y-2"></div>
                    </div>
                </div>
            </div>

            <!-- Conteúdo do Cadastro Manual -->
            <div id="manualContent" class="asset-tab-content hidden">
                <div class="max-w-xl mx-auto">
                    <form id="manualForm" class="space-y-6">
                        <div class="form-group">
                            <label for="nome" class="form-label">Nome do Ativo *</label>
                            <input type="text" id="nome" name="nome" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="tipo" class="form-label">Tipo *</label>
                            <select id="tipo" name="tipo" class="form-input" required>
                                <option value="">Selecione um tipo</option>
                                <option value="computador">Computador</option>
                                <option value="notebook">Notebook</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="status" class="form-label">Status</label>
                            <select id="status" name="status" class="form-input">
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="manutenção">Manutenção</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="observacoes" class="form-label">Observações</label>
                            <textarea id="observacoes" name="observacoes" class="form-input" rows="3"></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button type="button" id="clearManualFormBtn" class="btn btn-secondary">
                                <i class="fas fa-eraser mr-2"></i>
                                Limpar
                            </button>
                            <button type="submit" class="btn btn-primary" ${!isAdmin ? 'disabled' : ''}>
                                <i class="fas fa-save mr-2"></i>
                                Cadastrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Lista de Ativos -->
            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4">Ativos Cadastrados</h3>
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Data Registro</th>
                                <th>Observações</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="assetsTableBody">
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <div class="spinner mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Setup dos event listeners e carregar dados iniciais
    setupAssetHandlers();
    await loadAssets();
}

// Configurar handlers
function setupAssetHandlers() {
    // Tabs
    const tabButtons = document.querySelectorAll('.asset-tab-button');
    const tabContents = document.querySelectorAll('.asset-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            // Atualizar botões
            tabButtons.forEach(btn => {
                if (btn.dataset.tab === tab) {
                    btn.classList.add('border-blue-500', 'text-blue-600');
                } else {
                    btn.classList.remove('border-blue-500', 'text-blue-600');
                }
            });

            // Mostrar conteúdo
            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== `${tab}Content`);
            });
        });
    });

    // Ativar primeira tab
    tabButtons[0].click();

    // Form de Importação
    const importForm = document.getElementById('importForm');
    if (importForm) {
        importForm.addEventListener('submit', handleImport);
    }

    // Form Manual
    const manualForm = document.getElementById('manualForm');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualRegistration);
        
        // Botão Limpar
        document.getElementById('clearManualFormBtn').addEventListener('click', () => {
            manualForm.reset();
        });
    }
}

// Carregar lista de ativos
async function loadAssets() {
    try {
        const assets = await dashboardUtils.fetchAuth('/assets');
        const tbody = document.getElementById('assetsTableBody');

        if (assets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        Nenhum ativo cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = assets.map(asset => `
            <tr>
                <td class="px-6 py-4">${asset.nome}</td>
                <td class="px-6 py-4">${asset.tipo}</td>
                <td class="px-6 py-4">
                    <span class="badge ${getStatusBadgeClass(asset.status)}">
                        ${asset.status}
                    </span>
                </td>
                <td class="px-6 py-4">
                    ${new Date(asset.dataRegistro).toLocaleString()}
                </td>
                <td class="px-6 py-4">
                    ${asset.observacoes || '-'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="updateAssetStatus('${asset.id}')" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        ${dashboardState.isAdmin ? `
                            <button onclick="deleteAsset('${asset.id}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        dashboardUtils.showError('Erro ao carregar ativos: ' + error.message);
    }
}

// Handler da importação CSV
async function handleImport(e) {
    e.preventDefault();

    const formData = new FormData();
    const file = document.getElementById('csvFile').files[0];
    formData.append('arquivo', file);

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Importando...';

    try {
        const result = await dashboardUtils.fetchAuth('/assets/importar', {
            method: 'POST',
            body: formData,
            headers: {} // Remover Content-Type para FormData
        });

        // Mostrar resultado
        const resultDiv = document.getElementById('importResult');
        const resultContent = document.getElementById('importResultContent');
        
        resultContent.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-400 p-4">
                <p class="text-green-700">Importação concluída com sucesso!</p>
                <ul class="mt-2 text-sm">
                    <li>Registros processados: ${result.totalProcessado}</li>
                    <li>Sucesso: ${result.sucesso}</li>
                    <li>Ignorados: ${result.ignorados}</li>
                    <li>Erros: ${result.erros}</li>
                </ul>
            </div>
        `;
        
        resultDiv.classList.remove('hidden');
        e.target.reset();
        await loadAssets();

    } catch (error) {
        dashboardUtils.showError('Erro na importação: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Handler do cadastro manual
async function handleManualRegistration(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cadastrando...';

    try {
        const formData = {
            nome: e.target.nome.value,
            tipo: e.target.tipo.value,
            status: e.target.status.value,
            observacoes: e.target.observacoes.value
        };

        await dashboardUtils.fetchAuth('/assets', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        dashboardUtils.showSuccess('Ativo cadastrado com sucesso');
        e.target.reset();
        await loadAssets();

    } catch (error) {
        dashboardUtils.showError('Erro ao cadastrar ativo: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Atualizar status do ativo
async function updateAssetStatus(assetId) {
    const modalContent = `
        <form id="updateStatusForm" class="space-y-4">
            <div class="form-group">
                <label for="newStatus" class="form-label">Novo Status</label>
                <select id="newStatus" name="newStatus" class="form-input" required>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="manutenção">Manutenção</option>
                </select>
            </div>
            <div class="form-group">
                <label for="statusObservacao" class="form-label">Observação</label>
                <textarea id="statusObservacao" name="statusObservacao" class="form-input" rows="3"></textarea>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                <button type="submit" class="btn btn-primary">Atualizar</button>
            </div>
        </form>
    `;

    dashboardUtils.showModal('Atualizar Status', modalContent);

    document.getElementById('updateStatusForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            await dashboardUtils.fetchAuth(`/assets/${assetId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: e.target.newStatus.value,
                    observacao: e.target.statusObservacao.value
                })
            });

            dashboardUtils.showSuccess('Status atualizado com sucesso');
            document.getElementById('modalContainer').classList.add('hidden');
            await loadAssets();
        } catch (error) {
            dashboardUtils.showError('Erro ao atualizar status: ' + error.message);
        }
    });
}

// Excluir ativo
async function deleteAsset(assetId) {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
        try {
            await dashboardUtils.fetchAuth(`/assets/${assetId}`, {
                method: 'DELETE'
            });

            dashboardUtils.showSuccess('Ativo excluído com sucesso');
            await loadAssets();
        } catch (error) {
            dashboardUtils.showError('Erro ao excluir ativo: ' + error.message);
        }
    }
}

// Utilitário para classes do badge de status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'ativo':
            return 'badge-success';
        case 'inativo':
            return 'badge-danger';
        case 'manutenção':
            return 'badge-warning';
        default:
            return 'badge-info';
    }
}

// Exportar funções para o dashboard
window.loadAssetsContent = loadAssetsContent;
window.updateAssetStatus = updateAssetStatus;
window.deleteAsset = deleteAsset;
