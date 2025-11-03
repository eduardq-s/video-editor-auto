# Pesquisa: Tecnologias para Edição Automática de Vídeos

## Resumo Executivo

Para construir um site de edição automática de vídeos focado em redes sociais, identificamos três abordagens principais: APIs em nuvem (Shotstack, Creatomate), processamento local com FFmpeg, e serviços especializados de transcrição. Cada abordagem oferece diferentes trade-offs entre facilidade de uso, custo e controle.

## 1. APIs em Nuvem para Edição de Vídeos

### Shotstack [1]

**Funcionalidades:**
- Plataforma de criação de vídeos com IA
- API para edição programática de vídeos
- Editor de vídeo white-label
- Suporte para templates dinâmicos
- Renderização em escala (milhares de vídeos)

**Vantagens:**
- Interface intuitiva para desenvolvedores
- Suporte para automação em larga escala
- Integração com redes sociais
- Infraestrutura gerenciada

**Desvantagens:**
- Custo por renderização
- Limite de funcionalidades customizadas
- Dependência de serviço externo

**Preços:** Modelo de créditos (sandbox gratuito disponível)

---

### Creatomate [2]

**Funcionalidades:**
- API de edição de vídeos em nuvem
- Geração de vídeos a partir de templates
- Suporte para múltiplas linguagens de programação (Node.js, PHP, Ruby, Python)
- Editor de templates online
- Infraestrutura auto-escalável (AWS)

**Vantagens:**
- SDK bem documentado
- Fácil integração com Node.js
- Templates flexíveis e customizáveis
- Suporte para modificações dinâmicas

**Desvantagens:**
- Custo por renderização
- Limitado a templates pré-definidos
- Requer configuração de templates

**Preços:** 50 créditos gratuitos para trial, modelo de créditos para produção

---

## 2. Processamento Local com FFmpeg

### FFmpeg + Node.js [3]

**Funcionalidades:**
- Transcodificação de vídeos
- Extração de thumbnails
- Aplicação de watermarks
- Remoção de silêncios
- Manipulação de áudio e vídeo

**Bibliotecas Node.js:**

#### fluent-ffmpeg [4]
- Wrapper de alto nível para FFmpeg
- Interface fluente e fácil de usar
- Suporte para múltiplas operações

**Status:** Sendo descontinuado, mas ainda funcional

#### ffmpeg-static [5]
- Fornece build estático do FFmpeg
- Sem dependências externas
- Ideal para ambientes containerizados

#### silencecut-ffmpeg [6]
- Detecta e remove seções silenciosas
- Mantém sincronização de áudio/vídeo
- CLI e API Node.js

**Vantagens:**
- Controle total sobre processamento
- Sem custos de API
- Funcionalidades avançadas
- Código aberto

**Desvantagens:**
- Requer FFmpeg instalado no servidor
- Maior complexidade de implementação
- Consumo de recursos (CPU/memória)
- Requer gerenciamento de filas de processamento

---

## 3. Transcrição e Legendas Automáticas

### OpenAI Whisper API [7]

**Funcionalidades:**
- Transcrição de áudio em 100+ idiomas
- Detecção automática de idioma
- Suporte para vídeos e áudio
- Limite de 25MB por arquivo

**Integração com Node.js:**
- Suporte nativo via SDK oficial
- Requer splitting de vídeos longos em segmentos

**Vantagens:**
- Alta precisão
- Suporte multilíngue
- Fácil integração

**Desvantagens:**
- Custo por minuto de áudio
- Limite de tamanho (25MB)
- Requer chave de API

---

### Alternativas de Transcrição

- **Google Cloud Speech-to-Text:** Alternativa robusta com suporte a vídeo
- **Azure Speech Services:** Integração com ecossistema Microsoft
- **Sonix.ai:** Plataforma especializada em transcrição de vídeos
- **Simon Says:** Transcrição rápida com suporte a tradução

---

## 4. Comparação de Abordagens

| Aspecto | Shotstack | Creatomate | FFmpeg Local | Whisper |
|---------|-----------|-----------|--------------|---------|
| **Curva de Aprendizado** | Baixa | Baixa | Alta | Média |
| **Custo Inicial** | Baixo (free tier) | Baixo (free tier) | Médio (infra) | Médio (API) |
| **Custo Escalável** | Alto | Alto | Baixo | Médio |
| **Controle** | Limitado | Limitado | Total | Total |
| **Velocidade** | Rápida | Rápida | Variável | Rápida |
| **Funcionalidades** | Boas | Boas | Excelentes | Específica |
| **Manutenção** | Nenhuma | Nenhuma | Alta | Baixa |

---

## 5. Recomendação para o Projeto

### Abordagem Híbrida Recomendada

Para maximizar funcionalidades e custo-benefício, recomendamos:

1. **Frontend + Backend:** React 19 + Express (já configurado)
2. **Processamento de Vídeo:** FFmpeg local para operações básicas (corte, junção, filtros)
3. **Transcrição:** OpenAI Whisper API para legendas automáticas
4. **Armazenamento:** S3 para vídeos originais e processados
5. **Fila de Processamento:** Bull/Redis para gerenciar tarefas assíncronas

### Funcionalidades Implementáveis

- ✅ **Corte/Trimagem:** FFmpeg
- ✅ **Legendas Automáticas:** Whisper API
- ✅ **Filtros e Efeitos:** FFmpeg
- ✅ **Junção de Vídeos:** FFmpeg
- ✅ **Remoção de Silêncios:** silencecut-ffmpeg
- ✅ **Otimização para Redes Sociais:** FFmpeg presets

---

## 6. Stack Técnico Proposto

```
Frontend:
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Componentes para upload e preview

Backend:
- Express.js
- tRPC para comunicação type-safe
- FFmpeg para processamento
- OpenAI Whisper para transcrição
- Bull para fila de tarefas

Banco de Dados:
- MySQL/TiDB (já configurado)
- Tabelas: users, videos, edits, processing_jobs

Armazenamento:
- S3 para vídeos

Infraestrutura:
- Docker para FFmpeg
- Redis para fila de processamento
```

---

## Referências

[1] Shotstack - https://shotstack.io/
[2] Creatomate - https://creatomate.com/developers
[3] Transloadit - Stream video processing with Node.js and FFmpeg - https://transloadit.com/devtips/stream-video-processing-with-node-js-and-ffmpeg/
[4] fluent-ffmpeg - https://www.npmjs.com/package/fluent-ffmpeg
[5] ffmpeg-static - https://www.npmjs.com/package/ffmpeg-static
[6] silencecut-ffmpeg - https://github.com/beenotung/silencecut-ffmpeg
[7] OpenAI Whisper API - https://platform.openai.com/docs/guides/speech-to-text
