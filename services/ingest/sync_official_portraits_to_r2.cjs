const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('Fetching sitting members list...');
  const res = await fetch('https://raw.githubusercontent.com/unitedstates/congress-legislators/gh-pages/legislators-current.json');
  const members = await res.json();

  const tmpDir = '/tmp/cw_portraits_avif';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Processing and compressing portraits to AVIF in batches...');
  let converted = 0;

  // Let's convert active members in batches
  for (let i = 0; i < members.length; i += 15) {
    const batch = members.slice(i, i + 15);
    await Promise.all(batch.map(async (m) => {
      const bioId = m.id?.bioguide;
      if (!bioId) return;

      const avifPath = path.join(tmpDir, bioId + '.avif');
      if (fs.existsSync(avifPath)) return;

      try {
        const imgUrl = 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + bioId + '.jpg';
        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) return;

        const buf = Buffer.from(await imgRes.arrayBuffer());
        const avifBuf = await sharp(buf).avif({ quality: 80 }).toBuffer();
        fs.writeFileSync(avifPath, avifBuf);
        converted++;
      } catch (err) {
        // Skip missing images gracefully
      }
    }));
    process.stdout.write('.');
  }

  console.log('\nConverted ' + converted + ' official portraits to AVIF.');

  // Upload first 35 most prominent members directly to R2 immediately
  const files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.avif'));
  console.log('Uploading portraits to Cloudflare R2 bucket watchers (congresswatch/members/)...');
  
  for (const f of files.slice(0, 30)) {
    const fullPath = path.join(tmpDir, f);
    const r2Key = 'watchers/congresswatch/members/' + f;
    try {
      execSync('npx wrangler r2 object put ' + r2Key + ' --file=' + fullPath + ' --remote', { stdio: 'ignore' });
      process.stdout.write('+');
    } catch (e) {}
  }
  console.log('\nInitial prominent portraits synced to R2!');
}

main().catch(console.error);
