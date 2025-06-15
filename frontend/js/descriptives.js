// Função para carregar o conteúdo de descritivos
async function loadDescriptiveContent(contentDiv) {
    try {
        const descriptives = await dashboardUtils.fetchAuth('/descriptives');
        
        contentDiv.innerHTML = `
            <div class="mb-4">
                <button onclick="showAddDescriptiveModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Adicionar Descritivo
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${descriptives.map(desc => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">${desc.nome}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Ativo
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button onclick="deleteDescriptive(${desc.id})" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        dashboardUtils.showError('Erro ao carregar descritivos: ' + error.message);
    }
}

// Modal para adicionar descritivo
function showAddDescriptiveModal() {
    const content = `
        <form id="addDescriptiveForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Nome do Descritivo</label>
                <input type="text" name="nome" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ex: HD, SSD, Memoria Ram, etc">
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" onclick="dashboardUtils.showModal(null)" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Adicionar</button>
            </div>
        </form>
    `;

    dashboardUtils.showModal('Adicionar Descritivo', content);

    document.getElementById('addDescriptiveForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await dashboardUtils.fetchAuth('/descriptives', {
                method: 'POST',
                body: JSON.stringify({
                    nome: formData.get('nome')
                })
            });
            
            dashboardUtils.showSuccess('Descritivo adicionado com sucesso');
            dashboardUtils.showModal(null);
            loadDescriptiveContent(document.getElementById('descriptiveContent'));
        } catch (error) {
            dashboardUtils.showError('Erro ao adicionar descritivo: ' + error.message);
        }
    });
}

// Função para excluir descritivo
async function deleteDescriptive(descriptiveId) {
    if (!confirm('Tem certeza que deseja excluir este descritivo?')) {
        return;
    }

    try {
        await dashboardUtils.fetchAuth(`/descriptives/${descriptiveId}`, {
            method: 'DELETE'
        });
        
        dashboardUtils.showSuccess('Descritivo excluído com sucesso');
        loadDescriptiveContent(document.getElementById('descriptiveContent'));
    } catch (error) {
        dashboardUtils.showError('Erro ao excluir descritivo: ' + error.message);
    }
}

// Exportar funções para o dashboard
window.loadDescriptiveContent = loadDescriptiveContent;
window.showAddDescriptiveModal = showAddDescriptiveModal;
window.deleteDescriptive = deleteDescriptive;
