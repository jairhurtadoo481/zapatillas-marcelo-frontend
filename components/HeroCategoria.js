export default function HeroCategoria({ titulo, video }) {
  return (
    <section className="relative bg-black text-white overflow-hidden h-[45vh] min-h-[280px] flex items-center justify-center">
      {video && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/30" />
      <h1 className="font-display relative text-5xl md:text-6xl tracking-wide">{titulo}</h1>
    </section>
  );
}