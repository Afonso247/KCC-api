const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');
const { gerarRespostaKokomai } = require('../config/ai-config');

// Rota enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, role } = req.body;
  let kokomaiResponse = '';

  try {
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    await gerarRespostaKokomai(content, chat.messages, (data) => {
      kokomaiResponse += data;
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    console.log(kokomaiResponse);

    // if (!response) {
    //   return res.status(400).json({ message: 'Houve um erro ao enviar a mensagem' });
    // }

    chat.messages.push({ 
      content: kokomaiResponse, 
      role 
    });
    await chat.save();

    res.write('event: close\ndata: \n\n');
    res.end();
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error(error);
      res.status(429).json({ message: 'Requisições excedidas. Por favor, tente novamente mais tarde' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Erro ao enviar mensagem' });
    }
  }
});

module.exports = router;