# Modulo: Customers

## Estado

**Implementado**: clientes sao criados e atualizados pelo fluxo de pedidos e
podem ser buscados por nome. Nao existe router CRUD independente registrado.

## Arquivos

- `src/class/Customer.ts`: modelo de dominio, listagem e busca.
- `src/class/Order.ts`: criacao e atualizacao persistente.
- `src/rest/order/order.ts`: endpoint de busca.
- `prisma/schema.prisma`: modelo e relacao com pedidos.

## Campos

`name` e obrigatorio. `email`, `cpf_cnpj`, `rg_ie`, endereco, bairro, cidade,
estado, telefone e CEP sao opcionais. `email` e `cpf_cnpj` possuem restricao
unica quando informados.

Os dados sao pessoais. Nao os registre integralmente nem os use em fixtures ou
exemplos versionados.

## Criacao e vinculo

Ao criar pedido, `connectOrCreate` procura o cliente pelo ID recebido. Sem ID,
usa um valor sentinela que leva a criacao. O pedido guarda uma relacao
obrigatoria e varios pedidos podem compartilhar o mesmo cliente.

## Atualizacao

Atualizar um pedido executa nested update no cliente relacionado. Essa operacao
afeta todos os pedidos que apontam para o mesmo cliente. Nao transforme esse
comportamento em copia por pedido, ou o inverso, sem migracao e decisao de
produto explicitas.

## Busca

`GET /order/query-customer?query=<valor>` carrega todos os clientes, busca por
`name` com Fuse.js e retorna os primeiros dez resultados. Nao ha paginacao nem
busca no banco.

## Regras

- Valide e normalize documentos, email, telefone e CEP antes de novas gravacoes.
- Trate conflitos de unicidade como conflito, nao como erro interno generico.
- Nao exponha mais campos do que o consumidor necessita.
- Avalie impacto em clientes compartilhados em toda mutacao.
- Novos endpoints devem incluir autenticacao e autorizacao quando a politica do
  projeto for definida; hoje ela e **TBD**.
