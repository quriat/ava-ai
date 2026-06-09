#!/bin/bash
# Helper script to replace placeholder tracking codes in index.html

read -p "Enter your Google Search Console verification code: " GSC
read -p "Enter your Facebook Pixel ID: " FBPIX

sed -i "s/YOUR_GSC_CODE_HERE/$GSC/g" index.html
sed -i "s/YOUR_PIXEL_ID_HERE/$FBPIX/g" index.html

echo "✅ Secrets replaced in index.html"
echo "Run: git add index.html && git commit -m 'Add tracking codes' && git push origin main"
