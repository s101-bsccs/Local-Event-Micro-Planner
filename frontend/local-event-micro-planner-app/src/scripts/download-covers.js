const https = require('https');
const fs = require('fs');
const path = require('path');

const covers = [
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Shyamchi_Aai.jpg/400px-Shyamchi_Aai.jpg", filename: "shyamchi-aai.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Kosla.jpg/400px-Kosla.jpg", filename: "kosla.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Yayati.jpg/400px-Yayati.jpg", filename: "yayati.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mrutyunjay.jpg/400px-Mrutyunjay.jpg", filename: "mrutyunjay.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Batatyachi_Chal.jpg/400px-Batatyachi_Chal.jpg", filename: "batatyachi-chal.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yugant.jpg/400px-Yugant.jpg", filename: "yugant.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chhava.jpg/400px-Chhava.jpg", filename: "chhava.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Swami.jpg/400px-Swami.jpg", filename: "swami.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sriman_Yogi.jpg/400px-Sriman_Yogi.jpg", filename: "sriman-yogi.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Panipat.jpg/400px-Panipat.jpg", filename: "panipat.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Vishakha.jpg/400px-Vishakha.jpg", filename: "vishakha.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tukaram_Gatha.jpg/400px-Tukaram_Gatha.jpg", filename: "tukaram-gatha.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Majhe_Vidyapith.jpg/400px-Majhe_Vidyapith.jpg", filename: "majhe-vidyapith.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Natsamrat.jpg/400px-Natsamrat.jpg", filename: "natsamrat.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ekach_Pyala.jpg/400px-Ekach_Pyala.jpg", filename: "ekach-pyala.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/To_Mi_Navech.jpg/400px-To_Mi_Navech.jpg", filename: "to-mi-navech.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Vyakti_ani_Valli.jpg/400px-Vyakti_ani_Valli.jpg", filename: "vyakti-ani-valli.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Asa_Mi_Asami.jpg/400px-Asa_Mi_Asami.jpg", filename: "asa-mi-asami.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yogi.jpg/400px-Yogi.jpg", filename: "yogi.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lokmanya_Tilak.jpg/400px-Lokmanya_Tilak.jpg", filename: "lokmanya-tilak.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Ambedkar.jpg/400px-Ambedkar.jpg", filename: "ambedkar.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Vavatal.jpg/400px-Vavatal.jpg", filename: "vavatal.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Bangarwadi.jpg/400px-Bangarwadi.jpg", filename: "bangarwadi.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Dnyaneshwari.jpg/400px-Dnyaneshwari.jpg", filename: "dnyaneshwari.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Dasbodh.jpg/400px-Dasbodh.jpg", filename: "dasbodh.jpg" },
  { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Eknathi_Bhagwat.jpg/400px-Eknathi_Bhagwat.jpg", filename: "eknathi-bhagwat.jpg" }
];

const downloadDir = path.join(__dirname, '../assets/books/covers');

// Create directory if it doesn't exist
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

let downloaded = 0;
let failed = 0;

covers.forEach((cover, index) => {
  const filePath = path.join(downloadDir, cover.filename);
  
  // Add a small delay between downloads to avoid throttling
  setTimeout(() => {
    const file = fs.createWriteStream(filePath);
    
    https.get(cover.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          downloaded++;
          console.log(`✅ [${downloaded + failed}/${covers.length}] Downloaded: ${cover.filename}`);
        });
      } else {
        fs.unlink(filePath, (err) => {
          if (err) console.error(err);
          failed++;
          console.log(`⚠️  [${downloaded + failed}/${covers.length}] Skipped: ${cover.filename} (HTTP ${response.statusCode})`);
        });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error(unlinkErr);
        failed++;
        console.log(`❌ [${downloaded + failed}/${covers.length}] Error downloading ${cover.filename}: ${err.message}`);
      });
    });
  }, index * 500); // 500ms delay between each download
});

console.log('📥 Starting download of book covers...');
console.log(`ℹ️  Total covers to download: ${covers.length}`);
console.log(`📁 Destination: ${downloadDir}`);
