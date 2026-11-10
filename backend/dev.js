const { spawn, execSync } = require('child_process');
const path = require('path');

console.log('🌿 [BOTANIQUE Backend] Initializing development environment...');

const isWin = process.platform === 'win32';

// 1. Initial build to guarantee dist/ exists
try {
  console.log('📦 Compiling TypeScript with native tsc...');
  execSync(isWin ? 'cmd.exe /c npx tsc' : 'npx tsc', { cwd: __dirname, stdio: 'inherit' });
} catch (err) {
  console.error('Initial compilation note:', err.message);
}

// 2. Start TypeScript watcher in background
console.log('👀 Starting TypeScript watcher...');
const tsc = isWin
  ? spawn('cmd.exe', ['/c', 'npx', 'tsc', '--watch', '--preserveWatchOutput'], {
      stdio: 'inherit',
      cwd: __dirname,
    })
  : spawn('npx', ['tsc', '--watch', '--preserveWatchOutput'], {
      stdio: 'inherit',
      cwd: __dirname,
    });

// 3. Start Express server with Node built-in watch mode
console.log('🚀 Starting Express API server (node --watch dist/server.js)...');
const server = spawn(process.execPath, ['--watch', 'dist/server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
});

// Graceful cleanup
const cleanExit = () => {
  try { tsc.kill(); } catch (e) {}
  try { server.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
