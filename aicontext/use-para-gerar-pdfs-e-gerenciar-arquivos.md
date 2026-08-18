# Use Para Gerar PDFs e Gerenciar Arquivos

## Estado

**Implementado**: anexos e PDFs sao gravados no filesystem local sob `static/`.
O Express publica esse diretorio em `/static`.

## Dependencias de runtime

- `src/templates/procar_form.pdf`: template AcroForm obrigatorio.
- `src/class/PdfHandler.ts`: preenche e salva formularios.
- `src/class/Order.ts`: converte pedido em campos do PDF.
- `src/tools/saveFile.ts`: grava anexos e monta URLs.
- `static/orders/`: diretorio gravavel de saida.
- `URL` ou o modo `DEV`: base usada nas URLs de anexos.

O Dockerfile copia `src/templates/` para a imagem. O Compose de referencia monta
um volume em `/app/static`.

## Geracao de PDF

- O endpoint e `GET /order/pdf?order_id=<id>`.
- Totais sao formatados em moeda e datas em `pt-BR`.
- Cada pagina recebe no maximo 15 itens.
- O template e recarregado para cada pagina de itens.
- O arquivo segue `static/orders/Pedido_<cliente>_<numero>.pdf`.
- A resposta atual e uma string com o caminho local, nao uma URL publica.

Nomes dos campos AcroForm sao parte do contrato entre codigo e template. Ao
alterar o PDF, valide todos os nomes e gere um arquivo real de smoke test sem
usar dados pessoais.

## Anexos

- O multipart associa `file0`, `file1`, ... aos metadados de `body.data`.
- Nomes sao normalizados por `slugify`.
- A URL e persistida no array de anexos do pedido.
- A implementacao atual retorna antes de confirmar que o stream terminou.
- Excluir anexo remove apenas o metadado; o arquivo permanece no disco.
- Excluir pedido tambem nao remove seus arquivos.

## Regras para alteracoes

- Valide quantidade, tamanho, extensao e tipo MIME antes da gravacao.
- Nao confie no nome ou MIME enviado pelo cliente.
- Impeca path traversal e colisoes de nome.
- Aguarde o termino da escrita e normalize falhas de filesystem.
- Defina limpeza compensatoria quando banco e arquivo forem alterados juntos.
- Preserve o volume persistente do container.
- Nao registre conteudo de arquivos, campos completos do PDF ou dados pessoais.
- Use `Error` para falhas; nao lance strings.

## Riscos conhecidos

`PdfHandler.fillFields()` registra nomes, valores e erros dos campos. Isso pode
expor informacoes do cliente. `saveFile()` nao aguarda a escrita. Os dois pontos
devem ser tratados ao tocar nesses fluxos, com testes de regressao.

## Verificacao

1. Gere PDF com zero, um, 15 e mais de 15 itens.
2. Confirme template, campos, totais, datas e paginas.
3. Reinicie o container e confirme persistencia dos arquivos.
4. Teste falha de diretorio, arquivo invalido e escrita interrompida.
5. Confirme que logs nao contem dados do pedido ou cliente.
