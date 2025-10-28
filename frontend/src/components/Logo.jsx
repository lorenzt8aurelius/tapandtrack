function Logo({ size = 'medium', showText = true }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const textSize = {
    small: 'text-xs',
    medium: 'text-base',
    large: 'text-xl'
  };

  const pixelSize = {
    small: 2,
    medium: 3,
    large: 4
  };

  const px = pixelSize[size];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* QR Code Icon with proper finder patterns */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer square border */}
        <div className="absolute inset-0 border-2 border-gray-800"></div>

        {/* Top-left finder pattern (L-shape brackets pointing inward) */}
        <svg className="absolute top-0 left-0" width={`${px * 7}`} height={`${px * 7}`}>
          {/* Outer squares */}
          <rect x={px * 1} y={px * 1} width={px * 5} height={px * 5} fill="#1f2937" />
          {/* Inner hollow square */}
          <rect x={px * 2} y={px * 2} width={px * 3} height={px * 3} fill="white" />
          {/* Left bracket */}
          <rect x="0" y={`${px * 2}`} width={`${px * 2}`} height={`${px * 3}`} fill="#1f2937" />
          {/* Top bracket */}
          <rect x={`${px * 2}`} y="0" width={`${px * 3}`} height={`${px * 2}`} fill="#1f2937" />
        </svg>

        {/* Top-right finder pattern */}
        <svg className="absolute top-0 right-0" width={`${px * 7}`} height={`${px * 7}`}>
          <rect x={px * 1} y={px * 1} width={px * 5} height={px * 5} fill="#1f2937" />
          <rect x={px * 2} y={px * 2} width={px * 3} height={px * 3} fill="white" />
          <rect x={`${px * 5}`} y={`${px * 2}`} width={`${px * 2}`} height={`${px * 3}`} fill="#1f2937" />
          <rect x={`${px * 2}`} y="0" width={`${px * 3}`} height={`${px * 2}`} fill="#1f2937" />
        </svg>

        {/* Bottom-left finder pattern */}
        <svg className="absolute bottom-0 left-0" width={`${px * 7}`} height={`${px * 7}`}>
          <rect x={px * 1} y={px * 1} width={px * 5} height={px * 5} fill="#1f2937" />
          <rect x={px * 2} y={px * 2} width={px * 3} height={px * 3} fill="white" />
          <rect x="0" y={`${px * 2}`} width={`${px * 2}`} height={`${px * 3}`} fill="#1f2937" />
          <rect x={`${px * 2}`} y={`${px * 5}`} width={`${px * 3}`} height={`${px * 2}`} fill="#1f2937" />
        </svg>

        {/* Bottom-right data pattern (scattered pixels) */}
        <div className="absolute bottom-0 right-0" style={{ width: `${px * 6}px`, height: `${px * 6}px` }}>
          <svg width="100%" height="100%">
            {/* Create a random data pattern */}
            {[...Array(12)].map((_, i) => {
              const x = (i % 3) * px * 2;
              const y = Math.floor(i / 3) * px * 2;
              return <rect key={i} x={x} y={y} width={px} height={px} fill="#1f2937" />;
            })}
            {/* Add some scattered pixels */}
            <rect x={px * 4} y={px * 1} width={px} height={px} fill="#1f2937" />
            <rect x={px * 1} y={px * 2} width={px} height={px} fill="#1f2937" />
            <rect x={px * 3} y={px * 3} width={px} height={px} fill="#1f2937" />
            <rect x={px * 5} y={px * 4} width={px} height={px} fill="#1f2937" />
          </svg>
        </div>

        {/* Timing pattern dots in the middle */}
        {size !== 'small' && (
          <>
            <svg className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }} width={`${px * 3}`} height={`${px * 3}`}>
              <rect x={px} y={px} width={px} height={px} fill="#1f2937" />
              <rect x={0} y={0} width={px} height={px} fill="#1f2937" />
              <rect x={`${px * 2}`} y={0} width={px} height={px} fill="#1f2937" />
              <rect x={0} y={`${px * 2}`} width={px} height={px} fill="#1f2937" />
              <rect x={`${px * 2}`} y={`${px * 2}`} width={px} height={px} fill="#1f2937" />
            </svg>
          </>
        )}
      </div>

      {/* Text */}
      {showText && (
        <div className={`mt-3 ${textSize[size]} text-center`}>
          <h1 className="font-bold text-gray-900">
            TapAndTrack
          </h1>
        </div>
      )}
    </div>
  );
}

export default Logo;

