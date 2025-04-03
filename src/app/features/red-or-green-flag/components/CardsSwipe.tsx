import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface FlagCard {
  id: number;
  type: "red" | "green";
  text: string;
}

interface FlagCardProps extends FlagCard {
  setFlagCards: React.Dispatch<React.SetStateAction<FlagCard[]>>;
  flagCards: FlagCard[];
}

const getRandomFlags = (data: FlagCard[], count: number): FlagCard[] => {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const FlagSwiper: React.FC = () => {
  const [flagCards, setFlagCards] = useState<FlagCard[]>([]);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch("/flagsData.json"); 
        const data: FlagCard[] = await response.json();
        setFlagCards(getRandomFlags(data, 5)); 
      } catch (error) {
        console.error("Error fetching flag data:", error);
      }
    };

    fetchFlags();
  }, []);

  return (
    <div className="grid h-[500px] w-full place-items-center">
      {flagCards.map((flag) => (
        <FlagCardComponent 
          key={flag.id} 
          flagCards={flagCards} 
          setFlagCards={setFlagCards} 
          {...flag} 
        />
      ))}
    </div>
  );
};

const FlagCardComponent: React.FC<FlagCardProps> = ({ id, type, text, setFlagCards, flagCards }) => {
  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = id === flagCards[flagCards.length - 1]?.id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 100) {
      setFlagCards((prev) => prev.filter((v) => v.id !== id));
    }
  };

  return (
    <motion.div
      className={`absolute flex h-96 w-72 items-center justify-center rounded-lg p-6 text-center text-white shadow-lg
      ${type === "red" ? "bg-red-500" : "bg-green-500"}`}
      style={{
        x,
        opacity,
        rotate,
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
          : undefined,
      }}
      animate={{ scale: isFront ? 1 : 0.98 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      transition={{ type: "spring", stiffness: 300, damping: 20 }} 
      onDragEnd={handleDragEnd}
    >
      <p className="text-lg font-semibold">{text}</p>
    </motion.div>
  );
};

export default FlagSwiper;
