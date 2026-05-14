# Documento de Requisitos - Sistema de Gestão de Impressões (KLIJ)

### 1. Requisitos Funcionais (RF)
*Funcionalidades reais implementadas no sistema.*

*   **RF01 - Cadastro e Perfis de Usuário:** O sistema permite a criação de contas para **Estudantes** (com matrícula e curso) e **Administradores** (com cargo/setor)[cite: 13].
*   **RF02 - Autenticação Segura:** O sistema autentica usuários via e-mail e senha, gerenciando sessões distintas para a visão do cliente e o painel administrativo[cite: 13].
*   **RF03 - Recuperação de Senha:** O sistema oferece fluxo de redefinição de senha utilizando códigos de verificação e expiração por tempo[cite: 13].
*   **RF04 - Gestão de Perfil:** O usuário pode visualizar seus dados e atualizar preferências, como o recebimento de notificações[cite: 13].
*   **RF05 - Upload de Arquivos PDF:** O sistema permite o envio de arquivos no formato **PDF**, armazenando os dados brutos (`BYTEA`) diretamente no banco de dados para segurança e integridade.
*   **RF06 - Configuração Personalizada:** O estudante define parâmetros de impressão como: quantidade de cópias, tamanho do papel (A4), orientação (Retrato/Paisagem), cor (P&B/Colorido) e frente e verso[cite: 13].
*   **RF07 - Catálogo de Serviços e Preços:** O sistema gerencia dois serviços principais: **Impressão** (P&B e Colorida) e **Encadernação** (valor base + adicional por folha)[cite: 13].
*   **RF08 - Monitoramento de Status da Fila:** O sistema exibe o progresso do pedido através dos status: **PENDENTE, PRONTO, CONCLUIDO e CANCELADO**[cite: 13].
*   **RF09 - Estimativa de Tempo e Ocupação:** O sistema calcula e informa a posição na fila, o número de pessoas aguardando e o tempo estimado para retirada[cite: 13].
*   **RF10 - Regra de Cancelamento:** O estudante pode cancelar um pedido de forma autônoma apenas dentro do prazo de **5 minutos** após a criação, desde que ainda não tenha sido processado.
*   **RF11 - Central de Notificações:** O sistema armazena alertas e notifica o usuário em tempo real quando o administrador altera o status para "Pronto para Retirada"[cite: 13].
*   **RF12 - Gestão Administrativa da Fila:** O painel do administrador permite visualizar a fila global, filtrar pedidos por nome/ID e baixar o arquivo original para impressão[cite: 13].
*   **RF13 - Métodos de Pagamento:** O sistema registra a intenção de pagamento nos métodos: **PIX, Dinheiro ou Cartão**, para validação no balcão[cite: 13].
*   **RF14 - Histórico e Estatísticas do Estudante:** O aluno possui um dashboard com o total de pedidos realizados, páginas acumuladas e valor total gasto no setor[cite: 13].
*   **RF15 - Status do Setor e Horários:** O sistema exibe se o setor está "Aberto" ou "Fechado" e apresenta o quadro completo de horários de funcionamento por turno (Manhã, Tarde e Noite)[cite: 13].
*   **RF16 - Relatórios e Inteligência (Admin):** O administrador pode gerar relatórios de faturamento mensal e visualizar estatísticas de uso do setor[cite: 12, 13].

---

### 2. Requisitos Não Funcionais (RNF)
*Qualidade, performance e restrições técnicas.*

*   **RNF01 - Armazenamento Binário:** Documentos enviados não são salvos em pastas locais, mas como objetos binários (`BYTEA`) no PostgreSQL para garantir que o Admin sempre tenha acesso ao arquivo original[cite: 13].
*   **RNF02 - Consistência de Dados (Enums):** O sistema utiliza tipos enumerados (Enums) tanto no Java quanto no Banco de Dados para garantir que nenhum pedido assuma um status inválido[cite: 13].
*   **RNF03 - Responsividade Mobile-First:** A interface React foi projetada para funcionar perfeitamente em dispositivos móveis, facilitando o envio de arquivos por estudantes em deslocamento[cite: 13].
*   **RNF04 - Segurança de Acesso:** O sistema protege rotas sensíveis, impedindo que um estudante acesse o painel administrativo ou visualize arquivos de outros usuários[cite: 13].
*   **RNF05 - Comunicação Multipart:** O envio de pedidos utiliza o protocolo `multipart/form-data`, permitindo o envio simultâneo de metadados (JSON) e arquivos físicos (Blob).

