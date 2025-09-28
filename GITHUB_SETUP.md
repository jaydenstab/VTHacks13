# 🚀 GitHub Setup Guide for PulseNYC

Follow these steps to push your PulseNYC project to GitHub.

## 📋 Prerequisites

### 1. Install Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
- **Mac**: Install via [Homebrew](https://brew.sh/) or download from git-scm.com
- **Linux**: `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

### 2. Create GitHub Account
- Go to [github.com](https://github.com)
- Sign up for a free account
- Verify your email address

## 🔧 Git Configuration

After installing Git, open a terminal and configure it:

```bash
# Set your name (replace with your actual name)
git config --global user.name "Your Name"

# Set your email (replace with your actual email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

## 📁 Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - Repository name: `pulsenyc` or `pulse-nyc`
   - Description: `AI-powered hyperlocal event aggregator for NYC`
   - Make it **Public** (so others can see your work!)
   - **Don't** check "Initialize with README" (we already have files)
5. **Click "Create repository"**

## 🚀 Push Your Code

After creating the repository, run these commands in your project directory:

```bash
# Navigate to your project directory
cd "C:\Users\sabal\OneDrive\Desktop\VT HACKS"

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: PulseNYC AI-powered event aggregator

- Full-stack React/Node.js application
- AI-powered event processing with Google Gemini
- Multiple map providers (Mapbox, Google Maps, Advanced Google Maps)
- Apple-style UI with glassmorphism effects
- Real-time analytics and notifications
- Web scraping from The Skint
- Interactive mapping with custom markers
- Event categorization and filtering
- Mobile-responsive design"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pulsenyc.git

# Push to GitHub
git push -u origin main
```

## 🔐 Authentication

If you get authentication errors, you have two options:

### Option 1: Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name like "PulseNYC Development"
4. Select scopes: `repo`, `workflow`, `write:packages`
5. Copy the token
6. Use it as your password when prompted

### Option 2: SSH Keys (Advanced)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

## 📝 Repository Structure

Your GitHub repository will contain:

```
pulsenyc/
├── 📁 backend/              # Node.js backend
├── 📁 frontend/             # React frontend
├── 📁 demos/                # HTML demo files
├── 📄 README.md             # Project documentation
├── 📄 .gitignore            # Git ignore rules
├── 📄 package.json          # Root package.json
└── 📄 GITHUB_SETUP.md       # This file
```

## 🎯 Next Steps

After pushing to GitHub:

1. **Enable GitHub Pages** (optional):
   - Go to repository Settings → Pages
   - Select source: "Deploy from a branch"
   - Choose "main" branch
   - Your site will be available at `https://yourusername.github.io/pulsenyc`

2. **Add Issues and Projects**:
   - Create issues for bugs and feature requests
   - Set up project boards for task management

3. **Set up CI/CD**:
   - Add GitHub Actions for automated testing
   - Set up deployment workflows

4. **Add Collaborators**:
   - Invite team members to contribute
   - Set up branch protection rules

## 🔧 Troubleshooting

### Common Issues:

**"git is not recognized"**
- Restart your terminal after installing Git
- Make sure Git is added to your PATH

**"Authentication failed"**
- Use Personal Access Token instead of password
- Check your username and email configuration

**"Repository not found"**
- Verify the repository URL
- Check if the repository exists and you have access

**"Permission denied"**
- Make sure you're using the correct GitHub username
- Check if you have write access to the repository

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Documentation](https://docs.github.com/)
- [GitHub CLI](https://cli.github.com/) - Alternative to web interface
- [GitHub Desktop](https://desktop.github.com/) - GUI for Git

## 🎉 Success!

Once you've successfully pushed your code, you'll have:

✅ **Public repository** showcasing your work  
✅ **Professional README** with documentation  
✅ **Version control** for your project  
✅ **Collaboration** capabilities  
✅ **Portfolio** piece for job applications  

Your PulseNYC project is now on GitHub and ready to impress! 🚀

---

**Need help?** Open an issue in the repository or reach out for support!
