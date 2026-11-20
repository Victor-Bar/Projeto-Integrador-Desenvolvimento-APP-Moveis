# Notas Seguras — Projeto Integrador 2º Semestre de 2026

Aplicativo de apoio camuflado para mulheres em situação de violência doméstica. À primeira vista ele é um *app de notas comum*; só quem conhece o código secreto acessa a área de apoio, com botão de SOS, contatos de confiança e configurações da conta.

> *Protótipo acadêmico.* Este aplicativo não substitui atendimento policial, jurídico, psicológico ou de saúde real. Todos os dados usados nos testes são fictícios.
> *Em emergência, ligue 190 (Polícia Militar). Central de Atendimento à Mulher: 180 (gratuito, 24h).*

## Equipe

- Giovane Vitor Carbonera
- Matheus Moraes de Mattos
- Victor Baratta

## Como funciona o disfarce

- *Entrada:* o app abre na lista de notas. Ao digitar o código secreto *[codigo]* dentro de uma nota, o app abre a área de apoio (tela SOS). O código é apagado do texto da nota.
- *Login:* na primeira vez, a área de apoio pede usuário e senha da usuária.
- *Saída rápida:* na tela SOS, ao chacoalhar o celular, o app volta imediatamente para a lista de notas.

## Tecnologias

- *App:* React Native com Expo e React Navigation (Stack)
- *API:* Node.js com Express
- *Dados:* PostgreSQL (`blocodenotas`), com tabelas para usuárias, contatos e chamados SOS

## Como rodar

### Opção 1 — Windows
Execute o arquivo stater.cmd na raiz do projeto. Ele inicia a API e o Expo ao mesmo tempo.

### Opção 2 — Manual
Em um terminal, a API:
bash
cd api
npm install
npm start

A API sobe em http://localhost:3000.

Configure as credenciais do PostgreSQL no arquivo `api/.env` antes de iniciar. Há um modelo em `api/.env.example`.
O usuário configurado precisa poder criar e excluir bancos de dados. **A cada inicialização, a API apaga e recria
completamente o banco configurado em `PGDATABASE` (por padrão, `blocodenotas`); todos os dados anteriores são perdidos.**

Em outro terminal, na raiz do projeto, o app:
bash
npm install
npx expo start

Aperte *w* para abrir no navegador ou escaneie o QR code com o Expo Go.

> Para testar no celular, ajuste o IP do computador em src/configs/config.js (apiBaseUrl).

### Primeiro acesso
Crie uma usuária pelo painel administrativo em http://localhost:3000/admin (botão *Adicionar*) e use esse usuário e senha no login do app. Como o banco é recriado quando a API inicia, será necessário criar a usuária novamente depois de cada reinicialização.

## Rotas da API

| Recurso | Método | Rota | O que faz |
|---|---|---|---|
| Usuárias | GET | /api/users | Lista as usuárias |
| | GET | /api/users/:userId | Busca uma usuária |
| | POST | /api/users | Cria uma usuária |
| | PUT | /api/users/:userId | Atualiza uma usuária |
| | DELETE | /api/users/:userId | Exclui uma usuária |
| Login | POST | /api/login | Entra e devolve o token |
| | GET | /api/me | Dados da usuária logada |
| Contatos | GET | /api/contacts | Lista os contatos da usuária logada |
| | GET | /api/contacts/:contactId | Busca um contato |
| | POST | /api/contacts | Cria um contato |
| | PUT | /api/contacts/:contactId | Atualiza um contato |
| | DELETE | /api/contacts/:contactId | Exclui um contato |
| SOS | POST | /api/sos | Registra um chamado SOS da usuária logada |
| | GET | /api/admin/sos | Lista os chamados (painel) |
| | PUT | /api/admin/sos/:sosId | Atualiza um chamado |
| | DELETE | /api/admin/sos/:sosId | Exclui um chamado |

*Relacionamentos:* cada contato pertence a uma usuária (só a usuária logada vê e altera os próprios contatos), e cada chamado SOS guarda o userId de quem o acionou.

*Erros:* a API responde 400 para dados inválidos, 401 para sessão inválida, 404 quando o registro não existe e 409 para usuária ou e-mail já cadastrados.

## Estrutura de pastas


api/                 → back-end (Express)
  server.js          → rotas da API e painel administrativo
  public/admin.js    → script do painel
src/
  screens/           → telas do app (notas, SOS, contatos, configuração, login)
  services/          → chamadas à API
  contexts/, hooks/  → dados compartilhados entre as telas
  configs/           → endereço da API e código secreto
  navigations/       → navegação (Stack)


## Matriz de responsabilidades

| Integrante | CRUD individual | Outras entregas |
|---|---|---|
| *Giovane Vitor Carbonera* | Chamados SOS (sosRequests) | Projeto Expo base, tela SOS, reestruturação do app e da API (login, contexts, services), painel administrativo, saída rápida |
| *Matheus Moraes de Mattos* | Contatos de confiança (contacts) | Tela de notas e gatilho de entrada (Entrega 2), base da API em Express e primeira versão do CRUD de contatos integrado à API com validações (18/11), USO_IA.md, organização do Kanban |
| *Victor Baratta* | Usuárias (users) | Tela de configuração da usuária com criar, ver, editar e excluir (Entrega 2) e correção da navegação |

O histórico completo de commits de cada integrante está no GitHub.

## Uso de IA

O uso de ferramentas de IA está documentado em [USO_IA.md](USO_IA.md).