<div align="center">

<img src="https://unblast.com/wp-content/uploads/2025/07/instagram-logo-colored.jpg" width="100" alt="Instagram Logo"/>

# 📊 InstaAnalytics

**Plataforma robusta para análises detalhadas de perfis do Instagram — ideal para influenciadores, profissionais de marketing e empresas.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-FFA500?style=for-the-badge)]()

</div>

---

## 📌 Sobre o Projeto

O **InstaAnalytics** é uma plataforma robusta desenvolvida para fornecer análises detalhadas de perfis do Instagram. Ideal para influenciadores, profissionais de marketing e empresas que buscam insights profundos sobre engajamento, crescimento e comportamento de audiência, utilizando **Next.js**, **TypeScript** e **Supabase**.

> 🎯 Foco em análise de dados, dashboards interativos, autenticação e visualização de métricas.

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 📈 **Análise de perfil** | Coleta dados do Instagram via Apify e gera métricas de engajamento |
| 🏆 **Melhores posts** | Destaques por **mais curtidas**, **mais comentários** e **engajamento total** (curtidas + comentários) |
| 🕘 **Histórico funcional** | Salva buscas por usuário no Supabase (`search_history`) e permite limpar/filtrar |
| 💾 **Persistência/Cache** | Armazena `profiles`, `posts` e `engagement_metrics` no Supabase |
| 📊 **Visualização de Dados** | Gráficos interativos com Recharts |
| 🔐 **Segurança** | Autenticação via Supabase + RLS no histórico (cada usuário vê apenas o seu) |
| 🧪 **Testes** | Jest (unitários) e Cypress (e2e) |

---

## 🛠️ Tecnologias & Ferramentas

<div align="center">

| Tecnologia | Descrição |
|---|---|
| ⚛️ React | Biblioteca para interface |
| ▲ Next.js 13 | Framework full-stack |
| 📘 TypeScript | Tipagem estática |
| 🟢 Supabase | BaaS (PostgreSQL, Auth, API REST) |
| 🎨 Tailwind CSS | Estilização e design responsivo |
| 📊 Recharts | Gráficos interativos |
| 🧩 Radix UI | Componentes acessíveis |
| 🎭 Framer Motion | Animações |
| 📋 React Hook Form + Zod | Formulários e validação |

</div>

---

## 🚀 Como Executar

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ [Node.js](https://nodejs.org/) (v18+)
- ✅ npm ou Yarn
- ✅ Projeto configurado no [Supabase](https://supabase.com)
- ✅ Token do Apify (para a análise)

### Requisitos importantes

- **O perfil do Instagram precisa ser público** (não privado) para a análise funcionar.
- A análise depende do **Apify**. Se o token estiver inválido/sem créditos, a análise pode falhar.

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/RDEsley/InstaAnalytics.git

# 2. Acesse a pasta do projeto
cd InstaAnalytics

# 3. Instale as dependências
npm install
# ou: yarn install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env.local na raiz com:
# NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
# APIFY_API_TOKEN=seu_token_do_apify

# 5. Aplique o schema no Supabase (tabelas + RLS/policies)
# No Supabase Dashboard → SQL Editor, execute:
# supabase/migrations/database_schema.sql

# 6. Inicie o servidor de desenvolvimento
npm run dev
# ou: yarn dev
```

Acesse: **http://localhost:3000**

### Deploy no Vercel

1. Conecte o repositório ao [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente (Supabase URL/Key, `APIFY_API_TOKEN`)
3. No **Supabase** (Auth → URL Configuration):
   - **Site URL**: `https://seu-projeto.vercel.app`
   - **Redirect URLs**: adicione `https://seu-projeto.vercel.app/**`

**Email rate limit:** O Supabase gratuito envia ~4 emails/hora. Para produção, use SMTP próprio em Supabase (Settings → Auth → SMTP).

---

## 📂 Estrutura do Projeto

```
InstaAnalytics/
├── app/                # App Router (Next.js 13+)
├── components/         # Componentes React
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas (se houver)
├── cypress/e2e/        # Testes E2E
├── supabase/
│   └── migrations/     # Migrações do banco
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 🧠 Roadmap de Evolução

- [ ] Implementar análise profunda de hashtags
- [ ] Suporte para gerenciamento de múltiplos perfis
- [ ] Integração com APIs de outras redes sociais
- [ ] Sistema de notificações Push e E-mail

---

## 📖 Aprendizados

Durante o desenvolvimento deste projeto, foram praticados e aprofundados:

- ▲ Arquitetura e **App Router** do Next.js 13
- 📊 Criação de **dashboards** e visualização de dados com Recharts
- 🟢 Integração com **Supabase** (auth, banco, API)
- 🎨 Componentes com **Radix UI** e **Tailwind CSS**
- 📋 Formulários com **React Hook Form** e validação **Zod**
- 🧪 Testes com **Jest** e **Cypress**
- 📘 Boas práticas em **TypeScript**

---

## 🤝 Contribuindo

1. Faça um **Fork** do projeto
2. Crie sua **Branch** (`git checkout -b feature/minha-feature`)
3. **Commit** suas mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. **Push** para a Branch (`git push origin feature/minha-feature`)
5. Abra um **Pull Request**

---

## 🪪 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Equipe RockRedHat

<div align="center">

**Richard Esley** — *Full Stack Developer* · **Fernanda Mey** — *Developer*

[![Richard GitHub](https://img.shields.io/badge/Richard_GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RDEsley)
[![Fernanda GitHub](https://img.shields.io/badge/Fernanda_GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FeMeNiKi)

</div>

---

<div align="center">

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐

*Feito com 💚 e muito código TypeScript*

</div>
