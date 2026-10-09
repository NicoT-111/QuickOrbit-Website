import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DownloadButton, InstallHelp } from "./InstallHelp";

const APPS = [
  { name: "Photos", icon: "/assets/icons/photos.png" },
  { name: "Messages", icon: "/assets/icons/messages.png" },
  { name: "Notes", icon: "/assets/icons/notes.png" },
  { name: "Music", icon: "/assets/icons/music.png" },
  { name: "Mail", icon: "/assets/icons/mail.png" },
  { name: "Calendar", icon: "/assets/icons/calendar.png" },
  { name: "Discord", icon: "/assets/icons/discord.png", discord: true },
];

const LAYOUTS = {
  Circle: [[50, 17], [80, 34], [69, 74], [31, 74], [20, 34]],
  Fan: [[18, 58], [32, 34], [50, 24], [68, 34], [82, 58]],
  Row: [[12, 48], [31, 48], [50, 48], [69, 48], [88, 48]],
  Column: [[50, 15], [50, 31], [50, 47], [50, 63], [50, 79]],
};

const PROFILES = [
  { name: "Main", color: "#159cff" },
  { name: "Work", color: "#45d47b" },
  { name: "School", color: "#ad56e9" },
  { name: "Focus", color: "#39b5de" },
  { name: "Play", color: "#e8618c" },
];

const symbol = (name) => `/assets/symbols/${name}.png`;
const action = (name, icon, extra = {}) => ({ name, icon: symbol(icon), symbol: true, ...extra });

const PROFILE_APPS = [
  [APPS[0], APPS[1], APPS[3], APPS[4], APPS[6]],
  [APPS[5], action("Files", "folder"), action("Focus", "focus"), action("Time", "clock", { dynamicTime: true }), action("Timer", "timer")],
  [action("Books", "books"), action("Calculator", "calculator"), action("Study timer", "clock"), APPS[2], APPS[5]],
  [action("Quiet", "quiet"), action("Focus", "focus"), action("Timer", "timer"), action("Break", "break"), APPS[3]],
  [APPS[6], action("Game mode", "game"), action("Capture", "capture"), APPS[0], APPS[3]],
];

const HOME_APPS = [APPS[2], APPS[0], APPS[6], APPS[3], { name: "QuickOrbit", icon: "/assets/icons/quickorbit.png" }];
const HOME_POSITIONS = [[25, 48], [38, 42], [51, 39], [64, 42], [77, 48]];
const DISCORD_URL = "https://discord.gg/eJaBXCn77N";
const GITHUB_URL = "https://github.com/NicoT-111";
const PRODUCT_VIDEO = "/assets/video/quickorbit-product.mp4";
const DOCK_VIDEO = "https://github.com/NicoT-111/QuickOrbit-Website/releases/download/website-media-v1/quickorbit-guide.mp4";
const SHOWCASE_IMAGES = [
  { src: "/assets/showcase/01-app-grid.jpeg", title: "All your apps", text: "A spacious grid for fast visual access." },
  { src: "/assets/showcase/02-mac-actions.jpeg", title: "Mac actions", text: "Timers, volume, Wi-Fi and more in one orbit." },
  { src: "/assets/showcase/03-web-shortcuts.jpeg", title: "Web shortcuts", text: "Open your favorite services without losing focus." },
  { src: "/assets/showcase/04-compact-fan.jpeg", title: "Compact fan", text: "A small layout that stays close to your pointer." },
  { src: "/assets/showcase/05-circle-layout.jpeg", title: "Circle layout", text: "Balanced, clear and easy to scan." },
];
const SKETCH_IMAGES = [
  { src: "/assets/sketches/01-app-grid.png", title: "First app grid", text: "The earliest idea: fast access to the apps that matter." },
  { src: "/assets/sketches/02-first-orbit.png", title: "The first orbit", text: "A rough circle became the foundation of QuickOrbit." },
  { src: "/assets/sketches/03-segmented-orbit.png", title: "Four clear zones", text: "Early experiments focused on simple visual groups." },
  { src: "/assets/sketches/04-glass-orbit.png", title: "Glass exploration", text: "The orbit started to feel more native to macOS." },
  { src: "/assets/sketches/05-action-strip.png", title: "Action strip", text: "A playful attempt at quick actions around the pointer." },
  { src: "/assets/sketches/06-four-dot-mark.png", title: "Four-dot mark", text: "One of the first compact icon directions." },
  { src: "/assets/sketches/07-eight-petal-mark.png", title: "Petal study", text: "A softer symbol inspired by movement and choice." },
  { src: "/assets/sketches/08-node-mark.png", title: "Connected nodes", text: "A direct visual for apps connected to one center." },
  { src: "/assets/sketches/09-ten-petal-mark.png", title: "Expanded orbit", text: "More actions, still centered around one movement." },
];

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/live", label: "Live Demo" },
  { path: "/pricing", label: "Download" },
  { path: "/faq", label: "FAQ" },
];
const PRIMARY_ROUTES = ROUTES;
const LEGAL_ROUTES = [
  { path: "/privacy", label: "Privacy" },
  { path: "/imprint", label: "Imprint" },
  { path: "/terms", label: "Terms of Use" },
];

const routeBase = import.meta.env.BASE_URL.replace(/\/$/, "");
const readRoute = () => window.location.pathname.slice(routeBase.length).replace(/\/$/, "") || "/";

function useRoute() {
  const [path, setPath] = useState(readRoute);
  useEffect(() => {
    const onPopState = () => setPath(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, [path]);
  return [path, (next) => {
    if (next === path) window.scrollTo({ top: 0, behavior: "smooth" });
    else {
      window.history.pushState({}, "", routeBase + next);
      setPath(next);
      window.scrollTo(0, 0);
    }
  }];
}

function RouteLink({ to, navigate, children, className = "", onClick, ...props }) {
  return <a className={className} href={routeBase + to} {...props} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onClick?.();
    navigate(to);
  }}>{children}</a>;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: .12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ "--delay": `${delay}ms` }}>{children}</div>;
}

function OrbitDemo({ compact = false, controls = false, navigate }) {
  const [layout, setLayout] = useState(compact ? "Fan" : "Circle");
  const [selected, setSelected] = useState(2);
  const [profile, setProfile] = useState(0);
  const [compactInfo, setCompactInfo] = useState(null);
  const [sketchGalleryOpen, setSketchGalleryOpen] = useState(false);
  const [sketchIndex, setSketchIndex] = useState(0);
  const frameRef = useRef(null);
  const infoTimerRef = useRef(null);
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const [now, setNow] = useState(() => new Date());
  const apps = compact ? HOME_APPS : PROFILE_APPS[profile];
  const positions = useMemo(() => {
    if (compact) return HOME_POSITIONS;
    if (layout !== "Circle") return LAYOUTS[layout];
    const radius = Math.min(frameSize.width, frameSize.height) * .35;
    return [-90, -18, 54, 126, 198].map((angle) => {
      const radians = angle * Math.PI / 180;
      return [50 + Math.cos(radians) * radius / frameSize.width * 100, 52 + Math.sin(radians) * radius / frameSize.height * 100];
    });
  }, [compact, layout, frameSize]);
  const accent = PROFILES[profile].color;
  const center = { x: 50, y: compact ? 82 : 52 };
  const beam = useMemo(() => {
    const point = positions[selected];
    const dx = (point[0] - center.x) * frameSize.width / 100;
    const dy = (point[1] - center.y) * frameSize.height / 100;
    return { width: `${Math.sqrt(dx * dx + dy * dy)}px`, transform: `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)` };
  }, [positions, selected, center.x, center.y, frameSize]);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => setFrameSize({ width: frame.clientWidth, height: frame.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => window.clearTimeout(infoTimerRef.current), []);
  useEffect(() => {
    if (!sketchGalleryOpen) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") setSketchGalleryOpen(false); };
    const sketchTimer = window.setInterval(() => setSketchIndex((index) => (index + 1) % SKETCH_IMAGES.length), 3200);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearInterval(sketchTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [sketchGalleryOpen]);
  const chooseProfile = (index) => { setProfile(index); setSelected(0); };
  const openCompactInfo = (name) => {
    setCompactInfo(name);
    window.clearTimeout(infoTimerRef.current);
    infoTimerRef.current = window.setTimeout(() => setCompactInfo(null), 4200);
  };
  const handleAppClick = (event, app, index) => {
    setSelected(index);
    if (!compact || app.discord) {
      event.currentTarget.blur();
      return;
    }
    if (app.name === "Notes" || app.name === "Music") openCompactInfo(app.name);
    if (app.name === "Photos") { setCompactInfo(null); setSketchIndex(0); setSketchGalleryOpen(true); }
    if (app.name === "QuickOrbit") navigate?.("/pricing");
    event.currentTarget.blur();
  };
  const compactIndexAt = (event) => {
    if (!compact || !frameRef.current) return null;
    const rect = frameRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    const nearest = positions.reduce((best, point, index) => {
      const distance = Math.hypot((point[0] - x) * rect.width / 100, (point[1] - y) * rect.height / 100);
      return distance < best.distance ? { index, distance } : best;
    }, { index: selected, distance: Infinity });
    return nearest.distance <= Math.max(70, rect.width * .2) ? nearest.index : null;
  };

  return <div className={`orbit-demo ${compact ? "is-compact" : ""}`}>
    <div className="orbit-frame" ref={frameRef} onPointerMove={(event) => { const index = compactIndexAt(event); if (index !== null) setSelected(index); }} onPointerDownCapture={(event) => { const index = compactIndexAt(event); if (index !== null) setSelected(index); }}>
      <div className="orbit-beam" style={{ left: `${center.x}%`, top: `${center.y}%`, background: accent, ...beam }} />
      <div className="orbit-center" style={{ left: `${center.x}%`, top: `${center.y}%`, "--accent": accent }} />
      {apps.map((app, index) => {
        const label = app.dynamicTime ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : app.name;
        const OrbitItem = app.discord ? "a" : "button";
        return <OrbitItem
        className={`orbit-app ${app.symbol ? "is-symbol" : ""} ${selected === index ? "is-selected" : ""}`}
        key={`${compact ? "home" : profile}-${app.name}`}
        href={app.discord ? DISCORD_URL : undefined}
        target={app.discord ? "_blank" : undefined}
        rel={app.discord ? "noopener noreferrer" : undefined}
        type={app.discord ? undefined : "button"}
        data-app={app.name}
        style={{ left: `${positions[index][0]}%`, top: `${positions[index][1]}%` }}
        onPointerEnter={() => setSelected(index)}
        onFocus={() => setSelected(index)}
        onClick={(event) => handleAppClick(event, app, index)}
        aria-pressed={app.discord ? undefined : selected === index}
        title={compact ? `Click on me · ${app.name}` : label}
        aria-label={app.name === "QuickOrbit" && compact ? "QuickOrbit, download page" : `${label}${app.discord ? ", open Discord" : " preview"}`}
      ><span className="orbit-app__halo" /><img src={app.icon} alt="" loading="eager" decoding="async" fetchPriority={compact ? "high" : "auto"} draggable="false" />{!compact && <span className="orbit-app__label">{label}</span>}{compact && <span className="orbit-app__hint">Click on me</span>}</OrbitItem>})}
      {compact && <div className="orbit-instruction"><strong>Live</strong><span>Click an app</span></div>}
      {compact && compactInfo && <div className="orbit-info-card" role="status" aria-live="polite">
        <div><img src={compactInfo === "Notes" ? "/assets/icons/notes.png" : "/assets/icons/music.png"} alt="" /><span><small>{compactInfo} selected</small><strong>{compactInfo === "Notes" ? "Efficient by design." : "A clear action preview."}</strong></span></div>
        <p>{compactInfo === "Notes" ? "Native Swift keeps QuickOrbit fast, with low CPU use and energy-efficient performance." : "This example shows how media actions can sit inside your orbit, ready when you need them."}</p>
        <span className="orbit-info-card__timer">Closes automatically</span>
      </div>}
      {!compact && <div className="profile-rail" aria-label="Profiles">
        {PROFILES.map((item, index) => <button key={item.name} className={profile === index ? "is-active" : ""} style={{ "--profile": item.color }} onClick={() => chooseProfile(index)} aria-label={`Use ${item.name} profile`} />)}
      </div>}
    </div>
    {controls && <div className="demo-controls">
      <div><span className="control-label">Layout</span><div className="pill-group">{Object.keys(LAYOUTS).map((name) => <button key={name} className={layout === name ? "is-active" : ""} onClick={() => setLayout(name)}>{name}</button>)}</div></div>
      <div><span className="control-label">Profile</span><div className="pill-group">{PROFILES.map((item, index) => <button key={item.name} className={profile === index ? "is-active" : ""} onClick={() => chooseProfile(index)}>{item.name}</button>)}</div></div>
    </div>}
    {compact && sketchGalleryOpen && createPortal(<div className="sketch-lightbox" role="dialog" aria-modal="true" aria-label="How QuickOrbit started">
      <button className="sketch-lightbox__backdrop" onClick={() => setSketchGalleryOpen(false)} aria-label="Close sketch gallery" />
      <section className="sketch-lightbox__panel">
        <header><div><span className="eyebrow">How it started</span><h2>From sketch<br />to QuickOrbit.</h2></div><button className="sketch-close" onClick={() => setSketchGalleryOpen(false)}>Close</button></header>
        <div className="sketch-viewer">
          <img key={SKETCH_IMAGES[sketchIndex].src} src={SKETCH_IMAGES[sketchIndex].src} alt={SKETCH_IMAGES[sketchIndex].title} />
          <span>{sketchIndex + 1} / {SKETCH_IMAGES.length}</span>
        </div>
        <div className="sketch-footer"><div><h3>{SKETCH_IMAGES[sketchIndex].title}</h3><p>{SKETCH_IMAGES[sketchIndex].text}</p><small>From the early sketches</small></div><div className="sketch-controls"><button onClick={() => setSketchIndex((sketchIndex - 1 + SKETCH_IMAGES.length) % SKETCH_IMAGES.length)}>Previous</button><button onClick={() => setSketchIndex((sketchIndex + 1) % SKETCH_IMAGES.length)}>Next</button></div></div>
        <div className="sketch-dots" aria-label="Sketches">{SKETCH_IMAGES.map((image, index) => <button key={image.src} className={index === sketchIndex ? "is-active" : ""} onClick={() => setSketchIndex(index)} aria-label={`Show ${image.title}`} aria-pressed={index === sketchIndex} />)}</div>
      </section>
    </div>, document.body)}
  </div>;
}

function PageIntro({ eyebrow, title, copy, accent = "" }) {
  return <section className={`page-intro ruled ${accent}`}><Reveal><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></Reveal></section>;
}

const QUICK_FEATURES = [
  [symbol("settings"), "Per-app setup"],
  [symbol("animations"), "Custom animations"],
  [symbol("switching"), "Auto switching"],
  [symbol("quiet"), "Low resource use"],
  [symbol("folder"), "Local settings"],
  ["/assets/icons/discord.png", "Community news"],
];

function QuickFeatureGrid() {
  return <section className="quick-features ruled"><Reveal><span className="eyebrow">Built for your Mac</span><h2>Small details. Big difference.</h2></Reveal><div className="quick-feature-grid">{QUICK_FEATURES.map(([icon, label], index) => <Reveal key={label} delay={index * 45}><article><div className="quick-feature-icon"><img src={icon} alt="" /></div><h3>{label}</h3></article></Reveal>)}</div></section>;
}

function ProductVideo({ src = PRODUCT_VIDEO, label = "QuickOrbit product video", badge = "Live preview", preload = "auto" }) {
  const videoRef = useRef(null);
  const [hasFrame, setHasFrame] = useState(false);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const play = () => video.play().catch(() => {});
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else video.pause();
    }, { threshold: .18, rootMargin: "100px 0px" });
    const onVisibilityChange = () => { if (!document.hidden && video.getBoundingClientRect().top < window.innerHeight) play(); };
    observer.observe(video);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  return <div className={`product-video ${hasFrame ? "has-frame" : ""} ${hasError ? "has-error" : ""}`}>
    <img className="product-video__poster" src="/assets/motion-preview/01.jpeg" alt="" aria-hidden="true" />
    <video ref={videoRef} autoPlay muted playsInline loop preload={preload} aria-label={label} onLoadedMetadata={(event) => { if (event.currentTarget.currentTime < .2) event.currentTarget.currentTime = .2; }} onCanPlay={(event) => event.currentTarget.play().catch(() => {})} onPlaying={() => setHasFrame(true)} onTimeUpdate={(event) => { if (event.currentTarget.currentTime > .08) setHasFrame(true); }} onError={() => setHasError(true)}><source src={src} type="video/mp4" /></video>
    <span className="product-video__badge" aria-hidden="true">{badge}</span>
  </div>;
}

function ProductMedia() {
  const [activeImage, setActiveImage] = useState(0);
  const videoSectionRef = useRef(null);
  const active = SHOWCASE_IMAGES[activeImage];
  const move = (direction) => setActiveImage((index) => (index + direction + SHOWCASE_IMAGES.length) % SHOWCASE_IMAGES.length);
  useEffect(() => {
    const galleryTimer = window.setInterval(() => setActiveImage((index) => (index + 1) % SHOWCASE_IMAGES.length), 4200);
    return () => window.clearInterval(galleryTimer);
  }, []);
  useEffect(() => {
    const section = videoSectionRef.current;
    if (!section) return undefined;
    let frame = 0;
    const updateFocus = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - window.innerHeight / 2);
      const range = (window.innerHeight + rect.height) * .48;
      const focus = Math.max(0, Math.min(1, 1 - distance / range));
      section.style.setProperty("--video-focus", focus.toFixed(3));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateFocus); };
    updateFocus();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return <>
    <section id="product-video" ref={videoSectionRef} className="video-showcase ruled"><Reveal className="media-heading"><span className="media-kind">Product preview</span><h2>See QuickOrbit<br /><em>in motion.</em></h2><p>Get a first look at the app and the small details that make it feel at home on your Mac.</p><div className="media-detail"><span>Apps &amp; files</span><span>Mac actions</span><span>Your profiles</span></div></Reveal><Reveal delay={100}><div className="video-frame"><ProductVideo /></div></Reveal></section>
    <section className="gallery-showcase ruled"><Reveal className="media-heading"><span className="media-kind media-kind--images">Product images</span><h2>One view.<br /><em>Then the next.</em></h2><p>Layouts, actions and shortcuts.</p></Reveal><Reveal delay={90}><div className="gallery-stage"><div className="gallery-image"><img key={active.src} src={active.src} alt={active.title} /><span>{activeImage + 1} / {SHOWCASE_IMAGES.length}</span></div><div className="gallery-caption" aria-live="polite"><div><h3>{active.title}</h3><p>{active.text}</p><small>Product view</small></div><div className="gallery-arrows"><button onClick={() => move(-1)} aria-label="Previous image">Previous</button><button onClick={() => move(1)} aria-label="Next image">Next</button></div></div><div className="gallery-progress" aria-label="Product images">{SHOWCASE_IMAGES.map((image, index) => <button key={image.src} className={activeImage === index ? "is-active" : ""} onClick={() => setActiveImage(index)} aria-label={`Show ${image.title}`} aria-pressed={activeImage === index} />)}</div></div></Reveal></section>
  </>;
}

function HomePage({ navigate, notify }) {
  const showVideo = () => document.getElementById("product-video")?.scrollIntoView({ behavior: "smooth", block: "center" });
  return <div className="page page-enter">
    <section className="hero ruled">
      <Reveal className="hero-copy"><h1><span>Quick</span>Orbit</h1><p className="slogan"><b>Fast.</b> <em>Simple.</em> <b>Native.</b></p><p className="hero-subline">Apps and actions, one move away.</p><div className="hero-actions"><RouteLink className="outline-button purchase-button" to="/pricing" navigate={navigate}>Download · €0</RouteLink><a className="outline-button hero-donate" href={`${routeBase}/pricing#support`}>Donate</a></div><button className="watch-video" type="button" onClick={showVideo}><img src={symbol("play")} alt="" />Watch product video</button></Reveal>
      <Reveal delay={130}><OrbitDemo compact navigate={navigate} /></Reveal>
    </section>
    <section className="home-facts ruled" aria-label="QuickOrbit at a glance"><span>Free to use</span><span>144+ fields</span><span>9 profiles</span><span>No login</span></section>
    <ProductMedia />
    <QuickFeatureGrid />
    <section className="activation-section ruled"><Reveal className="activation-copy"><span className="eyebrow">Quick access</span><h2>Choose how<br /><em>to open it.</em></h2></Reveal><div className="activation-grid">{[[symbol("mouse"),"Middle click","Press the mouse wheel."],[symbol("keyboard"),"Keyboard shortcut","Set your own keys."],[symbol("trackpad"),"Trackpad","Open it with a gesture."]].map(([icon,title,text],index)=><Reveal key={title} delay={index*80}><article><img src={icon} alt="" /><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div></section>
    <section id="dock-video" className="video-showcase video-showcase--dock ruled"><Reveal className="media-heading"><span className="media-kind">Dock in motion</span><h2>More than a dock.<br /><em>Your orbit.</em></h2><p>Apps and actions gather around your pointer—ready in one move, then out of your way.</p><div className="media-detail"><span>One movement</span><span>Your apps</span><span>Made for Mac</span></div></Reveal><Reveal delay={100}><div className="video-frame"><ProductVideo src={DOCK_VIDEO} label="QuickOrbit dock demonstration" badge="Dock demo" preload="metadata" /></div></Reveal></section>
    <PageCta step="01 · Next" title="See what fits." label="Explore Features" to="/features" navigate={navigate} />
  </div>;
}

function FeaturesPage({ navigate }) {
  const features = [
    [symbol("fields"), "144+", "Custom fields", "Build the orbit you want."],
    [symbol("profiles"), "9", "Smart profiles", "A setup for every context."],
    [symbol("actions"), "Many", "Useful actions", "Apps, files and Mac controls."],
    [symbol("native"), "14+", "macOS", "Native from macOS 14."],
  ];
  return <div className="page page-enter"><section className="feature-hero ruled"><Reveal className="feature-hero__copy"><span className="eyebrow">Features</span><h1>More yours.<br /><em>Less work.</em></h1><p>Personalize QuickOrbit until it feels made for your Mac.</p></Reveal><div className="feature-stat-grid">{features.map(([icon, value, title, text], index) => <Reveal key={title} delay={index * 70}><article className="feature-stat"><img src={icon} alt="" /><div><strong>{value}</strong><h2>{title}</h2><p>{text}</p></div></article></Reveal>)}</div></section>
    <section className="home-story ruled"><Reveal><div className="story-number">01</div><h2>Move once.<br />Find anything.</h2><p>Apps, files and actions in one place.</p></Reveal><Reveal delay={110}><figure className="framed-shot"><img src="/assets/features/01-move-once.jpeg" alt="QuickOrbit compact fan with apps around the pointer" /><figcaption>Compact fan · one movement away</figcaption></figure></Reveal></section>
    <section className="home-story home-story--reverse ruled"><Reveal><figure className="framed-shot framed-shot--wide"><img src="/assets/features/02-orbit-rules.png" alt="QuickOrbit shape and appearance settings" /><figcaption>Shape, size and appearance in one place</figcaption></figure></Reveal><Reveal delay={110}><div className="story-number">02</div><h2>Your orbit.<br />Your rules.</h2><p>Layouts, profiles and animations that suit your day.</p></Reveal></section>
    <section className="split-feature ruled"><Reveal><figure className="framed-shot framed-shot--large framed-shot--profile"><img src="/assets/features/03-app-profile.png" alt="QuickOrbit School profile selection" /><figcaption>Profiles switch with your context</figcaption></figure></Reveal><Reveal delay={120}><div className="story-number">03</div><span className="eyebrow">App by app</span><h2>It changes with you.</h2><p>Choose which profile each app opens.</p><ul className="check-list"><li>144+ fields · 9 profiles</li><li>German and English</li></ul></Reveal></section>
    <PageCta step="02 · Next" title="See it in action." label="Open Live Demo" to="/live" navigate={navigate} />
  </div>;
}

function LivePage({ navigate }) {
  return <div className="page page-enter"><PageIntro eyebrow="Live demo" title="Move. Choose. Done." copy="Pick a layout, switch a profile and tap an app." accent="page-intro--blue" />
    <section className="live-page ruled"><Reveal><div className="live-card"><div className="live-card__bar"><span>Live</span><small>Interactive preview</small></div><OrbitDemo controls /></div></Reveal></section>
    <PageCta step="03 · Next" title="Ready to get started?" label="Download QuickOrbit" to="/pricing" navigate={navigate} />
  </div>;
}

function PricingPage({ notify, navigate }) {
  return <div className="page page-enter"><PageIntro eyebrow="Download" title="Use it freely. Support it if you want." copy="QuickOrbit is free to download and use. Its code and product assets remain private. Optional donations will be added later—never required." />
    <section className="pricing-page ruled"><div className="price-grid"><Reveal><article className="price-card price-card--blue"><div className="price-card-icon"><img src={symbol("folder")} alt="" /></div><span>QuickOrbit</span><strong className="free-price">€0</strong><p>Free to download and use. No account or subscription.</p><DownloadButton /><small>Official download link coming soon</small></article></Reveal><Reveal delay={100}><article className="price-card donation-card" id="support" tabIndex="-1"><div className="price-card-icon"><img src={symbol("payment")} alt="" /></div><span>Optional support</span><strong className="support-title">Your choice</strong><p>If QuickOrbit helps you, a voluntary donation option will be added later. Using the app will not depend on donating.</p><button disabled>Donations coming later</button><small>Always voluntary · Never required</small></article></Reveal></div>
      
      <Reveal><div className="license-box test-box"><div><span className="eyebrow">Free by choice</span><h2>No checkout.<br />No pressure.</h2><p>Use the official app at no cost. The source code and QuickOrbit identity are not published for reuse.</p></div><div className="test-perks"><span><i>01</i><b>Free app</b><small>No purchase or subscription.</small></span><span><i>02</i><b>Private source</b><small>The code is not publicly available.</small></span><span><i>03</i><b>Clear ownership</b><small>QuickOrbit and its product assets stay protected.</small></span></div><RouteLink to="/terms" navigate={navigate} className="license-link">Read Terms of Use</RouteLink></div></Reveal>
      <Reveal><section className="included-box"><div className="included-heading"><span className="eyebrow">Always included</span><h2>Everything important.<br />Nothing extra.</h2></div><div className="included-grid">{[[symbol("language"),"German & English","More languages are coming."],[symbol("no-account"),"No account","Open the app and start."],[symbol("payment"),"No paywall","Every core feature stays accessible."],[symbol("updates"),"Community updates","Follow development and improvements."]].map(([icon,title,text]) => <article key={title}><img src={icon} alt="" /><h3>{title}</h3><p>{text}</p></article>)}</div></section></Reveal>
      <Reveal><section className="pricing-help"><div><span className="eyebrow">Need an answer?</span><h2>Questions before downloading?</h2><p>The FAQ covers downloads, optional donations, updates and privacy.</p></div><RouteLink to="/faq" navigate={navigate} className="outline-button">Open FAQ</RouteLink></section></Reveal>
    </section>
  </div>;
}

function FaqPage() {
  const items = [
    ["Is QuickOrbit a subscription?", "No. QuickOrbit is free to download and use. No purchase or subscription is required."],
    ["How do I open QuickOrbit if macOS blocks it?", <InstallHelp detailed />],
    ["Do I have to donate?", "No. A donation option may be added later, but supporting QuickOrbit will always be completely voluntary."],
    ["Which languages are available?", "QuickOrbit is available in German and English. More languages are coming soon."],
    ["What can I find on Discord?", "News, community updates, events and support. You can open the server directly from this website."],
    ["Where can I download the app?", "The official download link will be published on this website. Join Discord for development updates in the meantime."],
    ["Can I copy or publish QuickOrbit?", "The public repository contains this website’s source, not the Mac app source. It is not an open-source license; broader reuse of QuickOrbit branding or product assets is not granted, subject to GitHub’s terms and applicable law."],
    ["Are updates included?", "Updates are included while QuickOrbit is actively developed and offered. There is no yearly update plan or permanent update guarantee."],
    ["Does QuickOrbit collect my data?", "QuickOrbit has no ads, analytics or telemetry. Settings and profiles are stored locally on your Mac."],
  ];
  return <div className="page page-enter"><PageIntro eyebrow="FAQ" title="Short answers." copy="Everything important, without the long read." accent="page-intro--coral" />
    <section className="faq-page ruled"><div className="faq-list">{items.map(([question, answer], index) => <Reveal key={question} delay={index * 45}><details><summary>{question}<span>+</span></summary>{typeof answer === "string" ? <p>{answer}</p> : answer}</details></Reveal>)}</div><Reveal><aside className="discord-card"><img src="/assets/icons/discord.png" alt="Discord" /><h2>Still unsure?</h2><p>Find news, community updates, events and support on Discord.</p><a className="outline-button" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Open Discord</a></aside></Reveal></section>
  </div>;
}

function PrivacyPage() {
  const items = [
    [symbol("no-account"), "No account", "QuickOrbit does not require a profile or sign-in."],
    [symbol("folder"), "Local first", "App settings stay on your Mac unless you choose to share feedback."],
    [symbol("quiet"), "Quiet website", "This beta website has no advertising or analytics integration."],
  ];
  return <div className="page page-enter legal-page"><section className="legal-hero ruled"><Reveal><span className="eyebrow">Privacy · first edition</span><h1>Small footprint.<br /><em>Clear choices.</em></h1><p>QuickOrbit is designed to feel private by default—not complicated by default.</p></Reveal><Reveal delay={100}><div className="legal-orbit"><img src={symbol("folder")} alt="" /><strong>Local</strong><span>by design</span></div></Reveal></section><section className="legal-grid ruled">{items.map(([icon,title,text],index)=><Reveal key={title} delay={index*70}><article><span>{String(index+1).padStart(2,"0")}</span><img src={icon} alt="" /><h2>{title}</h2><p>{text}</p></article></Reveal>)}</section><section className="legal-note ruled"><Reveal><span className="eyebrow">Good to know</span><h2>Leaving the site?</h2><p>Discord and GitHub are external services with their own privacy notices. The website is hosted by GitHub Pages, which may process technical request data. The website source is public on GitHub; the macOS app source is not included.</p></Reveal></section></div>;
}

function ImprintPage() {
  return <div className="page page-enter legal-page"><section className="legal-hero legal-hero--coral ruled"><Reveal><span className="eyebrow">Imprint · first edition</span><h1>Made with focus.<br /><em>Built by Nico.</em></h1><p>QuickOrbit is an independent macOS app created and maintained by Nico.</p></Reveal><Reveal delay={100}><div className="legal-orbit legal-orbit--coral"><img src="/assets/icons/quickorbit.png" alt="" /><strong>QuickOrbit</strong><span>Independent app</span></div></Reveal></section><section className="imprint-sheet ruled"><Reveal><div><span>01</span><small>Responsible</small><strong>Nico · QuickOrbit</strong></div><div><span>02</span><small>Find Nico</small><a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Discord community</a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub · @NicoT-111</a></div><div><span>03</span><small>Status</small><strong>Independent beta project</strong></div><div><span>04</span><small>Platform</small><strong>Made for macOS</strong></div></Reveal></section><section className="legal-note ruled"><Reveal><span className="eyebrow">Independent by design</span><h2>A small app<br />with a clear idea.</h2><p>QuickOrbit is not affiliated with Apple. Product names and trademarks belong to their respective owners. The website source is public on GitHub; this does not include the macOS app source or grant an open-source license.</p></Reveal></section></div>;
}

function TermsPage() {
  const items = [
    [symbol("folder"), "Public website source", "The QuickOrbit-Website repository is public, so its contents can be viewed and forked within GitHub. It contains website source only; the macOS app source is not included. No separate open-source license grants broader reuse rights."],
    [symbol("native"), "Original work", "Copyright may protect original code, text, graphics, video and other creative expression. QuickOrbit’s name and logo identify the project; do not imply an official connection or endorsement."],
    [symbol("no-account"), "Project materials", "The public website repository can be viewed and forked as permitted by GitHub’s Terms. No separate license grants broad reuse of QuickOrbit branding, app source or original product assets. Rights and exceptions under applicable law remain unaffected; general ideas are not claimed as exclusively owned."],
  ];
  return <div className="page page-enter legal-page terms-page"><section className="legal-hero terms-hero ruled"><Reveal><span className="eyebrow">Terms of Use · first edition</span><h1>Free to use.<br /><em>Still yours.</em></h1><p>QuickOrbit is free to download and use. The public repository contains only this website—not the Mac app source.</p></Reveal><Reveal delay={100}><div className="legal-orbit terms-orbit"><img src="/assets/icons/quickorbit.png" alt="" /><strong>Yours</strong><span>all rights reserved</span></div></Reveal></section><section className="legal-grid ruled">{items.map(([icon,title,text],index)=><Reveal key={title} delay={index*70}><article><span>{String(index+1).padStart(2,"0")}</span><img src={icon} alt="" /><h2>{title}</h2><p>{text}</p></article></Reveal>)}</section><section className="terms-clarity ruled"><Reveal><span className="eyebrow">The straight answer</span><h2>Use the app.<br /><em>Don’t copy the product.</em></h2><p>The public QuickOrbit-Website repository contains this website’s source only; it does not include the macOS app source. GitHub’s terms permit viewing and forking public repositories within GitHub. No separate open-source license grants broader rights. Nothing here claims ownership of general ideas or limits rights preserved by applicable law.</p><div className="terms-links"><a href="https://www.gesetze-im-internet.de/urhg/__69a.html" target="_blank" rel="noopener noreferrer">About software copyright</a><a href="https://www.dpma.de/marken/markenschutz/" target="_blank" rel="noopener noreferrer">About brand protection</a></div><small>This compact first edition is general project information, not legal advice. It should be professionally reviewed before a public release.</small></Reveal></section></div>;
}

function PageCta({ step, title, label, to, navigate }) {
  return <section className="page-cta ruled"><Reveal><span className="eyebrow">{step}</span><h2>{title}</h2><RouteLink to={to} navigate={navigate} className="outline-button">{label}<span aria-hidden="true"> →</span></RouteLink></Reveal></section>;
}

function App() {
  const [path, navigate] = useRoute();
  const [toast, setToast] = useState("");
  const notify = (message) => { setToast(message); window.clearTimeout(window.__quickOrbitToast); window.__quickOrbitToast = window.setTimeout(() => setToast(""), 2800); };
  const allRoutes = [...ROUTES, ...LEGAL_ROUTES];
  const current = allRoutes.some((route) => route.path === path) ? path : "/";
  const pages = {
    "/": <HomePage navigate={navigate} notify={notify} />,
    "/features": <FeaturesPage navigate={navigate} />,
    "/live": <LivePage navigate={navigate} />,
    "/pricing": <PricingPage notify={notify} navigate={navigate} />,
    "/faq": <FaqPage />,
    "/privacy": <PrivacyPage />,
    "/imprint": <ImprintPage />,
    "/terms": <TermsPage />,
  };
  useEffect(() => { document.title = `${allRoutes.find((route) => route.path === current)?.label || "Home"} — QuickOrbit`; }, [current]);

  return <main className="site">
    <a className="skip-link" href="#page-content">Skip to content</a>
    <header className="topbar"><RouteLink to="/" navigate={navigate} className="brand" aria-label="QuickOrbit — Home"><span className="brand-name"><span>Quick</span>Orbit</span><small>Home</small></RouteLink><nav aria-label="Main navigation">{PRIMARY_ROUTES.slice(1).map((route) => <RouteLink key={route.path} to={route.path} navigate={navigate} className={current === route.path ? "is-active" : ""}>{route.label}</RouteLink>)}</nav><RouteLink to="/pricing" navigate={navigate} className="nav-buy">Download</RouteLink></header>
    <nav className="mobile-nav" aria-label="Mobile navigation">{PRIMARY_ROUTES.map((route) => <RouteLink key={route.path} to={route.path} navigate={navigate} className={current === route.path ? "is-active" : ""}>{route.label}</RouteLink>)}</nav>
    <nav className="page-dots" aria-label="Pages">{ROUTES.map((route, index) => <RouteLink key={route.path} to={route.path} navigate={navigate} title={route.label} aria-label={`Open ${route.label}`} data-label={route.label} className={current === route.path ? "is-active" : ""}><span>{index + 1}</span></RouteLink>)}</nav>
    <div id="page-content" key={current} tabIndex={-1}>{pages[current]}</div>
    <footer className="site-footer"><div className="footer-top"><div className="footer-heading"><span className="eyebrow">Fast. Simple. Native.</span><h2>Your next action<br />is one move away.</h2><RouteLink to="/pricing" navigate={navigate} className="footer-buy">Download QuickOrbit</RouteLink></div><nav className="footer-nav" aria-label="Explore QuickOrbit">{ROUTES.slice(1).map((route) => <RouteLink key={route.path} to={route.path} navigate={navigate}>{route.label}</RouteLink>)}</nav><div className="footer-actions"><a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"><span>Discord</span></a><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="NicoT-111 on GitHub"><span>GitHub · @NicoT-111</span></a><a href="https://nicot-111.github.io/" target="_blank" rel="noopener noreferrer" aria-label="About Nico"><span>About Nico ↗</span></a></div><div className="footer-legal"><RouteLink to="/privacy" navigate={navigate}>Privacy</RouteLink><RouteLink to="/imprint" navigate={navigate}>Imprint</RouteLink><RouteLink to="/terms" navigate={navigate}>Terms of Use</RouteLink></div><small className="footer-copyright">© 2026 Nico. QuickOrbit is free to use. All rights reserved.</small></div><RouteLink to="/" navigate={navigate} className="footer-wordmark" aria-label="QuickOrbit home"><span>Quick</span>Orbit</RouteLink></footer>
    <div className={`toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
  </main>;
}

export { App };
