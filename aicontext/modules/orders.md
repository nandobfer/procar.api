# Modulo: Orders

## Estado

**Implementado**: CRUD, busca, numeracao, validacao de numero, snapshots de itens,
anexos e exportacao PDF. Nao ha testes automatizados nem autenticacao ativa.

## Arquivos

- `src/rest/order/order.ts`: endpoints.
- `src/class/Order.ts`: persistencia, calculos, anexos e PDF.
- `src/middlewares/requireOrderId.ts`: carrega pedido pela query.
- `prisma/schema.prisma`: modelo persistido.

## Contrato principal

Um pedido contem:

- `id`, `number` e `type` (`budget` ou `order` no tipo TypeScript).
- `order_date` e `validity` como numeros na classe e strings no banco.
- `discount`, `additional_charges`, `notes` e `payment_terms`.
- Um `Customer` obrigatorio.
- Arrays de `Item` e `Attachment` persistidos como string JSON em campos `Json`.

Subtotal e a soma de `unit_price * quantity`. Total e subtotal mais acrescimos
menos desconto.

## Criacao

`Order.create()` usa `connectOrCreate` pelo ID do cliente, inicializa anexos como
array vazio e serializa itens. O campo `type` recebido nao e enviado ao Prisma na
criacao; aplica-se o default `budget` do schema.

## Atualizacao

`Order.update()` pode alterar o pedido e atualizar o registro do cliente na
mesma operacao Prisma. Como clientes podem estar ligados a varios pedidos, essa
mutacao pode mudar os dados exibidos em pedidos anteriores.

## Numeracao e busca

- Numero e uma string unica.
- O proximo numero e calculado a partir do maior pedido lido, sem reserva
  transacional; criacoes concorrentes podem colidir.
- Busca carrega pedidos e clientes em memoria e usa Fuse.js.
- Ordenacao textual de numeros pode divergir da ordenacao numerica.

## Itens

Os itens no pedido sao snapshots. Alterar ou excluir o catalogo nao os atualiza.
Endpoints com `order_id` manipulam o array do pedido; sem `order_id`, manipulam o
catalogo. Consulte `items.md`.

## Anexos e PDF

Anexos sao gravados em `static/orders/<order-id>` e seus metadados entram no
pedido. A exclusao atual nao remove o arquivo. O PDF usa template fixo e ate 15
itens por pagina. Consulte
`../use-para-gerar-pdfs-e-gerenciar-arquivos.md`.

## Invariantes e riscos

- Numero deve permanecer unico.
- Cliente e itens devem existir no shape esperado antes de persistir.
- Datas, dinheiro e JSON exigem conversao explicita.
- `requireOrderId` nao garante que o pedido exista.
- Exclusao nao limpa arquivos associados.
- Rotas atuais podem retornar erros internos brutos.

Mudancas nesses comportamentos devem atualizar o guia de API e, quando houver
persistencia, o guia de banco.
