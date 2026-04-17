import RegisterAndLoginForm from "./RegisterAndLoginForm.jsx";
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx";
import Chat from "./Chat";

export default function Routes() {
  const {username, id} = useContext(UserContext);

  if (!id) {
    return <RegisterAndLoginForm />
  }

  return <Chat />
  
}