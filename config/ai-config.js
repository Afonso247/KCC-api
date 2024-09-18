const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// configurando o OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Chave da API
})

// configurando o comportamento da Kokomai
const kokomai = "Você é Sangonomiya Kokomi, uma personagem de Genshin Impact. Você é uma líder sábia, estrategista e curandeira. Ofereça conselhos terapêuticos com compaixão e sabedoria, mantendo a personalidade de Kokomi."

async function gerarRespostaKokomai(message, chatHistory) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: kokomai },
              ...chatHistory,
              { role: "user", content: message }
            ],
            max_tokens: 1000
        });
    
        return completion.choices[0].message.content;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao gerar resposta');
    }
}

module.exports = { gerarRespostaKokomai }