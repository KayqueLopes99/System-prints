-- 1. CRIAÇÃO DOS TIPOS ENUM (Padronizados para o Java)
CREATE TYPE categoria_servico_enum AS ENUM ('IMPRESSAO', 'ENCADERNACAO');
CREATE TYPE status_fila_enum AS ENUM ('PENDENTE', 'PRONTO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE orientacao_enum AS ENUM ('RETRATO', 'PAISAGEM');
CREATE TYPE tipo_cor_enum AS ENUM ('PRETO_BRANCO', 'COLORIDO');
CREATE TYPE metodo_pagamento_enum AS ENUM ('PIX', 'DINHEIRO', 'CARTAO');

-- 2. TABELA USUARIO
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    tipo_usuario VARCHAR(50) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    preferencias_notificacao BOOLEAN DEFAULT TRUE,
    matricula VARCHAR(20) UNIQUE,
    curso VARCHAR(100),
    cargo_setor VARCHAR(100),
    codigo_recuperacao VARCHAR(255),
    data_expiracao TIMESTAMP
);

-- 3. TABELA SERVICO
CREATE TABLE servico (
    id_servico SERIAL PRIMARY KEY,
    categoria_servico categoria_servico_enum NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE
);

-- 4. TABELA PEDIDO
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_fila status_fila_enum DEFAULT 'PENDENTE',
    arquivo_url VARCHAR(500),
    nome_arquivo_original VARCHAR(255),
    tamanho_arquivo_mb DECIMAL(10,2),
    total_paginas_arquivo INT,
    valor_total DECIMAL(10,2),
    dados_arquivo BYTEA
    
);

-- 5. TABELA ITEM_PEDIDO
CREATE TABLE item_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INT REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    tipo_servico VARCHAR(50) NOT NULL, 
    quantidade INT NOT NULL DEFAULT 1,
    tamanho_papel VARCHAR(20),
    orientacao orientacao_enum,
    frente_verso BOOLEAN DEFAULT FALSE,
    tipo_cor tipo_cor_enum
);

-- 6. TABELA PAGAMENTO
CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT UNIQUE REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    metodo metodo_pagamento_enum NOT NULL
);

-- 7. TABELA NOTIFICACAO
CREATE TABLE notificacao (
    id_notificacao SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    titulo VARCHAR(100),
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA CONFIGURACAO_SISTEMA E HORARIOS
CREATE TABLE configuracao_sistema (
    id_config SERIAL PRIMARY KEY,
    setor_aberto BOOLEAN DEFAULT TRUE,
    mensagem_aviso TEXT
);

CREATE TABLE horario_funcionamento (
    id_horario SERIAL PRIMARY KEY,
    id_config INT NOT NULL REFERENCES configuracao_sistema(id_config) ON DELETE CASCADE,
    dia_semana VARCHAR(50) NOT NULL,
    manha VARCHAR(50) DEFAULT 'Fechado',
    tarde VARCHAR(50) DEFAULT 'Fechado',
    noite VARCHAR(50) DEFAULT 'Fechado'
);

-- =========================================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =========================================================================

-- Configuração inicial do sistema
INSERT INTO configuracao_sistema (setor_aberto, mensagem_aviso) 
VALUES (true, 'Bem-vindo ao setor de impressão!');

-- Horários de funcionamento
INSERT INTO horario_funcionamento (id_config, dia_semana, manha, tarde, noite) VALUES 
(1, 'Segunda-feira', '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Terça-feira',   '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Quarta-feira',  '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Quinta-feira',  '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Sexta-feira',   '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Sábado',        'Fechado',       'Fechado',       'Fechado'),
(1, 'Domingo',       'Fechado',       'Fechado',       'Fechado');

-- Preços base dos serviços (IDs 1 a 4 são fixos no Service)
INSERT INTO servico (categoria_servico, preco_unitario, disponivel) VALUES 
('IMPRESSAO', 0.15, true),    -- ID 1: P&B
('IMPRESSAO', 1.00, true),    -- ID 2: Colorida
('ENCADERNACAO', 5.00, true), -- ID 3: Valor Base
('ENCADERNACAO', 0.15, true); -- ID 4: Adicional Folha

-- Inserindo o Administrador padrão
INSERT INTO usuario (tipo_usuario, nome_completo, email, senha, cargo_setor) 
VALUES ('ADMINISTRADOR', 'Administrador Xerox', 'admin@alunos.ufersa.edu.br', 'admin123', 'Gerente de Setor');