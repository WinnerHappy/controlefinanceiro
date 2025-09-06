# 🐛 Guia de Debug - Problemas Comuns

## ❌ Erro na Criação de Conta

### Possíveis Causas:

1. **Variáveis de ambiente não configuradas**
   - Verifique se `.env.local` existe
   - Confirme se as URLs do Supabase estão corretas

2. **Configuração do Supabase**
   - Verifique se a autenticação por email está habilitada
   - Confirme se as URLs de redirect estão corretas

3. **Problemas de CORS**
   - Adicione `http://localhost:3000` nas configurações do Supabase

### Como Debugar:

1. **Abra o Console do Navegador** (F12)
2. **Tente criar uma conta** e veja os erros
3. **Verifique a aba Network** para ver as requisições

### Soluções Rápidas:

#### 1. Verificar Variáveis de Ambiente
```bash
# Verifique se o arquivo .env.local existe
cat .env.local

# Deve conter:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

#### 2. Configurar Supabase Corretamente
1. Vá para **Authentication > Settings**
2. Em **Site URL**: `http://localhost:3000`
3. Em **Redirect URLs**: `http://localhost:3000`
4. Salve as configurações

#### 3. Habilitar Providers
1. Vá para **Authentication > Providers**
2. Habilite **Email**
3. Desabilite **Confirm email** temporariamente para testes

#### 4. Verificar Políticas RLS
Execute no SQL Editor:
```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT * FROM pg_policies;
```

## 🎨 Problema de Layout (Sobreposição)

### Já Corrigido:
- Ajustei o padding dos inputs para `px-12 py-3`
- Posicionei os ícones corretamente
- Adicionei espaçamento adequado

### Se ainda houver problemas:
1. Limpe o cache do navegador (Ctrl+F5)
2. Verifique se o Tailwind está carregando
3. Inspecione os elementos no DevTools

## 🔧 Comandos de Debug

### Verificar se o app está funcionando:
```bash
npm run dev
```

### Verificar erros de build:
```bash
npm run build
```

### Limpar cache:
```bash
rm -rf .next
npm run dev
```

## 📞 Checklist de Verificação

- [ ] Arquivo `.env.local` existe e está correto
- [ ] Supabase está configurado corretamente
- [ ] Autenticação por email está habilitada
- [ ] URLs de redirect estão corretas
- [ ] Tabelas foram criadas no banco
- [ ] RLS está habilitado
- [ ] App está rodando em `http://localhost:3000`

## 🆘 Se Nada Funcionar

1. **Delete o projeto do Supabase** e crie um novo
2. **Execute o script SQL** novamente
3. **Reconfigure as variáveis** de ambiente
4. **Teste com um email diferente**