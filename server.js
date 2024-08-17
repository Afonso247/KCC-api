const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const router = require('./router/index');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors( { origin: '*' } ));

// conexão com MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch((err) => {
    console.log("Erro ao conectar ao MongoDB: ", err);
})

// Roteamento
app.use('/auth', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
})