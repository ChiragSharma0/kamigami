import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../Hero/hero.css";
import gsap from "gsap";
import Draggable from "gsap/dist/Draggable";
import videoSrc from "../../assets/videos/14.mp4";
import api from "../../services/api";

gsap.registerPlugin(Draggable);

const boxes = [
  { width: "50vw", height: "30vw", top: "10vh", left: "10vw" },
  { width: "17vw", height: "9vw", top: "5vh", left: "5vw" },
  { width: "35vw", height: "19vw", top: "5vh", right: "5vw" },
  { width: "38vw", height: "22vw", top: "50vh", left: "5vw" },
  { width: "12vw", height: "10vw", top: "50vh", left: "25vw" },
];

export default function MaskVideo() {
  const videoRef = useRef(null);
  const maskRefs = useRef([]);
  const heroRef = useRef(null);
  const [featuredDrop, setFeaturedDrop] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch drops and active status on load
  useEffect(() => {
    const fetchDrops = async () => {
      try {
        const res = await api.get('/drops');
        const drops = res.data?.data?.drops || [];
        const active = drops.find(d => d.status === 'ACTIVE');
        if (active) {
          setFeaturedDrop({ ...active, isActive: true });
        } else {
          const nextDrop = drops.find(d => d.status === 'SCHEDULED');
          if (nextDrop) {
            setFeaturedDrop({ ...nextDrop, isActive: false });
          }
        }
      } catch (err) {
        console.error("Error fetching drops for hero:", err);
      }
    };
    fetchDrops();
  }, []);

  // Timer Tick Hook
  useEffect(() => {
    if (!featuredDrop) return;
    if (featuredDrop.isActive) {
      setTimeLeft("GO TO DROP");
      return;
    }

    const interval = setInterval(() => {
      const difference = new Date(featuredDrop.startTime) - new Date();
      if (difference <= 0) {
        setTimeLeft("LIVE NOW");
        clearInterval(interval);
        // Refresh page/state to transition to active
        window.location.reload();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const formatted = `${days > 0 ? `${days}d : ` : ""}${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
      setTimeLeft(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [featuredDrop]);

  useEffect(() => {
    const video = videoRef.current;
    const masks = maskRefs.current;

    let isDragging = false;

    const coords = document.querySelector(".cursor-coords");
    const xLabel = document.querySelector(".coord-x");
    const yLabel = document.querySelector(".coord-y");

    const grabText = document.querySelector(".coord-grab");

    maskRefs.current.forEach((mask) => {
      mask.addEventListener("mouseenter", () => {
        if (!isDragging) {
          grabText.style.display = "block";
          xLabel.style.display = "none";
          yLabel.style.display = "none";
        }
      });

      mask.addEventListener("mouseleave", () => {
        if (!isDragging) {
          grabText.style.display = "none";
          xLabel.style.display = "block";
          yLabel.style.display = "block";
        }
      });
    });

    function handleMouseMove(e) {
      const heroRefCurrent = heroRef.current;
      if (!heroRefCurrent) return;
      const heroRect = heroRefCurrent.getBoundingClientRect();

      // check if cursor inside hero + navbar area
      if (e.clientY < heroRect.bottom) {
        coords.style.display = "block";

        coords.style.left = e.clientX + 12 + "px";
        coords.style.top = e.clientY + 12 + "px";

        xLabel.textContent = "X: " + Math.round(e.clientX) + "px";
        yLabel.textContent = "Y: " + Math.round(e.clientY) + "px";
      } else {
        coords.style.display = "none";
      }
    }

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId;

    function drawClipped(ctx, video, rect) {
      const videoAspect = video.videoWidth / video.videoHeight;
      const windowAspect = window.innerWidth / window.innerHeight;

      let displayWidth, displayHeight, displayX, displayY;

      if (videoAspect > windowAspect) {
        displayHeight = window.innerHeight;
        displayWidth = displayHeight * videoAspect;
        displayX = (window.innerWidth - displayWidth) / 2;
        displayY = 0;
      } else {
        displayWidth = window.innerWidth;
        displayHeight = displayWidth / videoAspect;
        displayX = 0;
        displayY = (window.innerHeight - displayHeight) / 2;
      }

      const scaleX = video.videoWidth / displayWidth;
      const scaleY = video.videoHeight / displayHeight;

      const sourceX = (rect.left - displayX) * scaleX;
      const sourceY = (rect.top - displayY) * scaleY;
      const sourceWidth = rect.width * scaleX;
      const sourceHeight = rect.height * scaleY;

      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        rect.width,
        rect.height,
      );
    }

    function render() {
      masks.forEach((mask) => {
        const canvas = mask.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        // IMPORTANT: width/height only once
        if (!canvas._initialized) {
          const rect = mask.getBoundingClientRect();
          canvas.width = Math.round(rect.width);
          canvas.height = Math.round(rect.height);
          canvas._initialized = true;
        }

        const rect = mask.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawClipped(ctx, video, rect);
      });

      animationFrameId = requestAnimationFrame(render);
    }

    function init() {
      video.play();
      render();

      const navbarHeight = 80;

      masks.forEach((mask) => {
        const rect = mask.getBoundingClientRect();

        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height - navbarHeight;

        const randomX = Math.random() * maxX;

        // navbar ke niche spawn
        const randomY = Math.random() * maxY + navbarHeight;

        gsap.set(mask, {
          x: randomX,
          y: randomY,
        });
      });

      Draggable.create(masks, {
        type: "x,y",
        bounds: heroRef.current,
        edgeResistance: 0.9,
        inertia: false,

        onPress() {
          isDragging = true;

          xLabel.style.display = "none";
          yLabel.style.display = "none";
          grabText.style.display = "block";
        },

        onRelease() {
          isDragging = false;

          grabText.style.display = "none";
          xLabel.style.display = "block";
          yLabel.style.display = "block";
        },

        onDrag() {
          if (this.y < navbarHeight) {
            this.y = navbarHeight;
            gsap.set(this.target, { y: navbarHeight });
          }

          const label = this.target.querySelector(".coord-label");
          label.textContent = `X: ${Math.round(this.x)}  Y: ${Math.round(this.y)}`;
        },
      });
    }

    if (video.readyState >= 2) {
      init();
    } else {
      video.addEventListener("loadeddata", init);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [featuredDrop]);

  const addMaskRef = (el) => {
    if (el && !maskRefs.current.includes(el)) {
      maskRefs.current.push(el);
    }
  };

  return (
    <>
      <div ref={heroRef} className="hero">
        <div className="hero-corners"></div>

        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          style={{ display: "none" }}
        />

        {boxes.map((box, i) => (
          <div
            key={i}
            ref={addMaskRef}
            className="mask-box"
            style={{
              width: box.width,
              height: box.height,
            }}
          >
            <div className="corners"></div>
            <div className="coord-label">X: 0 Y: 0</div>
            <canvas />
          </div>
        ))}

        {featuredDrop && (
          <Link to="/drops" className="hero-countdown-btn">
            <span className="btn-pulse-dot"></span>
            <span className="btn-label">
              {featuredDrop.isActive ? "GATES ARE OPEN" : "THE DESCENSION"}
            </span>
            <span className="btn-timer">{timeLeft}</span>
          </Link>
        )}

        <div className="cursor-coords">
          <div className="coord-x">X: 0px</div>
          <div className="coord-y">Y: 0px</div>
          <div className="coord-grab">Grab</div>
        </div>
      </div>

    </>
  );
}
