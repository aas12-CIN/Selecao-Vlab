# Seleção VLab - Plataforma de Filmes e Maratonas

Uma aplicação Angular moderna para descoberta de filmes e criação de maratonas temáticas, integrada com a API do TMDB (The Movie Database).

## 🎬 Funcionalidades

### 🎯 Sistema de Filmes
- **Busca de Filmes**: Sistema de busca integrado com API do TMDB
- **Carrossel Interativo**: Navegação fluida entre filmes com controles de navegação
- **Categorias**: Filmes populares, mais bem avaliados e próximos lançamentos
- **Detalhes Completos**: Informações detalhadas incluindo gêneros, avaliações e sinopses
- **Interface Responsiva**: Design otimizado para diferentes tamanhos de tela

### 🎭 Sistema de Maratonas
- **Geração de Temas**: Criação automática de temas para maratonas de filmes
- **Gerenciamento de Maratonas**: Interface para criar e gerenciar maratonas personalizadas
- **Adição de Filmes**: Sistema para adicionar filmes às maratonas criadas
- **Temas Dinâmicos**: Geração inteligente de temas baseados em gêneros e tendências

### 🎨 Interface e UX
- **Hover Suave**: Efeitos de hover otimizados sem cortes
- **Navegação Intuitiva**: Roteamento Angular para navegação fluida
- **Design Moderno**: Interface dark theme com gradientes e animações
- **Carrossel Responsivo**: Adaptação automática para diferentes dispositivos

## 🚀 Tecnologias Utilizadas

- **Angular 18.2.0** - Framework principal
- **TypeScript** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **RxJS** - Programação reativa
- **TMDB API** - Base de dados de filmes
- **Angular Router** - Navegação entre páginas
- **Angular Services** - Gerenciamento de estado e dados

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Chave de API do TMDB

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/aas12-CIN/Selecao-Vlab.git
   cd Selecao-Vlab
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto ou configure as variáveis em `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://api.themoviedb.org/3',
     apiKey: 'SUA_CHAVE_API_TMDB_AQUI'
   };
   ```

4. **Execute o projeto**
   ```bash
   ng serve
   ```

5. **Acesse a aplicação**
   Navegue para `http://localhost:4200/`

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── features/
│   │   ├── movies/
│   │   │   ├── api/                 # Serviços de API
│   │   │   ├── components/          # Componentes de filmes
│   │   │   │   ├── movie-card/      # Card de filme
│   │   │   │   ├── movie-search/    # Busca de filmes
│   │   │   │   └── theme-generator/ # Gerador de temas
│   │   │   ├── pages/               # Páginas de filmes
│   │   │   ├── services/            # Serviços de filmes
│   │   │   ├── state/               # Gerenciamento de estado
│   │   │   └── types/               # Tipos TypeScript
│   │   └── marathons/
│   │       ├── pages/               # Páginas de maratonas
│   │       ├── services/            # Serviços de maratonas
│   │       └── types/               # Tipos de maratonas
│   ├── shared/
│   │   └── components/
│   │       └── carousel/            # Componente carrossel reutilizável
│   └── environments/                # Configurações de ambiente
```

## 🎮 Como Usar

### Busca de Filmes
1. Use a barra de busca na página inicial
2. Navegue pelos resultados usando os controles do carrossel
3. Clique em um filme para ver mais detalhes

### Criação de Maratonas
1. Acesse a seção de maratonas
2. Use o gerador de temas para criar temas automaticamente
3. Adicione filmes às suas maratonas usando o botão "Adicionar"
4. Gerencie suas maratonas criadas

### Navegação
- **Home**: Visualize filmes populares, bem avaliados e próximos lançamentos
- **Busca**: Encontre filmes específicos
- **Maratonas**: Crie e gerencie suas maratonas temáticas

## 🔧 Comandos Disponíveis

```bash
# Servidor de desenvolvimento
ng serve

# Build para produção
ng build

# Executar testes unitários
ng test

# Executar testes e2e
ng e2e

# Gerar novo componente
ng generate component nome-do-componente

# Gerar novo serviço
ng generate service nome-do-servico
```

## 🌐 Configuração da API

Para usar a API do TMDB:

1. Registre-se em [TMDB](https://www.themoviedb.org/settings/api)
2. Obtenha sua chave de API
3. Configure a chave no arquivo de ambiente
4. A aplicação estará pronta para consumir dados de filmes

## 🎨 Personalização

### Temas
O projeto usa SCSS para estilização. Você pode personalizar:
- Cores no arquivo `styles.scss`
- Componentes individuais nos arquivos `.component.scss`
- Variáveis SCSS para consistência

### Componentes
Todos os componentes são modulares e reutilizáveis:
- `carousel`: Carrossel genérico para qualquer tipo de conteúdo
- `movie-card`: Card de filme com informações completas
- `movie-search`: Sistema de busca integrado






