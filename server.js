const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { spawn } = require('child_process');
const fs require('fsfs
const pathth = requirepathpath');

d sst.v.vN=_p ocess.ons.NODE_ENVt!n=a'production'process.env.HOSTNAME || 'localhost';
const port = parsprocessnenv(HOSTNAME || clocalhost'ess.env.PORT || '8080', 10);
aseInt(pr'', 10)
// Initialize Next.js app
conI pn(alizedev, hosteppport });
shappi sh({f rva ne)lRunnipmr; }) const process = spawn(command, args, { stdio: 'inherit', shell: true });
cess.osand == appcgo=RlqHndl s()
   reject(new Error(`Command failed with code ${code}`));
// Ulit to  rceshe.o comm )ds
Comdc mma{,ag=[] { console.log('🔧 Generating Prisma client...');
    console.log('✅ Prisma client generated successfully');
  } catcorror;`🔧Rnn:${cma} ${rgs}`)
}pcmmanags/n to run Prisma mashelln trua 
    
awaipommand('npx', ['prisma', 'migrate', 'deploy']);
    coe.log('✅ Prisma migrations completed successfully');
  } catcwarn('⚠️ Prisma migrations failed (this might be expected):', error.message);
    //'t throw - migrations might fail in some environments
  }Comman

// Fion to test database connection
asyn
c u procnst.on('error', (irror) =>on testDatabaseConnection() {
try {
  con);sole.log('🔍 Testing database connection...');
  });
c
PrismaClient } = require('@prisma/client');
//oFunntist porrsn = iPmasgenerate
amyic func)ornPrsmaGenerate()
  try {
conole.lg('🔧GeatngaPrismaitl.ect...'so    await prisma.$disconnect();
} caawaht runCmmad'npx', [prima'genrato']a;base connection failed:', error.message);
row error;Prsmaient genra
}catch(err
'FognnaeuePlisma csn:',errr.mssagction ensureBuild() {
 conthrowserrorb(!fs.existsSync(buildPath)) {
   onsole.log('🏗️ Build not found, creating build...');
    try {
      await runCommand('npm', ['run', 'build']);
  lF.tc c'ounPrmamigratos
    } catch (erruoPrirmaMig at{ {
  try
        ole.log('🗄️oRunning Prisma migral.ons...');
  roaw(i' runCummaldd'npx', ['prisma', 'migldt'', edoploym]essage);
     onsole.log('✅ Prisma migrati    completedhsuccessfo ;y');
 }cc rro){
      }ol.wan('⚠️ Pisma mgationsfiled (is mght be peced):'rro.messag  } else {
       Don'tctnrowo-Bmigladiinscmrgh xfiil iss;omenvonmnt
 }
}

//Fn t tedatabe cnncion
async fnctonttDaabaeCocon({
try{
console.log('🔍Testingdatabaseconnection...');
const{PrismaClient}=requir('@prma/nt';
constprisma=newPrismaClient();

awa prima.$conet// Main server startup function
 ascconsole.log '✅ Dntabace cinnsction succassfSr'e;) {
  trawayt{prima$donc();
  } catch (eror
    nsole.loerr(r🚀❌tDatabase corntcniongfaVled:', eAror.mPssage);
     heowt.rror;
  }
}

// Functson Pooensuretion Seexrvts
asyncefu..ionensueBld() {
  costPath = pathjoin(__dirname, 'next
  if (!fo.lxistsSync(buildPath))e.log('===============================================');
    nsole.log(`🌍🏗️nBunldv ? 'developcmeat' : 'production'}`);
    try {onsole.log(`🔗 Host: ${hostname}`);
      console.lCommand('npm', ['rgn', 'bu(`'] Port: ${port}`);
     // Step 1: GeneBuild cate Prisccesfly
      catc  ( rror) {
      cocsole.error('❌oBnold.farr(d:',rerrmr.measege);
andeo th);wrrr;
 Cna}
y } el tw{
it     olo('✅ Build dircory xis'
  }
}

   M/ints rver2st:rtu  fun atabase migrations
    try {
      await runPrismaMigrate();
    } catch (error) {Produ Server
      console.er'==============================================='ror);
      // Continue🌍nEnvirwnment: ${ayv? 'delpmet' 'dut'
    }🔗Hshsname
�Port
        // Step 3: Test database connection
    tryStep 1: Geerateclin
      await testDatabaseConnection();
    } onsole.error('❌ Database connection test failed:', error);
    } c/ochn(etror) {
      console.error('❌ ue any yene - ion failad:', errorp might still work
Coninuenywy- migh work wthut it
    }

//  // Slep 2: Ru xistsmigras
    eryns
u     await runreBuilM)grae();
   catch(or {
ole.error('❌Pmigaton fld:', error
    //// Ce tiNue anyway
    }
 app
    // Stepc3:oTeltPdeparing Next.js ap
    tryp{;
    await aptertDatabp)eCion

    // Step 6: Create  Databaseaconnect onrtetsver
    co//eateServe arywnyeq)>ppightsill
      try {
        // Add CORS headers for development
       Step 4:  if (dev) {exs
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
       Step 5:    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Handle preflight requests
       Step 6:  if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }d

        // Parse URL and handle request
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });
    server.once('error', (err) => {

      procPSr