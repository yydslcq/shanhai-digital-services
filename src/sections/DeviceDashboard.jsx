import { useEffect, useRef } from 'react';
import Reveal from '../components/Reveal.jsx';
import { deviceCards } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

const DEVICE_VIDEO = 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618448924966912.mp4';
const VIDEO_SYNC_THRESHOLD = 0.12;
const VIDEO_SYNC_INTERVAL = 260;

export default function DeviceDashboard() {
  const backgroundVideoRef = useRef(null);
  const mainVideoRef = useRef(null);

  useEffect(() => {
    const backgroundVideo = backgroundVideoRef.current;
    const mainVideo = mainVideoRef.current;
    if (!backgroundVideo || !mainVideo) return undefined;

    const syncBackgroundVideo = () => {
      if (!Number.isFinite(mainVideo.duration) || mainVideo.readyState < 2 || backgroundVideo.readyState < 2) return;

      backgroundVideo.playbackRate = mainVideo.playbackRate;

      const drift = Math.abs(backgroundVideo.currentTime - mainVideo.currentTime);
      const loopBoundaryDrift = Math.abs(backgroundVideo.duration - drift);
      if (drift > VIDEO_SYNC_THRESHOLD && loopBoundaryDrift > VIDEO_SYNC_THRESHOLD) {
        backgroundVideo.currentTime = mainVideo.currentTime;
      }

      if (mainVideo.paused && !backgroundVideo.paused) {
        backgroundVideo.pause();
      } else if (!mainVideo.paused && backgroundVideo.paused) {
        backgroundVideo.play().catch(() => {});
      }
    };

    const handleMainPlay = () => {
      syncBackgroundVideo();
      backgroundVideo.play().catch(() => {});
    };

    const handleMainPause = () => {
      backgroundVideo.pause();
    };

    const syncTimer = window.setInterval(syncBackgroundVideo, VIDEO_SYNC_INTERVAL);
    mainVideo.addEventListener('play', handleMainPlay);
    mainVideo.addEventListener('playing', syncBackgroundVideo);
    mainVideo.addEventListener('pause', handleMainPause);
    mainVideo.addEventListener('seeked', syncBackgroundVideo);
    backgroundVideo.addEventListener('playing', syncBackgroundVideo);
    syncBackgroundVideo();

    return () => {
      window.clearInterval(syncTimer);
      mainVideo.removeEventListener('play', handleMainPlay);
      mainVideo.removeEventListener('playing', syncBackgroundVideo);
      mainVideo.removeEventListener('pause', handleMainPause);
      mainVideo.removeEventListener('seeked', syncBackgroundVideo);
      backgroundVideo.removeEventListener('playing', syncBackgroundVideo);
    };
  }, []);

  return (
    <section className="device-dashboard" aria-label="采集设备与现场证据">
      <video ref={backgroundVideoRef} className="device-bg-video" src={assetPath(DEVICE_VIDEO)} autoPlay muted loop playsInline preload="auto" />
      <div className="site-shell device-shell">
        <Reveal className="device-heading">
          <h2>芒果数智 · 四代自研智能化采集设备</h2>
          <p>以前沿设备、标准流程与超工业级精度，构建文博数字资产采集闭环</p>
        </Reveal>

        <Reveal className="device-video-panel">
          <video ref={mainVideoRef} id="mainVideo" src={assetPath(DEVICE_VIDEO)} autoPlay muted loop playsInline preload="auto" />
          <div className="device-video-caption">新一代智能采集一体机</div>
        </Reveal>

        <Reveal className="device-grid" id="devices">
          {deviceCards.map((device) => (
            <article
              key={device.id}
              className="device-card"
            >
              <div className="device-img">
                <img src={assetPath(device.image)} alt={device.title} loading="lazy" decoding="async" />
              </div>
              <div className="device-body">
                <div>
                  <h3>{device.title}</h3>
                  <p>{device.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
