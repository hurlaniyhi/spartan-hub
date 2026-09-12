import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import { getSquadPoster } from "@/lib/squad-poster";
import { currentSeason } from "@/lib/slugify";
import { SquadPosterDocument } from "@/lib/pdf/SquadPosterDocument";

// Public, like the poster page itself — no admin auth required.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedSeason = searchParams.get("season");
  const isValidYear = (value: string) => /^\d{4}$/.test(value) && Number(value) <= Number(currentSeason());
  const season = requestedSeason && isValidYear(requestedSeason) ? requestedSeason : currentSeason();

  const poster = await getSquadPoster(season);
  const logo = await readFile(path.join(process.cwd(), "public/images/spartan-logo.jpeg"));

  // The web poster's headings/names use Oswald (the app's "font-display") —
  // embed it here too so the PDF's typography actually matches, not just
  // its colors and layout.
  Font.register({
    family: "Oswald",
    fonts: [{ src: path.join(process.cwd(), "public/fonts/Oswald-Bold.ttf"), fontWeight: "bold" }],
  });

  const buffer = await renderToBuffer(<SquadPosterDocument poster={poster} logo={logo} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="spartan-fc-squad-poster-${season}.pdf"`,
    },
  });
}
