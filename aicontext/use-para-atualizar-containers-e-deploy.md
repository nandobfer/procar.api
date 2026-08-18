# Use Para Atualizar Containers e Deploy

## Estado

**Implementado**: Dockerfile multi-stage com Node.js 22, build TypeScript,
geracao do Prisma Client e migracao antes do startup.

**Verificado**: o unico Compose versionado e `docker-compose.yml.bak`; o nome
padrao `docker-compose.yml` esta ignorado. O script de deploy depende de
ferramentas e hosts externos ao repositorio.

## Build atual

O Dockerfile:

1. Copia `package*.json` e `prisma/`.
2. Executa `npm install --ignore-scripts`.
3. Executa `npx prisma generate`.
4. Executa `npm run build`.
5. Remove dependencias de desenvolvimento.
6. Copia `node_modules`, `dist`, `prisma` e `src/templates`.
7. Executa `npx prisma migrate deploy && node dist/index.js`.

## Runtime e persistencia

- `PORT`, `DATABASE_URL` e `URL` sao necessarias para o fluxo principal.
- `static/` precisa ser gravavel e persistente.
- O Compose de referencia usa volume nomeado e uma rede MySQL externa.
- Nao ha health check.
- O processo executa como root.
- `my.cnf` existe, mas nao e montado pelo Compose de referencia.

## Regras

- Nunca copie `.env`, arquivos `.bak` com segredos ou credenciais para a imagem.
- Use placeholders em exemplos e secret injection em deploy.
- Preserve o template PDF e o diretorio `static/` na imagem final.
- Revise o impacto de toda migracao antes de permitir startup em producao.
- Nao adicione servicos ao Compose sem necessidade concreta.
- Nao fixe `container_name` novo sem necessidade operacional.
- Prefira usuario sem privilegios e health check em futuras melhorias.
- Nao troque npm/Yarn ou lockfiles incidentalmente em uma alteracao Docker.

## Reprodutibilidade

Ha `yarn.lock`, mas o Dockerfile usa npm e nao existe `package-lock.json`. O
build atual nao e lockfile-reproduzivel. A escolha do gerenciador e **TBD** e
deve ser resolvida em mudanca propria, incluindo scripts, CI e Dockerfile.

## Deploy

`npm run deploy` usa o comando local `dockerbp`, publica uma imagem e acessa o
host SSH `boz`. Esses pre-requisitos nao estao definidos no repositorio. Execute
o script somente por solicitacao explicita e depois de confirmar ambiente,
destino e credenciais.

## Verificacao

1. `npx tsc --noEmit`.
2. `docker build .`.
3. Confirme que nenhum segredo aparece no contexto ou nas camadas.
4. Confirme que o template PDF existe na imagem.
5. Suba contra banco descartavel e valide `migrate deploy`.
6. Verifique `/`, `/metrics` e escrita em `static/`.
7. Reinicie o container e confirme persistencia.
