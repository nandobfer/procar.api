# Use Quando Alterar Banco de Dados

## Estado

**Implementado**: Prisma 5 com MySQL, tres modelos e oito migracoes historicas.
O container executa `prisma migrate deploy` antes de iniciar a API.

## Arquivos responsaveis

- `prisma/schema.prisma`: schema atual.
- `prisma/migrations/*/migration.sql`: historico aplicado.
- `src/prisma.ts`: instancia compartilhada de `PrismaClient`.
- `src/class/Order.ts`, `Customer.ts` e `Item.ts`: mapeamento e queries.

## Modelos atuais

- `Order`: numero unico, tipo, datas como strings, valores `Float`, itens e
  anexos em JSON e relacao obrigatoria com cliente.
- `Customer`: dados de contato e documento, com email e CPF/CNPJ opcionais e
  unicos.
- `Item`: descricao unica e preco unitario `Float`.

Consulte os arquivos em `modules/` antes de alterar a semantica desses campos.

## Fluxo de alteracao

1. Identifique os dados existentes e se a mudanca e compativel.
2. Atualize `prisma/schema.prisma`.
3. Gere uma nova migracao em ambiente de desenvolvimento com
   `npx prisma migrate dev --name <nome>`.
4. Revise integralmente o SQL gerado, inclusive warnings destrutivos.
5. Execute `npx prisma validate`.
6. Execute `npx prisma generate`.
7. Atualize classes, contratos HTTP, testes e `aicontext` afetados.
8. Use `npx prisma migrate deploy` apenas para aplicar migracoes ja criadas em
   ambiente de deploy.

Nao ha scripts Prisma no `package.json`; os comandos acima sao diretos.

## Regras de seguranca

- Nunca edite uma migracao historica que possa ter sido aplicada.
- Nunca execute `prisma migrate reset` contra dados nao descartaveis.
- Faca backup e defina rollback antes de alteracao destrutiva.
- Nao adicione campo obrigatorio sem estrategia para linhas existentes.
- Avalie corrida antes de implementar sequencias com `findFirst` seguido de
  `create`.
- Preserve unicidade de numero, descricao, email e CPF/CNPJ deliberadamente.
- Nao registre `DATABASE_URL` nem erros que exponham credenciais.

## Representacoes que exigem cuidado

- Datas: banco usa string; classe `Order` converte com `Number`.
- Dinheiro: `Float` possui arredondamento binario.
- JSON: o campo Prisma `Json` recebe atualmente uma string produzida por
  `JSON.stringify`, nao um array JSON nativo.
- Cliente: atualizar via pedido pode afetar todos os pedidos do mesmo cliente.
- Itens: snapshots de pedido nao possuem foreign key para o catalogo.

Alterar qualquer uma dessas representacoes exige estrategia de migracao e
compatibilidade com consumidores existentes.

## Container

O `CMD` do Dockerfile executa migracoes em todo startup. Uma migracao lenta,
destrutiva ou invalida impede a API de subir. Nao mova schema changes para codigo
de bootstrap e nao dependa de `migrate dev` em producao.
