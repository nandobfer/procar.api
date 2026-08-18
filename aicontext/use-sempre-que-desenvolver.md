# Use Sempre Que Desenvolver

## Principios

- Comece com a menor implementacao correta.
- Descreva o sistema existente antes de propor uma arquitetura ideal.
- Preserve a separacao atual entre rotas, classes de dominio e utilitarios em
  mudancas locais.
- Prefira tipos explicitos nos limites publicos.
- Nao esconda incerteza: use `TBD` em vez de inventar contratos.
- Nao trate codigo comentado, legado ou sem caller como funcionalidade ativa.

## Estrutura atual

```text
index.ts                  bootstrap e middlewares Express
routes.ts                 rotas de nivel superior
src/rest/                 handlers HTTP
src/class/                dominio e persistencia
src/middlewares/          enriquecimento e verificacao de requests
src/tools/                utilitarios sem estado de dominio
src/prisma.ts             PrismaClient compartilhado
src/templates/            artefatos usados na geracao de PDF
prisma/                   schema e migracoes
```

As classes `Order`, `Customer` e `Item` combinam regras de negocio e acesso ao
Prisma. Nao introduza uma camada de service ou repository apenas por preferencia
arquitetural; faca isso somente quando o escopo justificar.

## TypeScript e contratos

- O projeto usa `strict: true`, CommonJS e imports relativos.
- Evite novos `any`, casts sem validacao e `@ts-ignore`.
- Valide query, body e multipart em runtime. Um cast `as Tipo` nao valida dados.
- Normalize numeros, datas e campos opcionais de forma explicita.
- Lance instancias de `Error`, nao strings.
- Preserve `snake_case` nos contratos existentes e `camelCase` em funcoes e
  metodos novos, salvo quando o dominio exigir outra forma.

## API e erros

- Mantenha handlers finos e mova regra reutilizavel para o dominio.
- Use status HTTP coerentes em novos endpoints.
- Nao retorne o objeto bruto recebido em `catch`.
- Nao registre payloads completos de pedidos, clientes, anexos ou PDFs.
- Diferencie input invalido, recurso inexistente, conflito e erro interno.

O comportamento legado pode ser preservado por compatibilidade, mas nao deve ser
copiado para endpoints novos. Consulte `use-quando-desenvolver-api.md`.

## Banco e filesystem

- Use o `PrismaClient` compartilhado de `src/prisma.ts`.
- Analise concorrencia, unicidade e impacto em clientes compartilhados antes de
  alterar pedidos.
- Nao edite migracoes historicas nem resete dados nao descartaveis.
- Aguarde gravacoes de arquivo antes de confirmar sucesso em codigo novo.
- Valide quantidade, tamanho, extensao e tipo MIME de novos uploads.

## Testes

- Teste comportamento e contratos publicos, nao detalhes internos.
- Para fluxos criticos, cubra sucesso, input invalido, recurso ausente, conflito
  e falha da dependencia.
- Isole Prisma, filesystem e relogio quando o comportamento depender deles.
- Nao use banco ou servicos externos reais em testes automatizados.
- A ausencia atual de suite nao justifica adicionar comportamento critico sem
  testes; documente qualquer excecao.

## Checklist de encerramento

1. Inputs novos possuem validacao runtime.
2. Erros e logs nao vazam detalhes internos ou dados pessoais.
3. Efeitos no banco, filesystem, PDF e tipos exportados foram considerados.
4. Testes foram adicionados ou a ausencia foi justificada.
5. `npx tsc --noEmit` foi executado quando aplicavel.
6. A documentacao contextual foi atualizada se o contrato mudou.
7. Nenhum segredo ou valor real de ambiente foi adicionado.
