import React, { useEffect, useState } from "react";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
} from "../hooks/useSocket";

import {
  Container,
  Heading,
  Button,
  Input,
  Text,
  HStack,
  VStack,
} from "@chakra-ui/react";

const Chat = () => {
  const rooms = [1, 2, 3];
  const [room, setRoom] = useState(rooms[0]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (room) initiateSocket(room);

    subscribeToChat((err: any, message: string) => {
      if (err) return;
      setChat((oldChats) => [message, ...oldChats]);
    });

    return () => {
      disconnectSocket();
    };
  }, [room]);

  const handleSendMessage = () => {
    sendMessage(room, message);
    setMessage("");
  };

  return (
    <Container>
      <Heading>Current Room: {room}</Heading>

      <HStack>
        <Text>Click button to select room:</Text>
        {rooms.map((r, i) => (
          <Button onClick={() => setRoom(r)} key={i}>
            {r}
          </Button>
        ))}
      </HStack>

      <Heading>Live Chat:</Heading>

      <HStack>
        <Input
          type="text"
          name="name"
          value={message}
          placeholder="Type your message here..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </HStack>

      <VStack align="flex-start" marginTop="1em">
        {chat.map((message: string, i: number) => (
          <Text key={i}>{message}</Text>
        ))}
      </VStack>
    </Container>
  );
};

export default Chat;
