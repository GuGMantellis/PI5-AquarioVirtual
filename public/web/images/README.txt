=========================================================================
INSTRUÇÕES DE IMAGENS DO AQUÁRIO VIRTUAL
=========================================================================

Esta pasta "web/images/" é o local correto para colocar as fotos reais
dos seus peixes. O código do site e o banco de dados Firebase estão
configurados para ler as imagens deste diretório.

COMO USAR:
1. Salve as fotos dos peixes nesta pasta.
2. No formulário do site ou no Firebase, insira o caminho relativo da imagem.
   
Exemplos de mapeamento:
- Se você salvar uma foto chamada "neon.jpg" nesta pasta:
  Caminho a digitar no cadastro: images/neon.jpg

- Se você salvar uma foto chamada "acara_disco.png" nesta pasta:
  Caminho a digitar no cadastro: images/acara_disco.png

Nomes pré-configurados no arquivo "firebase_structure.json":
- Neon Tetra:      images/neon_tetra.png
- Acará-Disco:     images/acara_disco.png
- Guppy (Lebiste): images/guppy.png

DICA VISUAL:
Recomendamos utilizar imagens com fundo transparente (.png) para que elas 
flutuem de forma mais realista e integrada no fundo azul do aquário virtual!

Caso não coloque nenhuma imagem ou digite um caminho inexistente, o sistema
ativará automaticamente uma ilustração vetorial animada (SVG) em 3D que 
nada e mexe a cauda de verdade, para que o site nunca fique com visual quebrado!
