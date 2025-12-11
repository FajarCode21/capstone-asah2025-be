import ChatbotController from '../controllers/ChatbotController.js';
import express from 'express';

const Router = express.Router();

Router.post('/', ChatbotController.askChatbot);

export default Router;
