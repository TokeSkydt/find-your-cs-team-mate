import Image from "next/image";

export default function Home() {
  return (
    <main className="mt-1">
      <header>
        <section className="relative w-full h-[70vh]">
          <Image
            src="/assets/fronpage/cs2-banner-hero.webp"
            alt="find your team cs2"
            loading="eager"
            fill
            className="object-cover rounded-2xl"
          />

          <h2 className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold drop-shadow-[0_0_3px_black]">
            Find your team
          </h2>
        </section>
      </header>
    </main>
  );
}
