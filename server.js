const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB
const dotenv = require('dotenv');
const routerApi = require('./router/index');
const routerUser = require('./router/user');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors( {
    origin: 'http://localhost:5173', // Substitua pelo seu domínio
    credentials: true
} ));

// conexão com MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((err) => {
    console.log("Erro ao conectar ao MongoDB: ", err);
})

// Configurar a sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 dia
        httpOnly: true,
        secure: false // Certifique-se de definir como true em produção se estiver usando HTTPS
    }
}));

// Roteamento
app.use('/api', routerApi);
app.use('/user', routerUser);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
})