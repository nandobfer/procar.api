# Modulo: Infrastructure

## Estado

**Implementado**: Express, Prisma, metricas, CORS, parsing de body e cookies,
uploads, arquivos estaticos, Docker e persistencia local.

**Inativo**: Socket.IO, Mailer e autenticacao presentes no codigo nao sao
inicializados pelo bootstrap atual.

## Bootstrap

`index.ts` registra, nesta ordem:

1. Handler de `unhandledRejection`.
2. Middleware de metricas.
3. CORS permissivo.
4. Parsers JSON e URL-encoded.
5. Cookie parser.
6. Upload parser.
7. Router principal.
8. Arquivos estaticos em `/static`.
9. Servidor HTTP com timeout de uma hora.

Nao ha graceful shutdown ou chamada explicita a `prisma.$disconnect()`.

## Prisma

`src/prisma.ts` exporta uma instancia compartilhada. Nao crie um novo
`PrismaClient` por request. O datasource usa `DATABASE_URL` e MySQL.

## HTTP e seguranca

- CORS aceita qualquer origem e declara credenciais.
- Body JSON e URL-encoded aceitam ate `10000mb`.
- Uploads nao possuem limite, filtro MIME ou autenticacao.
- `/ip` expoe dados de proxy e conexao.
- Erros e payloads sao registrados com `console.log` em varios fluxos.

Esse e o estado atual, nao um padrao para endpoints novos. Mudancas de seguranca
podem afetar consumidores e devem ser coordenadas, mas novos fluxos nao devem
ampliar essas permissoes.

## Metricas

`express-prom-bundle` inclui metodo, path e status. O label `project_name` ainda
usa uma identidade herdada de outro projeto. Trate a correcao como alteracao
operacional e verifique dashboards antes de renomear.

## Ambiente

Variaveis ativas: `PORT`, `DATABASE_URL`, `URL` e `DEV`. Variaveis de SMTP,
website e JWT pertencem a fluxos inativos ou sem callers verificados. Nao
registre valores e nao use arquivos `.bak` como exemplos seguros.

## Filesystem e container

- `static/` precisa ser gravavel e persistente.
- `src/templates/procar_form.pdf` precisa existir em runtime.
- O container usa Node.js 22, executa como root e aplica migracoes no startup.
- Nao ha health check.
- A rede MySQL e o volume do Compose sao externos ao processo Node.

## Codigo inativo

Antes de reutilizar email, Socket.IO, login, recovery ou users:

1. Confirme a necessidade atual.
2. Remova identidade e configuracao herdadas.
3. Defina contratos, seguranca e ownership.
4. Registre o subsystem no bootstrap.
5. Adicione testes e atualize esta documentacao.

A mera existencia do arquivo nao comprova que a integracao funciona.
