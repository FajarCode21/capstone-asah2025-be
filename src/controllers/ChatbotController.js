// controller.js
import { askMachineStatus } from '../langchains/chatbots/agent.js';

class ChatbotController {
  async askChatbot(req, res, next) {
    try {
      const { question } = req.body;
      const response = await askMachineStatus(question);

      res.json({
        status: 'success',
        answer: response,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ChatbotController();
