# Bot com Puppeteer

## Visão Geral

Este projeto utiliza Puppeteer para realizar tarefas de automação de navegador. Este README fornece instruções sobre como compilar e executar o projeto usando um arquivo bash.

## Pré-requisitos

1. **Node.js**: Certifique-se de ter o Node.js instalado. Você pode verificar isso com o comando `node -v`.
2. **npm**: O Node Package Manager (npm) deve estar instalado. Verifique com `npm -v`.
3. **TypeScript**: O TypeScript deve estar instalado globalmente. Instale-o com `npm install -g typescript` se ainda não estiver.

## Estrutura do Projeto

- **`src/`**: Contém os arquivos TypeScript do projeto.
- **`dist/`**: Diretório onde os arquivos JavaScript compilados serão colocados após a execução do comando `tsc` (TypeScript Compiler).
- **`start.sh`**: Arquivo bash para compilar e executar o projeto.

## Executando no Ubuntu - Linux

```bash
npm install

chmod +x start.sh

./start.sh
```
