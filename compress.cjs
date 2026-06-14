const sharp = require('sharp');
sharp('public/assets/dotzeroai/logo 1.png')
  .resize(200)
  .webp({ quality: 80 })
  .toBuffer()
  .then(b => {
    require('fs').writeFileSync('src/logoBase64.js', "export const logoBase64 = 'data:image/webp;base64," + b.toString('base64') + "';");
    console.log('Done');
  });
