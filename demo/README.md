# Bibliotech — API e Front-End (Admin) 

Este projeto contém:
- API de biblioteca (Spring Boot), com JPA/Hibernate, validações (Jakarta Validation), autenticação via JWT e tratamento global de erros.
- Front-end estático servido por Spring Boot em `src/main/resources/static` (páginas e assets), incluindo o painel de administração em `/pages/admin.html`.

Os endpoints seguem organização por domínio (livros, compras/aluguéis, clientes, avaliações, funcionários e admins). O front-end consome a API via `window.__API_BASE_URL__`, definida dinamicamente como `origin + '/api'`.

## Visão Geral
- `controller`: expõe endpoints REST e converte entidades em DTOs.
- `service`: concentra regras de negócio e validações.
- `repository`: interfaces JPA para acesso ao banco com consultas derivadas.
- `model`: entidades JPA e enums do domínio.
- `security`: utilitários de JWT e filtro de autenticação.
- `config`: configurações de CORS, segurança e carga inicial de dados.
- `exception`: exceções de domínio e handler global.
- `dto` e `mapper`: objetos de transferência e conversor central.

## Estrutura de Pastas
- `src/main/java/com/biblioteca/config`
  - `SecurityConfig.java`: configura autenticação/autorização, filtros e regras de acesso.
  - `CorsConfig.java`: habilita CORS para origens configuradas em `application.properties`.
  - `DataSeeder.java`: popula dados iniciais (se aplicável).
- `src/main/java/com/biblioteca/controller`
  - `LivroController.java`: CRUD de livros e buscas (título, autor, gênero).
  - `CompraController.java`: CRUD e operações de compras/aluguéis, mudança de status.
  - `ClienteController.java`: CRUD de clientes e buscas.
  - `AvaliacaoController.java`: CRUD de avaliações e listagens por cliente/livro.
  - `FuncionarioController.java`: CRUD de funcionários.
  - `AdminController.java`: CRUD de administradores.
  - `AuthController.java`: login, registro e verificação de autenticação.
- `src/main/java/com/biblioteca/service`
  - `LivroService.java`: regras para criação/atualização, validações de livro.
  - `CompraService.java`: regras de compra/aluguel, prevenção de duplicidades, transições de status.
  - `ClienteService.java`: validações de CPF/email, cadastro e atualização.
  - `AvaliacaoService.java`: validações (só avalia quem comprou/alugou), cálculo de média.
  - `FuncionarioService.java`: regras e validações de funcionário.
  - `AdminService.java`: regras e validações de admin.
  - `AuthService.java`: autenticação, criptografia de senha e geração de JWT.
- `src/main/java/com/biblioteca/repository`
  - `LivroRepository.java`: consultas por título/autor (case-insensitive) e gênero.
  - `CompraRepository.java`: por cliente, por status, existência de ativo, contagem por livro.
  - `ClienteRepository.java`: busca por CPF e email.
  - `AvaliacaoRepository.java`: por livro, por cliente e contagem por livro.
  - `FuncionarioRepository.java`: busca por email.
  - `AdminRepository.java`: busca por email.
  - `UserRepository.java`: suporte à autenticação (se usado pelo `AuthService`).
- `src/main/java/com/biblioteca/model`
  - `Livro`, `Cliente`, `Funcionario`, `Admin`, `Avaliacao`, `Compra`, `Pessoa`, `User`: entidades JPA.
  - `TipoCompra.java`: enum com tipos (ex.: COMPRA, ALUGUEL).
- `src/main/java/com/biblioteca/security`
  - `JwtUtil.java`: gera e valida tokens JWT.
  - `JwtAuthenticationFilter.java`: extrai e valida JWT nas requisições.
- `src/main/java/com/biblioteca/exception`
  - `GlobalExceptionHandler.java`: traduz exceções em respostas HTTP consistentes.
  - `BusinessException.java`, `ResourceNotFoundException.java`, `ErrorResponse.java`: suporte a erros de domínio.
- `src/main/java/com/biblioteca/dto`
  - `LivroDTO`, `CompraDTO`, `ClienteDTO`, `AvaliacaoDTO`, `LoginRequest`, `LoginResponse`.
- `src/main/java/com/biblioteca/mapper`
  - `DtoMapper.java`: conversões entre entidades e DTOs.
- `src/main/resources`
  - `application.properties`: configuração de datasource, JPA, JWT, CORS e estáticos.

## Interação entre Camadas
- Controllers chamam Services e retornam DTOs; não possuem lógica de negócio.
- Services validam regras (ex.: impedir aluguel/compra duplicada ativa, calcular média de avaliações), consultam Repositories e disparam exceções de domínio quando necessário.
- Repositories usam consultas derivadas do Spring Data JPA para filtrar por atributos.
- Security configura autenticação com JWT; o filtro valida o token em endpoints protegidos.

## Regras de Negócio (Resumo)
- Compras/Aluguéis:
  - Impede duplicidade de compra/aluguel ativo por cliente/livro usando `existsByClienteAndLivroAndStatusNot`.
  - Transições de status controladas (ex.: cancelamento, conclusão), validadas no `CompraService`.
- Avaliações:
  - Somente clientes que compraram/alugaram podem avaliar um livro.
  - Média de avaliações atualizada no `LivroService`/`AvaliacaoService` após operações.

## Execução
- Rodar localmente: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`).
- Porta padrão: `8080` (configurável em `application.properties`).
- Admin (front-end): acesse `http://localhost:8080/pages/admin.html`.
- Base da API usada no front-end: `http://localhost:8080/api` (definida automaticamente pela página).

## Auditoria: convenção e compatibilidade
- Campos padronizados disponíveis em todas as entidades principais: `createdAt`, `createdByEmail`, `createdByRole`.
- Aliases JSON para compatibilidade com frontends existentes:
  - `dtCadastro` → aponta para `createdAt`
  - `cadastradoPorEmail` → aponta para `createdByEmail`
  - `cadastradoPorRole` → aponta para `createdByRole`
- Entidades cobertas: `Livro`, `Cliente`, `Funcionario`, `Admin`.

Exemplo de resposta `LivroDTO`:
```json
{
  "id": 1,
  "titulo": "Exemplo",
  "autor": "Autor",
  "preco": 10.99,
  "createdAt": "2025-01-01T12:34:56",
  "createdByEmail": "admin@exemplo.com",
  "createdByRole": "ADMIN",
  "dtCadastro": "2025-01-01T12:34:56",
  "cadastradoPorEmail": "admin@exemplo.com",
  "cadastradoPorRole": "ADMIN"
}
```

## Endpoints úteis para inspeção
- OpenAPI: `GET http://localhost:8080/v3/api-docs`
- Livros:
  - `GET http://localhost:8080/api/livros`
  - `GET http://localhost:8080/api/livros/{id}`
  - `GET http://localhost:8080/api/livros/buscar/titulo?titulo=...`
  - `GET http://localhost:8080/api/livros/buscar/autor?autor=...`
  - `GET http://localhost:8080/api/livros/buscar/genero?genero=...`
 - Funcionários:
   - `GET http://localhost:8080/api/funcionarios`
   - `GET http://localhost:8080/api/funcionarios/{id}`
   - `POST http://localhost:8080/api/funcionarios` (criação)
   - `PUT http://localhost:8080/api/funcionarios/{id}` (edição)
   - `DELETE http://localhost:8080/api/funcionarios/{id}`

## Autenticação JWT: como obter token e testar endpoints
- Endpoints de autenticação (`AuthController`):
  - Login: `POST http://localhost:8080/api/auth/login`
  - Registro (clientes): `POST http://localhost:8080/api/auth/registro`
  - Verificar autenticação: `GET http://localhost:8080/api/auth/me`

### Login
Body (JSON):
```json
{
  "email": "seu-email@exemplo.com",
  "senha": "sua-senha"
}
```
Resposta (exemplo):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiraEm": 86400000
}
```

### Usando o token
Inclua o header: `Authorization: Bearer <token>`.

Exemplo `curl` protegendo um endpoint (ajuste conforme seus endpoints protegidos):
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/compras/minhas
```

### Registro de cliente
Body (JSON):
```json
{
  "nome": "Cliente Teste",
  "cpf": "00011122233",
  "email": "cliente@exemplo.com",
  "senha": "123456"
}
```
Observação: a senha será criptografada e o cliente poderá fazer login em seguida.


## Perfis de execução (MySQL local vs remoto)
- Remoto: definido atualmente em `src/main/resources/application.properties` (host Railway).
- Local: use `src/main/resources/application-local.properties` com `localhost:3306`.
- Ativar profile local:
  - Windows (Maven): `mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`
  - Variável de ambiente: `set SPRING_PROFILES_ACTIVE=local` e depois `mvnw.cmd spring-boot:run`
  - Jar: `java -jar target/demo-1.0.0.jar --spring.profiles.active=local`

### Preparando MySQL local
- Verifique se o serviço MySQL está ativo na porta `3306`.
- Crie o banco (se necessário):
  - `mysql -u root -p`
  - `CREATE DATABASE bibliotech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- Ajuste `spring.datasource.username` e `spring.datasource.password` em `application-local.properties` para suas credenciais locais.
- A propriedade `spring.jpa.hibernate.ddl-auto=update` criará/atualizará tabelas conforme as entidades.

## Observações
### Atualizações recentes do Front-End (Admin)
- Aba Funcionários: botão "Ver Detalhes" adicionado à coluna Ações com texto, alinhado ao padrão de Clientes e Compras. A ação dispara `verDetalhesFuncionario(id)`, que busca dados na API e exibe modal de detalhes.
- Modal "Novo Funcionário": campo de gênero agora restrito às opções "Masculino" e "Feminino".
- Delegação de cliques nas abas centralizada, garantindo que ações de editar, excluir e ver detalhes funcionem em tabelas dinâmicas.

### Dicas de uso do Admin
- Se uma mudança de UI não aparecer, faça um hard refresh (`Ctrl+F5`).
- Ao rodar via Spring Boot, os assets estáticos são servidos de `src/main/resources/static`. Reinicie a aplicação caso esteja executando um JAR antigo.
- A página `admin.html` importa scripts em `/assets/js` (ex.: `admin.js`, `funcionario-modals.js`, `api.js`).