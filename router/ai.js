const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');
const { gerarRespostaKokomai } = require('../config/ai-config');

// Rota enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, role } = req.body;
  try {
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    const response = await gerarRespostaKokomai(content, chat.messages);

    if (!response) {
      return res.status(400).json({ message: 'Houve um erro ao enviar a mensagem' });
    }

    chat.messages.push({ 
      content: response, 
      role 
    });
    await chat.save();

    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
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