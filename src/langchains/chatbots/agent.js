import { ChatGroq } from '@langchain/groq';
import Prompts from './prompts.js';
import Tools from './Tools.js';
import AppError from '../../utils/AppError.js';

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-8b-instant',
});

export async function askMachineStatus(question) {
  try {
    const selectionPrompt = Prompts.selectionPrompt(question);
    const selectionResponse = await llm.invoke(selectionPrompt);

    let selectionArray = [];
    if (selectionResponse?.content) {
      const content = selectionResponse.content.trim();
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        try {
          selectionArray = JSON.parse(jsonMatch[0]);
        } catch (err) {
          selectionArray = [];
        }
      }
    }

    if (!Array.isArray(selectionArray) || selectionArray.length === 0) {
      return 'Pertanyaan anda tidak relevan. Mohon ulangi pertanyaan anda.';
    }

    const chosenToolData = await Tools.chooseTool(selectionArray);

    if (!chosenToolData || chosenToolData.length === 0) {
      return 'Data untuk pertanyaan ini tidak tersedia.';
    }

    const answerPrompt = Prompts.answerPrompt(question, chosenToolData);
    const response = await llm.invoke(answerPrompt);

    return response?.content || 'Jawaban tidak tersedia.';
  } catch (err) {
    throw new AppError(err.message, 500);
  }
}
