const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Carregar o arquivo de configuração
function loadConfig() {
    try {
        const config = fs.readFileSync('./config/kokomai-config.json', 'utf8');
        return JSON.parse(config);
    } catch (error) {
        console.error('Erro ao carregar o arquivo de configuração:', error);
        throw error;
    }
}

// Construir a mensagem de sistema baseando-se na configuração
function buildSystemMessage(config) {
  let message = `Você é ${config.personalidade.nome}, ${config.personalidade.titulo}.\n${config.personalidade.descricao}\n\nDiretrizes:\n`;
  Object.entries(config.diretrizes).forEach(([key, value]) => {
    if (value && value.length > 0) {
      message += `\n${key.replace(/_/g, ' ').toUpperCase()}:\n`;
      value.forEach(item => message += `- ${item}\n`);
    }
  });
  return message;
}

// Carrega a configuração e constrói a mensagem inicial
const config = loadConfig();
const kokomaiBaseMessage = buildSystemMessage(config);

// configurando o OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Chave da API
})

/**
 * Gera resposta com o estilo "Kokomai" através da API da OpenAI
 * 
 * @param {string} message - A mensagem atual do usuário
 * @param {Array} chatHistory - Histórico da conversa (array de mensagens com 'role' e 'content')
 * @param {function} onData - Callback para processar os dados do stream de resposta
 */
async function gerarRespostaKokomai(message, chatHistory, onData) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: kokomaiBaseMessage },
          ...chatHistory,
          { role: "user", content: message }
        ],
        stream: true
      });
  
      // Processa os dados do stream em tempo real
      for await (const part of completion) {
        if (part.choices[0].delta?.content) {
          onData(part.choices[0].delta.content);
        }
      }
      
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw new Error('Erro ao gerar resposta');
    }
}

module.exports = { gerarRespostaKokomai }