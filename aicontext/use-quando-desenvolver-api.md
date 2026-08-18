# Use Quando Desenvolver API

## Estado

**Implementado**: as rotas abaixo estao registradas no Express. Nao existe
autenticacao ativa nem validacao runtime sistematica dos payloads.

## Rotas de nivel superior

| Metodo | Caminho | Comportamento atual |
| --- | --- | --- |
| `GET` | `/` | Retorna `{ version }` de `src/version.ts` |
| `GET` | `/ip` | Retorna informacoes de IP e headers de proxy |
| Varios | `/order` | Monta o modulo de pedidos |
| `GET` | `/metrics` | Endpoint padrao do middleware de metricas |
| `GET` | `/static/*` | Serve arquivos do diretorio `static/` |

## Pedidos e clientes

| Metodo | Caminho | Input principal | Resultado atual |
| --- | --- | --- | --- |
| `GET` | `/order` | `order_id` opcional | Um pedido ou todos |
| `POST` | `/order` | `OrderForm` no body | Cria e retorna pedido |
| `PUT` | `/order` | `order_id`, `OrderForm` | Atualiza pedido e cliente |
| `DELETE` | `/order` | `order_id` | Exclui e retorna `204` |
| `GET` | `/order/next-available-number` | Nenhum | Retorna proximo numero calculado |
| `GET` | `/order/query` | `query` | Busca pedidos em memoria |
| `GET` | `/order/query-customer` | `query` | Retorna ate 10 clientes |
| `GET` | `/order/validate-number` | `number` | Retorna booleano de disponibilidade |
| `POST` | `/order/attachment` | `order_id`, multipart e `body.data` JSON | Adiciona anexos |
| `DELETE` | `/order/attachment` | `order_id`, `attachment_id` | Remove metadado do anexo |
| `GET` | `/order/pdf` | `order_id` | Gera PDF e retorna caminho |

## Itens

| Metodo | Caminho | Comportamento atual |
| --- | --- | --- |
| `GET` | `/order/item` | Lista catalogo ou busca por `query` |
| `POST` | `/order/item` | Faz upsert no catalogo e, com `order_id`, adiciona snapshot ao pedido |
| `PUT` | `/order/item` | Atualiza catalogo ou snapshot quando ha `order_id` |
| `DELETE` | `/order/item` | Exclui catalogo ou remove snapshot quando ha `order_id` |

## Regras para alteracoes

- Valide query, body e multipart antes de acessar o dominio.
- Nao use somente `as Tipo` como validacao.
- Retorne `400` para input invalido, `404` para recurso ausente, `409` para
  conflito conhecido e `500` somente para falha interna inesperada.
- Use `201` em novos endpoints de criacao e nao envie body com `204`.
- Nao envie objetos brutos de erro ao cliente.
- Nao registre bodies completos, dados de clientes ou metadados sensiveis.
- Adicione paginacao antes de criar novas listagens sem limite.
- Nao adicione autenticacao parcial a uma unica rota sem uma politica definida.

O comportamento legado de status e erro pode exigir compatibilidade. Nao o
replique em endpoints novos.

## `requireOrderId`

O middleware exige apenas a presenca de `order_id` e atribui o resultado de
`Order.get()` a `request.order`. Ele nao rejeita pedido inexistente. Qualquer
alteracao deve tratar explicitamente `null` antes de usar o pedido.

## Multipart

O upload espera:

- `order_id` na query.
- `body.data` como string JSON de `Attachment[]`.
- Arquivos nomeados `file0`, `file1`, ... na mesma ordem dos metadados.

Mudancas nesse formato sao mudancas de contrato e devem atualizar tambem
`modules/orders.md` e o consumidor frontend.

## Testes minimos para novos contratos

1. Happy path e shape da resposta.
2. Query ou body ausente e invalido.
3. Recurso inexistente.
4. Conflito de unicidade.
5. Falha Prisma ou filesystem normalizada.
6. Autorizacao, se autenticacao vier a ser implementada.
