const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Force production mode for Azure
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Utility function to run shell commands
async function runCommand(command, args = []) {
  console.log(`🔧 Running: ${command} ${args.join(' ')}`);
  
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', shell: true });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to run Prisma setup
async function setupPrisma() {
  console.log('🗄️ Setting up Prisma database...');
  
  try {
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);
    console.log('✅ Prisma client generated successfully');
    
    // Run migrations (if any)
    try {
      await runCommand('npx', ['prisma', 'migrate', 'deploy']);
      console.log('✅ Prisma migrations completed successfully');
    } catch (error) {
      console.warn('⚠️ Prisma migrations failed (this might be expected):', error.message);
      // Don't throw - migrations might fail in some environments
    }
    
    // Push schema to database
    console.log('🔧 Pushing database schema...');
    await runCommand('npx', ['prisma', 'db', 'push', '--accept-data-loss']);
    console.log('✅ Database schema pushed successfully');
    
  } catch (error) {
    console.error('❌ Prisma setup failed:', error.message);
    console.log('⚠️ Continuing with app startup despite Prisma setup issues...');
    // Don't throw - continue with app startup
  }
}

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

// Check if build is needed (if .next directory doesn't exist or is incomplete)
async function ensureBuild() {
  const nextDir = path.join(__dirname, '.next');
  const buildIdFile = path.join(nextDir, 'BUILD_ID');
  const serverDir = path.join(nextDir, 'server');

  // Check if .next directory exists and has required files for production
  const hasCompleteBuild = fs.existsSync(nextDir) &&
                           fs.existsSync(buildIdFile) &&
                           fs.existsSync(serverDir);

  if (!hasCompleteBuild) {
    if (fs.existsSync(nextDir)) {
      console.log('🔨 .next directory exists but build is incomplete, running build...');
    } else {
      console.log('🔨 .next directory not found, running build...');
    }
    await runBuild();
  } else {
    console.log('✅ Complete .next build found, skipping build');
  }
}

// Start the application
async function startServer() {
  try {
    console.log('🚀 Starting VAPI Next.js application...');
    console.log(`📍 Working directory: ${__dirname}`);
    console.log(`🔧 Node version: ${process.version}`);
    console.log(`🌐 Port: ${port}`);
    console.log(`🎯 Environment: ${dev ? 'development' : 'production'}`);

    // CRITICAL: Setup Prisma database first
    await setupPrisma();

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