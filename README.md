# Auto Video Editor 🎬

Um site moderno para edição automática de vídeos com inteligência artificial. Corte, adicione legendas, remova silêncios e aplique filtros automaticamente.

## 🚀 Funcionalidades

- **Corte Automático**: Defina pontos de início e fim para criar vídeos perfeitos
- **Legendas com IA**: Transcrição automática de áudio e geração de legendas
- **Filtros e Efeitos**: Grayscale, desfoque, brilho, contraste e muito mais
- **Remoção de Silêncios**: Remove automaticamente pausas e silêncios
- **Junção de Vídeos**: Combine múltiplos clipes em um arquivo otimizado
- **Otimização para Redes Sociais**: Formatos e resoluções para TikTok, Instagram, YouTube

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - UI moderna e responsiva
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Componentes reutilizáveis
- **Vite** - Build tool rápido

### Backend
- **Express.js** - Servidor web
- **tRPC 11** - RPC type-safe
- **FFmpeg** - Processamento de vídeos
- **Bull Queue** - Fila de processamento
- **Redis** - Cache e fila

### Banco de Dados
- **MySQL/TiDB** - Armazenamento de metadados
- **Drizzle ORM** - Type-safe queries

### Infraestrutura
- **S3** - Armazenamento de vídeos
- **OAuth** - Autenticação
- **Docker** - Containerização

## 📋 Requisitos

- Node.js 22+
- pnpm 10+
- FFmpeg instalado
- Redis (para fila de processamento)
- Conta AWS S3 (para armazenamento)

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/eduardq-s/video-editor-auto.git
cd video-editor-auto

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar migrações do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 📝 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/video_editor

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# AWS S3
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=seu_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=seu_bucket

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_secreta
```

## 🚀 Deploy

### GitHub Pages (Frontend)
O projeto está configurado para fazer deploy automático no GitHub Pages via GitHub Actions.

1. Acesse as configurações do repositório
2. Vá para "Pages"
3. Selecione "Deploy from a branch"
4. Escolha a branch `gh-pages`

### Full Stack (Backend + Frontend)
Para hospedar o backend, use:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

## 📚 Estrutura do Projeto

```
video-editor-auto/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas
│   │   ├── components/    # Componentes
│   │   ├── lib/           # Utilitários
│   │   └── App.tsx        # App principal
│   └── dist/              # Build output
├── server/                # Backend Express
│   ├── routers.ts         # Rotas tRPC
│   ├── db.ts              # Queries do banco
│   ├── videoProcessor.ts  # Processamento FFmpeg
│   └── processingQueue.ts # Fila Bull
├── drizzle/               # Schema do banco
└── storage/               # Helpers S3
```

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com coverage
pnpm test:coverage
```

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma issue em: https://github.com/eduardq-s/video-editor-auto/issues

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes

## 👨‍💻 Autor

**Eduardo Santana**
- GitHub: [@eduardq-s](https://github.com/eduardq-s)

## 🙏 Agradecimentos

Construído com ❤️ usando Manus AI

---

**Visite o site**: [Auto Video Editor](https://eduardq-s.github.io/video-editor-auto)
