import { useEffect, useRef } from 'react';

export default function Matrix() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
      if (!canvas || !canvas.parentElement || !ctx) return;
      const { clientWidth, clientHeight } = canvas.parentElement;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      canvas.style.width = clientWidth + 'px';
      canvas.style.height = clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const columns = Math.floor(canvas.width / dpr / 16);
    const drops: number[] = new Array(columns).fill(0);
    const chars = '01░▒▓█'.split('');

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.fillStyle = 'rgba(11,15,26,0.15)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 16;
        const y = drops[i] * 16;
        ctx.fillStyle = Math.random() > 0.5 ? '#08f7fe' : '#f608f7';
        ctx.fillText(text, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationFrame = requestAnimationFrame(draw);
    }
    ctx.font = '14px monospace';
    ctx.shadowColor = '#08f7fe';
    ctx.shadowBlur = 4;
    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 -z-20 opacity-20 pointer-events-none"
      aria-hidden
    />
  );
}
