"use client";

import "./globals.css";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { store } from "../store/store"; // Import your Redux store

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <div className="">{children}</div>
    </Provider>
  );
}
