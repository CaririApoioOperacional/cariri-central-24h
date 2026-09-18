# CARIRI MONITORAMENTO • CENTRAL 24h

Sistema web/PWA para operação da Central 24h e atendimento técnico externo.

## Escopo inicial
- Central web
- Cadastro de clientes, estabelecimentos e contatos autorizados por WhatsApp
- Chamados/eventos e protocolos
- Despacho de técnico externo
- Histórico e auditoria
- Integração assistida com WhatsApp Business via WhatsApp Web oficial, sem Cloud API
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
Requer PostgreSQL, HTTPS e volume persistente montado em `EVIDENCE_STORAGE_PATH`. Nunca versionar `.env` ou credenciais. No Railway, conecte um PostgreSQL e um Volume ao serviço antes de habilitar evidências em produção.

## Segurança
O modelo `StaffUser` foi reservado para autenticação e RBAC de ADMIN, CENTRAL, TECHNICIAN e SUPERVISOR. As telas internas ainda não devem ser expostas publicamente até a camada de sessão/autenticação estar ativa.


## WhatsApp Business
A operação usa o WhatsApp Web oficial como dispositivo vinculado ao número Business. O sistema apenas prepara links e textos para conversas; não lê a sessão, não automatiza cliques e não usa bibliotecas não oficiais para controlar o WhatsApp Web. O operador confirma o envio no próprio WhatsApp.
