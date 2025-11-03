-- Remover a coluna 'ativo' de TB_Cliente/tb_cliente (MySQL)
-- Em alguns ambientes, o nome físico pode estar em minúsculas
ALTER TABLE TB_Cliente DROP COLUMN ativo;
ALTER TABLE tb_cliente DROP COLUMN ativo;