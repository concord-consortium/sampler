#!/bin/bash
# Usage: ./grab.sh <video_filename> <time>
# Accepts time in seconds (e.g., 11) or in mm:ss format (e.g., 3:36)

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <video_filename> <time_in_seconds or mm:ss>"
  exit 1
fi

video_file="$1"
time_arg="$2"

# Check if the time argument contains a colon, indicating mm:ss format
if [[ "$time_arg" == *:* ]]; then
  IFS=':' read -r minutes seconds <<< "$time_arg"
  # Convert minutes and seconds to total seconds
  time_seconds=$((10#$minutes * 60 + 10#$seconds))
else
  time_seconds="$time_arg"
fi

output_file="snapshot-${time_seconds}.jpg"

# Extract a single frame at the given time and save it
ffmpeg -ss "$time_seconds" -i "$video_file" -frames:v 1 -q:v 2 "$output_file"

if [ $? -eq 0 ]; then
  echo "Screenshot saved to $output_file"
else
  echo "Error: Failed to extract screenshot from $video_file"
fi