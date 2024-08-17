const express = require('express');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const router = express.Router();

// Rota p/registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verificar se o username existe
        const userExistente = await User.findOne({ username });
        if (userExistente) {
            return res.status(400).json({ message: 'Este nome de usuario ja existe' });
        }

        // Criar o hash da senha
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        // Criar o novo usuario
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();

        return res.status(201).json({ message: 'Usuario criado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao registrar o usuario' });
    }
});

// Rota p/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verificar se o username existe
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Este nome de usuario nao existe' });
        }

        // Verificar se a senha esta correta
        const checkPassword = await bycrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({ message: 'Senha invalida' });
        }

        // Gerar o token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        return res.status(200).json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao logar o usuario' });
    }
});

// Middleware p/verificar o token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Nenhum token encontrado' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido' });
    }
}

// Exemplo de rotas protegidas
router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token valido' });
});

module.exports = router;