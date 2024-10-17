# KCC-api

Esta aplicação back-end faz parte de um projeto chamado "Kokomi's Mindspace", em que a KokomAI, a inteligência artificial principal do projeto, atende usuários e fornece assistência terapeutica para quem precisa.

## Notas de Atualização

`v1.2.0` *
- Implementado uma feature de recuperação de senha do usuário

`v1.1.0`
- Usuários podem agora inserir e-mail em seu cadastro

`v1.0.1`      
- Documentação e indentação do código

`v1.0.0` 
- Versão inicial do projeto front-end

## Índice

- [Instalação](#instalação)
- [Arquivo .env](#arquivo-.env)
- [Como Usar](#como-usar)
- [Contribuindo](#contribuindo)
- [Tecnologias e Funcionalidades](#tecnologias-e-funcionalidades)
- [Contato](#contato)

---

## Instalação

Antes de começar, certifique-se de que você possui os seguintes pré-requisitos instalados em sua máquina:

- **Node.js** (v18.18.0 recomendado): [Instalar Node.js](https://nodejs.org/)
- **MongoDB**: Banco de dados MongoDB rodando localmente. Você pode instalar o MongoDB seguindo as instruções oficiais: [Instalar MongoDB](https://www.mongodb.com/docs/manual/installation/)

Siga os passos abaixo para configurar e rodar o projeto localmente:

### Clone o repositório
```bash
git clone https://github.com/Afonso247/KCC-api.git
```
### Navegue até a pasta do projeto
```bash
cd KCC-api
```

### Instale as dependências
```bash
npm install
```

## Arquivo .env

Para que a aplicação backend funcione corretamente, é necessário criar um arquivo `.env` com as configurações do seu ambiente.

### Configurando o .env

Crie um arquivo `.env` na raiz do seu projeto e insira os seguintes valores:

```env
PORT={Porta do servidor. Evite a porta 5173, já que é a porta utilizada pela aplicação frontend.}
     {Recomendo utilizar a porta 3000 para o backend, já que as requisições HTTP da aplicação frontend serão por esta porta.}

NODE_ENV={Definição de ambiente. Defina a variável em "development" se você estiver rodando o projeto localmente.}

DATABASE_URL={URL do seu banco de dados MongoDB. Normalmente seria "mongodb://127.0.0.1:27017/[nome_do_database]"}

SESSION_SECRET={Código secreto usado para gerenciar as sessões de usuário. Gere uma string segura e armazene aqui.} 
               {Exemplo: "minhasecretkey123"}

OPENAI_API_KEY={Sua chave da API OpenAI para que a funcionalidade de IA funcione.} 
               {Certifique-se de ter créditos suficientes na OpenAI antes de rodar a aplicação.}

SENDER_EMAIL={O e-mail que irá enviar mensagens para o e-mail do usuário. (Ex: p/recuperação de senha)}
             {Recomendo utilizar uma conta do Gmail para esta função.}
SENDER_APP_PASSWORD={A senha de app da sua conta do e-mail.}
                    {No Gmail, você pode definir a sua senha de app na sua Conta do Google, em: Segurança > Como você faz login no Google > Verificação em duas etapas > Ative a Verificação em duas etapas > Senhas de app}
```

**Exemplo:**

```env
PORT=3000
NODE_ENV="development"
DATABASE_URL=mongodb://127.0.0.1:27017/minha_base_de_dados
SESSION_SECRET=secretosuperseguro
OPENAI_API_KEY=sua-chave-api-aqui
SENDER_EMAIL="seuemailaqui@gmail.com"
SENDER_APP_PASSWORD="sua-senha-de-app-aqui"
```

Certifique-se de não compartilhar seu arquivo `.env` publicamente, especialmente valores como `SESSION_SECRET` e `OPENAI_API_KEY`. O arquivo `.env` deve ser incluído no `.gitignore` para evitar exposição de informações sensíveis.

## Como Usar

Após a instalação e a configuração do arquivo .env, siga os passos abaixo para rodar a aplicação:

### Rodar o servidor de desenvolvimento

```sh
npm run dev
```
A aplicação irá rodar localmente na porta específicada no arquivo `.env`

Se as requisições iniciais do servidor forem atendidas, o servidor irá retornar a seguinte mensagem no terminal, indicando a sua ativação:

```bash
Servidor iniciado na porta [porta especificada pelo .env]
Conectado ao MongoDB
```

## Contribuindo

Você tem ideias interessantes para adicionar ao projeto? Não hesite em contribuir:

1. Faça um fork do repositório.

2. Crie uma branch nova para implementar suas alterações
```bash
git checkout -b minha-nova-feature
```

3. Commit suas mudanças com uma mensagem descritiva:
```bash
git commit -m 'Adicionando nova feature'
```

4. Faça um push para a branch criada:
```bash
git push origin minha-nova-feature
```

5. Abra um pull request.

## Tecnologias e Funcionalidades

### Tecnologias Utilizadas

Esta aplicação foi desenvolvida utilizando as seguintes tecnologias principais:

- **Node.js:** Ambiente de runtime para construir aplicativos com JavaScript no backend.
- **Express:** Framework para criar APIs de forma eficiente e simplificada.
- **MongoDB:** Banco de dados NoSQL utilizado para armazenar as informações da aplicação.
- **Mongoose:** Biblioteca que facilita o mapeamento de dados e modelos no MongoDB.
- **Connect-Mongo:** Utilizada para armazenar sessões no MongoDB, integrando com o sistema de autenticação.
- **Bcrypt:** Biblioteca para criptografia de senhas, garantindo maior segurança.
- **CORS:** Middleware para lidar com solicitações cross-origin, permitindo que a aplicação interaja com outras origens.
- **dotenv:** Carrega variáveis de ambiente a partir de um arquivo `.env`, facilitando a configuração de ambientes.
- **nodemailer:** Biblioteca para o envio de e-mail para usuários.
- **OpenAI:** Biblioteca para integrar a API da OpenAI para dar vida a KokomAI.

### Funcionalidades Principais

A aplicação oferece as seguintes funcionalidades principais:

- **Autenticação:** Configuração de sessão e middleware para autenticação de usuários, incluindo uma feature de recuperação de senha.
- **CRUD de Usuário:** Rotas para gerenciar usuários, incluindo a criação, leitura, atualização e exclusão.
- **CRUD de Chat:** Rotas para gerenciar chats, incluindo a criação, leitura, atualização e exclusão.
- **Interação com IA:** Rotas e funcionalidades dedicadas para interagir com a KokomAI, permitindo funcionalidades como o streaming de dados da IA em tempo real.

## Contato

Se você tiver dúvidas, sugestões, ou qualquer outro assunto em relação ao repositório, entre em contato comigo:

- **Email**: afonsoh.dev@gmail.com
- **LinkedIn**: [Afonso Henrique](https://www.linkedin.com/in/afonso-h)
- **GitHub**: [Afonso247](https://github.com/Afonso247)

Fique à vontade para abrir issues no repositório ou enviar pull requests com melhorias e correções!
