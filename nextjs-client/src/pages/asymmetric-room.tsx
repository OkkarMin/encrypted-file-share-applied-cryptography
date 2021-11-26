import React, { useEffect, useState } from "react";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
  sendAsymmetricMessage,
  connectedUsers,
  makeSharedKey,
  sendSharedKey,
  receieveSharedKey,
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
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

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
  const [sendToTarget, setSendToTarget] = useState<string>("-");

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

    receieveSharedKey((err: any, importDecryptedSharedKey: any) => {
      if (err) return;
      console.log("got this shared key from sender", importDecryptedSharedKey);
    });

    setSendToTarget("-");

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
        senderExportedPublicVerifyingKey:
          listOfConnectedUsers[room][mySocketID].exportedPublicVerifyingKey,
      };
    } else {
      messageObject = {
        type: "text",
        body: message,
        senderExportedPublicVerifyingKey:
          listOfConnectedUsers[room][mySocketID].exportedPublicVerifyingKey,
      };
    }

    sendAsymmetricMessage(room, messageObject);
    setMessage("");
    setFile(undefined);
  };

  const handleChosenReceipient = async (receipient: string) => {
    setSendToTarget(receipient);
    const createdSharedKey = await makeSharedKey();
    await sendSharedKey(
      receipient,
      listOfConnectedUsers[room][receipient].exportedPublicKey,
      createdSharedKey
    );
  };

  return (
    <Container>
      <Heading>Current Room: {room}</Heading>

      <Text>Select room:</Text>
      {rooms.map((r, i) => (
        <Button
          margin="5px"
          colorScheme="green"
          onClick={() => setRoom(r)}
          key={i}
        >
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
                  handleChosenReceipient(user);
                }}
                margin="5px"
                colorScheme="blue"
              >
                {user}
              </Button>
            );
          }
        })}
      <Heading size="md" marginTop="2vh">
        You are sending to:
      </Heading>
      {sendToTarget === "-" ? (
        <Text>Click on connected user to select who to send item to</Text>
      ) : (
        <Heading size="md">{sendToTarget}</Heading>
      )}

      <Heading marginTop="5vh">Live Chat:</Heading>

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
          // only display something in chat is body is decrypted
          if (message.body !== "not for you") {
            if (message.type === "file") {
              return (
                <HStack key={index}>
                  <Image src={message.body} />
                  {message.verified ? (
                    <CheckCircleIcon color="green.500" />
                  ) : (
                    <WarningIcon color="red.500" />
                  )}
                </HStack>
              );
            }
            return (
              <HStack key={index}>
                <Text>{message.body}</Text>
                {message.verified ? (
                  <CheckCircleIcon color="green.500" />
                ) : (
                  <WarningIcon color="red.500" />
                )}
              </HStack>
            );
          }
        })}
      </VStack>
    </Container>
  );
};

export default AsymmetricChat;
