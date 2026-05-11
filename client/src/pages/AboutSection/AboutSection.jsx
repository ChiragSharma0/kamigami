import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./module.css";

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        {/* LEFT SIDE */}
        <div className="left-section">
          {/* HERO CARD */}
          <div className="hero-card">
            <div className="hero-overlay"></div>

            <div>
              <h2 className="hero-title">
                Uncover Your <br /> Stylish Identity
              </h2>

              <p className="hero-text">
                Step into a World of High-Quality, Fashion-forward Design. From
                Casual Chic to Elevated Elegance.
              </p>
            </div>

            <div className="shop-btn">
              <Link to="/about-us">
                SHOP <br /> NOW
              </Link>
            </div>
          </div>

          {/* BOTTOM CARDS */}
          <div className="card-grid">
            {[
              {
                img: "https://images.unsplash.com/photo-1520975661595-6453be3f7070",
                title: "SIGNATURE",
                sub: "STAPLES",
              },
              {
                img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
                title: "TRENDSETTER",
                sub: "COLLECTION",
              },
              {
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                title: "VINCE",
                sub: "EXCLUSIVE",
              },
            ].map((card, i) => (
              <div key={i} className="card">
                <img src={card.img} alt="" />
                <div className="card-overlay"></div>

                <div className="card-text">
                  <p>{card.title}</p>
                  <span>{card.sub}</span>
                </div>

                <ArrowUpRight className="card-icon" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-section">
          <img
            src="https://i5.walmartimages.com/seo/Cute-Hoodies-for-Teen-Girls-Trendy-Waffle-Hooded-Sweatshirts-Oversized-Long-Sleeve-Sweater-Tween-Girl-Clothes-With-Pocket_f5eaaedd-a0b2-4298-ad86-ecb4e60e4665.3f912967cc120203881ec023922d10b1.jpeg"
            alt=""
          />

          <div className="image-overlay"></div>

          {/* SOCIAL ICONS */}
          <div className="social-icons">
            <div>fb</div>
            <div>tw</div>
            <div>in</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
