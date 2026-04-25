import imageio
from PIL import Image, ImageSequence
import numpy as np
import sys

def convert_webp_to_mp4(input_path, output_path):
    print(f"Reading {input_path}...")
    img = Image.open(input_path)
    
    frames = []
    # Read each frame from the animated WebP
    for frame in ImageSequence.Iterator(img):
        # Convert to RGB to ensure compatibility with MP4
        frame_rgb = frame.convert('RGB')
        frames.append(np.array(frame_rgb))
        
    print(f"Loaded {len(frames)} frames. Writing to {output_path}...")
    
    # Write frames to MP4. Using imageio-ffmpeg backend automatically.
    # fps is typically 10 for these webp recordings
    imageio.mimwrite(output_path, frames, fps=10, format='FFMPEG')
    print("Done!")

if __name__ == "__main__":
    convert_webp_to_mp4(sys.argv[1], sys.argv[2])
