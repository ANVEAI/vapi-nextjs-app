const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Force production mode for Azure
const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 8080;

// Function to find Next.js binary
function findNextBinary() {
  const possiblePaths = [
    './node_modules/.bin/next',
    '/node_modules/.bin/next',
    path.join(__dirname, 'node_modules', '.bin', 'next'),
    path.join(__dirname, '..', 'node_modules', '.bin', 'next')
  ];

  for (const binPath of possiblePaths) {
    if (fs.existsSync(binPath)) {
      console.log(`Found Next.js binary at: ${binPath}`);
      return binPath;
    }
  }

  console.log('Next.js binary not found in expected locations');
  return null;
}

// Function to run Next.js build
function runBuild() {
  return new Promise((resolve, reject) => {
    const nextBin = findNextBinary();
    if (!nextBin) {
      console.log('Attempting to build using node_modules/next/dist/bin/next');
      const nextScript = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
      if (fs.existsSync(nextScript)) {
        const buildProcess = spawn('node', [nextScript, 'build'], {
          stdio: 'inherit',
          cwd: __dirname
        });

        buildProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Build completed successfully');
            resolve();
          } else {
            console.error(`❌ Build failed with code ${code}`);
            reject(new Error(`Build failed with code ${code}`));
          }
        });
      } else {
        reject(new Error('Could not find Next.js binary or script'));
      }
    } else {
      const buildProcess = spawn(nextBin, ['build'], {
        stdio: 'inherit',
        cwd: __dirname
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Build completed successfully');
          resolve();
        } else {
          console.error(`❌ Build failed with code ${code}`);
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    }
  });
}

// Check if build is needed (if .next directory doesn't exist)
async function ensureBuild() {
  const nextDir = path.join(__dirname, '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('🔨 .next directory not found, running build...');
    await runBuild();
  } else {
    console.log('✅ .next directory exists, skipping build');
  }
}

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, dir: '.' });
const handle = app.getRequestHandler();

// Start the application
async function startServer() {
  try {
    console.log('🚀 Starting VAPI Next.js application...');
    console.log(`📍 Working directory: ${__dirname}`);
    console.log(`🔧 Node version: ${process.version}`);
    console.log(`🌐 Port: ${port}`);

    // Ensure build is complete
    await ensureBuild();

    // Prepare Next.js app
    console.log('⚙️ Preparing Next.js application...');
    await app.prepare();

    // Create and start server
    const server = createServer(async (req, res) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    server.once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });

    server.listen(port, hostname, () => {
      console.log(`✅ Server ready on http://${hostname}:${port}`);
      console.log(`🎯 Environment: ${dev ? 'development' : 'production'}`);
      console.log(`📦 Next.js version: ${require('next/package.json').version}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
