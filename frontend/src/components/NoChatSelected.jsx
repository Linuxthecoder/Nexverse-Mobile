import { MessageSquare, Sparkles, Zap, Shield, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";

// Mouse Gradient Effect
const useMouseGradient = (ref) => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ref.current.style.setProperty("--mouse-x", `${x}px`);
      ref.current.style.setProperty("--mouse-y", `${y}px`);
    };
    const element = ref.current;
    element.addEventListener("mousemove", handleMouseMove);
    return () => element.removeEventListener("mousemove", handleMouseMove);
  }, [ref]);
};

// Starfield Animation
const useStarfield = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const stars = [];
    const shootingStars = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.6 + 0.4,
        blinkSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        this.x = canvas.width + 200;
        this.y = -200;
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const angle = Math.atan2(dy, dx);
        this.length = 300;
        this.speed = 6;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.alpha = 1;
        this.angle = angle;
        this.active = true;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.002;
        if (this.alpha <= 0 || this.y > canvas.height + 100) {
          this.active = false;
        }
      }

      draw() {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x - this.length * Math.cos(this.angle),
          this.y - this.length * Math.sin(this.angle)
        );
        grad.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - this.length * Math.cos(this.angle),
          this.y - this.length * Math.sin(this.angle)
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "white";
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const launchStars = () => {
      const batch = Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 2 : 1;
      for (let i = 0; i < batch; i++) {
        shootingStars.push(new ShootingStar());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.opacity += star.blinkSpeed;
        if (star.opacity > 1 || star.opacity < 0.4) {
          star.blinkSpeed *= -1;
        }
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      });

      shootingStars.forEach((star, i) => {
        star.update();
        if (!star.active) shootingStars.splice(i, 1);
        else star.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();
    launchStars();
    const interval = setInterval(launchStars, 10000);

    window.addEventListener("resize", () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    });

    return () => clearInterval(interval);
  }, []);
};

const NoChatSelected = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useMouseGradient(containerRef);
  useStarfield(canvasRef);

  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const handleAuraClick = () => {
    setSelectedUser({ _id: "aura", fullName: "Aura" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-1 flex-col items-center justify-center p-4 sm:p-8 md:p-16 bg-gradient-to-br from-base-100/90 to-base-200/80 backdrop-blur-md overflow-hidden"
    >
      {/* Starfield Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      />

      {/* Content */}
      <div className="relative z-10 max-w-lg text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div
              className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 30%)" }}
            />
            <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Welcome to <span className="tracking-wide">NexVerse</span>
          </h2>
          <p className="text-base-content/80 text-lg">
            Select a conversation to begin a private, encrypted journey.
          </p>
        </div>

        {/* Glassmorphic "What's New" Button (No Shine Effect) */}
        <button
          onClick={handleAuraClick}
          className="group relative px-7 py-4 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: "600",
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>What's New in v3.3</span>
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              NEW
            </span>
          </div>

          {/* Subtle glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            }}
          ></div>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-theme={theme}
        >
          <div className="bg-base-100 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                What's New in v3.3
              </h3>
              <button
                onClick={closeModal}
                className="text-base-content/50 hover:text-base-content transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5 text-base-content/80">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Lightning Fast Performance
                </h4>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-1">
                  <li>Instant message delivery and real-time updates.</li>
                  <li>Blazing fast file transfers and media sharing.</li>
                  <li>Smooth animations and seamless navigation.</li>
                  <li>Zero lag, even with large conversations.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  Enhanced Chat Experience
                </h4>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-1">
                  <li>Improved typing indicators and read receipts.</li>
                  <li>Better file sharing with preview support.</li>
                  <li>Smarter notifications and message threading.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Enhanced Security & Privacy
                </h4>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-1">
                  <li>Fixed critical security vulnerabilities.</li>
                  <li>Stronger encryption for all your messages.</li>
                  <li>Better session management and protection.</li>
                  <li>Your privacy is our top priority.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Cleaner Interface
                </h4>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-1">
                  <li>Streamlined settings for easier customization.</li>
                  <li>More intuitive navigation and controls.</li>
                  <li>Beautiful themes and smooth transitions.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-base-200 text-center">
                <p className="text-sm text-base-content/70 italic">
                  We're constantly improving your NexVerse experience. Stay tuned for more updates!
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow hover:shadow-md transition-all"
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .relative {
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
      `}</style>
    </div>
  );
};

export default NoChatSelected;
