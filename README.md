# KrakenSpy

Experiência de demonstração: o usuário digita um @, vê um preview com dados
públicos do perfil e entra num painel ilustrativo de conversas com paywall.

## O que é real e o que é simulado

- Real: nome, foto, posts, seguidores, seguindo e bio, obtidos de fonte pública.
- Simulado: conversas, áudios, fotos e transcrições do painel.
- Dramatização: as etapas da tela de carregamento.
- Não usado: login, Direct, criptografia, Graph API.

## Estrutura

- index.html — landing, age gate 18+, busca do @, terminal
- app.html — painel (inbox, chat, bloqueios, contador de teste)
- checkout.html — oferta, planos e order bump
- obrigado.html — libera o VIP localmente
- netlify/functions/ig.js — busca de perfil público + proxy de imagem

## Configurar

1. Edite js/config.js: checkout.url, checkout.prices, supportEmail, pixel.
2. Ajuste KS.freeChats, KS.trialMinutes e KS.searchPerDevice se quiser outro funil.
3. Preencha os dados da empresa em termos.html, privacidade.html e reembolso.html.

## Rodar local

    npm install
    npm run dev

## Deploy na Netlify

1. Suba o repositório no GitHub.
2. Netlify -> Add new site -> Import an existing project -> GitHub.
3. Build command vazio, publish ".", functions netlify/functions.
4. Deploy e configure o domínio.

## VIP

obrigado.html grava ks_vip=1 no localStorage. Configure o redirect do gateway
para /obrigado.html.

## Observações

- O Instagram limita requisições por IP. Se a busca falhar muito, troque a
  primeira estratégia em netlify/functions/ig.js por um scraper pago.
- Quando a busca falha, o front gera perfil sintético e o funil não quebra.
