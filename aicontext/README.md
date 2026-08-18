# Documentacao de Contexto para IA

Esta pasta concentra contratos tecnicos, estado verificado e regras de
desenvolvimento do `procar.api`.

## Estado da documentacao

Os documentos usam quatro estados:

- **Implementado**: comportamento presente em um caminho ativo do codigo. A
  cobertura automatizada, quando existir, deve ser informada separadamente.
- **Verificado**: fato observado diretamente no codigo, configuracao, schema ou
  artefato do repositorio.
- **Planejado**: decisao ainda nao implementada.
- **TBD**: depende de pesquisa ou de uma decisao ainda nao tomada.

Documentacao planejada nao prova que o codigo correspondente existe. Codigo
comentado ou nao registrado no bootstrap nao conta como implementado.

## Ordem de leitura

1. Leia `use-sempre-que-desenvolver.md` em toda alteracao de codigo.
2. Leia `use-diretrizes-do-projeto.md` para arquitetura ou novas dependencias.
3. Leia o guia especifico da tarefa.
4. Leia os modulos afetados em `modules/`.

## Guias

| Arquivo | Quando usar |
| --- | --- |
| `use-sempre-que-desenvolver.md` | Toda alteracao de codigo |
| `use-diretrizes-do-projeto.md` | Arquitetura, dependencias e decisoes tecnicas |
| `use-quando-desenvolver-api.md` | Rotas, contratos HTTP, validacao e erros |
| `use-quando-alterar-banco-de-dados.md` | Prisma, modelos e migracoes |
| `use-para-gerar-pdfs-e-gerenciar-arquivos.md` | PDFs, anexos e filesystem |
| `use-para-atualizar-containers-e-deploy.md` | Dockerfile, Compose e deploy |

## Modulos

| Arquivo | Conteudo |
| --- | --- |
| `modules/orders.md` | Pedidos, totais, numeracao, anexos e PDF |
| `modules/customers.md` | Clientes, busca e relacao com pedidos |
| `modules/items.md` | Catalogo e snapshots de itens por pedido |
| `modules/infrastructure.md` | Express, Prisma, ambiente, metricas e runtime |

## Convencoes

- `use-sempre-*`: regras aplicaveis a toda tarefa.
- `use-quando-*`: regras para um contexto de desenvolvimento.
- `use-para-*`: procedimento para uma tarefa especifica.
- `modules/*`: estado e contrato de um dominio.

## Atualizacao

Atualize esta documentacao quando houver:

- Mudanca em endpoint, payload, resposta ou status HTTP relevante.
- Mudanca em modelo, migracao ou representacao persistida.
- Nova variavel de ambiente ou dependencia de runtime.
- Mudanca no fluxo de PDF, anexos, container ou deploy.
- Ativacao ou remocao de um subsistema.
- Novo modulo de dominio ou decisao arquitetural.

Detalhes locais sem efeito em contrato, arquitetura ou operacao nao precisam ser
documentados. Mantenha cada regra no arquivo mais especifico e use referencias
em vez de duplicacao.
