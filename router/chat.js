const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const authMiddleware = require('../middleware/auth');

// Rota para criar um novo chat
router.post('/create-chat', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const chat = new Chat({ name });
    await chat.save();
    res.status(201).json({ message: 'Chat criado com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar chat' });
  }
});

// Rota para selecionar um chat
router.get('/select-chat/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao selecionar chat' });
  }
});

// Rota para renomear um chat
router.put('/rename-chat/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }
    chat.name = name;
    await chat.save();
    res.status(200).json({ message: 'Chat renomeado com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao renomear chat' });
  }
});

// Rota para excluir um chat
router.delete('/delete-chat/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Chat.findByIdAndDelete(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }
    res.status(200).json({ message: 'Chat excluído com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao excluir chat' });
  }
});

module.exports = router;