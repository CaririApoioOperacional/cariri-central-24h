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


## Produção
Requer PostgreSQL, HTTPS e volume persistente montado em `EVIDENCE_STORAGE_PATH`. Nunca versionar `.env` ou tokens do WhatsApp. No Railway, conecte um PostgreSQL e um Volume ao serviço antes de habilitar evidências em produção.

## Segurança
O modelo `StaffUser` foi reservado para autenticação e RBAC de ADMIN, CENTRAL, TECHNICIAN e SUPERVISOR. As telas internas ainda não devem ser expostas publicamente até a camada de sessão/autenticação estar ativa.
