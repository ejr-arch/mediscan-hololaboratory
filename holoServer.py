import os
import subprocess
import uuid
import sys
import json

ASSETS_DIR = os.path.expanduser("~/Projects/emm/client/assets")
GENERATED_DIR = os.path.expanduser("~/Projects/emm/client/generated")
os.makedirs(GENERATED_DIR, exist_ok=True)


def get_video_dimensions(input_video):
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        input_video
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    info = json.loads(result.stdout)
    w = info["streams"][0]["width"]
    h = info["streams"][0]["height"]
    return w, h


def create_hologram_video(input_video):
    filename = f"hologram_{uuid.uuid4().hex}.mp4"
    output_video = os.path.join(GENERATED_DIR, filename)

    w, h = get_video_dimensions(input_video)

    s = max(w, h)
    pad_x = (s - w) // 2
    pad_y = (s - h) // 2

    canvas = f"{3 * s}x{3 * s}"

    hologram_grade = (
        "eq=brightness=-0.08:contrast=1.5:saturation=0.6,"
        "curves="
            "r='0/0 0.3/0.1 0.7/0.55 1/0.85':"
            "g='0/0 0.3/0.2 0.7/0.75 1/1.0':"
            "b='0/0 0.3/0.25 0.7/0.85 1/1.0',"
        "unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=1.2"
    )

    square = f"pad={s}:{s}:{pad_x}:{pad_y}:color=black,{hologram_grade}"

    filter_complex = (
        f"[0:v]{square}[top];"
        f"[0:v]{square},vflip[bottom];"
        f"[0:v]{square},transpose=1[left];"
        f"[0:v]{square},transpose=2[right];"

        f"color=size={canvas}:color=black[base];"

        f"[base][top]overlay={s}:0[tmp1];"
        f"[tmp1][bottom]overlay={s}:{2 * s}[tmp2];"
        f"[tmp2][left]overlay=0:{s}[tmp3];"
        f"[tmp3][right]overlay={2 * s}:{s}"
    )

    cmd = [
        "ffmpeg",
        "-i", input_video,
        "-t", "10",
        "-filter_complex", filter_complex,
        "-c:v", "libx264",
        "-crf", "18",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-y",
        output_video
    ]

    print(f"\nSource:     {os.path.basename(input_video)}")
    print(f"Dimensions: {w}x{h} → panel {s}x{s} (padded {pad_x}px left/right, {pad_y}px top/bottom)")
    print(f"Canvas:     {3*s}x{3*s}")
    print(f"Output:     {output_video}")
    print(f"Effects:    black crush · contrast boost · cyan tint · edge glow\n")

    result = subprocess.run(cmd, text=True)

    if result.returncode != 0:
        print("\nFFmpeg failed.")
        sys.exit(1)

    print(f"\nDone! → {output_video}")
    return output_video


def main():
    if len(sys.argv) > 1:
        video_name = sys.argv[1]
        input_video = os.path.join(ASSETS_DIR, video_name)
        if not os.path.exists(input_video):
            print(f"Error: '{video_name}' not found in {ASSETS_DIR}")
            sys.exit(1)
        create_hologram_video(input_video)
        return

    videos = [f for f in os.listdir(ASSETS_DIR)
              if f.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".webm"))]

    if not videos:
        print(f"No videos found in {ASSETS_DIR}")
        sys.exit(1)

    print("Available videos:")
    for i, v in enumerate(videos, 1):
        print(f"  [{i}] {v}")

    choice = input("\nEnter number or filename: ").strip()

    if choice.isdigit():
        idx = int(choice) - 1
        if 0 <= idx < len(videos):
            video_name = videos[idx]
        else:
            print("Invalid selection.")
            sys.exit(1)
    else:
        video_name = choice

    input_video = os.path.join(ASSETS_DIR, video_name)
    if not os.path.exists(input_video):
        print(f"Error: '{video_name}' not found in {ASSETS_DIR}")
        sys.exit(1)

    create_hologram_video(input_video)


if __name__ == "__main__":
    main()
