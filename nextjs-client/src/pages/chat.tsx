import React, { useEffect, useState } from "react";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendMessage,
  setKey,
} from "../utils/socket";

import {
  Container,
  Heading,
  Button,
  Input,
  Text,
  HStack,
  VStack,
  Image,
} from "@chakra-ui/react";

import { IMessageObject } from "../../interface";

const Chat = () => {
  const rooms = ["1", "2", "3"];
  const [room, setRoom] = useState(rooms[0]);
  const [message, setMessage] = useState("");
  const [cipherKey, setCipherKey] = useState("");
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    if (room) initiateSocket(room);

    subscribeToChat((err: any, messageObject: IMessageObject) => {
      if (err) return;
      setChat((oldChats) => [messageObject, ...oldChats]);
    });

    return () => {
      disconnectSocket();
    };
  }, [room]);

  useEffect(() => {
    if (cipherKey === "") {
      setKey("defaultKey");
    } else {
      setKey(cipherKey);
    }
  }, [cipherKey]);

  const handleSendMessage = () => {
    if (file) {
      const messageObject = {
        type: "file",
        body: URL.createObjectURL(file),
        mimeType: file.type,
        fileName: file.name,
      };
      sendMessage(room, messageObject);
      setMessage("");
      setFile(undefined);
    } else {
      const messageObject = {
        type: "text",
        body: message,
      };
      sendMessage(room, messageObject);
      setMessage("");
    }
  };

  return (
    <Container>
      <Heading>Current Room: {room}</Heading>

      <HStack>
        <Text>Select room:</Text>
        {rooms.map((r, i) => (
          <Button onClick={() => setRoom(r)} key={i}>
            {r}
          </Button>
        ))}
        <Input
          type="text"
          name="key"
          value={cipherKey}
          placeholder="Enter key for cipher"
          onChange={(e) => setCipherKey(e.target.value)}
        />
      </HStack>

      <Heading>Live Chat:</Heading>

      <HStack>
        <VStack>
          <Input
            type="text"
            name="name"
            value={message}
            placeholder="Type your message here..."
            onChange={(e) => setMessage(e.target.value)}
          />
          <Input
            type="file"
            name="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </VStack>
        <Button onClick={handleSendMessage}>Send</Button>
      </HStack>
      <VStack align="flex-start" marginTop="1em">
        {chat.map((message, index) => {
          if (message.type === "file") {
            return <Image src={message.body} />;
          }
          return <Text key={index}>{message.body}</Text>;
        })}
      </VStack>
    </Container>
  );
};

export default Chat;
