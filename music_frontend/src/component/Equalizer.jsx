import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import '../styles/Equalizer.css';

const Equalizer = ({ type = 'linked', isPlaying = true }) => {
  const barsRef = useRef([]);

  // 모드별 기본 크기 설정 (CSS에서 반응형으로 조정)
  const sizes = {
    dynamic: { width: 200, height: 80, barWidth: 15 },
    linked: { width: 100, height: 60, barWidth: 10 },
    static: { width: 80, height: 40, barWidth: 8 },
  };
  const { width, height, barWidth } = sizes[type] || sizes.linked;

  useEffect(() => {
    let animationFrameId;
    let startTime = null;

    // 초음파형 웨이브 애니메이션 함수 (dynamic)
    const drawDynamicWave = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // 초 단위
      const period = 2; // 2초 주기
      const phase = (elapsed % period) / period; // 0~1

      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const maxHeight = height * 0.9;
          const minHeight = height * 0.1;
          const wave = Math.sin(2 * Math.PI * (phase * 3 - i / 5)); // phase * 3으로 속도 증가
          const normalized = (wave + 1) / 2; // -1~1 → 0~1
          const dynamicHeight = isPlaying ? minHeight + normalized * (maxHeight - minHeight) : minHeight;
          const y = height - dynamicHeight;
          bar.setAttribute('height', dynamicHeight.toString());
          bar.setAttribute('y', y.toString());
        }
      });
      animationFrameId = requestAnimationFrame(drawDynamicWave);
    };

    // 정지 상태 시 초기화 함수
    const initializeBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const minHeight = height * 0.2;
          bar.setAttribute('height', minHeight.toString());
          bar.setAttribute('y', (height - minHeight).toString());
        }
      });
    };

    // 연동형 막대 애니메이션 함수 (linked)
    const drawLinkedEqualizer = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const maxHeight = height * 0.8;
          const minHeight = height * 0.2;
          const dynamicHeight = isPlaying ? Math.random() * (maxHeight - minHeight) + minHeight : minHeight;
          const y = height - dynamicHeight;
          bar.setAttribute('height', dynamicHeight.toString());
          bar.setAttribute('y', y.toString());
        }
      });
      animationFrameId = requestAnimationFrame(drawLinkedEqualizer);
    };

    // type에 따라 애니메이션 실행
    if (isPlaying) {
      if (type === 'dynamic') {
        drawDynamicWave(performance.now());
      } else if (type === 'linked') {
        drawLinkedEqualizer();
      } else {
        initializeBars();
      }
    } else {
      initializeBars();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [type, isPlaying, height]);

  return (
    <div className={`equalizer-container ${type} ${isPlaying ? 'playing' : ''}`}>
      <svg
        width="100%"
        height={height}
        className="equalizer-svg-icon"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {[...Array(5)].map((_, i) => (
          <rect
            key={i}
            ref={(el) => (barsRef.current[i] = el)}
            x={i * (barWidth * 2) + 5}
            y={(height - height * 0.2).toString()}
            width={barWidth}
            height={(height * 0.2).toString()}
            fill="currentColor"
            rx="2"
          />
        ))}
      </svg>
    </div>
  );
};

Equalizer.propTypes = {
  type: PropTypes.oneOf(['dynamic', 'linked', 'static']),
  isPlaying: PropTypes.bool,
};

export default Equalizer;