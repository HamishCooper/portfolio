// Fixed main.js - full script with corrected syntax and logic

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const backArrow = document.getElementById("back-arrow");
  const credentials = document.getElementById("credentials");
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoSubtitle = document.getElementById("info-subtitle");
  const infoMeta = document.getElementById("info-meta");
  const infoBody = document.getElementById("info-body");
  const canvasContainer = document.getElementById("canvas-scroll-container");
  const shapes = [];
  let frameCount = 0;
  let selectedShape = null;
  let hoveredShape = null;
let lastMouseX = 0;
let lastMouseY = 0;
  let credentialsFadeInTriggered = false;

  class Shape {
    constructor({ name, width, height, expandedScale, color = '#ccc', image = null, videoSrc = null, title = '', subtitle = '', meta = '', body = '', cornerRadiusDefault = 20, cornerRadiusExpanded }) {
      this.name = name;
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
      this.width = 0;
      this.height = 0;
      this.baseWidth = width;
      this.baseHeight = height;
      this.expandedWidth = width * (expandedScale || 1.5);
      this.expandedHeight = height * (expandedScale || 1.5);
      this.cornerRadius = 0;
      this.baseCornerRadius = cornerRadiusDefault;
      this.cornerRadiusExpanded = cornerRadiusExpanded !== undefined ? cornerRadiusExpanded : Math.min(width, height) / 2;
      this.color = color;
      this.vx = 0;
      this.vy = 0;
      this.isHovered = false;
      this.shadowOpacity = 0;
      this.imageLoaded = false;
      this.image = null;
      this.videoSrc = videoSrc;
      this.opacity = 0;
      this.expandedScale = expandedScale || 1.5;
      this.title = title;
      this.subtitle = subtitle;
      this.meta = meta;
      this.body = body;
      if (image) {
        const img = new Image();
        img.onload = () => { this.imageLoaded = true; };
        img.src = image;
        this.image = img;
      }
    }

    update() {
      if (selectedShape !== this) {
        if (this.isHovered) {
          this.vx = 0;
          this.vy = 0;
        } else {
          const dx = window.innerWidth / 2 - (this.x + this.width / 2);
          const dy = window.innerHeight / 2 - (this.y + this.height / 2);
          const force = 0.002;
          this.vx += dx * force;
          this.vy += dy * force;

          // Apply slight counter-clockwise force
          const torque = 0.0001;
          this.vx -= dy * torque;
          this.vy += dx * torque;
          this.vx *= 0.85;
          this.vy *= 0.85;
          this.x += this.vx;
          this.y += this.vy;
        }
      }

      const targetWidth = this.isHovered || selectedShape === this ? this.expandedWidth : this.baseWidth;
      const targetHeight = this.isHovered || selectedShape === this ? this.expandedHeight : this.baseHeight;
      this.width += (targetWidth - this.width) * 0.1;
      this.height += (targetHeight - this.height) * 0.1;

      const targetCorner = this.isHovered || selectedShape === this ? this.cornerRadiusExpanded : this.baseCornerRadius;
      this.cornerRadius += (targetCorner - this.cornerRadius) * 0.1;

      const targetShadowOpacity = (this.isHovered && !selectedShape) ? 0.6 : 0;
      this.shadowOpacity += (targetShadowOpacity - this.shadowOpacity) * 0.1;

      if (selectedShape === this) {
        const targetX = window.innerWidth * 0.1;
        const targetY = window.innerHeight * 0.1 + canvasContainer.scrollTop;
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;
      }

      if (this.overlayElement) {
        const el = this.overlayElement;
        el.style.display = this.opacity < 0.51 ? 'none' : 'block';
        el.style.position = 'absolute';
        el.style.left = `${this.x}px`;
        el.style.top = `${this.y}px`;
        el.style.width = `${this.width}px`;
        el.style.height = `${this.height}px`;
        el.style.opacity = this.opacity.toFixed(2);
        el.style.borderRadius = `${this.cornerRadius}px`;
      }
    }

    draw() {
      if (this.opacity < 0.01 || this.shadowOpacity < 0.01) return;
      ctx.save();
      ctx.shadowColor = `rgba(0,0,0,${this.shadowOpacity})`;
      ctx.shadowBlur = 50;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 60;
      const cr = Math.min(this.cornerRadius + 2, this.width / 2, this.height / 2);
      ctx.beginPath();
      ctx.moveTo(this.x + cr, this.y);
      ctx.lineTo(this.x + this.width - cr, this.y);
      ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + cr);
      ctx.lineTo(this.x + this.width, this.y + this.height - cr);
      ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - cr, this.y + this.height);
      ctx.lineTo(this.x + cr, this.y + this.height);
      ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - cr);
      ctx.lineTo(this.x, this.y + cr);
      ctx.quadraticCurveTo(this.x, this.y, this.x + cr, this.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,255,255,${this.shadowOpacity})`;
      ctx.fill();
      ctx.restore();
    }

    isPointInside(px, py) {
      return px > this.x && px < this.x + this.width && py > this.y && py < this.y + this.height;
    }

    hover() {
      if (selectedShape != null) return;
      if (hoveredShape && hoveredShape !== this) hoveredShape.unhover();
      hoveredShape = this;
      this.isHovered = true;
      if (this.overlayElement) this.overlayElement.style.zIndex = '10';
    }

    unhover() {
      if (this.isHovered) {
        this.isHovered = false;
        if (this.overlayElement) this.overlayElement.style.zIndex = '5';
      }
    }
  }

  function createOverlayElement(shape) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '5';
    container.style.overflow = 'hidden';
    container.style.borderRadius = '20px';
    container.style.display = 'none';

    const fallbackImg = document.createElement('img');
    fallbackImg.src = shape.image?.src || '';
    fallbackImg.style.width = '100%';
    fallbackImg.style.height = '100%';
    fallbackImg.style.objectFit = 'cover';
    fallbackImg.style.display = 'none';
    container.appendChild(fallbackImg);

    if (shape.videoSrc) {
      const video = document.createElement('video');
      video.src = shape.videoSrc;
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.onerror = () => { video.style.display = 'none'; fallbackImg.style.display = 'block'; };
      video.oncanplay = () => { video.style.display = 'block'; fallbackImg.style.display = 'none'; };
      container.appendChild(video);
    } else {
      fallbackImg.style.display = 'block';
    }

    canvasContainer.appendChild(container);
    shape.overlayElement = container;
  }

  // Continuation of main.js from overlay creation to animation and interaction handling

  function resolveCollisions() {
    if (selectedShape) return;
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i];
        const b = shapes[j];
        const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
        const dy = (b.y + b.height / 2) - (a.y + a.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.width / 2 + b.width / 2 + 10;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          if (!a.isHovered) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!b.isHovered) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }
    }
  }

  shapeConfigs.forEach(config => {
    const shape = new Shape(config);
    shape.visibleFrame = shapes.length * 15;
    shapes.push(shape);
    createOverlayElement(shape);
  });

  function animate() {
    frameCount++;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
      if (frameCount >= shape.visibleFrame) {
        shape.opacity += (selectedShape && selectedShape !== shape ? 0 - shape.opacity : 1 - shape.opacity) * 0.1;
        shape.update();
      }
    });

    if (!credentialsFadeInTriggered && frameCount >= shapes[0].visibleFrame) {
      credentials.style.opacity = '1';
      credentialsFadeInTriggered = true;
    }

    resolveCollisions();

    shapes.forEach(shape => {
      if (shape.opacity > 0.01) {
        ctx.globalAlpha = shape.opacity;
        shape.draw();
        ctx.globalAlpha = 1;
      }
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener("mousemove", (e) => {
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    // Apply slight rotational push to all shapes based on mouse movement
    shapes.forEach(shape => {
      if (!shape.isHovered && selectedShape !== shape) {
        const influence = 0.005;
        shape.vx += -deltaY * influence;
        shape.vy += deltaX * influence;
      }
    });
    const x = e.clientX;
    const y = e.clientY + window.scrollY;
    if (selectedShape) return;
    shapes.forEach(shape => {
      if (shape.isPointInside(x, y)) {
        shape.hover();
      } else {
        shape.unhover();
      }
    });
  });

  window.addEventListener("click", (e) => {
    if (selectedShape) return;
    const x = e.clientX + window.scrollX;
    const y = e.clientY;
    shapes.forEach(shape => {
      if (shape.isPointInside(x, y)) {
        selectedShape = shape;
        infoTitle.textContent = shape.title;
        infoSubtitle.textContent = shape.subtitle;
        infoMeta.textContent = shape.meta || '';
        infoBody.textContent = shape.body;
        infoPanel.classList.add("visible");
        backArrow.style.display = "block";
        credentials.style.transform = "translateX(-200%)";
      }
    });
  });

  backArrow.addEventListener("click", () => {
    selectedShape = null;
    infoPanel.classList.remove("visible");
    backArrow.style.display = "none";
    credentials.style.transform = "translateX(0)";
  });

  window.scrollTo(0, 0);
  animate();
};
