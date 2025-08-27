import { useEffect, useState } from "react";
import { request } from "../api";
import type { Test } from "../types";
import Loading from "../components/Loading";


export function Home() {
  
const [testMessage,setTestMessage] = useState<string | null>(null)

useEffect(() => {
  const getTestMessage = async () => {


    const testMessage = await request<Test>(
      "/")
   

  
    if (!testMessage.message) {
      alert("error");
      return;
    }

    setTestMessage(testMessage.message);
 
  };

  getTestMessage();
}, []);

if (!testMessage) {
  return <Loading />;
}

  return (
    <div className="bg-center">
      Hello
    </div>
  );
}
