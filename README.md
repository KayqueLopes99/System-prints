# Sistema de Gerenciamento de Impressões 

Este é um sistema desenvolvido para facilitar a solicitação, acompanhamento e administração de serviços de impressão e encadernação. O projeto integra uma interface moderna em React com um back-end em Spring Boot e armazenamento seguro de arquivos em PostgreSQL.

## Principais Funcionalidades
*   **Perfis de Acesso**: Interfaces distintas para **Estudantes** (solicitação e acompanhamento) e **Administradores** (gestão de fila e financeiro).
*   **Upload e Configuração de PDF**: Envio remoto de arquivos com seleção de parâmetros como cor (P&B/Colorido), orientação, frente e verso e quantidade de cópias.
*   **Cálculo Automático e Encadernação**: Cálculo de preço em tempo real, suportando serviços de encadernação com valor base e adicional por folha.
*   **Gestão de Fila em Tempo Real**: Monitoramento de status (PENDENTE, PRONTO, CONCLUIDO, CANCELADO) e estimativa de tempo de espera.
*   **Notificações Instantâneas**: Alertas automáticos para o aluno quando o pedido está pronto para retirada.
*   **Dashboard Administrativo**: Painel para o gestor com relatórios de faturamento e estatísticas de uso do setor.
*   **Segurança de Documentos**: Armazenamento binário de arquivos (`BYTEA`) no banco de dados, garantindo que o arquivo original nunca se perca.

## Tecnologias Utilizadas

*   **Front-End**: React.js, Lucide React (ícones), Axios (integração).
*   **Back-End**: Java 21, Spring Boot 3.x, Spring Data JPA.
*   **Banco de Dados**: PostgreSQL com tipos enumerados (Enums).

## Bibliotecas Adicionais Necessárias

Para o funcionamento correto da contagem de páginas e dos relatórios, instale as seguintes dependências na pasta do **Front-End**:

### 1. Processamento de PDF (pdf-lib)
Utilizada para contar automaticamente as páginas do arquivo enviado pelo aluno.
```bash
npm install pdf-lib
```

### 2. Relatórios Administrativos (jsPDF)
Utilizada para gerar os relatórios de faturamento e estatísticas no painel do administrador.
```bash
npm install jspdf jspdf-autotable
```

## Configuração do Banco de Dados

1.  Crie um banco de dados no PostgreSQL chamado: `sistema_impressoes`.
2.  Execute o script SQL fornecido para criar as tabelas e tipos `ENUM`.
3.  **Importante**: Certifique-se de que a coluna `dados_arquivo BYTEA` na tabela `pedido` foi criada, pois ela armazena o arquivo físico para o administrador baixar.

## Como Executar o Projeto

### 1. Rodando o Back-End (Spring Boot)
1.  Configure suas credenciais em `src/main/resources/application.properties`.
2.  Execute o projeto através da sua IDE ou comando Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(O servidor rodará em `https://backend-impressoes-ufersa.onrender.com`)*

### 2. Rodando o Front-End (React)
1.  Navegue até a pasta do frontend:
    ```bash
    npm install
    npm run dev
    ```
    *(O site abrirá geralmente em `http://localhost:5173`)*

---





#### EMERGENCIA: Durante o desenvolvimento local, a URL da API deve ser ajustada para `http://localhost:8080` para garantir que as requisições sejam direcionadas corretamente ao servidor Spring Boot rodando localmente. Para produção, mantenha a URL como


https://backend-impressoes-ufersa.onrender.com para produção, http://localhost:8080 para desenvolvimento local. Certifique-se de ajustar a URL da API no arquivo `src/apiConfig.js` conforme necessário durante o desenvolvimento.