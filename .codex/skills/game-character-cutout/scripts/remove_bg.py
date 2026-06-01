import argparse
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Remove an image background with rembg and save a transparent PNG."
    )
    parser.add_argument("--input", required=True, help="Input image path.")
    parser.add_argument("--output", required=True, help="Output PNG path.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise SystemExit(f"Input image does not exist: {input_path}")

    try:
        from rembg import remove
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: rembg\n"
            "Install it with:\n"
            "  python -m pip install rembg\n"
            "Then run this script again."
        ) from exc

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(remove(input_path.read_bytes()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
