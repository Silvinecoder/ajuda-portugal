# Ajuda Portugal - Plataforma de Ajuda Mútua

Web app para conectar pessoas em necessidade com voluntários em Portugal. Usa React + TypeScript no frontend, Node.js + Express + TypeScript no backend, PostgreSQL em Docker, e OpenStreetMap para o mapa.

## Requisitos

- Node.js 18+
- Docker e Docker Compose

## Setup

### 1. Database is via docker

```bash
docker compose up -d
```

### 2. Backend we use prisma

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend

Noutro terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Aceder

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Scripts (raiz do projeto)

```bash
npm run docker:up    # Inicia a base de dados
npm run dev         # Inicia backend + frontend em paralelo
```

## Funcionalidades

### Pessoa em necessidade
- Ver mapa com pins coloridos (crítico=vermelho, urgente=laranja, normal=amarelo, recuperação=verde)
- Pedir ajuda: formulário com urgência, categoria, descrição, localização, contacto WhatsApp
- Após publicar: link único para gerir o pedido (marcar como ajudado, atualizar, apagar)
- Pedido expira em 14 dias

### Voluntário
- Ver mapa com filtros por urgência
- Clicar no pin: card com detalhes
- Oferecer ajuda: abre WhatsApp com mensagem pré-preenchida
- Denunciar pedidos suspeitos
