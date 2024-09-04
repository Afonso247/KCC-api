const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');
const User = require('../model/User');
const authMiddleware = require('../middleware/auth');

// Rota para criar um novo chat
router.post('/create-chat', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    // Verificar se o usuário já tem pelo menos 10 chats existentes
    const existingChats = await Chat.countDocuments({ user: { _id: req.session.userId } });
    if (existingChats >= 10) {
      return res.status(400).json({ message: 'Limite máximo de chats atingido' });
    }

    const newChat = new Chat({ name, user: { _id: req.session.userId } });
    await newChat.save();

    // Atualizar o usuário que criou o chat
    await User.updateOne({ _id: req.session.userId }, { $push: { chats: newChat._id } });

    res.status(201).json({ message: 'Chat criado com sucesso!', chat: newChat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar chat.' });
  }
});

// Rota para encontrar todos os chats associados ao usuário
router.get('/get-chats', authMiddleware, async (req, res) => {
  try {

    const chats = await Chat.find({ user: { _id: req.session.userId } });
    res.status(200).json({ chats });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao selecionar chats' });
  }
});

// Rota enviar uma mensagem
router.post('/send-message/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content, sender } = req.body;
  try {
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    chat.messages.push({ content, sender });
    await chat.save();

    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
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
    console.error(error);
    res.status(500).json({ message: 'Erro ao renomear chat' });
  }
});

// Rota para excluir um chat
router.delete('/delete-chat/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }
    if (!chat.user._id.equals(req.session.userId)) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este chat' });
    }

    await Chat.deleteOne({ _id: id });
    await User.updateOne({ _id: req.session.userId }, { $pull: { chats: id } });

    res.status(200).json({ message: 'Chat excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir chat' });
  }
});

module.exports = router;