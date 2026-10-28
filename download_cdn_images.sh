#!/bin/bash
# Script to download CDN images and update HTML references

CDN_DIR="cdn_images"
mkdir -p "$CDN_DIR"

# Extract all unique image URLs (just the base URL without query params and srcset junk)
grep -roh 'https://cdn.myportfolio.com/[^"?]*\.(jpg|jpeg|png|gif|webp)' --include="*.html" | sort -u > /tmp/clean_cdn_urls.txt

echo "Found $(wc -l < /tmp/clean_cdn_urls.txt) unique images to download"

# Download each image
while IFS= read -r url; do
    # Extract filename from URL
    filename=$(basename "$url")
    
    # Skip if already downloaded
    if [ -f "$CDN_DIR/$filename" ]; then
        echo "Already exists: $filename"
        continue
    fi
    
    echo "Downloading: $filename"
    curl -s -o "$CDN_DIR/$filename" "$url"
    
    # Small delay to be nice to the server
    sleep 0.2
done < /tmp/clean_cdn_urls.txt

echo "Download complete!"
echo "Total files in $CDN_DIR: $(ls -1 $CDN_DIR | wc -l)"
