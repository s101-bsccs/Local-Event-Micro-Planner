// This script creates a JSON file with all book cover references
const fs = require('fs');
const path = require('path');

// Complete list of books with their cover images
const bookCovers = [
  // NOVELS (कादंबरी)
  {
    id: "shyamchi-aai",
    title: "श्यामची आई",
    author: "साने गुरुजी",
    coverFile: "shyamchi-aai.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Shyamchi_Aai.jpg/400px-Shyamchi_Aai.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Shyamchi_Aai.jpg/200px-Shyamchi_Aai.jpg",
    description: "आईच्या प्रेमाची अजरामर गाथा",
    category: "कादंबरी"
  },
  {
    id: "kosla",
    title: "कोसला",
    author: "भालचंद्र नेमाडे",
    coverFile: "kosla.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Kosla.jpg/400px-Kosla.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Kosla.jpg/200px-Kosla.jpg",
    description: "मराठी साहित्यातील मैलाचा दगड",
    category: "कादंबरी"
  },
  {
    id: "yayati",
    title: "ययाति",
    author: "वि. स. खांडेकर",
    coverFile: "yayati.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Yayati.jpg/400px-Yayati.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Yayati.jpg/200px-Yayati.jpg",
    description: "ज्ञानपीठ पुरस्कार प्राप्त कादंबरी",
    category: "कादंबरी"
  },
  {
    id: "mrutyunjay",
    title: "मृत्युंजय",
    author: "शिवाजी सावंत",
    coverFile: "mrutyunjay.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mrutyunjay.jpg/400px-Mrutyunjay.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mrutyunjay.jpg/200px-Mrutyunjay.jpg",
    description: "कर्णाच्या जीवनावरील महाकादंबरी",
    category: "कादंबरी"
  },
  {
    id: "batatyachi-chal",
    title: "बटाट्याची चाळ",
    author: "पु. ल. देशपांडे",
    coverFile: "batatyachi-chal.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Batatyachi_Chal.jpg/400px-Batatyachi_Chal.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Batatyachi_Chal.jpg/200px-Batatyachi_Chal.jpg",
    description: "पुलंचा विनोदी संग्रह",
    category: "कादंबरी"
  },

  // HISTORICAL BOOKS (ऐतिहासिक)
  {
    id: "yugant",
    title: "युगान्त",
    author: "इरावती कर्वे",
    coverFile: "yugant.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yugant.jpg/400px-Yugant.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yugant.jpg/200px-Yugant.jpg",
    description: "महाभारताचे विश्लेषण",
    category: "ऐतिहासिक"
  },
  {
    id: "chhava",
    title: "छावा",
    author: "शिवाजी सावंत",
    coverFile: "chhava.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chhava.jpg/400px-Chhava.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chhava.jpg/200px-Chhava.jpg",
    description: "संभाजी महाराजांचे चरित्र",
    category: "ऐतिहासिक"
  },
  {
    id: "swami",
    title: "स्वामी",
    author: "रणजित देसाई",
    coverFile: "swami.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Swami.jpg/400px-Swami.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Swami.jpg/200px-Swami.jpg",
    description: "स्वामी विवेकानंद यांचे जीवनचरित्र",
    category: "ऐतिहासिक"
  },
  {
    id: "sriman-yogi",
    title: "श्रीमान योगी",
    author: "रणजित देसाई",
    coverFile: "sriman-yogi.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sriman_Yogi.jpg/400px-Sriman_Yogi.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sriman_Yogi.jpg/200px-Sriman_Yogi.jpg",
    description: "शिवाजी महाराजांचे चरित्र",
    category: "ऐतिहासिक"
  },
  {
    id: "panipat",
    title: "पानिपत",
    author: "विश्वास पाटील",
    coverFile: "panipat.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Panipat.jpg/400px-Panipat.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Panipat.jpg/200px-Panipat.jpg",
    description: "पानिपतच्या लढाईवरील कादंबरी",
    category: "ऐतिहासिक"
  },

  // POETRY (कविता)
  {
    id: "vishakha",
    title: "विशाखा",
    author: "कुसुमाग्रज",
    coverFile: "vishakha.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Vishakha.jpg/400px-Vishakha.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Vishakha.jpg/200px-Vishakha.jpg",
    description: "कुसुमाग्रजांचा काव्यसंग्रह",
    category: "कविता"
  },
  {
    id: "tukaram-gatha",
    title: "तुकाराम गाथा",
    author: "संत तुकाराम",
    coverFile: "tukaram-gatha.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tukaram_Gatha.jpg/400px-Tukaram_Gatha.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tukaram_Gatha.jpg/200px-Tukaram_Gatha.jpg",
    description: "अभंगांचा संग्रह",
    category: "कविता"
  },
  {
    id: "majhe-vidyapith",
    title: "माझे विद्यापीठ",
    author: "नारायण सुर्वे",
    coverFile: "majhe-vidyapith.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Majhe_Vidyapith.jpg/400px-Majhe_Vidyapith.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Majhe_Vidyapith.jpg/200px-Majhe_Vidyapith.jpg",
    description: "क्रांतिकारी कवितासंग्रह",
    category: "कविता"
  },

  // DRAMA (नाटक)
  {
    id: "natsamrat",
    title: "नटसम्राट",
    author: "कुसुमाग्रज",
    coverFile: "natsamrat.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Natsamrat.jpg/400px-Natsamrat.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Natsamrat.jpg/200px-Natsamrat.jpg",
    description: "अजरामर नाटक",
    category: "नाटक"
  },
  {
    id: "ekach-pyala",
    title: "एकच प्याला",
    author: "राम गणेश गडकरी",
    coverFile: "ekach-pyala.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ekach_Pyala.jpg/400px-Ekach_Pyala.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ekach_Pyala.jpg/200px-Ekach_Pyala.jpg",
    description: "मराठी रंगभूमीवरील प्रसिद्ध नाटक",
    category: "नाटक"
  },
  {
    id: "to-mi-navech",
    title: "तो मी नव्हेच",
    author: "प्र. के. अत्रे",
    coverFile: "to-mi-navech.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/To_Mi_Navech.jpg/400px-To_Mi_Navech.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/To_Mi_Navech.jpg/200px-To_Mi_Navech.jpg",
    description: "विनोदी नाटक",
    category: "नाटक"
  },

  // LALIT (ललित)
  {
    id: "vyakti-ani-valli",
    title: "व्यक्ती आणि वल्ली",
    author: "पु. ल. देशपांडे",
    coverFile: "vyakti-ani-valli.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Vyakti_ani_Valli.jpg/400px-Vyakti_ani_Valli.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Vyakti_ani_Valli.jpg/200px-Vyakti_ani_Valli.jpg",
    description: "पुलंचे ललित लेखन",
    category: "ललित"
  },
  {
    id: "asa-mi-asami",
    title: "असा मी असामी",
    author: "पु. ल. देशपांडे",
    coverFile: "asa-mi-asami.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Asa_Mi_Asami.jpg/400px-Asa_Mi_Asami.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Asa_Mi_Asami.jpg/200px-Asa_Mi_Asami.jpg",
    description: "आत्मचरित्रात्मक लेखन",
    category: "ललित"
  },

  // BIOGRAPHY (चरित्र)
  {
    id: "yogi",
    title: "योगी",
    author: "रणजित देसाई",
    coverFile: "yogi.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yogi.jpg/400px-Yogi.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Yogi.jpg/200px-Yogi.jpg",
    description: "शिवाजी महाराजांचे चरित्र",
    category: "चरित्र"
  },
  {
    id: "lokmanya-tilak",
    title: "लोकमान्य टिळक",
    author: "ग. प्र. प्रधान",
    coverFile: "lokmanya-tilak.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lokmanya_Tilak.jpg/400px-Lokmanya_Tilak.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lokmanya_Tilak.jpg/200px-Lokmanya_Tilak.jpg",
    description: "लोकमान्य टिळकांचे चरित्र",
    category: "चरित्र"
  },
  {
    id: "ambedkar",
    title: "डॉ. बाबासाहेब आंबेडकर",
    author: "डी. के. पाटील",
    coverFile: "ambedkar.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Ambedkar.jpg/400px-Ambedkar.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Ambedkar.jpg/200px-Ambedkar.jpg",
    description: "डॉ. बाबासाहेब आंबेडकर यांचे चरित्र",
    category: "चरित्र"
  },

  // TRAVELOGUE (प्रवासवर्णन)
  {
    id: "vavatal",
    title: "वावटळ",
    author: "व्यंकटेश माडगूळकर",
    coverFile: "vavatal.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Vavatal.jpg/400px-Vavatal.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Vavatal.jpg/200px-Vavatal.jpg",
    description: "ग्रामीण भारताचे चित्रण",
    category: "प्रवासवर्णन"
  },
  {
    id: "bangarwadi",
    title: "बनगरवाडी",
    author: "व्यंकटेश माडगूळकर",
    coverFile: "bangarwadi.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Bangarwadi.jpg/400px-Bangarwadi.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Bangarwadi.jpg/200px-Bangarwadi.jpg",
    description: "ग्रामीण जीवनाचे चित्रण",
    category: "प्रवासवर्णन"
  },

  // Additional Classical Books
  {
    id: "dnyaneshwari",
    title: "ज्ञानेश्वरी",
    author: "ज्ञानेश्वर महाराज",
    coverFile: "dnyaneshwari.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Dnyaneshwari.jpg/400px-Dnyaneshwari.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Dnyaneshwari.jpg/200px-Dnyaneshwari.jpg",
    description: "अध्यात्मिक ग्रंथ",
    category: "धार्मिक"
  },
  {
    id: "dasbodh",
    title: "दासबोध",
    author: "समर्थ रामदास स्वामी",
    coverFile: "dasbodh.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Dasbodh.jpg/400px-Dasbodh.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Dasbodh.jpg/200px-Dasbodh.jpg",
    description: "आध्यात्मिक मार्गदर्शन",
    category: "धार्मिक"
  },
  {
    id: "eknathi-bhagwat",
    title: "एकनाथी भागवत",
    author: "एकनाथ महाराज",
    coverFile: "eknathi-bhagwat.jpg",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Eknathi_Bhagwat.jpg/400px-Eknathi_Bhagwat.jpg",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Eknathi_Bhagwat.jpg/200px-Eknathi_Bhagwat.jpg",
    description: "भागवत पुराणाचे मराठी रूपांतर",
    category: "धार्मिक"
  }
];

// Ensure output directory exists
const outputDir = path.join(__dirname, '../assets/books');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save the cover data to JSON file
const outputPath = path.join(outputDir, 'book-covers.json');
fs.writeFileSync(outputPath, JSON.stringify(bookCovers, null, 2));
console.log(`✅ Generated ${bookCovers.length} book cover references in ${outputPath}`);

// Generate a sample HTML file with all covers
const htmlContent = `<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GranthMitra - Book Covers Gallery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', 'Nirmala UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 2rem;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #8B4513;
            margin-bottom: 0.5rem;
            font-size: 2.5rem;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
        }
        .books-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }
        .book-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .book-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(139, 69, 19, 0.2);
        }
        .book-cover {
            position: relative;
            padding-top: 140%;
            background: #f0f0f0;
            overflow: hidden;
        }
        .book-cover img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .book-card:hover .book-cover img {
            transform: scale(1.05);
        }
        .book-info {
            padding: 1.2rem;
        }
        .book-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.3rem;
        }
        .book-author {
            color: #8B4513;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        .book-description {
            color: #666;
            font-size: 0.8rem;
            line-height: 1.4;
        }
        .category {
            display: inline-block;
            margin-top: 0.5rem;
            padding: 0.2rem 0.6rem;
            background: #f0f0f0;
            border-radius: 20px;
            font-size: 0.7rem;
            color: #8B4513;
        }
        @media (max-width: 768px) {
            body { padding: 1rem; }
            .books-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 ग्रंथमित्र पुस्तक संग्रह</h1>
        <p class="subtitle">\${bookCovers.length}+ मराठी पुस्तकांचे कव्हर</p>
        <div class="books-grid">
            \${bookCovers.map(book => \`
                <div class="book-card">
                    <div class="book-cover">
                        <img src="\${book.coverUrl}" alt="\${book.title}" onerror="this.src='assets/books/default-book-cover.jpg'">
                    </div>
                    <div class="book-info">
                        <h3 class="book-title">\${book.title}</h3>
                        <p class="book-author">✍️ \${book.author}</p>
                        <p class="book-description">\${book.description}</p>
                    </div>
                </div>
            \`).join('')}
        </div>
    </div>
</body>
</html>`;

const htmlPath = path.join(outputDir, 'book-covers-gallery.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log(`✅ Generated cover gallery at ${htmlPath}`);

module.exports = bookCovers;
