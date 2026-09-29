# ECOS Modeling 4.0 — Frontend

Frontend da nova versão da **ECOS Modeling**, uma ferramenta web para modelagem de Ecossistemas de Software (ECOS) utilizando a notação **Software Supply Network (SSN)**.

Esta versão está sendo reconstruída do zero com tecnologias atuais, buscando melhorar a experiência de modelagem, a organização do código e preparar a ferramenta para funcionalidades futuras de evolução, saúde e qualidade de ecossistemas de software.

---

## Tecnologias

O frontend utiliza:

- React
- TypeScript
- Vite
- React Flow (`@xyflow/react`)
- Zustand
- Lucide React

O **React Flow** é utilizado apenas como mecanismo de visualização e interação com o diagrama. O modelo conceitual da ECOS Modeling permanece independente da biblioteca gráfica.

---

## Estado atual

Esta é a versão inicial do novo editor da **ECOS Modeling 4.0**.

Atualmente já estão implementados:

- editor visual baseado em React Flow;
- modelo canônico independente do React Flow;
- criação e movimentação de atores;
- drag-and-drop da paleta para o canvas;
- seleção simples e múltipla;
- copiar, colar e duplicar atores;
- exclusão de elementos;
- menu de contexto;
- painel lateral de propriedades;
- Undo/Redo;
- zoom e movimentação do canvas;
- minimapa;
- autosave utilizando `localStorage`;
- exportação do modelo em JSON;
- atalhos de teclado;
- validação inicial de nomes duplicados;
- regra de unicidade da Companhia de Interesse.

---

## Atores da notação SSN

A versão atual implementa os seis atores utilizados pela ECOS Modeling.

### Atores diretos

| Ator | Representação |
|---|---|
| Companhia de Interesse (CoI) | Retângulo azul |
| Fornecedor | Forma laranja com seta para a direita |
| Cliente | Forma amarela com seta para a esquerda |

### Atores indiretos

| Ator | Representação |
|---|---|
| Intermediário | Hexágono verde |
| Cliente do Cliente | Forma cinza com recorte lateral |
| Agregador | Paralelogramo vermelho |

As formas, cores e descrições são centralizadas no catálogo:

```text
src/domain/catalogs.ts