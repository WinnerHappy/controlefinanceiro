# App de Controle Financeiro

## Descrição
Aplicativo web e mobile para controle de gastos do mercado, contas mensais e análise financeira.

## Funcionalidades
- ✅ Autenticação por email (Supabase Auth)
- ✅ Registro de compras do mercado
- ✅ Controle de formas de pagamento (PIX, VR, VA, etc.)
- ✅ Gestão de contas mensais (fatura, celular, internet, luz)
- ✅ Registro de salário e gastos fixos
- ✅ Cálculo automático do dízimo (10% do salário)
- ✅ Gráficos e relatórios de consumo
- ✅ Comparativo entre gastos registrados e reais

## Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React para aplicações web
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS** - Framework CSS para estilização
- **Lucide React** - Biblioteca de ícones
- **Recharts** - Biblioteca para gráficos e visualizações

### Backend e Banco de Dados
- **Supabase** - Backend as a Service (BaaS)
- **Supabase Auth** - Sistema de autenticação
- **PostgreSQL** - Banco de dados (via Supabase)

### Hospedagem
- **Vercel** - Plataforma de deploy para aplicações Next.js

## Bibliotecas e Dependências

### Principais
- `next`: Framework React para produção
- `react` & `react-dom`: Biblioteca React
- `@supabase/supabase-js`: Cliente JavaScript do Supabase
- `@supabase/auth-helpers-nextjs`: Helpers de autenticação para Next.js
- `recharts`: Biblioteca para criação de gráficos
- `lucide-react`: Ícones SVG para React
- `date-fns`: Biblioteca para manipulação de datas

### Desenvolvimento
- `typescript`: Suporte ao TypeScript
- `tailwindcss`: Framework CSS utilitário
- `eslint`: Linter para JavaScript/TypeScript
- `autoprefixer` & `postcss`: Processadores CSS

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no `.env.local`
4. Execute o projeto: `npm run dev`

## Deploy

### Vercel
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Supabase
1. Crie um projeto no Supabase
2. Configure as tabelas do banco de dados
3. Ative a autenticação por email