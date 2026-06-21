import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  DatabaseZap,
  Factory,
  GraduationCap,
  Menu,
  MousePointer2,
  Sparkles,
  X
} from 'lucide-react';
import './styles.css';

const navItems = [
  { label: 'Mission', href: '#mission' },
  { label: 'Services', href: '#services' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'Contact', href: '#contact' }
];

const services = [
  {
    icon: BrainCircuit,
    title: 'AI Transformation Strategy',
    text: 'Map your current operations, identify high-value AI opportunities, and create an execution roadmap that leaders can trust.',
    thai: 'ที่ปรึกษา AI Transformation สำหรับธุรกิจไทย วางแผน use case, KPI และ roadmap ที่ผู้บริหารใช้ตัดสินใจได้จริง'
  },
  {
    icon: Bot,
    title: 'AI Agents & Workflow Automation',
    text: 'Build practical agents for sales, operations, finance, customer service, reporting, and repetitive decision support.',
    thai: 'พัฒนา AI Agent และ automation สำหรับงานขาย ปฏิบัติการ บัญชี บริการลูกค้า และงานรายงานซ้ำๆ'
  },
  {
    icon: DatabaseZap,
    title: 'Data Foundation',
    text: 'Prepare business data, dashboards, and integration patterns so AI systems can work with reliable context.',
    thai: 'จัดระบบ data strategy, dashboard และ integration เพื่อให้ AI ใช้ข้อมูลที่ถูกต้องและตรวจสอบได้'
  },
  {
    icon: GraduationCap,
    title: 'Team Enablement',
    text: 'Train leaders and teams to adopt AI safely, confidently, and with measurable business impact.',
    thai: 'อบรม AI training ให้ผู้บริหารและทีมงานใช้ AI อย่างปลอดภัย มั่นใจ และวัดผลทางธุรกิจได้'
  }
];

const outcomes = [
  'Reduce manual work across daily operations',
  'Make better decisions with real-time insight',
  'Launch AI use cases without waiting years',
  'Upgrade teams into AI-powered operators',
  'Create a future-ready advantage for Thailand'
];

const roadmap = [
  ['01', 'Discover', 'Understand goals, workflows, pain points, data readiness, and the business case.'],
  ['02', 'Design', 'Prioritize use cases and define the AI roadmap, success metrics, and implementation plan.'],
  ['03', 'Build', 'Prototype, integrate, and ship AI workflows with fast feedback from the real team.'],
  ['04', 'Scale', 'Train users, improve adoption, monitor results, and expand transformation across functions.']
];

const useCases = [
  {
    title: 'AI Automation for Operations',
    text: 'Automate approvals, document handling, reporting, and internal workflows so teams spend more time on decisions.',
    thai: 'ลดงาน manual ในฝ่ายปฏิบัติการด้วย AI automation ที่เชื่อมกับ workflow จริงขององค์กร'
  },
  {
    title: 'AI Agents for Sales & Service',
    text: 'Deploy AI agents that support lead qualification, customer response, knowledge search, and follow-up tasks.',
    thai: 'สร้าง AI Agent ช่วยทีมขายและบริการลูกค้า ตอบคำถาม ค้นข้อมูล และติดตามงานได้เร็วขึ้น'
  },
  {
    title: 'Data Strategy for Executives',
    text: 'Turn scattered data into dashboards, decision intelligence, and a trusted foundation for future AI initiatives.',
    thai: 'ออกแบบ data strategy สำหรับผู้บริหาร เพื่อให้เห็นสถานะธุรกิจและตัดสินใจด้วยข้อมูลที่น่าเชื่อถือ'
  },
  {
    title: 'AI Training for Thai Teams',
    text: 'Enable teams to use generative AI, automation tools, and responsible AI practices in daily work.',
    thai: 'อบรมทีมไทยให้ใช้ AI ในงานประจำวัน ตั้งแต่ prompt, workflow, automation ไปจนถึง governance'
  }
];

const industries = [
  'Manufacturing and industrial operations',
  'Retail, distribution, and customer service',
  'Finance, accounting, and back office teams',
  'SMEs preparing for digital transformation',
  'Executive teams building AI-first strategy'
];

function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let particles = [];
    let pointer = { x: 0, y: 0, active: false };
    const colors = ['#0080f0', '#7b2ff7', '#ff8030', '#e04040'];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(42, Math.min(110, Math.floor((width * height) / 14500)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        size: 1.2 + Math.random() * 2.2,
        color: colors[index % colors.length],
        phase: Math.random() * Math.PI * 2
      }));
    };

    const drawGrid = (time) => {
      const grid = Math.max(56, width / 16);
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 128, 240, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const offset = (time * 0.018) % grid;
      for (let x = -grid + offset; x < width + grid; x += grid) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height * 0.16, height);
      }
      for (let y = -grid + offset; y < height + grid; y += grid) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y - width * 0.08);
      }
      ctx.stroke();
      ctx.restore();
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(width * 0.72, height * 0.32, 0, width * 0.72, height * 0.32, width * 0.75);
      gradient.addColorStop(0, 'rgba(0, 128, 240, 0.26)');
      gradient.addColorStop(0.42, 'rgba(123, 47, 247, 0.14)');
      gradient.addColorStop(1, 'rgba(0, 16, 96, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      drawGrid(time);

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time * 0.0008 + p.phase) * 0.08;
        p.y += p.vy + Math.cos(time * 0.0007 + p.phase) * 0.08;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = pointer.active ? 148 : 120;
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.22;
            ctx.strokeStyle = `rgba(0, 128, 240, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            p.x -= dx * 0.0015;
            p.y -= dy * 0.0015;
          }
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    animationFrame = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
    });
    window.addEventListener('pointerleave', () => {
      pointer.active = false;
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.round((scrollTop / height) * 100)) : 0);
      setSolid(scrollTop > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${solid ? 'is-solid' : ''}`}>
      <a className="brand" href="#top" aria-label="InNextGen home">
        <img src="/assets/innextgen-logo.png" alt="InNextGen Innovation Next Generation logo" />
        <span>InNextGen</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <span className="scroll-percent">{progress}%</span>
        <a className="mini-cta spotlight" href="#contact">
          Start
          <ChevronRight size={16} />
        </a>
        <button className="menu-button" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>
      <div className={`mobile-panel ${open ? 'is-open' : ''}`}>
        <button className="menu-button close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
          <X size={22} />
        </button>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
      <div className="progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
    </header>
  );
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.unobserve(node);
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function App() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <>
      <Header />
      <main id="top">
        <section className="hero section-dark">
          <NetworkCanvas />
          <div className="hero-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="container hero-grid">
            <Reveal className="hero-copy">
              <p className="eyebrow">
                <Sparkles size={16} />
                Innovation Next Generation
              </p>
              <h1>AI Transformation for the next generation of Thai business.</h1>
              <p className="hero-lead">
                InNextGen partners with business owners and industry leaders to turn AI from a trend into
                real operating advantage.
              </p>
              <p className="hero-thai" lang="th">
                ที่ปรึกษา AI Transformation สำหรับธุรกิจไทย วางกลยุทธ์ AI, automation, data และ AI Agent
                เพื่อยกระดับองค์กรสู่การทำงานแบบ future-ready
              </p>
              <div className="hero-actions">
                <a className="primary-button spotlight" href="#contact">
                  Transform my business
                  <ArrowRight size={18} />
                </a>
                <a className="secondary-button spotlight" href="#services">
                  Explore services
                </a>
              </div>
            </Reveal>
            <Reveal className="signal-panel">
              <img src="/assets/innextgen-logo.png" alt="InNextGen AI Transformation consulting logo" />
              <div className="signal-list">
                <span>AI Strategy</span>
                <span>Automation</span>
                <span>Data Intelligence</span>
                <span>AI Agents</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="mission" className="mission" lang="th">
          <div className="container mission-grid">
            <Reveal>
              <p className="section-kicker">Mission</p>
              <h2>พื้นที่เริ่มต้นของการร่วมมือ เพื่อพาธุรกิจไทยไปอยู่แนวหน้าของโลก</h2>
            </Reveal>
            <Reveal className="thai-statement">
              <p>
                เป้าหมายของพวกเราชัดเจนมากครับ คือการลุยทำเรื่อง AI Transformation
                เพื่อขับเคลื่อนทั้งภาคธุรกิจและอุตสาหกรรมในไทย และเราตั้งใจให้พื้นที่ตรงนี้เป็นจุดเริ่มต้น
                ที่พวกเราจะมาร่วมมือกัน นำเทคโนโลยีล้ำๆ ไปผลักดันให้ประเทศของเราก้าวไปอยู่แนวหน้าของโลกให้ได้
              </p>
            </Reveal>
          </div>
        </section>

        <section id="services" className="services section-dark">
          <div className="container">
            <Reveal className="section-heading">
              <p className="section-kicker">Transformation Stack</p>
              <h2>From strategy to systems your team can actually use.</h2>
            </Reveal>
            <div className="service-grid">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Reveal className="service-card" key={service.title}>
                    <Icon size={28} />
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                    <p className="thai-card-copy" lang="th">{service.thai}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="outcomes">
          <div className="container outcome-grid">
            <Reveal>
              <p className="section-kicker">Business Outcomes</p>
              <h2>Designed for owners who need measurable progress, not another experiment.</h2>
              <p lang="th">
                เราออกแบบ AI Transformation ให้โยงกับผลลัพธ์ทางธุรกิจ เช่น ลดต้นทุน เพิ่มความเร็ว
                ยกระดับ customer experience และทำให้ทีมตัดสินใจได้จากข้อมูลจริง
              </p>
            </Reveal>
            <Reveal className="outcome-list">
              {outcomes.map((outcome) => (
                <div className="outcome-item" key={outcome}>
                  <Check size={18} />
                  <span>{outcome}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="use-cases" className="use-cases">
          <div className="container">
            <Reveal className="section-heading">
              <p className="section-kicker">AI Use Cases Thailand</p>
              <h2>Practical AI use cases for Thai companies ready to move now.</h2>
              <p className="section-intro" lang="th">
                InNextGen ช่วยธุรกิจไทยเริ่มจาก use case ที่มีผลกระทบสูงและนำไปใช้จริงได้เร็ว
                ตั้งแต่ AI automation, AI agents, data strategy ไปจนถึง AI training สำหรับทีมงาน
              </p>
            </Reveal>
            <div className="use-case-grid">
              {useCases.map((item) => (
                <Reveal className="use-case-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <p className="thai-card-copy" lang="th">{item.thai}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="roadmap section-dark">
          <div className="container">
            <Reveal className="section-heading">
              <p className="section-kicker">Roadmap</p>
              <h2>A practical path from ambition to adoption.</h2>
            </Reveal>
            <div className="roadmap-grid">
              {roadmap.map(([number, title, text]) => (
                <Reveal className="roadmap-step" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="why">
          <div className="container why-grid">
            <Reveal className="why-card">
              <Building2 size={30} />
              <h3>For Business Owners</h3>
              <p>Clear strategy, fast wins, and AI workflows connected to revenue, cost, speed, and customer experience.</p>
            </Reveal>
            <Reveal className="why-card">
              <Factory size={30} />
              <h3>For Industry</h3>
              <p>Modernize operational systems with data, automation, and AI enablement built around real constraints.</p>
            </Reveal>
            <Reveal className="why-card">
              <ChartNoAxesCombined size={30} />
              <h3>For National Growth</h3>
              <p>Help Thai teams build capability, compete globally, and move from AI awareness to AI leadership.</p>
            </Reveal>
          </div>
          <div className="container industries-wrap">
            <Reveal className="industries-panel">
              <p className="section-kicker">Industries Served</p>
              <h2>Built for leaders who want AI to change the operating model, not only the presentation deck.</h2>
              <div className="industry-list">
                {industries.map((industry) => (
                  <span key={industry}>{industry}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="contact section-dark">
          <div className="container contact-panel">
            <Reveal>
              <p className="section-kicker">Start The Transformation</p>
              <h2>Bring InNextGen into the room where your next business model is being built.</h2>
              <p>
                Tell us where your business is today. We will help shape the AI roadmap, prototype the highest-impact use cases,
                and prepare your team for the future.
              </p>
              <p lang="th">
                ติดต่อ InNextGen เพื่อเริ่มประเมินโอกาส AI Transformation, AI automation, data strategy
                และ AI Agent สำหรับธุรกิจของคุณในประเทศไทย
              </p>
              <div className="contact-actions">
                <a className="primary-button spotlight" href="mailto:transformation@innextgen.com">
                  transformation@innextgen.com
                  <ArrowRight size={18} />
                </a>
                <span className="placeholder-note">Contact us here</span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <footer>
        <div className="container footer-inner">
          <span>InNextGen © {year}</span>
          <span>Innovation Next Generation</span>
          <span className="footer-cursor">
            <MousePointer2 size={15} />
            Future-ready by design
          </span>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Analytics />
  </>
);
