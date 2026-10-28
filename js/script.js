// ===== Помощник: debounce =====

// Запускает функцию только когда событие (например, resize) затихло на delay мс.
// Так тяжёлый код не выполняется десятки раз в секунду.
function debounce(fn, delay) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}


// ===== Мобильное меню =====

// Находим кнопку-бургер и само меню
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');

if (burger && mobileMenu) {
  // Все ссылки внутри меню: пункты и контакты внизу
  const menuLinks = mobileMenu.querySelectorAll('a');

  // Открыть меню
  function openMenu() {
    burger.classList.add('is-active');
    mobileMenu.classList.add('is-open');
    document.body.classList.add('menu-open'); // страница под меню не прокручивается
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
  }

  // Закрыть меню
  function closeMenu() {
    burger.classList.remove('is-active');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  // Нажатие на бургер: если меню открыто — закрываем, иначе открываем
  burger.addEventListener('click', function () {
    if (mobileMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Закрываем меню после нажатия на любую ссылку
  menuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Закрываем меню клавишей Escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Если экран стал широким (например, повернули планшет) — закрываем меню
  window.addEventListener('resize', debounce(function () {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  }, 150));
}


// ===== Лента портфолио =====

const gallery = document.querySelector('.gallery');
const prevBtn = document.querySelector('.gallery__btn--prev');
const nextBtn = document.querySelector('.gallery__btn--next');

// Стрелки и автолистание ленты — в конце файла,
// в разделе «Портфолио: медленное листание и автолистание»


// ===== Плавное появление блоков при прокрутке =====

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  // Наблюдатель следит, когда блок попадает на экран
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // показываем один раз
      }
    });
  }, {
    threshold: 0.15,                 // блок виден хотя бы на 15%
    rootMargin: '0px 0px -40px 0px'  // и немного поднялся от нижнего края
  });

  revealItems.forEach(function (item) {
    revealObserver.observe(item);
  });
} else {
  // Старый браузер без IntersectionObserver — просто показываем всё
  revealItems.forEach(function (item) {
    item.classList.add('is-visible');
  });
}


// ===== Просмотр фото портфолио на весь экран =====

const lightbox = document.querySelector('.lightbox');

// Просмотр есть только на главной, где есть лента
if (lightbox && gallery) {
  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const lightboxClose = lightbox.querySelector('.lightbox__close');
  const lightboxPrev = lightbox.querySelector('.lightbox__btn--prev');
  const lightboxNext = lightbox.querySelector('.lightbox__btn--next');
  const lightboxCounter = lightbox.querySelector('.lightbox__counter');
  const photos = gallery.querySelectorAll('img');

  let currentIndex = 0;   // номер открытого фото
  let lastFocused = null; // куда вернуть фокус после закрытия

  // Показать фото по номеру (по кругу: после последнего — первое)
  function showPhoto(index) {
    currentIndex = (index + photos.length) % photos.length;
    lightboxImg.src = photos[currentIndex].src;
    lightboxImg.alt = photos[currentIndex].alt;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + photos.length;
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    showPhoto(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  }

  // Клик по фото в ленте открывает его
  photos.forEach(function (photo, index) {
    photo.setAttribute('tabindex', '0'); // фото можно выбрать клавишей Tab
    photo.addEventListener('click', function () {
      openLightbox(index);
    });
    photo.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') openLightbox(index);
    });
  });

  // Кнопки: крестик и стрелки
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () {
    showPhoto(currentIndex - 1);
  });
  lightboxNext.addEventListener('click', function () {
    showPhoto(currentIndex + 1);
  });

  // Клик по тёмному фону (а не по фото или кнопке) закрывает просмотр
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  // Клавиатура: Esc — закрыть, стрелки — листать
  document.addEventListener('keydown', function (event) {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showPhoto(currentIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(currentIndex + 1);
  });

  // Свайп пальцем на телефоне
  let touchStartX = 0;

  lightbox.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (event) {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (distance > 50) showPhoto(currentIndex - 1);  // свайп вправо
    if (distance < -50) showPhoto(currentIndex + 1); // свайп влево
  }, { passive: true });
}


// ===== Общие настройки для эффектов ниже =====

// Человек включил в системе «уменьшение движения»
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Есть ли мышь (на телефонах и планшетах — нет)
const hasMouse = window.matchMedia('(hover: hover)').matches;


// ===== 3D-карточки услуг =====

const TILT_MAX = 10;    // максимальный наклон, градусы
const SPRING = 0.08;    // жёсткость пружины: больше — быстрее догоняет курсор
const FRICTION = 0.82;  // затухание: меньше — меньше покачиваний

// Нужно, чтобы на iPhone срабатывало «нажатие» (:active) у карточек
document.addEventListener('touchstart', function () {}, { passive: true });

if (hasMouse && !prefersReducedMotion) {
  document.querySelectorAll('.card').forEach(function (card) {
    const body = card.querySelector('.card__body');
    const photo = card.querySelector('.card__photo');
    if (!body || !photo) return;

    card.classList.add('card--tilt'); // включает в CSS блик и «выступающий» текст

    // Текущий наклон, скорость и цель
    const state = {
      rotX: 0, rotY: 0,
      speedX: 0, speedY: 0,
      targetX: 0, targetY: 0,
      glareX: 50, glareY: 50,             // блик сейчас, %
      glareTargetX: 50, glareTargetY: 50, // куда движется блик, %
      running: false
    };

    function update() {
      // Пружина: разгоняемся к цели и затухаем — так получается мягкое покачивание
      state.speedX += (state.targetX - state.rotX) * SPRING;
      state.speedY += (state.targetY - state.rotY) * SPRING;
      state.speedX *= FRICTION;
      state.speedY *= FRICTION;
      state.rotX += state.speedX;
      state.rotY += state.speedY;

      // Блик просто плавно догоняет курсор
      state.glareX += (state.glareTargetX - state.glareX) * 0.15;
      state.glareY += (state.glareTargetY - state.glareY) * 0.15;

      body.style.transform = 'rotateX(' + state.rotX.toFixed(2) + 'deg) rotateY(' + state.rotY.toFixed(2) + 'deg)';

      // Тень и фото сдвигаются в сторону, противоположную курсору
      card.style.setProperty('--sx', (state.rotY * 1.2).toFixed(2));
      card.style.setProperty('--sy', (-state.rotX * 1.2).toFixed(2));
      card.style.setProperty('--px', (state.rotY * 0.6).toFixed(2) + 'px');
      card.style.setProperty('--py', (-state.rotX * 0.6).toFixed(2) + 'px');
      card.style.setProperty('--x', state.glareX.toFixed(1) + '%');
      card.style.setProperty('--y', state.glareY.toFixed(1) + '%');

      // Карточка успокоилась — останавливаем цикл, чтобы не тратить ресурсы
      const settled =
        Math.abs(state.targetX - state.rotX) < 0.01 &&
        Math.abs(state.targetY - state.rotY) < 0.01 &&
        Math.abs(state.speedX) < 0.01 &&
        Math.abs(state.speedY) < 0.01 &&
        Math.abs(state.glareTargetX - state.glareX) < 0.1 &&
        Math.abs(state.glareTargetY - state.glareY) < 0.1;

      if (settled) {
        state.running = false;
        return;
      }
      requestAnimationFrame(update);
    }

    function start() {
      if (!state.running) {
        state.running = true;
        requestAnimationFrame(update);
      }
    }

    card.addEventListener('mousemove', function (event) {
      const rect = photo.getBoundingClientRect();
      // Положение курсора над фото: 0 — левый/верхний край, 1 — правый/нижний
      const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

      state.targetY = (0.5 - x) * 2 * TILT_MAX;
      state.targetX = (y - 0.5) * 2 * TILT_MAX;
      state.glareTargetX = x * 100;
      state.glareTargetY = y * 100;
      start();
    });

    // Курсор ушёл — карточка плавно, с покачиванием, выравнивается
    card.addEventListener('mouseleave', function () {
      state.targetX = 0;
      state.targetY = 0;
      state.glareTargetX = 50;
      state.glareTargetY = 50;
      start();
    });
  });
}


// ===== Портфолио: медленное листание и автолистание =====

if (gallery && prevBtn && nextBtn) {
  const AUTOPLAY_DELAY = 3000;  // пауза между перелистываниями, мс
  const SLIDE_DURATION = 900;   // длительность одного перелистывания, мс
  const USER_PAUSE = 6000;      // пауза после действий пользователя, мс

  let scrollAnimation = null;  // номер текущей анимации прокрутки
  let elapsed = 0;             // сколько прошло с прошлого перелистывания
  let pausedUntil = 0;         // до какого времени пауза после действий пользователя
  let isHovered = false;       // курсор над лентой

  // Плавность: медленно — быстрее — мягкое замедление
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stopScrollAnimation() {
    if (scrollAnimation !== null) {
      cancelAnimationFrame(scrollAnimation);
      scrollAnimation = null;
      gallery.style.scrollSnapType = ''; // возвращаем «защёлкивание»
    }
  }

  // Своя медленная прокрутка ленты до позиции target
  function animateScrollTo(target, duration) {
    stopScrollAnimation();

    const start = gallery.scrollLeft;
    const distance = target - start;

    // Анимации отключены — просто переходим сразу
    if (prefersReducedMotion || Math.abs(distance) < 1) {
      gallery.scrollLeft = target;
      return;
    }

    const startTime = performance.now();
    gallery.style.scrollSnapType = 'none'; // иначе «защёлкивание» мешает анимации

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      gallery.scrollLeft = start + distance * easeInOutCubic(progress);

      if (progress < 1) {
        scrollAnimation = requestAnimationFrame(step);
      } else {
        scrollAnimation = null;
        gallery.style.scrollSnapType = '';
      }
    }
    scrollAnimation = requestAnimationFrame(step);
  }

  // Шаг перелистывания: ширина одного фото + промежуток между фото
  let step = 0;

  function updateStep() {
    const firstPhoto = gallery.querySelector('img');
    const gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
    step = firstPhoto ? firstPhoto.getBoundingClientRect().width + gap : gallery.clientWidth;
  }

  updateStep();

  // Размер окна изменился — фото стали другой ширины, пересчитываем шаг
  window.addEventListener('resize', debounce(updateStep, 150));

  function scrollNext() {
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const current = gallery.scrollLeft;

    // Показаны последние фото — плавно возвращаемся к началу
    if (current >= maxScroll - 2) {
      animateScrollTo(0, SLIDE_DURATION * 1.5);
      return;
    }

    // Номер фото, которое сейчас стоит первым, и сдвиг ровно на одно фото
    const index = Math.round(current / step);
    animateScrollTo(Math.min((index + 1) * step, maxScroll), SLIDE_DURATION);
  }

  function scrollPrev() {
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const current = gallery.scrollLeft;

    // В самом начале — уходим к концу ленты
    if (current <= 2) {
      animateScrollTo(maxScroll, SLIDE_DURATION * 1.5);
      return;
    }

    const index = Math.round(current / step);
    animateScrollTo(Math.max((index - 1) * step, 0), SLIDE_DURATION);
  }

  // Пользователь что-то сделал — ждём 6 секунд, потом продолжаем
  function pauseByUser() {
    pausedUntil = performance.now() + USER_PAUSE;
    elapsed = 0;
  }

  // Стрелки
  nextBtn.addEventListener('click', function () {
    pauseByUser();
    scrollNext();
  });

  prevBtn.addEventListener('click', function () {
    pauseByUser();
    scrollPrev();
  });

  // Пауза, пока курсор над лентой
  gallery.addEventListener('mouseenter', function () {
    isHovered = true;
  });
  gallery.addEventListener('mouseleave', function () {
    isHovered = false;
  });

  // Листают пальцем — останавливаем анимацию и ставим паузу
  gallery.addEventListener('touchstart', function () {
    stopScrollAnimation();
    pauseByUser();
  }, { passive: true });

  // Листают тачпадом вбок — тоже пауза
  gallery.addEventListener('wheel', function (event) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      stopScrollAnimation();
      pauseByUser();
    }
  }, { passive: true });

  // Автолистание (если анимации не отключены)
  if (!prefersReducedMotion) {
    let lastTime = performance.now();

    function tick(now) {
      // Ограничиваем шаг, чтобы после неактивной вкладки не было скачка
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;

      const isPaused =
        isHovered ||
        now < pausedUntil ||
        document.hidden ||
        (lightbox && lightbox.classList.contains('is-open')) ||
        scrollAnimation !== null;

      if (!isPaused) {
        elapsed += delta;
        if (elapsed >= AUTOPLAY_DELAY) {
          elapsed = 0;
          scrollNext();
        }
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }
}


// ===== Плавающая кнопка «Записаться в Telegram» (телефон) =====

const floatingCta = document.querySelector('.floating-cta');
// После чего показывать кнопку: на главной — баннер, на страницах услуг — фото услуги
const ctaTrigger = document.querySelector('#hero') || document.querySelector('.service__photo');
const pageFooter = document.querySelector('.footer');

if (floatingCta && 'IntersectionObserver' in window) {
  let triggerPassed = !ctaTrigger; // нет баннера — считаем, что он уже прокручен
  let footerVisible = false;

  // Кнопка видна, когда баннер ушёл вверх, а подвал ещё не показался
  function updateCta() {
    floatingCta.classList.toggle('is-visible', triggerPassed && !footerVisible);
  }

  if (ctaTrigger) {
    new IntersectionObserver(function (entries) {
      const entry = entries[0];
      // Баннер не виден и находится выше экрана — значит, его прокрутили
      triggerPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateCta();
    }).observe(ctaTrigger);
  }

  if (pageFooter) {
    new IntersectionObserver(function (entries) {
      footerVisible = entries[0].isIntersecting;
      updateCta();
    }).observe(pageFooter);
  }

  updateCta();
}
