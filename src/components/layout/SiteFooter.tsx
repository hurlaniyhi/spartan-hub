import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 pb-16 sm:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
        <Image
          src="/images/spartan-logo.jpeg"
          alt="Spartan FC crest"
          width={36}
          height={36}
          className="rounded-full"
        />
        <p className="font-display text-sm font-semibold text-white/70">SPARTAN FC</p>
        <p className="max-w-xs text-xs text-white/30">
          More than a team. Built for Spartan FC players, by Spartan FC.
        </p>
      </div>
    </footer>
  );
}
