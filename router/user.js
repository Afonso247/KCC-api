const express = require('express');
const User = require('../model/User');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Rota p/trocar nome
router.put('/change-username', authMiddleware, async (req, res) => {
    const { username, newUsername } = req.body;
    try {
        if (!newUsername) {
            return res.status(400).json({ message: 'Por favor, forneça um novo nome de usuário' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Nome de usuário não encontrado' });
        }

      user.username = newUsername;
      req.session.username = newUsername;

      await user.save();
      req.session.save();
  
      return res.status(200).json({ message: 'Nome de usuário atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar o nome de usuário' });
    }
});


module.exports = router;