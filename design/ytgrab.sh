#!/bin/bash

# Usage: ./ytgrab.sh <YouTube URL>
# Example: ./ytgrab.sh "https://youtu.be/aPibzv3goJY?t=11"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <YouTube URL>"
  exit 1
fi

input_url="$1"

# Extract video ID and timestamp from youtu.be URL using sed
if [[ "$input_url" =~ youtu\.be ]]; then
  videoId=$(echo "$input_url" | sed -E 's|https?://youtu\.be/([^?]+).*|\1|')
  timestamp=$(echo "$input_url" | sed -nE 's/.*[?&]t=([0-9]+).*/\1/p')
  if [ -z "$timestamp" ]; then
    timestamp=0
  fi
else
  # For standard YouTube URLs
  videoId=$(echo "$input_url" | sed -nE 's/.*[?&]v=([^&]+).*/\1/p')
  timestamp=$(echo "$input_url" | sed -nE 's/.*[?&]t=([0-9]+).*/\1/p')
  if [ -z "$timestamp" ]; then
    timestamp=0
  fi
fi

# Construct the embed URL
embed_url="https://www.youtube.com/embed/${videoId}?start=${timestamp}"
echo "Using embed URL: ${embed_url}"

# URL encode the embed URL using jq
encoded_url=$(jq -nr --arg url "$embed_url" '$url|@uri')

# Set your Google PageSpeed Insights API key here
googleApiKey="AIzaSyBizEijS8ce3pkpZDx6l1eJSdq2ltQr1f8"

# Build the API request URL with strategy=desktop
api_url="https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encoded_url}&screenshot=true&strategy=desktop&key=${googleApiKey}"

echo "Requesting screenshot from API..."
json_response=$(curl -s "$api_url")

# Uncomment the following line to print the full API response for debugging
echo "Full API response:" && echo "$json_response" | jq .

# Check if we received a response
if [ -z "$json_response" ]; then
  echo "Error: No response from API. Check your network and API key."
  exit 1
fi

# Extract the screenshot data using jq
screenshot_data=$(echo "$json_response" | jq -r '.lighthouseResult.audits["final-screenshot"].details.data')

if [ "$screenshot_data" == "null" ] || [ -z "$screenshot_data" ]; then
  echo "Error: No screenshot data returned. Verify your API key and URL."
  echo "Please uncomment the debug line in the script to see the full API response for more details."
  exit 1
fi

# Extract MIME type and base64 data
data_header=$(echo "$screenshot_data" | cut -d',' -f1)
base64_data=$(echo "$screenshot_data" | cut -d',' -f2-)
mime_type=$(echo "$data_header" | cut -d';' -f1 | cut -d':' -f2)
echo "Detected MIME type: $mime_type"

extension="png"  # default
if [[ "$mime_type" == "image/jpeg" ]]; then
  extension="jpg"
elif [[ "$mime_type" == "image/png" ]]; then
  extension="png"
fi

output_file="output.${extension}"
echo "Saving screenshot to $output_file..."

echo "$base64_data" | base64 --decode > "$output_file"

if [ $? -eq 0 ]; then
  echo "Screenshot saved to $output_file"
else
  echo "Error: Failed to save screenshot."
fi