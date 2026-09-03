import fs from 'fs';
import path from 'path';
import https from 'https';

const items = [
  { url: 'https://lusion.co/tunnels/desktop.png', dest: 'public/assets/images/tunnel-desktop.png' },
  { url: 'https://lusion.co/assets/videos/reel/desktop.mp4', dest: 'public/assets/videos/reel-desktop.mp4' },
  { url: 'https://lusion.co/assets/meta/social_sharing.jpg', dest: 'public/assets/images/social_sharing.jpg' }
];

function download(url, dest) {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log('Downloaded:', dest); resolve(true); });
      } else {
        file.close(); fs.unlink(dest, () => {}); console.warn(`Failed (${res.statusCode}):`, url); resolve(false);
      }
    }).on('error', () => { file.close(); fs.unlink(dest, () => {}); resolve(false); });
  });
}

async function run() {
  for (const item of items) {
    await download(item.url, item.dest);
  }
}
run();
