const LOGOS = {
  'light-text': `${import.meta.env.BASE_URL}brand/sabave-logo-umbrella-transparent-light-text.png`,
  'dark-text': `${import.meta.env.BASE_URL}brand/sabave-logo-umbrella-transparent-dark-text.png`,
} as const;

/** Source PNGs are 968×288, including transparent padding around the lockup. */
const RATIO = 968 / 288;

export function SabaveLogo({
  variant = 'light-text',
  height = 36,
}: {
  /** Light wordmark for dark backgrounds. Dark wordmark for light backgrounds. */
  variant?: keyof typeof LOGOS;
  height?: number;
}) {
  const width = Math.round(height * RATIO);
  return (
    <img
      src={LOGOS[variant]}
      alt="sabave.ai"
      width={width}
      height={height}
      decoding="async"
      style={{ display: 'block', width, height, objectFit: 'contain', background: 'transparent' }}
    />
  );
}
