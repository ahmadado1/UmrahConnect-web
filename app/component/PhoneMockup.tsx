type PhoneMockupProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function PhoneMockup({ src, alt, className = '' }: PhoneMockupProps) {
  return (
    <div className={`phone-mockup ${className}`.trim()}>
      <div className="phone-mockup-frame">
        <div className="phone-mockup-screen">
          <div className="phone-mockup-notch" />
          <img src={src} alt={alt} />
        </div>
      </div>
    </div>
  );
}
