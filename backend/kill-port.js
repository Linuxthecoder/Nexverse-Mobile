#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    console.log(`🔍 Looking for processes on port ${port}...`);
    
    // For Windows
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.includes(':' + port));
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        });
        
        if (pids.size > 0) {
          console.log(`📋 Found ${pids.size} process(es) using port ${port}`);
          for (const pid of pids) {
            try {
              await execAsync(`taskkill /F /PID ${pid}`);
              console.log(`✅ Killed process ${pid}`);
            } catch (error) {
              console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
            }
          }
        } else {
          console.log(`✅ No processes found on port ${port}`);
        }
      } else {
        console.log(`✅ No processes found on port ${port}`);
      }
    } else {
      // For Unix-like systems
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        if (stdout.trim()) {
          const pids = stdout.trim().split('\n');
          console.log(`📋 Found ${pids.length} process(es) using port ${port}`);
          
          for (const pid of pids) {
            try {
              await execAsync(`kill -9 ${pid}`);
              console.log(`✅ Killed process ${pid}`);
            } catch (error) {
              console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
            }
          }
        } else {
          console.log(`✅ No processes found on port ${port}`);
        }
      } catch (error) {
        console.log(`✅ No processes found on port ${port}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
};

const port = process.argv[2] || 5001;
killPort(port);
