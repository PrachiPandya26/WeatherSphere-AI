class WeatherCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.weatherType = 'clear';
    this.isDay = 1;
    this.animId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.initParticles();
  }

  setWeather(category, isDay = 1) {
    this.weatherType = category || 'clear';
    this.isDay = isDay;
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = this.weatherType === 'rain' || this.weatherType === 'thunderstorm' ? 120 :
                  this.weatherType === 'snow' ? 80 :
                  this.weatherType === 'cloudy' ? 20 : 40;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 20 + 10,
        speedY: Math.random() * 12 + 10,
        speedX: Math.random() * 2 - 1,
        opacity: Math.random() * 0.4 + 0.3
      };
    } else if (this.weatherType === 'snow') {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 1.5 + 0.5,
        speedX: Math.sin(Math.random() * Math.PI) * 0.8,
        opacity: Math.random() * 0.7 + 0.3
      };
    } else if (this.weatherType === 'cloudy') {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.5,
        radius: Math.random() * 100 + 60,
        speedX: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.08 + 0.03
      };
    } else {
      // Clear sky: Stars at night or Sunbeams at day
      return {
        x: Math.random() * this.width,
        y: Math.random() * (this.isDay ? this.height : this.height * 0.8),
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        deltaAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
      };
    }
  }

  start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  update() {
    for (let p of this.particles) {
      if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > this.height) {
          p.y = -20;
          p.x = Math.random() * this.width;
        }
      } else if (this.weatherType === 'snow') {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.5;
        if (p.y > this.height) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }
      } else if (this.weatherType === 'cloudy') {
        p.x += p.speedX;
        if (p.x - p.radius > this.width) {
          p.x = -p.radius;
        }
      } else {
        p.alpha += p.deltaAlpha;
        if (p.alpha > 1 || p.alpha < 0.1) p.deltaAlpha = -p.deltaAlpha;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Background ambient overlay gradient
    if (this.weatherType === 'thunderstorm') {
      if (Math.random() < 0.015) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    for (let p of this.particles) {
      this.ctx.beginPath();

      if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
        this.ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.speedX, p.y + p.length);
        this.ctx.stroke();
      } else if (this.weatherType === 'snow') {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (this.weatherType === 'cloudy') {
        let grad = this.ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        if (!this.isDay) {
          // Night Stars
          this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          // Daytime Warm Glow
          let grad = this.ctx.createRadialGradient(this.width * 0.8, 100, 20, this.width * 0.8, 100, 300);
          grad.addColorStop(0, 'rgba(253, 224, 71, 0.12)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(0, 0, this.width, this.height);
        }
      }
    }
  }
}

window.weatherCanvas = new WeatherCanvas('weather-canvas');
window.weatherCanvas.start();
