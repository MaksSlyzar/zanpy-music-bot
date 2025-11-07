
export function isYoutubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    const validHosts = ["youtube.com", "youtu.be"];

    if (!validHosts.includes(hostname)) return false;

    if (hostname === "youtube.com") {
      const pathname = parsed.pathname;
      if (pathname === "/watch" && parsed.searchParams.has("v")) {
        return true;
      }
      if (/^\/(shorts|embed)\/[a-zA-Z0-9_-]+$/.test(pathname)) {
        return true;
      }
      return false;
    }

    if (hostname === "youtu.be") {
      return /^\/[a-zA-Z0-9_-]+$/.test(parsed.pathname);
    }

    return false;
  } catch {
    return false;
  }
}

export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;

    if (hostname === "youtube.com") {
      if (pathname === "/watch" && searchParams.has("v")) {
        return searchParams.get("v");
      }

      const match = pathname.match(/^\/(shorts|embed)\/([a-zA-Z0-9_-]+)$/);
      if (match) {
        return match[2];
      }
    }

    if (hostname === "youtu.be") {
      const match = pathname.match(/^\/([a-zA-Z0-9_-]+)$/);
      if (match) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getYoutubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const searchParams = parsed.searchParams;

    const validHosts = ["youtube.com", "youtu.be"];
    if (!validHosts.includes(hostname)) return null;

    if (searchParams.has("list")) {
      return searchParams.get("list");
    }

    const match = parsed.pathname.match(/^\/playlist\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

