
import { useEffect, useState } from "react";

interface ChannelTypesHeaderProps {
  backgroundImages: string[];
}

const ChannelTypesHeader = ({ backgroundImages }: ChannelTypesHeaderProps) => {
  const [backgroundImage, setBackgroundImage] = useState("");
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, [backgroundImages]);

  return (
    <div 
      className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
    >
      <div className="text-center text-white max-w-3xl mx-auto px-4">
        <h1 className="font-crimson text-4xl font-bold mb-4 text-center">Channel Types</h1>
        <p className="font-lato text-lg text-center">
          Explore different types of YouTube channels to understand their unique characteristics, 
          production styles, and potential for growth.
        </p>
      </div>
    </div>
  );
};

export default ChannelTypesHeader;
