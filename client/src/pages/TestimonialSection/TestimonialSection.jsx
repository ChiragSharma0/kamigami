import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./testimonialSection.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Sample Data ─────────────────────────────────── */
const testimonials = [
  {
    id: 1,
    name: "Arjun Mehta",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    text: "Absolutely love the quality. The fabric feels premium and the fit is spot on. KamiGami is my new go-to brand for streetwear.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "Ordered the oversized tee — it's exactly what I wanted. The design is clean, minimal, and the packaging was super nice.",
  },
  {
    id: 3,
    name: "Rohan Verma",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 4,
    text: "Great attention to detail. The stitching, the tags, the overall vibe — everything screams quality. Will definitely order again.",
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "This brand understands aesthetics. Every piece feels like it was designed with purpose. The hoodie is insanely comfortable.",
  },
  {
    id: 5,
    name: "Karan Singh",
    avatar: "https://i.pravatar.cc/150?img=59",
    rating: 5,
    text: "Best streetwear I've bought in India. The drop shoulder fit is perfect and the material is thick and breathable.",
  },
];

/* ── Stars helper ────────────────────────────────── */
const Stars = ({ count }) => (
  <div className="testimonial-stars">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`testimonial-star ${i < count ? "" : "empty"}`}>
        ★
      </span>
    ))}
  </div>
);

/* ── Component ───────────────────────────────────── */
const TestimonialSection = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  // Reset refs array on each render to avoid stale entries
  cardRefs.current = [];

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  useEffect(() => {
    const cards = cardRefs.current;
    const total = cards.length;
    if (!total) return;

    // Set initial stacked positions — first card on top, rest behind
    cards.forEach((card, i) => {
      gsap.set(card, {
        y: i * 30,
        scale: 1 - i * 0.05,
        zIndex: total - i,
        opacity: 1,
      });
    });

    // Build scroll-linked timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${total * 600}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Animate each card (skip the first — it's already in position)
    for (let i = 1; i < total; i++) {
      const card = cards[i];
      const timelinePos = (i - 1) * 1; // each card gets its own segment

      // Push all previous cards slightly downward and scale down
      // so the new card visually rises above them
      for (let j = 0; j < i; j++) {
        tl.to(
          cards[j],
          {
            y: (i - j) * 30,
            scale: 1 - (i - j) * 0.05,
            zIndex: total - (i - j),
            duration: 1,
            ease: "power2.inOut",
          },
          timelinePos
        );
      }

      // Animate the active card to the top
      tl.to(
        card,
        {
          y: 0,
          scale: 1,
          zIndex: total + i, // highest z-index
          duration: 1,
          ease: "power2.inOut",
        },
        timelinePos
      );
    }

    ScrollTrigger.refresh();

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section className="testimonial-section" ref={sectionRef}>
      <div className="testimonial-pin">
        {/* Background glow */}
        <div className="testimonial-glow" />

        {/* Heading */}
        <div className="testimonial-heading">
          <p className="section-label">What People Say</p>
          <h2>Loved by Our Community</h2>
        </div>

        {/* Card Stack */}
        <div className="testimonial-stack">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              ref={addCardRef}
              className="testimonial-card"
            >
              <div className="testimonial-card-header">
                <img
                  className="testimonial-avatar"
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                />
                <div className="testimonial-user-info">
                  <p className="testimonial-user-name">{t.name}</p>
                  <Stars count={t.rating} />
                </div>
              </div>
              <p className="testimonial-text">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
