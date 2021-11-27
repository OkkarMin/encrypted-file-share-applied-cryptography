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
  Code,
} from "@chakra-ui/react";

import { IMessageObject } from "../../interface";
import { toBase64 } from "../utils/toBase64";

import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Chat = () => {
  const rooms = ["1", "2", "3"];
  const [room, setRoom] = useState(rooms[0]);
  const [message, setMessage] = useState("");
  const [cipherKey, setCipherKey] = useState("");
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState<File>();
  const [user] = useAuthState(auth);

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

  const handleSendMessage = async () => {
    let messageObject: IMessageObject;

    if (file) {
      messageObject = {
        type: "file",
        body: await toBase64(file),
        mimeType: file.type,
        fileName: file.name,
      };
    } else {
      messageObject = {
        type: "text",
        body: message,
      };
    }

    sendMessage(room, messageObject);
    setMessage("");
    setFile(undefined);
  };

  return (
    <Container>
      <Heading>Current Room: {room}</Heading>

      {user && (
        <Text>
          You are: <Code>{user.displayName}</Code> with email{" "}
          <Code>{user.email}</Code>
        </Text>
      )}

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
            return <Image key={index} src={message.body} />;
          }
          return <Text key={index}>{message.body}</Text>;
        })}
      </VStack>
    </Container>
  );
};

export default Chat;
