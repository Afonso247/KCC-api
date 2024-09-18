const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');
const openai = require('../config/ai-config');

// Rota enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, sender } = req.body;
  try {
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: content }],
      max_tokens: 100
    });

    if (!completion.choices[0].message.content) {
      return res.status(400).json({ message: 'Houve um erro ao enviar a mensagem' });
    }

    chat.messages.push({ 
      content: completion.choices[0].message.content, 
      sender 
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