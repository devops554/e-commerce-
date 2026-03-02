const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
    console.error(`${colors.red}Error: ${message}${colors.reset}`);
    process.exit(1);
}

// 1. Check for staged .env files
log(colors.cyan, '🔍 Checking for sensitive files...');

try {
    // Get list of staged files with status
    const gitOutput = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
    const stagedFiles = gitOutput.split('\n').filter(line => line.trim() !== '');

    // Filter for .env files that are NOT deleted (D)
    // Format: "STATUS  PATH" e.g. "A  .env" or "D  frontend/.env"
    const envFiles = stagedFiles
        .filter(line => {
            const [status, ...pathParts] = line.split(/\s+/);
            const filePath = pathParts.join(' ');
            // Check if it's an env file (but exclude .envSample and .env.example)
            const isEnv = (filePath.endsWith('.env') || filePath.includes('/.env') || filePath.includes('.env.'))
                && !filePath.includes('.envSample')
                && !filePath.includes('.env.example')
                && !filePath.includes('.env.sample');
            // We care if it's Added (A), Modified (M), or Renamed (R), but NOT Deleted (D)
            return isEnv && status !== 'D';
        })
        .map(line => line.split(/\s+/).slice(1).join(' ')); // Get just the path for error msg

    if (envFiles.length > 0) {
        error(`Found staged .env files! Please DO NOT commit environment variables.\nStaged files:\n${envFiles.join('\n')}\n\nTo fix this: git reset HEAD ${envFiles[0]} (and confirm they are in .gitignore)`);
    }
} catch (err) {
    // If no git repo or error, just warn
    log(colors.yellow, '⚠️  Could not check staged files (is this a git repo?)');
}


log(colors.green, '✅ No sensitive files found.');

// Check if only documentation files are being committed
try {
    const gitOutput = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    const changedFiles = gitOutput.split('\n').filter(line => line.trim() !== '');

    // Check if all changed files are documentation or config files
    const onlyDocs = changedFiles.every(file =>
        file.endsWith('.md') ||
        file.endsWith('.txt') ||
        file.includes('README') ||
        file.includes('.envSample') ||
        file.includes('.env.example')
    );

    if (onlyDocs && changedFiles.length > 0) {
        log(colors.green, '📝 Only documentation files changed, skipping build checks.');
        log(colors.green, '\n✨ All checks passed! Committing changes...');
        process.exit(0);
    }
} catch (err) {
    // Continue with build checks if we can't determine
}

// 2. Build Backend
log(colors.cyan, '\n🏗️  Building Backend...');
try {
    const backendPath = path.join(__dirname, '..', 'Backend');
    if (fs.existsSync(backendPath)) {
        execSync('npm run build', { cwd: backendPath, stdio: 'inherit' });
        log(colors.green, '✅ Backend build successful.');
    } else {
        log(colors.yellow, '⚠️  Backend directory not found, skipping build.');
    }
} catch (err) {
    error('Backend build failed! Please fix errors before committing.');
}

// 3. Build Frontend
log(colors.cyan, '\n🏗️  Building Frontend...');
try {
    const frontendPath = path.join(__dirname, '..', 'Frontend');
    if (fs.existsSync(frontendPath)) {
        execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
        log(colors.green, '✅ Frontend build successful.');
    } else {
        log(colors.yellow, '⚠️  Frontend directory not found, skipping build.');
    }
} catch (err) {
    error('Frontend build failed! Please fix errors before committing.');
}

log(colors.green, '\n✨ All checks passed! Committing changes...');
