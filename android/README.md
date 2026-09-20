# CARIRI CENTRAL 24h — Android

Aplicativo Android por perfis, integrado ao sistema web de produção.

## Perfis
- ADMIN, CENTRAL, SUPERVISOR: interface web autenticada correspondente.
- TECHNICIAN: interface operacional do Técnico Externo.

## Segurança
O aplicativo não armazena senha. A autenticação permanece no servidor CARIRI CENTRAL 24h.
O WebView aceita apenas o domínio oficial do sistema e links externos são enviados ao navegador/app apropriado.

## Localização
O projeto prevê foreground service Android para localização operacional do Técnico Externo. A ativação deve ocorrer somente durante operação autorizada e exige permissões Android.

## Build
Abra a pasta android no Android Studio e gere APK assinado para distribuição interna.
