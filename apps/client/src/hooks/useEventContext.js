import { useContext } from "react";
import { EventContext } from "../contexts/EventContext.jsx";

export const useEventContext = () => useContext(EventContext);
