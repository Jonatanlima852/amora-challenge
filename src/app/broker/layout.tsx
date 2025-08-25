import { ReactNode } from "react";
import { BrokerSidebar } from "./_components/BrokerSidebar";
import { BrokerHeader } from "./_components/BrokerHeader";

export default function BrokerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <BrokerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BrokerHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children }
        </main>
      </div>
    </div>
  );
}
