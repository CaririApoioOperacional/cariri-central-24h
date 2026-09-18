# CARIRI MONITORAMENTO • CENTRAL 24h

Sistema web/PWA para operação da Central 24h e atendimento técnico externo.

## Escopo inicial
- Central web
- Cadastro de clientes, estabelecimentos e contatos autorizados por WhatsApp
- Chamados/eventos e protocolos
- Despacho de técnico externo
- Histórico e auditoria
- Módulo desacoplado para integração com WhatsApp Business Platform
- Interface PWA para operação externa

O cliente não possui login ou senha: a identificação é feita pelo número de WhatsApp previamente autorizado.

## Desenvolvimento
```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```
