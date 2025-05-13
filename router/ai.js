const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');
const { gerarRespostaKokomai } = require('../config/ai-config');

// Rota para o chatbot enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, role } = req.body;
  let kokomaiResponse = '';
  let temaChatIdentificado = null;

  try {
    // Verificar se o chat existe
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    // Preparando os headers para o data stream
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const isFirstMessage = chat.messages.length === 0;

    if (!isFirstMessage && content && (chat.topic === 'Sem assunto' || !chat.topic)) {
      try {
        // Tenta identificar o tema do chat com base na mensagem do usuário
        temaChatIdentificado = await identificarTemaChat(content, id);
        
        // Envia o tema identificado para o frontend atualizar o nome do chat
        res.write(`data: ${JSON.stringify({tipo: 'tema_identificado', tema: temaChatIdentificado})}\n\n`);
      } catch (error) {
        console.error('Falha ao identificar tema:', error);
      }
    }

    if (isFirstMessage) {
      // Se for a primeira mensagem, solicita à IA uma saudação que pergunte sobre o tema
      const initialPrompt = "Esta é a primeira mensagem do chat. Por favor, apresente-se e pergunte ao usuário sobre qual tema ele gostaria de conversar.";
      
      await gerarRespostaKokomai(initialPrompt, [], (data) => {
        kokomaiResponse += data;
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });

      // Ao concluir o data streaming, envia a mensagem criada para o banco
      chat.messages.push({ 
        content: kokomaiResponse, 
        role 
      });
      await chat.save();
    } else {
      // Construir contexto com o tema do chat
      const contextoChat = {
        tema: temaChatIdentificado || chat.topic
      };
      
      // Caso contrário, gera a resposta normalmente do chatbot
      const promptComTema = temaChatIdentificado ? 
        `[Tema do chat: ${temaChatIdentificado}] ${content}` : content;

      await gerarRespostaKokomai(promptComTema, chat.messages, (data) => {
        kokomaiResponse += data;
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }, contextoChat);

      // Descomente a linha abaixo p/ debug
      // console.log(kokomaiResponse);

      // Ao concluir o data streaming, envia a mensagem criada para o banco
      chat.messages.push({ 
        content: kokomaiResponse, 
        role 
      });
      await chat.save();

      // Se ainda não conseguiu identificar o tema, envia mensagem pedindo ao usuário para esclarecer
      if (!temaChatIdentificado && (chat.topic === 'Sem assunto' || !chat.topic)) {
        const esclarecer = "\n\nPoderia me contar mais sobre o que gostaria de conversar? Assim posso entender melhor o tema deste chat.";
        kokomaiResponse += esclarecer;
        
        // Atualiza a última mensagem com o esclarecimento
        await Chat.findOneAndUpdate(
          { _id: id, "messages.role": "assistant" },
          { $set: { "messages.$.content": kokomaiResponse } },
          { sort: { "messages.timestamp": -1 }, new: true }
        );
        
        res.write(`data: ${JSON.stringify({tipo: 'mensagem', conteudo: esclarecer})}\n\n`);
      }
    }

    res.write('event: close\ndata: \n\n');
    res.end();
  } catch (error) {
    if (error.response && error.response.status === 429) { // Erro de requisições excedidas
      console.error(error);
      res.status(429).json({ message: 'Requisições excedidas. Por favor, tente novamente mais tarde' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Erro ao enviar mensagem' });
    }
  }
});

// Função para analisar mensagem e identificar o tema do chat
async function identificarTemaChat(mensagem, chatId) {
  let temaIdentificado = '';
  
  try {
    return new Promise((resolve, reject) => {
      gerarRespostaKokomai(
        `Por favor, analise esta mensagem e identifique o tema principal do chat em no máximo 3 palavras. 
        Caso não seja possível identificar o tema, responda "Sem assunto". 
        Caso tenha identificado o tema, responda APENAS com o tema identificado, sem nenhum texto adicional:
        "${mensagem}"`,
        [],
        (data) => {
          temaIdentificado += data;
        },
        { modo: 'identificacao_tema' }
      )
      .then(async () => {
        // Limpa e formata o tema identificado
        temaIdentificado = temaIdentificado.trim();
        
        // Limita a 3 palavras caso a IA tenha gerado mais
        const palavras = temaIdentificado.split(' ');
        if (palavras.length > 3) {
          temaIdentificado = palavras.slice(0, 3).join(' ');
        }
        
        // Primeira letra maiúscula para o tema
        temaIdentificado = temaIdentificado.charAt(0).toUpperCase() + temaIdentificado.slice(1);
        
        // Atualiza o chat com o tema identificado
        await Chat.findByIdAndUpdate(chatId, { topic: temaIdentificado });
        
        resolve(temaIdentificado);
      })
      .catch(error => {
        console.error('Erro ao identificar tema:', error);
        reject('Sem assunto');
      });
    });
  } catch (error) {
    console.error('Erro no processo de identificação do tema:', error);
    return 'Sem assunto';
  }
}

module.exports = router;