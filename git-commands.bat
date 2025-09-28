@echo off
echo 🚀 Setting up Git repository and pushing to GitHub...

echo.
echo 📁 Initializing Git repository...
git init

echo.
echo 📝 Adding all files...
git add .

echo.
echo 💾 Creating initial commit...
git commit -m "Initial commit: NYC 3D Map with React components and trail cards"

echo.
echo 🔗 Adding remote repository...
git remote add origin https://github.com/jaydenstab/VTHacks13.git

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Successfully pushed to GitHub!
echo 🌐 Your repository: https://github.com/jaydenstab/VTHacks13
pause
