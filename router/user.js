const express = require('express');
const bycrypt = require('bcrypt');
const User = require('../model/User');
const Chat = require('../model/Chat');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Rota p/trocar nome
router.put('/change-username', authMiddleware, async (req, res) => {
    const { username, newUsername } = req.body;
    try {
        if (!newUsername) {
            return res.status(400).json({ message: 'Por favor, forneça um novo nome de usuário.' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Nome de usuário não encontrado.' });
        }

        if (newUsername === user.username) {
            return res.status(400).json({ message: 'O novo nome de usuário deve ser diferente do atual.' });
        }

      user.username = newUsername;
      req.session.username = newUsername;

      await user.save();
      req.session.save();
  
      return res.status(200).json({ message: 'Nome de usuário atualizado com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar o nome de usuário.' });
    }
});

// Rota p/atualizar senha
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(400).json({ message: 'Usuário não encontrado.' });
      }

      const checkPassword = await bycrypt.compare(currentPassword, user.password);
      if (!checkPassword) {
          return res.status(400).json({ message: 'Senha atual incorreta.' });
      }

      if (currentPassword === newPassword) {
          return res.status(400).json({ message: 'A nova senha deve ser diferente da atual.' });
      }

      const salt = await bycrypt.genSalt(10);
      const hashedPassword = await bycrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar a senha.' });
  }
});

// Rota p/excluir conta
router.delete('/delete-account', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        // Destruir a sessão
        req.session.destroy(err => {
          if (err) {
              return res.status(500).json({ message: 'Erro ao encerrar a sessão' });
          }
          res.clearCookie('connect.sid');
        });

        // Excluir todos os chats do usuário
        await Chat.deleteMany({ _id: { $in: user.chats } });

        await User.deleteOne({ _id: user._id });
        
        return res.status(200).json({ message: 'Conta excluída com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao excluir a conta.' });
    }
});


module.exports = router;