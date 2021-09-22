import Link from "next/link";
import { Button, Heading, VStack } from "@chakra-ui/react";

const Index = () => (
  <VStack height="100vh" justify="center" align="center" spacing="2em">
    <Heading>Encrypted File Sharing Session - Applied Cryptography</Heading>

    <Button colorScheme="whatsapp">To Send File</Button>
    <Button colorScheme="linkedin">To Receive File</Button>

    <Link href="/chat">
      <Button colorScheme="pink">To Chat Page</Button>
    </Link>
  </VStack>
);

export default Index;
