import { createContext, useContext } from "react";
import SApp from "./app";

const ctx = createContext({
  sApp: new SApp(),
});

export const useStores = () => {
  return useContext(ctx);
};
