"""Run Pond Patrol locally using only Python's standard library."""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


# Serve the game folder even if this launcher is called from another directory.
ROOT = Path(__file__).resolve().parent


class GameHandler(SimpleHTTPRequestHandler):
    """Serve the browser game with module support and no hidden-file access."""

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        # Reject hidden files, outside paths, and directory listings before serving.
        requested = unquote(urlsplit(self.path).path)
        parts = requested.replace("\\", "/").split("/")
        if any(part.startswith(".") for part in parts if part):
            self.send_error(403, "Forbidden")
            return None
        target = Path(self.translate_path(self.path)).resolve()
        if not target.is_relative_to(ROOT):
            self.send_error(403, "Forbidden")
            return None
        if target.is_dir() and target != ROOT:
            self.send_error(403, "Directory listing disabled")
            return None
        return super().send_head()

    def end_headers(self):
        # Refreshing the browser should immediately show edits made in VS Code.
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


def main():
    # Standard-library hosting only; there are no Python packages to install.
    parser = ArgumentParser(description="Play Pond Patrol in your browser.")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    try:
        # Bind to this computer only. Threads allow simultaneous asset requests.
        with ThreadingHTTPServer(("127.0.0.1", args.port), GameHandler) as server:
            print(f"Pond Patrol is ready at http://localhost:{args.port}", flush=True)
            print(
                "Open that address in your browser. Press Ctrl+C to stop.",
                flush=True,
            )
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                print("\nThe pond is closed. See you next time!")
    except OSError as error:
        parser.exit(
            1,
            f"Could not start the game server: {error}\n"
            "Try a different port: python play.py --port 8001\n",
        )


if __name__ == "__main__":
    main()
