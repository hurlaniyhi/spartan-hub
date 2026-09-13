import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Image
        src="/images/spartan-logo.jpeg"
        alt="Spartan FC crest"
        width={72}
        height={72}
        className="rounded-full opacity-80"
      />
      <h1 className="font-display text-2xl font-bold text-white">Page Not Found</h1>
      <p className="max-w-sm text-sm text-white/50">
        This page doesn&apos;t exist, or may have moved. Let&apos;s get you back on the pitch.
      </p>
      <Button href="/" variant="primary" className="mt-2">
        Back to Home
      </Button>
    </div>
  );
}
