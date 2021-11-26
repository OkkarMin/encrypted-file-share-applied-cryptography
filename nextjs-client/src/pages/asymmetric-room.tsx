import React, { useEffect, useState } from "react";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendAsymmetricMessage,
  connectedUsers,
} from "../utils/asymSocket";

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
import { toBase64 } from "../utils/toBase64";
import { Socket } from "socket.io-client";

let socket: Socket;

const AsymmetricChat = () => {
  const rooms = ["1", "2", "3"];
  const [room, setRoom] = useState(rooms[0]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState<File>();
  const [listOfConnectedUsers, setListOfConnectedUsers] = useState<any>();

  const [mySocketID, setMySocketID] = useState("");

  useEffect(() => {
    if (room) initiateSocket(room);

    subscribeToChat((err: any, messageObject: IMessageObject) => {
      if (err) return;
      setChat((oldChats) => [messageObject, ...oldChats]);
    });

    connectedUsers((err: any, listOfUsers: any, myID: string) => {
      if (err) return;
      setListOfConnectedUsers(listOfUsers);
      setMySocketID(myID);
    });

    return () => {
      disconnectSocket();
    };
  }, [room]);

  console.log(listOfConnectedUsers);

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

    sendAsymmetricMessage(room, messageObject);
    setMessage("");
    setFile(undefined);
  };

  return (
    <Container>
      <Heading>Current Room: {room}</Heading>

      <Text>Select room:</Text>
      {rooms.map((r, i) => (
        <Button onClick={() => setRoom(r)} key={i}>
          {r}
        </Button>
      ))}

      {/* display list of connected users excluding my socket id */}
      <Text>Connected Users:</Text>
      {listOfConnectedUsers &&
        mySocketID &&
        Object.keys(listOfConnectedUsers[room]).map((user, i) => {
          if (user !== mySocketID) {
            return (
              <Button
                key={i}
                onClick={() => {
                  console.log(listOfConnectedUsers[user]);
                }}
              >
                {user}
              </Button>
            );
          }
        })}

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

export default AsymmetricChat;
