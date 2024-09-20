const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');
const { gerarRespostaKokomai } = require('../config/ai-config');

// Rota para a KokomAI enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, role } = req.body;
  let kokomaiResponse = '';

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

    // Gera a resposta da KokmAI, iniciando o data streaming
    await gerarRespostaKokomai(content, chat.messages, (data) => {
      kokomaiResponse += data;
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    // Descomente a linha abaixo p/ debug
    // console.log(kokomaiResponse);

    // Ao concluir o data streaming, envia a mensagem criada para o banco
    chat.messages.push({ 
      content: kokomaiResponse, 
      role 
    });
    await chat.save();

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

module.exports = router;