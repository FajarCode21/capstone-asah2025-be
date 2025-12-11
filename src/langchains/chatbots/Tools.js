import ChatbotRetrieverService from './retriever.js';

class Tools {
  async chooseTool(res) {
    console.log(`cek type ${res[0]}, value ${res[1]}`);
    if (!Array.isArray(res) || res.length === 0) return [];

    const type = res[0];
    const value = res[1];

    switch (type) {
      case 'failure':
        return await ChatbotRetrieverService.getLatestSensorPredictions();
      case 'machineName':
        return await ChatbotRetrieverService.getMachineStatusByName(value);
      case 'machineId':
        return await ChatbotRetrieverService.getMachineStatusById(value);
      case 'failureType':
        return await ChatbotRetrieverService.getMachineStatusByType(value);
      case 'priority':
        return await ChatbotRetrieverService.getMachineStatusByPriority(value);
      case 'status':
        return await ChatbotRetrieverService.getMachineStatusByStatus(value);
      case 'rulSmallest':
        return await ChatbotRetrieverService.getMachineStatusBySmallestRUL(
          Number(value)
        );
      case 'rulHighest':
        return await ChatbotRetrieverService.getMachineStatusByHighestRUL(
          Number(value)
        );
      default:
        return [];
    }
  }
}

export default new Tools();
