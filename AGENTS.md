# AGENTS.md

Guia normativo para agentes de IA e colaboradores que trabalhem neste
repositorio.

## 1. Ordem obrigatoria de leitura

Antes de implementar, leia nesta ordem:

1. `aicontext/README.md`
2. `aicontext/use-sempre-que-desenvolver.md`
3. O guia relacionado a tarefa:
   - API: `aicontext/use-quando-desenvolver-api.md`
   - Banco e Prisma: `aicontext/use-quando-alterar-banco-de-dados.md`
   - PDF, anexos e filesystem: `aicontext/use-para-gerar-pdfs-e-gerenciar-arquivos.md`
   - Docker e deploy: `aicontext/use-para-atualizar-containers-e-deploy.md`
   - Arquitetura: `aicontext/use-diretrizes-do-projeto.md`
4. A documentacao do modulo afetado em `aicontext/modules/`.

## 2. Estado atual

A API de pedidos esta ativa. Ela inclui clientes, catalogo de itens, snapshots de
itens por pedido, anexos e geracao de PDF. Autenticacao, usuarios, recuperacao de
senha, email e Socket.IO nao fazem parte do fluxo ativo.

Preserve nos documentos a distincao entre `Implementado`, `Verificado`,
`Planejado` e `TBD`. Codigo comentado, sem registro no bootstrap ou sem callers
nao deve ser descrito como funcionalidade implementada.

## 3. Regras nao negociaveis

- Use TypeScript em modo `strict`. Nao introduza `any` ou `@ts-ignore` sem uma
  justificativa concreta.
- Valide em runtime todo novo input HTTP antes de usa-lo em regras de negocio,
  Prisma, filesystem ou geracao de PDF.
- Nao exponha erros internos, stack traces, credenciais ou dados pessoais em
  respostas e logs.
- Preserve a arquitetura atual durante alteracoes locais. Nao crie camadas,
  abstracoes ou compatibilidade retroativa sem necessidade concreta.
- Trate mudancas nos formatos de `Order`, `Customer`, `Item`, `Attachment` e nas
  respostas HTTP como mudancas de contrato.
- Nao presuma que o item do catalogo continua sincronizado com o snapshot salvo
  no pedido.
- Nao altere migracoes Prisma historicas ja aplicadas. Nunca execute reset ou
  operacao destrutiva contra dados nao descartaveis.
- O template `src/templates/procar_form.pdf` e o diretorio gravavel `static/`
  sao dependencias de runtime.
- Nunca adicione `.env`, backups de ambiente, tokens, senhas ou URLs com
  credenciais ao repositorio, documentacao, imagem ou logs.
- Alteracoes de contrato, arquitetura, comportamento ou ambiente devem atualizar
  o arquivo correspondente em `aicontext/`.

## 4. Operacao e ferramentas

- Nao existe gerenciador de pacotes oficialmente definido: ha `yarn.lock`, mas
  os scripts e o Dockerfile usam npm. Nao troque ou regenere lockfiles sem uma
  decisao explicita.
- `npm run cptypes` apaga e substitui tipos em um repositorio frontend irmao.
  Execute somente quando solicitado e com o caminho de destino confirmado.
- `npm run deploy` depende de `dockerbp`, do host SSH `boz` e de configuracao
  externa. Nao o execute como verificacao comum.
- `src/scripts/mapAndRegisterProducts.ts` executa imediatamente e grava no banco.
  Nao o importe nem execute durante testes ou verificacoes comuns.

## 5. Verificacao minima

Execute conforme o escopo:

1. `npx tsc --noEmit` para checagem de tipos sem gerar `dist/`.
2. `npm run build` quando a emissao, os tipos gerados ou o container forem
   afetados.
3. Testes focados quando existirem. O script `npm test` atual apenas falha porque
   ainda nao ha suite configurada.
4. `npx prisma validate` para alteracoes no schema Prisma.
5. `npx prisma generate` quando o schema mudar.
6. `docker build .` quando o Dockerfile ou dependencias de runtime mudarem.

Nao use banco, SMTP ou servicos externos reais em testes automatizados.

## 6. Documentacao

- `aicontext/` contem contratos tecnicos, estado verificado e decisoes.
- Um novo dominio deve receber `aicontext/modules/<dominio>.md`.
- Novas variaveis devem ser documentadas e receber exemplo sanitizado quando um
  `.env.example` existir.
- Evite repetir regras em varios arquivos; prefira links para o guia responsavel.
- Nao copie segredos ou dados pessoais para exemplos.
