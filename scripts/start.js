const { spawn } = require('child_process');

const serverProcess = spawn('next', ['start', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    COMPASS_BUILD_TARGET: 'server',
  },
});

serverProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
