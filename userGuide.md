# Auto Video Editor - Guia do Usuário

## Bem-vindo ao Auto Video Editor

**Propósito:** Edite seus vídeos automaticamente com inteligência artificial, aplicando cortes, legendas, filtros e muito mais em segundos.

**Acesso:** Público (requer login)

**Autenticação:** OAuth integrado - faça login com sua conta Manus

---

## Powered by Manus

O Auto Video Editor é construído com tecnologia de ponta:

**Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui - interface moderna e responsiva

**Backend:** Express.js + tRPC 11 - comunicação type-safe entre cliente e servidor

**Processamento:** FFmpeg + Bull Queue - processamento robusto de vídeos em fila

**Banco de Dados:** MySQL/TiDB - armazenamento seguro de metadados

**Armazenamento:** S3 - hospedagem confiável de vídeos

**Deployment:** Auto-scaling infrastructure com global CDN - performance em qualquer lugar do mundo

---

## Usando o Auto Video Editor

### 1. Fazer Upload de um Vídeo

Clique no botão **"Começar a Editar"** na página inicial. Na página do editor:

- Clique na área de upload ou arraste um vídeo para selecionar
- Formatos suportados: MP4, WebM, MOV, AVI
- Tamanho máximo: 500MB
- Clique em **"Enviar Vídeo"** para fazer upload

Você verá uma barra de progresso enquanto o vídeo é enviado.

### 2. Configurar Opções de Edição

No painel direito, configure as edições automáticas:

**Formato e Resolução:**
- Escolha o formato de saída (MP4, WebM, MOV)
- Selecione a resolução (720p, 1080p, 2K)

**Cortar Vídeo:**
- Ative a opção "Cortar Vídeo"
- Defina o ponto de início (em segundos)
- Defina o ponto final (em segundos)

**Adicionar Legendas:**
- Ative "Adicionar Legendas" para transcrição automática
- As legendas serão geradas automaticamente do áudio

**Remover Silêncios:**
- Ative "Remover Silêncios" para otimizar o tempo de visualização
- Ajuste o limite de detecção (em dB)
- Valores mais altos detectam silêncios mais agressivamente

**Aplicar Filtros:**
- Ative "Aplicar Filtros" para efeitos visuais
- Escolha entre: Escala de Cinza, Desfoque, Brilho, Contraste
- Ajuste a intensidade do filtro (0-100%)

### 3. Iniciar a Edição

Após configurar todas as opções, clique em **"Iniciar Edição"**. 

O sistema começará a processar seu vídeo. Você receberá uma notificação quando a edição estiver concluída.

### 4. Baixar Seu Vídeo

Quando a edição estiver pronta, você poderá baixar o vídeo editado diretamente.

---

## Gerenciando Seu Website

### Histórico de Vídeos

Todos os seus vídeos e edições são salvos automaticamente. Acesse seu histórico para:
- Ver vídeos anteriores
- Revisar edições realizadas
- Baixar vídeos já processados

### Configurações

Use o painel de **Settings** (Configurações) para:
- Atualizar seu perfil
- Gerenciar preferências de notificação
- Visualizar uso de armazenamento

### Dashboard

O **Dashboard** mostra:
- Estatísticas de uso
- Vídeos processados
- Tempo total de edição

---

## Próximos Passos

Converse com o Manus AI a qualquer momento para solicitar novas funcionalidades ou fazer alterações.

**Comece agora:** Faça upload de seu primeiro vídeo e deixe a IA fazer a magia! Seus vídeos para redes sociais nunca foram tão fáceis de criar.
