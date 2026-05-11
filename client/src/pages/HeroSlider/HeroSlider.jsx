import React, { useState, useEffect } from "react";
import "../HeroSlider/module.css";

const slides = [
  {
    id: 1,
    title: "Hoodies",
    subtitle: "Shop Now",
    image:
      "https://i.pinimg.com/736x/81/cf/0a/81cf0ae5207c5af67de47a418b1fe6ef.jpg",
  },
  {
    id: 2,
    title: "New Collection",
    subtitle: "Discover",
    image:
      "https://i.pinimg.com/736x/b0/df/44/b0df44b19351f3e5ea54f6d82c7e0f21.jpg",
  },
  {
    id: 3,
    title: "Street Wear",
    subtitle: "Shop Now",
    image:
      "https://i.pinimg.com/1200x/77/07/c7/7707c7bc64430185043adc06d26a09b7.jpg",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);
 
  return (
    <section className="hero-slider">

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide ${index === current ? "active" : ""}`}
        >

          <img src={slide.image} alt="slider" className="slide-image" />

          <div className="overlay"></div>

          <div className="slide-content">

            <h1>{slide.title}</h1>

            <p>{slide.subtitle}</p>

          </div>

        </div>
      ))}

      {/* Dots */}
      <div className="slider-dots">

        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`dot ${index === current ? "active-dot" : ""}`}
          ></button>
        ))}

      </div>

    </section>
  );
};

export default HeroSlider;