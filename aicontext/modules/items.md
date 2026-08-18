# Modulo: Items

## Estado

**Implementado**: catalogo reutilizavel e snapshots independentes dentro de
pedidos. Busca ocorre em memoria com Fuse.js.

## Dois conceitos de item

1. O modelo Prisma `Item` e o catalogo, com `id`, `description` unica e
   `unit_price`.
2. `Order.items` e um array de snapshots com os mesmos dados e `quantity`,
   serializado no pedido.

Nao existe foreign key nem sincronizacao automatica entre os dois conceitos.

## Operacoes HTTP

- `GET /order/item`: lista catalogo.
- `GET /order/item?query=<valor>`: busca descricao com threshold `0.2`.
- `POST /order/item`: upsert por ID no catalogo.
- `POST /order/item?order_id=<id>`: upsert e adiciona o resultado ao pedido.
- `PUT /order/item`: atualiza catalogo.
- `PUT /order/item?order_id=<id>`: atualiza snapshot correspondente.
- `DELETE /order/item?item_id=<id>`: exclui catalogo.
- `DELETE /order/item?item_id=<id>&order_id=<id>`: remove snapshot do pedido.

Atualizar o catalogo nao atualiza pedidos existentes. Excluir catalogo nao
remove snapshots.

## Persistencia

- Preco e convertido com `Number` e persistido como `Float`.
- Itens listados recebem `quantity: 1` em memoria.
- Descricao e unica no banco, mas o upsert usa ID como chave.
- Um POST com ID novo e descricao existente pode gerar conflito de unicidade.

## Script de registro

`src/scripts/mapAndRegisterProducts.ts` percorre todos os pedidos e chama
`Item.new()` para cada snapshot. O script executa imediatamente ao ser carregado,
nao possui dry-run, nao trata duplicatas e nao tem comando oficial no
`package.json`.

Nao importe nem execute esse arquivo em verificacoes comuns. Antes de uma
execucao manual, use backup, banco correto e uma estrategia idempotente.

## Regras

- Preserve a distincao entre catalogo e snapshot.
- Valide ID, descricao, quantidade e preco em runtime.
- Nao use quantidade negativa ou valor nao finito.
- Trate conflitos de descricao explicitamente.
- Para grandes catalogos, planeje busca e paginacao no banco em vez de carregar
  tudo em memoria.
