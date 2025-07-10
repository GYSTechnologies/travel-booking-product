import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ImageCarousel = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-52 sm:h-60 overflow-hidden rounded-t-xl">
      <div className="flex w-full h-full transition-transform duration-700 ease-in-out"
           style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`slide-${i}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === index ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
