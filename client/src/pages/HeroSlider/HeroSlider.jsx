import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../HeroSlider/Module.css";
import api from "../../services/api";

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: "Hoodies",
    subtitle: "Shop Now",
    image:
      "https://i.pinimg.com/736x/81/cf/0a/81cf0ae5207c5af67de47a418b1fe6ef.jpg",
    redirectUrl: "/collections/hoodies"
  },
  {
    id: 2,
    title: "New Collection",
    subtitle: "Discover",
    image:
      "https://i.pinimg.com/736x/b0/df/44/b0df44b19351f3e5ea54f6d82c7e0f21.jpg",
    redirectUrl: "/collections"
  },
  {
    id: 3,
    title: "Street Wear",
    subtitle: "Shop Now",
    image:
      "https://i.pinimg.com/1200x/77/07/c7/7707c7bc64430185043adc06d26a09b7.jpg",
    redirectUrl: "/drops"
  },
];

const HeroSlider = () => {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSliderCms = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.data?.value?.slider) {
          setSlides(res.data.data.value.slider);
        }
      } catch (err) {
        console.log('[CMS-Slider] Fetch failed or settings unseeded, using default storefront sliders.');
      }
    };
    fetchSliderCms();
  }, []);

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
          onClick={() => slide.redirectUrl && navigate(slide.redirectUrl)}
          style={{ cursor: slide.redirectUrl ? 'pointer' : 'default' }}
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