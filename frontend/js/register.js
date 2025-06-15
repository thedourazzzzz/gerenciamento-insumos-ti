// Função para carregar o conteúdo da aba de cadastro de produtos
async function loadRegisterContent(containerDiv) {
    // Verificar se é admin
    if (!dashboardState.isAdmin) {
        containerDiv.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">Acesso restrito a administradores</p>
            </div>
        `;
        return;
    }

    containerDiv.innerHTML = `
        <div class="mb-6">
            <h2 class="text-xl font-semibold mb-4">Cadastrar Produto</h2>

            <!-- Formulário de Autenticação Admin -->
            <div id="adminAuthForm" class="max-w-md mx-auto">
                <p class="text-gray-600 mb-4">
                    Por favor, confirme suas credenciais de administrador para continuar.
                </p>
                <form id="adminAuthFormContent" class="space-y-4">
                    <div class="form-group">
                        <label for="adminUsername" class="form-label">Usuário Admin</label>
                        <input type="text" id="adminUsername" name="adminUsername" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="adminPassword" class="form-label">Senha Admin</label>
                        <input type="password" id="adminPassword" name="adminPassword" class="form-input" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full">
                        Verificar Credenciais
                    </button>
                </form>
            </div>

            <!-- Formulário de Cadastro (inicialmente oculto) -->
            <div id="registerForm" class="hidden">
                <form id="productRegisterForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label for="tipo" class="form-label">Tipo *</label>
                            <select id="tipo" name="tipo" class="form-input" required>
                                <option value="">Selecione um tipo</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="marca" class="form-label">Marca *</label>
                            <input type="text" id="marca" name="marca" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="modelo" class="form-label">Modelo *</label>
                            <input type="text" id="modelo" name="modelo" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="codigoBarras" class="form-label">Código de Barras *</label>
                            <input type="text" id="codigoBarras" name="codigoBarras" class="form-input" required>
                        </div>
                        <div class="form-group md:col-span-2">
                            <label for="descricao" class="form-label">Descrição *</label>
                            <textarea id="descricao" name="descricao" class="form-input" rows="3" required></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" id="clearFormBtn" class="btn btn-secondary">
                            <i class="fas fa-eraser mr-2"></i>
                            Limpar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            Cadastrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Setup dos event listeners
    setupRegisterFormHandlers();
}

// Configurar handlers dos formulários
function setupRegisterFormHandlers() {
    // Handler do formulário de autenticação admin
    const adminAuthForm = document.getElementById('adminAuthFormContent');
    adminAuthForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const response = await dashboardUtils.fetchAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: e.target.adminUsername.value,
                    password: e.target.adminPassword.value
                })
            });

            if (response.user.role !== 'admin') {
                throw new Error('Credenciais de administrador necessárias');
            }

            // Mostrar formulário de cadastro
            document.getElementById('adminAuthForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');

            // Carregar tipos de produtos
            await loadProductTypes();

        } catch (error) {
            dashboardUtils.showError('Erro na autenticação: ' + error.message);
        }
    });

    // Handler do formulário de cadastro de produto
    const productRegisterForm = document.getElementById('productRegisterForm');
    if (productRegisterForm) {
        productRegisterForm.addEventListener('submit', handleProductRegistration);

        // Handler do botão limpar
        document.getElementById('clearFormBtn').addEventListener('click', () => {
            productRegisterForm.reset();
        });
    }
}

// Carregar tipos de produtos no select
async function loadProductTypes() {
    try {
        const tipos = await dashboardUtils.fetchAuth('/descriptives');
        const tipoSelect = document.getElementById('tipo');
        
        tipoSelect.innerHTML = '<option value="">Selecione um tipo</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.nome;
            option.textContent = tipo.nome;
            tipoSelect.appendChild(option);
        });
    } catch (error) {
        dashboardUtils.showError('Erro ao carregar tipos de produtos: ' + error.message);
    }
}

// Handler do formulário de cadastro de produto
async function handleProductRegistration(e) {
    e.preventDefault();

    // Desabilitar botão durante o cadastro
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Cadastrando...';

    try {
        // Verificar se código de barras já existe
        const codigoBarras = e.target.codigoBarras.value;
        const checkResponse = await dashboardUtils.fetchAuth(`/products/codigo/${codigoBarras}`);
        
        if (checkResponse) {
            throw new Error('Já existe um produto com este código de barras');
        }

        // Cadastrar produto
        const formData = {
            tipo: e.target.tipo.value,
            marca: e.target.marca.value,
            modelo: e.target.modelo.value,
            descricao: e.target.descricao.value,
            codigoBarras: codigoBarras
        };

        await dashboardUtils.fetchAuth('/products', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        dashboardUtils.showSuccess('Produto cadastrado com sucesso');
        e.target.reset();

    } catch (error) {
        dashboardUtils.showError('Erro ao cadastrar produto: ' + error.message);
    } finally {
        // Restaurar botão
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Exportar função para o dashboard
window.loadRegisterContent = loadRegisterContent;
