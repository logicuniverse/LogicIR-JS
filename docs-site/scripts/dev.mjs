import { watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncContent } from './sync-content.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(siteDir, '..');

const watchTargets = [
  'docs',
  'dev',
  'ai',
];

let syncTimer;
let syncInFlight = false;
let syncQueued = false;

async function runSync(reason) {
  if (syncInFlight) {
    syncQueued = true;
    return;
  }

  syncInFlight = true;
  try {
    if (reason) {
      console.log(`Docs source changed: ${reason}`);
    }
    await syncContent();
  } catch (error) {
    console.error(error);
  } finally {
    syncInFlight = false;
    if (syncQueued) {
      syncQueued = false;
      await runSync('queued changes');
    }
  }
}

function scheduleSync(reason) {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void runSync(reason);
  }, 100);
}

async function startWatcher(targetRel) {
  const targetPath = path.join(repoRoot, targetRel);
  const targetStat = await stat(targetPath);
  const options = targetStat.isDirectory() ? { recursive: true } : {};

  try {
    const watcher = watch(targetPath, options, (_event, filename) => {
      const changed = filename ? path.join(targetRel, filename.toString()) : targetRel;
      if (changed.includes('.generated') || changed.includes('.vitepress')) {
        return;
      }
      scheduleSync(changed);
    });

    watcher.on('error', (error) => {
      console.error(`Docs watcher failed for ${targetRel}:`, error);
    });
  } catch (error) {
    console.error(`Could not watch ${targetRel}:`, error);
  }
}

function startVitePress() {
  const args = ['vitepress', 'dev', 'docs-site', ...process.argv.slice(2)];
  const child = spawn('yarn', args, {
    cwd: repoRoot,
    shell: true,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

await runSync();
await Promise.all(watchTargets.map((target) => startWatcher(target)));
startVitePress();
