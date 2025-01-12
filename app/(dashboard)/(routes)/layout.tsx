import React from "react";
import { ReactNode } from "react";

interface MyComponentProps {
  children: ReactNode;
}

const layout = ({ children }: MyComponentProps) => {
  return <div>{children}</div>;
};

export default layout;
