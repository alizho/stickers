function generateNoiseTexture(width, height, intensity) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 2 * intensity;
    const value = Math.floor(Math.max(0, Math.min(255, 128 + noise * 127)));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

const noiseTexture = generateNoiseTexture(512, 512, 0.6);

function initCardHover(stickerEl) {
  const image = stickerEl.querySelector('.card-hover-image');
  const overlay = stickerEl.querySelector('.card-light-overlay');
  const container = stickerEl.querySelector('.card-hover-container');
  if (!image || !overlay || !container) return;

  const imageSrc = image.getAttribute('src');
  if (imageSrc) {
    const maskProps = { maskImage: `url(${imageSrc})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' };
    Object.assign(overlay.style, maskProps);
    overlay.style.webkitMaskImage = maskProps.maskImage;
    overlay.style.webkitMaskSize = maskProps.maskSize;
    overlay.style.webkitMaskRepeat = maskProps.maskRepeat;
    overlay.style.webkitMaskPosition = maskProps.maskPosition;
  }

  const noiseOverlay = document.createElement('div');
  noiseOverlay.style.cssText = `
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: url(${noiseTexture}); background-size: 150% 150%;
    background-repeat: repeat; mix-blend-mode: overlay;
    pointer-events: none; z-index: 3; opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  overlay.appendChild(noiseOverlay);

  let isHovering = false;
  let isEntering = false;

  container.addEventListener('mousemove', (e) => {
    if (!isHovering) return;
    if (!isEntering) {
      image.style.transition = 'none';
      overlay.style.transition = 'none';
    }

    const rect = container.getBoundingClientRect();
    const mouseX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const mouseY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const rotateX = mouseY * -15;
    const rotateY = mouseX * 15;

    const imgRect = image.getBoundingClientRect();
    const relX = ((e.clientX - imgRect.left) / imgRect.width) * 100;
    const relY = ((e.clientY - imgRect.top) / imgRect.height) * 100;

    const angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    const dist = Math.min(Math.sqrt(mouseX * mouseX + mouseY * mouseY), 1);
    const gradAngle = angle + 90;
    const light = Math.min(dist * 0.2, 0.2);
    const dark = Math.min(dist * 0.3, 0.3);

    overlay.style.background = `linear-gradient(${gradAngle}deg,
      rgba(0,0,0,${dark}) 0%, rgba(0,0,0,${dark * 0.5}) 20%,
      rgba(255,255,255,${light}) 40%, rgba(255,255,255,${light}) 60%,
      rgba(0,0,0,${dark * 0.5}) 80%, rgba(0,0,0,${dark}) 100%)`;
    overlay.style.backgroundSize = '100% 100%';
    overlay.style.backgroundPosition = 'center';
    overlay.style.backgroundRepeat = 'no-repeat';

    const lightMask = `linear-gradient(${gradAngle}deg,
      rgba(0,0,0,0) 0%, rgba(0,0,0,0) 20%,
      rgba(255,255,255,${Math.min(light * 1.5, 1)}) 40%,
      rgba(255,255,255,${Math.min(light * 1.5, 1)}) 60%,
      rgba(0,0,0,0) 80%, rgba(0,0,0,0) 100%)`;

    noiseOverlay.style.backgroundPosition = `${relX}% ${relY}%`;
    noiseOverlay.style.maskImage = lightMask;
    noiseOverlay.style.webkitMaskImage = lightMask;
    noiseOverlay.style.maskSize = '100% 100%';
    noiseOverlay.style.webkitMaskSize = '100% 100%';
    noiseOverlay.style.maskPosition = 'center';
    noiseOverlay.style.webkitMaskPosition = 'center';
    noiseOverlay.style.maskRepeat = 'no-repeat';
    noiseOverlay.style.webkitMaskRepeat = 'no-repeat';
    if (!isEntering) noiseOverlay.style.transition = 'none';

    const transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05,1.05,1.05)`;
    image.style.transform = transform;
    overlay.style.transform = transform;
    noiseOverlay.style.transform = transform;
  });

  container.addEventListener('mouseenter', () => {
    isHovering = true;
    isEntering = true;
    image.style.transition = 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)';
    overlay.style.transition = 'opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    noiseOverlay.style.transition = 'opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    noiseOverlay.style.opacity = '1';
    setTimeout(() => {
      isEntering = false;
      if (isHovering) {
        image.style.transition = 'none';
        overlay.style.transition = 'none';
        noiseOverlay.style.transition = 'none';
      }
    }, 150);
  });

  container.addEventListener('mouseleave', () => {
    isHovering = false;
    image.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    overlay.style.transition = 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    noiseOverlay.style.transition = 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
    const reset = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    image.style.transform = reset;
    overlay.style.transform = reset;
    noiseOverlay.style.transform = reset;
    overlay.style.background = 'transparent';
    noiseOverlay.style.opacity = '0';
  });
}

function createStickerElement(src, x, y, rotation, width) {
  const el = document.createElement('div');
  el.className = 'sticker';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.dataset.rotation = String(rotation);
  el.style.transform = `rotate(${rotation}deg)`;
  el.innerHTML = `
    <div class="card-hover-container">
      <div class="card-hover-wrapper">
        <img src="${src}" alt="sticker" class="card-hover-image" style="width:${width}px;" draggable="false" />
        <div class="card-light-overlay"></div>
      </div>
    </div>`;
  return el;
}

let panX = 0, panY = 0;
let zCounter = 10;
const MAX_FLING_SPEED = 8;

async function init() {
  const viewport = document.getElementById('viewport');
  const canvas = document.getElementById('canvas');

  let stickerPaths = [];
  try {
    const res = await fetch('/api/stickers');
    stickerPaths = await res.json();
  } catch (e) {
    console.error('Could not load stickers:', e);
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = vw / 2;
  const cy = vh / 2;
  const sizes = [80, 96, 112, 128, 140];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const stickerEls = [];

  stickerPaths.forEach((src, i) => {
    const angle = i * goldenAngle;
    const radius = Math.sqrt(i + 1) * 90;
    const x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 60 - 60;
    const y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 60 - 60;
    const rotation = (Math.random() - 0.5) * 40;
    const width = sizes[i % sizes.length];
    const el = createStickerElement(src, x, y, rotation, width);
    canvas.appendChild(el);
    stickerEls.push(el);

    initCardHover(el);
    setTimeout(() => el.classList.add('visible'), 100 + i * 80);
  });

  // Sticker dragging
  stickerEls.forEach((sticker) => {
    let isDragging = false;
    let posX = 0, posY = 0;
    let velX = 0, velY = 0;
    let lastX = 0, lastY = 0, lastTime = 0;
    let rafId = null;
    const rotation = parseFloat(sticker.dataset.rotation || '0');

    function setTransform() {
      sticker.style.transform = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
    }

    sticker.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      velX = 0;
      velY = 0;
      sticker.classList.add('dragging');
      sticker.style.zIndex = String(++zCounter);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const alpha = 0.4;
      velX = alpha * ((dx / dt) * 16) + (1 - alpha) * velX;
      velY = alpha * ((dy / dt) * 16) + (1 - alpha) * velY;
      velX = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, velX));
      velY = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, velY));
      posX += dx;
      posY += dy;
      setTransform();
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      sticker.classList.remove('dragging');

      const friction = 0.97;
      function decelerate() {
        velX *= friction;
        velY *= friction;
        posX += velX;
        posY += velY;
        setTransform();
        if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
          rafId = requestAnimationFrame(decelerate);
        } else {
          rafId = null;
        }
      }

      if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
        decelerate();
      }
    });
  });

  let isPanning = false;
  let panStartX = 0, panStartY = 0;

  function applyPan() {
    canvas.style.transform = `translate(${panX}px, ${panY}px)`;
    viewport.style.backgroundPosition = `${panX}px ${panY}px`;
  }

  viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.sticker')) return;
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    viewport.classList.add('panning');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
    applyPan();
  });

  document.addEventListener('mouseup', () => {
    if (!isPanning) return;
    isPanning = false;
    viewport.classList.remove('panning');
  });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    panX -= e.deltaX;
    panY -= e.deltaY;
    applyPan();
  }, { passive: false });
}

init();

// spring animation utility with per-element cancellation
const _springCleanup = new WeakMap();

function springAnimate(el, from, to, { stiffness = 0.12, damping = 0.72, delay = 0 } = {}) {
  const prev = _springCleanup.get(el);
  if (prev) prev();

  return new Promise((resolve) => {
    const keys = Object.keys(to);
    const current = {};
    const velocity = {};
    keys.forEach((k) => {
      current[k] = from[k];
      velocity[k] = 0;
    });

    let rafId = null;
    let timerId = null;
    let cancelled = false;
    const threshold = 0.001;

    function cancel() {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timerId !== null) clearTimeout(timerId);
      _springCleanup.delete(el);
    }

    _springCleanup.set(el, cancel);

    function applyStyle() {
      const s = current.scale ?? 1;
      const ty = current.translateY ?? 0;
      const o = Math.max(0, Math.min(1, current.opacity ?? 1));
      el.style.transform = `scale(${s}) translateY(${ty}px)`;
      el.style.opacity = String(o);
    }

    function tick() {
      if (cancelled) return;
      let settled = true;
      keys.forEach((k) => {
        const dist = to[k] - current[k];
        velocity[k] += dist * stiffness;
        velocity[k] *= damping;
        current[k] += velocity[k];
        if (Math.abs(dist) > threshold || Math.abs(velocity[k]) > threshold) {
          settled = false;
        } else {
          current[k] = to[k];
        }
      });

      applyStyle();

      if (settled) {
        _springCleanup.delete(el);
        resolve();
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    function start() {
      if (cancelled) return;
      keys.forEach((k) => { current[k] = from[k]; });
      applyStyle();
      rafId = requestAnimationFrame(tick);
    }

    if (delay > 0) {
      timerId = setTimeout(start, delay);
    } else {
      start();
    }
  });
}

// toolbar - color picker & grid toggle
(function () {
  const viewport = document.getElementById('viewport');
  const picker = document.getElementById('colorPicker');
  const trigger = document.getElementById('colorTrigger');
  const gridToggle = document.getElementById('gridToggle');
  const swatches = Array.from(picker.querySelectorAll('.color-swatch'));
  const swatchesReversed = [...swatches].reverse();
  let isOpen = false;

  const themes = {
    dark: { bgVar: '--theme-dark-bg', dotsVar: '--theme-dark-dots' },
    light: { bgVar: '--theme-light-bg', dotsVar: '--theme-light-dots' },
    blue: { bgVar: '--theme-blue-bg', dotsVar: '--theme-blue-dots' },
    pink: { bgVar: '--theme-pink-bg', dotsVar: '--theme-pink-dots' },
  };

  function updateTrigger(themeName) {
    const t = themes[themeName];
    const rootStyles = getComputedStyle(document.documentElement);
    trigger.style.backgroundColor = rootStyles.getPropertyValue(t.bgVar).trim();
    trigger.style.borderColor = rootStyles.getPropertyValue(t.dotsVar).trim();
  }

  viewport.classList.add('theme-dark');
  updateTrigger('dark');

  function openPicker() {
    isOpen = true;
    picker.classList.add('open');
    swatchesReversed.forEach((swatch, i) => {
      springAnimate(
        swatch,
        { scale: 0.5, translateY: 8, opacity: 0 },
        { scale: 1, translateY: 0, opacity: 1 },
        { stiffness: 0.14, damping: 0.7, delay: i * 65 }
      );
    });
  }

  function closePicker() {
    isOpen = false;
    swatches.forEach((swatch, i) => {
      springAnimate(
        swatch,
        { scale: 1, translateY: 0, opacity: 1 },
        { scale: 0.5, translateY: 12, opacity: 0 },
        { stiffness: 0.14, damping: 0.7, delay: i * 35 }
      ).then(() => {
        if (!isOpen) picker.classList.remove('open');
      });
    });
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) closePicker();
    else openPicker();
  });

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = swatch.dataset.theme;
      viewport.className = viewport.className
        .replace(/theme-\w+/g, '')
        .trim();
      viewport.classList.add(`theme-${theme}`);
      if (!gridToggle.classList.contains('active')) {
        viewport.classList.add('no-dots');
      }
      updateTrigger(theme);
      swatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      closePicker();
    });
  });

  gridToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    gridToggle.classList.toggle('active');
    viewport.classList.toggle('no-dots');
  });

  document.addEventListener('click', () => {
    if (isOpen) closePicker();
  });

  picker.addEventListener('click', (e) => {
    e.stopPropagation();
  });
})();
