import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    let animationId: number;

    // Create falling characters
    const chars = '01';
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark background with subtle gradient
      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(0, 0, w, h);

      // Subtle top glow
      const topGradient = ctx.createLinearGradient(0, 0, 0, 100);
      topGradient.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      topGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, w, 100);

      // Subtle bottom glow
      const bottomGradient = ctx.createLinearGradient(0, h - 100, 0, h);
      bottomGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
      bottomGradient.addColorStop(1, 'rgba(139, 92, 246, 0.08)');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, h - 100, w, 100);

      // Draw falling binary digits
      ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i];

        // Draw character with slight opacity variation
        const opacity = 0.3 + Math.sin(time * 0.01 + i) * 0.3;
        ctx.fillStyle = `rgba(6, 182, 212, ${opacity})`;
        ctx.fillText(char, x, y);

        // Reset drop when it goes off screen
        if (y > h) {
          drops[i] = 0;
        } else {
          drops[i] += 2; // Speed of falling
        }
      }

      // Horizontal scanning line
      const scanY = (Math.sin(time * 0.003) * h * 0.3) + h * 0.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Vertical scanning line
      const scanX = (Math.cos(time * 0.003) * w * 0.3) + w * 0.5;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, h);
      ctx.stroke();

      // Simple corner brackets and text
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      const bracketSize = 15;

      // Top-left bracket
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(10 + bracketSize, 10);
      ctx.moveTo(10, 10);
      ctx.lineTo(10, 10 + bracketSize);
      ctx.stroke();

      // Top-right bracket
      ctx.beginPath();
      ctx.moveTo(w - 10, 10);
      ctx.lineTo(w - 10 - bracketSize, 10);
      ctx.moveTo(w - 10, 10);
      ctx.lineTo(w - 10, 10 + bracketSize);
      ctx.stroke();

      // Bottom-left bracket
      ctx.beginPath();
      ctx.moveTo(10, h - 10);
      ctx.lineTo(10 + bracketSize, h - 10);
      ctx.moveTo(10, h - 10);
      ctx.lineTo(10, h - 10 - bracketSize);
      ctx.stroke();

      // Bottom-right bracket
      ctx.beginPath();
      ctx.moveTo(w - 10, h - 10);
      ctx.lineTo(w - 10 - bracketSize, h - 10);
      ctx.moveTo(w - 10, h - 10);
      ctx.lineTo(w - 10, h - 10 - bracketSize);
      ctx.stroke();

      // Status text
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('[SECURE]', 30, 25);
      ctx.fillText('[LIVE]', w - 90, 25);
      ctx.fillText('[ACTIVE]', 30, h - 15);
      ctx.fillText('[MONITOR]', w - 120, h - 15);

      // Pulsing center dot
      const pulse = 0.5 + Math.sin(time * 0.005) * 0.5;
      ctx.fillStyle = `rgba(6, 182, 212, ${0.3 * pulse})`;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 3 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        border: 'none',
        zIndex: -10,
        pointerEvents: 'none',
        backgroundColor: '#0a0f1a',
      }}
    />
  );
}
