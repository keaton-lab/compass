const { spawn } = require('child_process');

const requestedTarget = process.argv[2] === 'static' ? 'static' : 'server';
const target = process.env.COMPASS_BUILD_TARGET || requestedTarget;
const devServer = spawn('next', ['dev', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    COMPASS_BUILD_TARGET: target,
  },
});

devServer.on('exit', (code) => {
  process.exit(code ?? 0);
});
