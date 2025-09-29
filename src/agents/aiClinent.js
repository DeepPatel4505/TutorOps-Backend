import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askLLM(prompt) {
    try {
        const res = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        });
        return res.choices[0].message.content;
    } catch (e) {
        console.error('AI Error:', e);
        return null;
    }
}
