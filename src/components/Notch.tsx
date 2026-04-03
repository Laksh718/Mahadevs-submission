import React from "react";

interface NotchProps {
  text: string;
  topText?: string;
  bottomText?: string;
}

const Notch: React.FC<NotchProps> = ({ text, topText, bottomText }) => {
  return (
    <>
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-white backdrop-blur-sm text-black font-semibold px-4 py-2 rounded-full shadow-lg border-slate-700">
          {topText || text}
        </div>
      </div>
      <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
        <div className="bg-white backdrop-blur-sm text-black font-semibold px-20 py-2 rounded-full shadow-lg border-slate-700">
          {bottomText || text}
        </div>
      </div>
    </>
  );
};

export default Notch;