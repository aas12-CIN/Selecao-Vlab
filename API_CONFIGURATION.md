# Configuração da API do The Movie DB

## Configuração das Variáveis de Ambiente

### 1. Arquivo de Configuração

Foi criado o arquivo `config.env` na raiz do projeto com as seguintes variáveis:

```env
# The Movie DB API Configuration
# Get your API key from: https://www.themoviedb.org/settings/api
NG_APP_API_KEY=your_api_key_here

# API Base URL
NG_APP_API_URL=https://api.themoviedb.org/3
```

### 2. Como Obter a API Key

1. Acesse [The Movie DB](https://www.themoviedb.org/)
2. Crie uma conta ou faça login
3. Vá para [Settings > API](https://www.themoviedb.org/settings/api)
4. Solicite uma API Key (é gratuito)
5. Copie a API Key gerada

### 3. Configuração no Projeto

#### Opção 1: Usando o arquivo config.env
1. Renomeie `config.env` para `.env`
2. Substitua `your_api_key_here` pela sua API Key real
3. Execute o projeto normalmente

#### Opção 2: Variáveis de ambiente do sistema
Configure as variáveis de ambiente no seu sistema:

**Windows (PowerShell):**
```powershell
$env:NG_APP_API_KEY="sua_api_key_aqui"
$env:NG_APP_API_URL="https://api.themoviedb.org/3"
```

**Linux/Mac:**
```bash
export NG_APP_API_KEY="sua_api_key_aqui"
export NG_APP_API_URL="https://api.themoviedb.org/3"
```

### 4. Verificação da Configuração

O projeto já está configurado para usar essas variáveis de ambiente:

- **Arquivo de tipos**: `src/env.d.ts` - Define os tipos TypeScript
- **Arquivos de ambiente**: `src/environments/environment.ts` e `src/environments/environment.prod.ts`
- **Serviço da API**: `src/app/features/movies/api/movie.api.ts`

### 5. Uso no Código

O serviço `MovieApiService` já está configurado para usar automaticamente:

```typescript
private readonly apiKey = process.env["NG_APP_API_KEY"];
private readonly apiUrl = 'https://api.themoviedb.org/3';
```

### 6. Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite arquivos `.env` com chaves reais no repositório
- Use `.env.example` como template
- Adicione `.env` ao `.gitignore`

### 7. Estrutura de Arquivos Criados/Modificados

- ✅ `config.env` - Arquivo de configuração de exemplo
- ✅ `src/env.d.ts` - Tipos TypeScript (já existia)
- ✅ `src/environments/environment.ts` - Ambiente de desenvolvimento (atualizado)
- ✅ `src/environments/environment.prod.ts` - Ambiente de produção (atualizado)
- ✅ `src/app/features/movies/api/movie.api.ts` - Serviço da API (corrigido)
