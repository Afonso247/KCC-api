const express = require('express');
const bycrypt = require('bcrypt');
const User = require('../model/User');
const Chat = require('../model/Chat');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Rota p/registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar se o username existe
        const userExistente = await User.findOne({ username });
        if (userExistente) {
            return res.status(400).json({ message: 'Este nome de usuario ja existe' });
        }

        // Verificar se o email existe
        const emailExistente = await User.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ message: 'Este email ja existe' });
        }

        // Criar o hash da senha
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        // Criar um novo chat
        const newChat = new Chat({
            name: "Chat 1",
            messages: [],
            user: null
        });

        // Criar o novo usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            chats: [newChat._id]
        });

        // Atribuir o novo chat ao novo usuario
        newChat.user = newUser._id;
        await newChat.save();
        await newUser.save();

        return res.status(201).json({ message: 'Usuario criado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao registrar o usuario' });
    }
});

// Rota p/login
router.post('/login', async (req, res) => {
    const { userEntry, password } = req.body;
    
    try {
        // Verificar se o userEntry é um nome de usuário ou um e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(userEntry);
        
        let user;
        if (isEmail) {
            user = await User.findOne({ email: userEntry });
        } else {
            user = await User.findOne({ username: userEntry });
        }
        
        if (!user) {
            return res.status(400).json({ message: 'Credenciais incorretas.' });
        }

        // Verificar se a senha esta correta
        const checkPassword = await bycrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({ message: 'Credenciais incorretas.' });
        }

        // Salvar o usuário na sessão
        req.session.userId = user._id;
        req.session.username = user.username;

        // Criar o cookie da sessão
        res.cookie('connect.sid', req.sessionID, { httpOnly: true });

        return res.status(200).json({ message: 'Login bem-sucedido', user: { id: user._id, username: user.username } });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao logar o usuario' });
    }
});

// Rota p/logout
router.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao encerrar a sessão' });
        }
        res.clearCookie('connect.sid'); // Remove o cookie da sessão
        return res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
});

// Exemplo de rota protegida
router.get('/auth/check', authMiddleware, (req, res) => {
    // res.status(200).json({ message: `Bem-vindo, ${req.session.username}! Você está autenticado.` });
    res.status(200).json({ authenticated: true, user: { id: req.session.userId, username: req.session.username } });
});

module.exports = router;