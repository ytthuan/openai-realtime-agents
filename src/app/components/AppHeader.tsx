import React from "react";
import Image from "next/image";

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
    </div>
  );
};

export default React.memo(AppHeader);