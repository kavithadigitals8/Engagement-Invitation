// Engagement invitation details: date/time is Hyderabad local time (Asia/Kolkata, UTC+05:30).
const engagementDate = new Date("2026-11-26T10:40:00+05:30");

const $ = (id) => document.getElementById(id);

$("openInvitation").addEventListener("click", () => {
    toggleMusic(true);

    $("cover").classList.add("hidden");
    const inv = $("invitation");
    inv.classList.remove("hidden", "scroll-unroll");
    void inv.offsetWidth;
    inv.classList.add("scroll-unroll");
    window.scrollTo(0, 0);

    paintScratchLayer();
    initScrollAnimations();
    $("openInvitation").addEventListener("click", () => {
        toggleMusic(true);

        const cover = $("cover");
        const inv = $("invitation");

        // Prevent double-clicks while animating
        if (cover.classList.contains("cover-exit"))
            return;

        // 1. Start the smooth fade & scale out
        cover.classList.add("cover-exit");

        // 2. Wait 600ms for the fade to finish before hiding cover & unrolling invitation
        setTimeout( () => {
            cover.classList.add("hidden");
            cover.classList.remove("cover-exit");

            inv.classList.remove("hidden", "scroll-unroll");
            void inv.offsetWidth;
            inv.classList.add("scroll-unroll");
            window.scrollTo(0, 0);

            paintScratchLayer();
            initScrollAnimations();
            initMobileGallery();
        }
        , 600);
    }
    );

    // =====================================
    // 2. SCROLL-TRIGGERED SECTION ANIMATIONS
    // =====================================
    function initScrollAnimations() {
        const targets = document.querySelectorAll(".section, .person-card, .event-card, .venue-inner, .countdown-section, .closing");

        targets.forEach( (el, index) => {
            el.classList.add("reveal-item");
            // Slight stagger for cards side-by-side
            if (el.classList.contains("person-card")) {
                el.style.transitionDelay = `${index * 120}ms`;
            }
        }
        );

        const observer = new IntersectionObserver( (entries, obs) => {
            entries.forEach( (entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            }
            );
        }
        ,{
            threshold: 0.14
        });

        targets.forEach( (el) => observer.observe(el));
    }

    // =====================================
    // 3. MOBILE GALLERY SLIDESHOW & DOTS
    // =====================================
    function initMobileGallery() {
        const gallery = document.querySelector(".gallery");
        if (!gallery)
            return;

        const images = Array.from(gallery.querySelectorAll("img"));
        if (images.length <= 1)
            return;

        // Create dots container if not already in HTML
        let dotsContainer = document.querySelector(".gallery-dots");
        if (!dotsContainer) {
            dotsContainer = document.createElement("div");
            dotsContainer.className = "gallery-dots";
            gallery.insertAdjacentElement("afterend", dotsContainer);
        }

        dotsContainer.innerHTML = "";
        const dots = images.map( (_, idx) => {
            const dot = document.createElement("button");
            dot.className = idx === 0 ? "gallery-dot active" : "gallery-dot";
            dot.setAttribute("aria-label", `View photo ${idx + 1}`);
            dot.addEventListener("click", () => {
                gallery.scrollTo({
                    left: images[idx].offsetLeft - gallery.offsetLeft,
                    behavior: "smooth",
                });
            }
            );
            dotsContainer.appendChild(dot);
            return dot;
        }
        );

        // Update active dot on swipe/scroll
        gallery.addEventListener("scroll", () => {
            const center = gallery.scrollLeft + gallery.offsetWidth / 2;
            let activeIdx = 0;
            images.forEach( (img, idx) => {
                const imgCenter = img.offsetLeft - gallery.offsetLeft + img.offsetWidth / 2;
                if (Math.abs(center - imgCenter) < img.offsetWidth / 2) {
                    activeIdx = idx;
                }
            }
            );
            dots.forEach( (d, idx) => d.classList.toggle("active", idx === activeIdx));
        }
        );
    }

}
);
$("backToTop").addEventListener("click", () => {
    const cover = $("cover");
    const inv = $("invitation");

    inv.classList.add("hidden");
    cover.classList.remove("hidden");
    cover.style.opacity = "0";
    cover.style.transform = "scale(1.04)";

    requestAnimationFrame( () => {
        cover.style.opacity = "1";
        cover.style.transform = "scale(1)";
    }
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
);

// Live countdown to 26 November 2026, 10:40 AM IST.
function updateCountdown() {
    let remaining = engagementDate.getTime() - Date.now();
    if (remaining <= 0) {
        ["days", "hours", "minutes", "seconds"].forEach(id => $(id).textContent = "00");
        return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    $("days").textContent = String(days).padStart(2, "0");
    $("hours").textContent = String(hours).padStart(2, "0");
    $("minutes").textContent = String(minutes).padStart(2, "0");
    $("seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Scratch-off date reveal. Pointer events support both mouse and touch.
const canvas = $("scratchCanvas");
const ctx = canvas.getContext("2d");
let isScratching = false;

function paintScratchLayer() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height)
        return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#d6c9c5");
    gradient.addColorStop(.48, "#f5eeea");
    gradient.addColorStop(1, "#c9b9b5");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#806b69";
    ctx.textAlign = "center";
    ctx.font = "600 13px Georgia";
    ctx.fillText("✧  SCRATCH HERE  ✧", rect.width / 2, rect.height / 2 + 5);
}
function eraseAt(event) {
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 20, 0, Math.PI * 2);
    ctx.fill();
}
canvas.addEventListener("pointerdown", event => {
    isScratching = true;
    canvas.setPointerCapture(event.pointerId);
    eraseAt(event);
}
);
canvas.addEventListener("pointermove", event => {
    if (isScratching)
        eraseAt(event);
}
);
["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
    canvas.addEventListener(type, () => {
        isScratching = false;
    }
    );
}
);
window.addEventListener("resize", () => {
    if (!$("invitation").classList.contains("hidden"))
        paintScratchLayer();
}
);

// English/Telugu text switch. All elements with data-en/data-te are translated.
let teluguMode = false;
$("languageToggle").addEventListener("click", () => {
    teluguMode = !teluguMode;
    document.documentElement.lang = teluguMode ? "te" : "en";
    document.querySelectorAll("[data-en][data-te]").forEach(element => {
        element.textContent = teluguMode ? element.dataset.te : element.dataset.en;
    }
    );
    $("languageToggle").textContent = teluguMode ? "English" : "తెలుగు";
}
);

// Music player shared by both "Open Invitation" and the top music toggle button.
let audio;

async function toggleMusic(forcePlay=false) {
    if (!audio) {
        audio = new Audio("music.mp3");
        audio.loop = true;
    }
    try {
        if (forcePlay || audio.paused) {
            await audio.play();
            $("musicToggle").textContent = "♫ Music: On";
        } else {
            audio.pause();
            $("musicToggle").textContent = "♫ Music: Off";
        }
    } catch (error) {
        $("musicToggle").textContent = "Add music.mp3";
    }
}

$("musicToggle").addEventListener("click", () => toggleMusic(false));
// =====================================
// GENTLE FALLING FLOWER PETALS
// =====================================
function startFallingPetals() {
    const container = document.getElementById("petalContainer");
    if (!container)
        return;

    const petalColors = ["linear-gradient(135deg, #f9d5d3, #e6a4a8)", // Soft Blush Rose
    "linear-gradient(135deg, #fce4ec, #f48fb1)", // Pink Lotus
    "linear-gradient(135deg, #f7e6d4, #dfb78c)", // Champagne Gold
    "linear-gradient(135deg, #f3cfd2, #c97b84)" // Deep Rose
    ];

    function createPetal() {
        // Pause spawning if browser tab is hidden to save mobile battery
        if (document.hidden)
            return;

        const petal = document.createElement("span");
        petal.classList.add("petal");

        const size = Math.random() * 10 + 10;
        // 10px to 20px
        const startLeft = Math.random() * 100;
        // 0% to 100% screen width
        const duration = Math.random() * 5 + 7;
        // 7s to 12s gentle fall
        const swayDistance = (Math.random() * 100 - 50) + "px";
        // -50px to +50px sway

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 0.75}px`;
        petal.style.left = `${startLeft}%`;
        petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
        petal.style.animationDuration = `${duration}s`;
        petal.style.setProperty("--sway", swayDistance);

        container.appendChild(petal);

        // Clean up petal after it falls off-screen
        setTimeout( () => {
            petal.remove();
        }
        , duration * 1000);
    }

    // Spawn an initial burst of 8 petals so the cover looks festive immediately
    for (let i = 0; i < 10; i++) {
        setTimeout(createPetal, i * 300);
    }

    // Continue spawning a new petal every 650ms
    setInterval(createPetal, 650);
}

document.addEventListener("DOMContentLoaded", startFallingPetals);
