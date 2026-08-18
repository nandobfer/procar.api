# Diretrizes do Projeto

## Objetivo

O `procar.api` gerencia orcamentos e pedidos, clientes, produtos reutilizaveis,
anexos e formularios PDF da Procar.

## Estado

**Implementado**: API Express de pedidos, clientes consultados pelo fluxo de
pedidos, catalogo de itens, anexos, PDF, arquivos estaticos e metricas.

**Verificado**: nao ha autenticacao ativa, suite de testes, lint, CI, health
check ou Compose versionado sob o nome padrao.

**TBD**: gerenciador de pacotes oficial, versao canonica entre `package.json` e
`src/version.ts`, politica de autenticacao e estrategia de armazenamento de
arquivos para producao.

## Fluxo principal

```text
Cliente HTTP
  -> middlewares Express em index.ts
  -> routes.ts
  -> src/rest/order/order.ts ou item.ts
  -> Order / Customer / Item
  -> PrismaClient compartilhado
  -> MySQL
```

As rotas fazem parsing e constroem respostas. As classes de dominio executam
calculos e queries Prisma. Nao existe hoje separacao formal entre controller,
service e repository.

## Stack verificada

| Area | Tecnologia |
| --- | --- |
| Runtime de container | Node.js 22 |
| Linguagem | TypeScript 5, modo strict |
| HTTP | Express 4 |
| ORM | Prisma 5 |
| Banco | MySQL |
| Busca | Fuse.js 7 em memoria |
| PDF | pdf-lib e fontkit |
| Upload | express-fileupload |
| Metricas | express-prom-bundle |
| Modulos compilados | CommonJS, target ES2016 |

## Organizacao

- `index.ts`: carrega ambiente, registra middlewares e inicia o servidor.
- `routes.ts`: registra `/`, `/order` e `/ip`.
- `src/rest/order/`: superficie HTTP ativa.
- `src/class/`: dominio, calculos, PDF e acesso ao Prisma.
- `src/middlewares/`: verificacoes e dados anexados ao request.
- `src/tools/`: filesystem, formatacao e utilitarios herdados.
- `prisma/schema.prisma`: contrato atual do banco.
- `prisma/migrations/`: historico imutavel de migracoes.
- `src/templates/procar_form.pdf`: template obrigatorio em runtime.
- `static/`: saida gravavel e servida por HTTP; nao versionada.

## Representacoes persistidas

- IDs sao CUIDs gerados pelo Prisma, salvo quando um item informa seu proprio ID.
- Numero do pedido e uma string unica.
- Datas de pedido e validade sao strings no banco e numeros na classe `Order`.
- Valores monetarios usam `Float`.
- Itens e anexos usam campos Prisma `Json`, mas o codigo grava strings JSON
  nesses campos e faz parse no construtor.
- Itens do pedido sao snapshots, sem relacao persistente com o catalogo `Item`.
- Clientes podem ser compartilhados por varios pedidos.

## Configuracao

| Variavel | Estado | Uso |
| --- | --- | --- |
| `PORT` | Ativa | Porta HTTP, sem default |
| `DATABASE_URL` | Ativa | Conexao MySQL do Prisma |
| `URL` | Ativa | Base das URLs de anexos |
| `DEV` | Ativa | Qualquer valor nao vazio seleciona URL local fixa |
| `WEBSITE_URL` | Presente | Helper aparentemente sem caller ativo |
| `SMTP_USER` | Inativa | Mailer nao usado pelo fluxo ativo |
| `SMTP_PASS` | Inativa | Mailer nao usado pelo fluxo ativo |
| `JWT_SECRET` | Inativa | Autenticacao ativa nao existe |

Nao ha validacao centralizada do ambiente. Valores ausentes podem falhar apenas
quando o fluxo correspondente for executado.

## Subsistemas inativos e legado

Nao descreva como ativos sem registrar e testar explicitamente:

- Login, usuarios e recuperacao de senha.
- Middlewares de autenticacao e de usuario.
- Socket.IO em `src/io.ts`.
- Email em `src/class/Mailer.ts`.
- `src/class/Trip/ExpenseNode.ts`.
- Utilitarios sem callers ativos.

## Riscos conhecidos

- Rotas de negocio nao possuem autenticacao ou autorizacao.
- CORS e permissivo e combina origem `*` com credenciais.
- Limites de body chegam a `10000mb` e uploads nao possuem validacao.
- Listagens e buscas carregam tabelas completas em memoria.
- Numero seguinte de pedido nao e reservado por transacao.
- Atualizar um pedido pode alterar um cliente compartilhado.
- Exclusao de anexo remove metadados, mas nao o arquivo.
- Nao ha graceful shutdown do servidor ou desconexao explicita do Prisma.
- Existem arquivos `.bak` versionados com configuracao sensivel; valores
  presentes neles devem ser tratados como expostos e nunca copiados.

Estes riscos documentam o estado atual. Corrigi-los exige analisar compatibilidade
e escopo, nao adicionar workarounds silenciosos.
