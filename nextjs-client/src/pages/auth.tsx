import { Heading, VStack } from "@chakra-ui/react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../utils/firebase";

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: "popup",
  signInSuccessUrl: "/",
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

function SignInScreen() {
  return (
    <VStack height="100vh" justify="center" align="center" spacing="2em">
      <Heading>Encrypted File Sharing Session - Applied Cryptography</Heading>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </VStack>
  );
}

export default SignInScreen;
