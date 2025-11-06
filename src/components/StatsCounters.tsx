import React from 'react';
import { TeamOutlined, ProfileOutlined } from '@ant-design/icons';

const easeOutQuad = (t: number) => t * (2 - t);

const useCountUp = (target: number, start: boolean, duration = 1500) => {
  const [value, setValue] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!start) return;
    if (target <= 0) { setValue(0); return; }

    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / duration);
      const eased = easeOutQuad(progress);
      const current = Math.floor(eased * target);
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); startRef.current = null; };
  }, [start, target, duration]);

  return value;
};

const StatsCounters: React.FC = () => {
  const [jobs, setJobs] = React.useState<number>(0);
  const [companies, setCompanies] = React.useState<number>(0);
  const [ready, setReady] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const base = import.meta.env.VITE_API_URL as string;
    let mounted = true;
    (async () => {
      try {
        const [jobsRes, compRes] = await Promise.all([
          fetch(`${base}/jobs?page=1&limit=1`),
          fetch(`${base}/companies/count`),
        ]);
        const jobsJson = await jobsRes.json();
        const compJson = await compRes.json();
        if (!mounted) return;
        setJobs(Number(jobsJson?.total || 0));
        setCompanies(Number(compJson?.total || 0));
        setReady(true);
      } catch {
        if (!mounted) return;
        setJobs(0);
        setCompanies(0);
        setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, [rootRef.current]);

  const jobsVal = useCountUp(jobs, ready && visible, 1600);
  const compsVal = useCountUp(companies, ready && visible, 1600);

  return (
    <section className="section" style={{ padding: '36px 0', background: 'transparent' }}>
      <div className="container" ref={rootRef}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20,
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#d1fae5', display: 'grid', placeItems: 'center', color: '#00B14F' }}>
              <ProfileOutlined style={{ fontSize: 26 }} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {jobsVal.toLocaleString('vi-VN')}
              </div>
              <div style={{ color: '#475569' }}>Việc làm hiện tại</div>
            </div>
          </div>
          <div style={{
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20,
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#d1fae5', display: 'grid', placeItems: 'center', color: '#00B14F' }}>
              <TeamOutlined style={{ fontSize: 26 }} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {compsVal.toLocaleString('vi-VN')}
              </div>
              <div style={{ color: '#475569' }}>Công ty</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCounters;
