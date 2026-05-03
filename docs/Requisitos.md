
### 1. Requisitos Funcionais (RF)
*Ações e funcionalidades que o sistema deve executar para os usuários.*

* **RF01 - Cadastro de Usuários:** O sistema deve permitir a criação de contas para estudantes, professores e atendentes, coletando dados como nome, matrícula, e-mail e curso.
* **RF02 - Autenticação e Recuperação (Login/Logout):** O sistema deve autenticar usuários utilizando credenciais acadêmicas e oferecer a opção de redefinição de senha via e-mail.
* **RF03 - Gestão de Perfil e Preferências:** O sistema deve permitir que o usuário visualize e atualize suas informações de contato e ajuste configurações do sistema (ex: ativar notificações).
* **RF04 - Controle de Acesso:** O sistema deve ter interfaces diferentes baseadas no perfil do usuário (visão do cliente vs. painel da atendente).
* **RF05 - Envio Remoto de Arquivos:** O sistema deve permitir o upload de arquivos (PDF, DOCX, etc.) de forma remota, exibindo o tamanho do arquivo e a quantidade de páginas identificadas.
* **RF06 - Configuração de Impressão e Serviços:** O sistema deve permitir que o estudante selecione parâmetros precisos (frente e verso, orientação, tipo de cor, tamanho do papel) diretamente na plataforma.
* **RF07 - Catálogo Expandido de Serviços:** O sistema deve exibir os serviços oferecidos (impressão, encadernação, plotagem, digitalização) e seus respectivos custos unitários.
* **RF08 - Acompanhamento de Status:** O sistema deve mostrar em que etapa o pedido está (ex: pendente, na fila, imprimindo, pronto, cancelado).
* **RF09 - Estimativa de Fila e Tempo:** O sistema deve informar ao estudante a sua posição atual na fila e uma estimativa de tempo para a conclusão do serviço.
* **RF10 - Cancelamento de Pedido:** O sistema deve permitir que o usuário cancele um pedido caso este ainda esteja com o status "Pendente" ou "Na Fila".
* **RF11 - Central de Notificações:** O sistema deve possuir uma aba para armazenar o histórico de alertas e notificar o usuário quando o material estiver pronto para retirada.
* **RF12 - Gestão de Fila (Painel da Atendente):** O sistema deve organizar as solicitações recebidas em uma fila virtual sequencial para a administração do setor.
* **RF13 - Gestão de Pagamentos:** O sistema deve registrar o método de pagamento escolhido (ex: PIX, Dinheiro) e o status da cobrança de cada pedido.
* **RF14 - Dashboard de Estatísticas do Usuário:** O sistema deve apresentar um resumo do histórico do aluno, exibindo o total de pedidos realizados, páginas impressas e o valor total já gasto no setor.
* **RF15 - Exibição de Horários e Status do Setor:** O sistema deve exibir um quadro com os horários de funcionamento e indicar em tempo real se o setor está "Aberto" ou "Fechado".

---

### 2. Requisitos Não Funcionais (RNF)
*Critérios de qualidade, segurança e performance do sistema.*

* **RNF01 - Usabilidade e Prevenção de Erros:** A interface deve ser altamente intuitiva e fornecer avisos/confirmações antes do envio do pedido, reduzindo a chance de o aluno errar a configuração da impressão.
* **RNF02 - Feedback em Tempo Real:** O sistema deve informar instantaneamente o sucesso ou falha de ações (ex: upload concluído, senha incorreta).
* **RNF03 - Disponibilidade Multiplataforma:** O sistema deve funcionar via web (navegador) para ser acessado de qualquer dispositivo pessoal (celulares e computadores).
* **RNF04 - Segurança e Privacidade de Dados:** O sistema deve criptografar senhas (hash) e proteger os documentos enviados e os dados pessoais dos alunos, seguindo as diretrizes da LGPD.
* **RNF05 - Desempenho e Escalabilidade:** O sistema deve suportar múltiplos uploads de arquivos e usuários simultâneos sem apresentar lentidão, processando arquivos de até um tamanho máximo predefinido (ex: 50MB).

---
