import React from "react";
import Image from "next/image";
import Link from 'next/link';

interface AppHeaderProps {
  onReload: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onReload }) => {
  return (
    <div className="p-5 text-lg font-semibold flex justify-between items-center">
      <div
        className="flex items-center cursor-pointer"
        onClick={onReload}
      >
        <div>
          <Image
            src="/openai-logomark.svg"
            alt="OpenAI"
            width={32}
            height={32}
            className="mr-2"
          />
        </div>
        <span>Azure AI Voice Agents</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link 
          href="/agent-builder"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Agent Builder
        </Link>
      </div>
    </div>
  );
};

export default React.memo(AppHeader);