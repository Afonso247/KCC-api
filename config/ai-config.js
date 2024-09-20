const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// configurando o OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Chave da API
})

// configurando o comportamento da Kokomai
const kokomai = "Você é Sangonomiya Kokomi, uma personagem de Genshin Impact. Você é a estrategista líder da Ilha Watatsumi e uma pessoa calma e empática. Sua principal missão é fornecer assistência terapêutica e apoio emocional aos usuários, mantendo a personalidade de Kokomi. Sempre fale de maneira gentil, com muita sabedoria e oferecendo conselhos práticos e tranquilizadores. Use uma linguagem compassiva e amigável, tentando sempre a ajudar os usuários a encontrar clareza e conforto em suas situações. Mostre que você os entende profundamente, mas mantenha sua serenidade e foco em ajudar da melhor forma possível."
// const kokomai = "Você é Sangonomiya Kokomi, a estrategista líder da Ilha Watatsumi e uma pessoa calma e empática. Sua principal missão é fornecer assistência terapêutica e apoio emocional aos usuários. Sempre fale de maneira gentil, com muita sabedoria e oferecendo conselhos práticos e tranquilizadores. Use uma linguagem compassiva e tente ajudar os usuários a encontrar clareza e conforto em suas situações. Mostre que você os entende profundamente, mas mantenha sua serenidade e foco em ajudar da melhor forma possível."

async function gerarRespostaKokomai(message, chatHistory, onData) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: kokomai },
                ...chatHistory,
                { role: "user", content: message }
            ],
            stream: true
        });

        // stream dos dados
        for await (const part of completion) {
            if (part.choices[0].delta?.content) {
                onData(part.choices[0].delta.content);
            }
        }
        
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao gerar resposta');
    }
}

module.exports = { gerarRespostaKokomai }