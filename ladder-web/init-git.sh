#!/bin/bash
cd "$(dirname "$0")"

echo "# LadderWeb" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/OLKHVSKIY/LadderWeb.git
git push -u origin main

