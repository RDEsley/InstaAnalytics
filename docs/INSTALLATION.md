# Guia de Instalação - InstaAnalytics

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Git**
- Conta no **Supabase** (para banco de dados e autenticação)
- Conta no **Apify** (para scraping do Instagram)

## Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/RDEsley/InstaAnalytics.git
cd InstaAnalytics
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Apify Configuration
APIFY_API_TOKEN=your_apify_api_token

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### 4. Configuração do Supabase

#### 4.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto
5. Aguarde a criação do banco de dados

#### 4.2. Configurar Banco de Dados

Execute as migrações SQL no editor SQL do Supabase:

```sql
-- Execute o conteúdo do arquivo: supabase/migrations/database_schema.sql
-- Execute o conteúdo do arquivo: supabase/migrations/search_history.sql
```

#### 4.3. Configurar Autenticação

1. No painel do Supabase, vá para "Authentication" > "Settings"
2. Configure as seguintes opções:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Email confirmation**: Desabilitado (para desenvolvimento)

### 5. Configuração do Apify

1. Acesse [apify.com](https://apify.com)
2. Crie uma conta ou faça login
3. Vá para "Settings" > "Integrations"
4. Copie seu API token
5. Cole no arquivo `.env.local`

### 6. Executar a Aplicação

#### Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em: `http://localhost:3000`

#### Produção

```bash
# Build da aplicação
npm run build

# Iniciar servidor de produção
npm start
```

## Estrutura do Projeto

```
InstaAnalytics/
├── app/                    # Páginas da aplicação (App Router)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx          # Página inicial
│   ├── login/            # Página de login
│   └── register/         # Página de registro
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn/ui)
│   ├── AuthGuard.tsx     # Proteção de rotas
│   ├── Header.tsx        # Cabeçalho
│   └── ...
├── lib/                  # Utilitários e configurações
│   ├── auth.ts          # Configuração Supabase
│   ├── api.ts           # Funções da API
│   ├── types.ts         # Tipos TypeScript
│   ├── validation.ts    # Validações
│   └── ...
├── pages/               # Páginas (Pages Router)
│   └── api/            # Endpoints da API
│       ├── auth/       # Endpoints de autenticação
│       └── analyze.ts  # Endpoint de análise
├── supabase/           # Configurações do Supabase
│   └── migrations/     # Migrações SQL
├── docs/               # Documentação
└── ...
```

## Configurações Adicionais

### Configuração de CORS

Para produção, configure os domínios permitidos no Supabase:

1. Vá para "Settings" > "API"
2. Em "CORS origins", adicione seus domínios de produção

### Configuração de Rate Limiting

O rate limiting está configurado por padrão:
- Login: 5 tentativas por minuto
- Registro: 3 tentativas por minuto
- Análise: 5 tentativas por minuto

Para ajustar, edite o arquivo `lib/rateLimit.ts`.

### Configuração de Logs

Para produção, configure um serviço de logs:

1. **Sentry** para monitoramento de erros
2. **LogRocket** para logs de sessão
3. **Winston** para logs estruturados

## Testes

### Executar Testes Unitários

```bash
npm test
# ou
yarn test
```

### Executar Testes E2E

```bash
npm run test:e2e
# ou
yarn test:e2e
```

### Executar Testes de API

```bash
# Instalar dependências de teste
npm install --save-dev jest supertest

# Executar testes
npm run test:api
```

## Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `.next`

### Docker

```bash
# Build da imagem
docker build -t instaanalytics .

# Executar container
docker run -p 3000:3000 instaanalytics
```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Supabase

```
Error: Invalid API key
```

**Solução**: Verifique se as chaves do Supabase estão corretas no `.env.local`

#### 2. Erro de CORS

```
Access to fetch blocked by CORS policy
```

**Solução**: Configure os domínios permitidos no painel do Supabase

#### 3. Erro de Rate Limiting

```
Too many requests
```

**Solução**: Aguarde alguns minutos ou ajuste as configurações em `lib/rateLimit.ts`

#### 4. Erro de Migração

```
relation "profiles" does not exist
```

**Solução**: Execute as migrações SQL no painel do Supabase

### Logs de Debug

Para habilitar logs detalhados:

```bash
DEBUG=* npm run dev
```

### Verificação de Saúde

Acesse `http://localhost:3000/api/health` para verificar o status da API.

## Suporte

Para suporte técnico:

- **Email**: richardesleyso@gmail.com
- **GitHub Issues**: [InstaAnalytics Issues](https://github.com/RDEsley/InstaAnalytics/issues)
- **Discord**: [Servidor da Comunidade](#)

## Contribuição

Consulte o arquivo `CONTRIBUTING.md` para diretrizes de contribuição.

## Licença

Este projeto está licenciado sob a MIT License. Consulte o arquivo `LICENSE` para mais detalhes.