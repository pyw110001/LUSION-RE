import fs from 'fs';
import path from 'path';
import https from 'https';

const projects = [
  'oryzo_ai',
  'atlas_motion',
  'devin_ai',
  'of_the_oak',
  'everswap',
  'porsche_dream_machine',
  'synthetic_human',
  'spatial_fusion',
  'spaace',
  'ddd_2024',
  'choo_choo_world',
  'soda_experience'
];

const baseDir = path.resolve('public/assets/projects');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${dest}`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.warn(`Failed (${res.statusCode}): ${url}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.warn(`Error on ${url}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const id of projects) {
    const dir = path.join(baseDir, id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const url = `https://lusion.co/assets/projects/${id}/home.webp`;
    const dest = path.join(dir, 'home.webp');
    if (!fs.existsSync(dest)) {
      await downloadFile(url, dest);
    }
  }

  // Also download showreel video or thumbnail if available
  const reelDir = path.resolve('public/assets/videos');
  if (!fs.existsSync(reelDir)) fs.mkdirSync(reelDir, { recursive: true });
  console.log('Finished project downloads!');
}

run();
