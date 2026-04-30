-- SETAR isso no bancode dados!!!!!!!!!!!

-- 1. CRIAÇÃO DOS TIPOS ENUM (Ajustados para o padrão do Java/Spring Boot)
CREATE TYPE categoria_servico_enum AS ENUM ('IMPRESSAO', 'ENCADERNACAO');
CREATE TYPE status_fila_enum AS ENUM ('PENDENTE', 'PRONTO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE orientacao_enum AS ENUM ('RETRATO', 'PAISAGEM');
CREATE TYPE tipo_cor_enum AS ENUM ('PRETO_BRANCO', 'COLORIDO');
CREATE TYPE metodo_pagamento_enum AS ENUM ('PIX', 'DINHEIRO', 'CARTAO'); -- 👉 ADICIONADO

-- 2. TABELA USUARIO (Contendo os campos de Estudante e Administrador - Estratégia de Herança)
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    tipo_usuario VARCHAR(50) NOT NULL, -- 👉 ADICIONADO: Obrigatório para a herança do Java funcionar
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    preferencias_notificacao BOOLEAN DEFAULT TRUE,
    
    matricula VARCHAR(20) UNIQUE,
    curso VARCHAR(100),

    cargo_setor VARCHAR(100) 
);

ALTER TABLE usuario ADD COLUMN codigo_recuperacao VARCHAR(255);
ALTER TABLE usuario ADD COLUMN data_expiracao TIMESTAMP;

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
    status_fila status_fila_enum DEFAULT 'PENDENTE', -- 👉 Ajustado para maiúsculo
    arquivo_url VARCHAR(500),
    nome_arquivo_original VARCHAR(255), -- 👉 ADICIONADO: Para mostrar o nome bonito na tela do React
    tamanho_arquivo_mb DECIMAL(10,2),
    total_paginas_arquivo INT,
    valor_total DECIMAL(10,2)
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
    metodo metodo_pagamento_enum NOT NULL -- 👉 AJUSTADO para usar o ENUM
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

-- 8. TABELA CONFIGURACAO_SISTEMA
CREATE TABLE configuracao_sistema (
    id_config SERIAL PRIMARY KEY,
    setor_aberto BOOLEAN DEFAULT TRUE,
    mensagem_aviso TEXT
);

-- 9. TABELA HORARIO_FUNCIONAMENTO
CREATE TABLE horario_funcionamento (
    id_horario SERIAL PRIMARY KEY,
    id_config INT NOT NULL REFERENCES configuracao_sistema(id_config) ON DELETE CASCADE,
    dia_semana VARCHAR(50) NOT NULL,
    manha VARCHAR(50) DEFAULT 'Fechado',
    tarde VARCHAR(50) DEFAULT 'Fechado',
    noite VARCHAR(50) DEFAULT 'Fechado'
);

-- =========================================================================
-- 3. INSERINDO DADOS DO SISTEMA E HORÁRIOS
-- =========================================================================
INSERT INTO configuracao_sistema (setor_aberto, mensagem_aviso) 
VALUES (true, 'Bem-vindo ao setor de impressão!');

INSERT INTO horario_funcionamento (id_config, dia_semana, manha, tarde, noite) VALUES 
(1, 'Segunda-feira', '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Terça-feira',   '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Quarta-feira',  '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Quinta-feira',  '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Sexta-feira',   '08:00 - 12:00', '13:30 - 18:00', '19:00 - 22:00'),
(1, 'Sábado',        'Fechado',       'Fechado',       'Fechado'),
(1, 'Domingo',       'Fechado',       'Fechado',       'Fechado');