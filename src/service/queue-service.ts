import createLogger from "../utils/CustomLogger/logger";

const logger = createLogger(__filename);

interface Message {
  MessageId: string;
  Protocol: string;
  Body: string;
  Attributes?: {
    [key: string]: string;
  };
}

const receiveMessage = async (): Promise<Message | null> => {
  logger.info("Aguardando receber mensagem... " + new Date().toISOString());

  return {
    MessageId: "1",
    Protocol: "amqp",
    Body: '{ "sigla": "GOOGLE" }',
  };
};

export { receiveMessage };
