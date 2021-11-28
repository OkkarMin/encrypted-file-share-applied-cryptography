import Link from "next/link";
import { Button, Heading, VStack } from "@chakra-ui/react";

import { auth } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Index = () => {
  const [user, loading, error] = useAuthState(auth);

  if (error) return <div>Error: {error.message}</div>;

  !loading && !user && (window.location.href = "/auth");

  return (
    <VStack height="100vh" justify="center" align="center" spacing="2em">
      <Heading>Encrypted File Sharing Session - Applied Cryptography</Heading>

      <Link href="/symmetric-room">
        <Button colorScheme="linkedin">Room - Symmetrically Encrypted</Button>
      </Link>

      <Link href="/asymmetric-room">
        <Button colorScheme="whatsapp">Room - Asymmetrically Encrypted</Button>
      </Link>

      {user && (
        <Button colorScheme="red" onClick={() => auth.signOut()}>
          Sign Out
        </Button>
      )}
    </VStack>
  );
};

export default Index;
