#!/usr/bin/env node

/**
 * Verify that the logs route file is correctly fixed
 */

const fs = require('fs');
const path = require('path');

function verifyLogsFile() {
  console.log('🔍 Verifying Analytics Logs Route Fix');
  console.log('=====================================');

  const filePath = path.join(__dirname, 'src/app/api/analytics/logs/route.ts');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find all lines that declare 'now'
    const nowDeclarations = [];
    lines.forEach((line, index) => {
      if (line.includes('const now') || line.includes('let now')) {
        nowDeclarations.push({
          lineNumber: index + 1,
          content: line.trim()
        });
      }
    });

    console.log(`📄 File: ${filePath}`);
    console.log(`📏 Total lines: ${lines.length}`);
    console.log(`🔍 'now' declarations found: ${nowDeclarations.length}`);
    
    if (nowDeclarations.length === 0) {
      console.log('❌ No "now" declarations found - this might be an issue');
    } else if (nowDeclarations.length === 1) {
      console.log('✅ Exactly one "now" declaration found - CORRECT!');
      console.log(`   Line ${nowDeclarations[0].lineNumber}: ${nowDeclarations[0].content}`);
    } else {
      console.log('❌ Multiple "now" declarations found - PROBLEM!');
      nowDeclarations.forEach(decl => {
        console.log(`   Line ${decl.lineNumber}: ${decl.content}`);
      });
    }

    // Check for usage of 'now' variable
    const nowUsages = [];
    lines.forEach((line, index) => {
      if (line.includes('now.getTime()') || (line.includes('now') && !line.includes('const now') && !line.includes('let now') && !line.includes('// '))) {
        nowUsages.push({
          lineNumber: index + 1,
          content: line.trim()
        });
      }
    });

    console.log(`🔍 'now' usages found: ${nowUsages.length}`);
    if (nowUsages.length > 0) {
      console.log('   Usage locations:');
      nowUsages.forEach(usage => {
        console.log(`   Line ${usage.lineNumber}: ${usage.content}`);
      });
    }

    // Verify the specific problematic area around line 131
    console.log('\n🎯 Content around line 131:');
    for (let i = 128; i <= 138; i++) {
      if (lines[i - 1]) {
        const marker = i === 131 ? ' >>> ' : '     ';
        console.log(`${marker}${i}: ${lines[i - 1]}`);
      }
    }

    console.log('\n💡 Recommendations:');
    if (nowDeclarations.length === 1) {
      console.log('✅ File structure is correct');
      console.log('🔄 Try these steps to resolve browser cache issues:');
      console.log('   1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)');
      console.log('   2. Clear browser cache and reload');
      console.log('   3. Restart the Next.js development server');
      console.log('   4. Delete .next folder and restart: rm -rf .next && npm run dev');
    } else {
      console.log('❌ File needs to be fixed - multiple "now" declarations found');
    }

  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}

verifyLogsFile();
