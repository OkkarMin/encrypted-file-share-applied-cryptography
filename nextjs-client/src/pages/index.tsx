import Link from "next/link";
import { Button, Heading, VStack } from "@chakra-ui/react";

const Index = () => (
  <VStack height="100vh" justify="center" align="center" spacing="2em">
    <Heading>Encrypted File Sharing Session - Applied Cryptography</Heading>

    <Link href="/symmetric-room">
      <Button colorScheme="linkedin">Room - Symmetrically Encrypted</Button>
    </Link>

    <Link href="/asymmetric-room">
      <Button colorScheme="whatsapp">Room - Asymmetrically Encrypted</Button>
    </Link>
  </VStack>
);

export default Index;
