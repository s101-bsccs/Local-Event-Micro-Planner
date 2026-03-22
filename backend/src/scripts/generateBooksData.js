const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');

dotenv.config();

// Synthetic large-catalog generator for demo/testing only.
const authors = [
  'ज्ञानेश्वर महाराज', 'एकनाथ महाराज', 'तुकाराम महाराज', 'समर्थ रामदास स्वामी',
  'वि. स. खांडेकर', 'शिवाजी सावंत', 'पु. ल. देशपांडे', 'साने गुरुजी',
  'व्यंकटेश माडगूळकर', 'कुसुमाग्रज', 'इरावती कर्वे', 'रणजित देसाई',
  'भालचंद्र नेमाडे', 'विश्वास पाटील', 'द. मा. मिरासदार', 'स. ना. पेंडसे',
  'मालती बेडेकर', 'विद्या बाळ', 'शांता शेळके', 'मंगेश पाडगावकर',
  'विंदा करंदीकर', 'नारायण सुर्वे', 'दुर्गा भागवत', 'लक्ष्मण गायकवाड',
  'मेधा पाटकर', 'वैशाली चौधरी', 'मिलिंद बोकील', 'अरुण साधू'
];

const genres = [
  'कादंबरी', 'लघुकथा', 'कथा संग्रह', 'नाटक', 'विनोदी', 'रोमान्स', 'थ्रिलर',
  'रहस्य', 'भयपट', 'विज्ञान कथा', 'साहस', 'ऐतिहासिक कादंबरी', 'सामाजिक कादंबरी',
  'ग्रामीण कादंबरी', 'मनोवैज्ञानिक', 'चरित्र', 'आत्मचरित्र', 'प्रवासवर्णन',
  'संस्मरण', 'निबंध', 'तत्त्वज्ञान', 'अध्यात्म', 'इतिहास', 'राजकारण',
  'विज्ञान', 'शिक्षण', 'आरोग्य', 'योग', 'कविता', 'अभंग', 'गझल',
  'बालसाहित्य', 'बालकथा', 'किशोर साहित्य', 'संशोधन', 'संदर्भ', 'शब्दकोश',
  'साहित्य समीक्षा', 'क्रीडा', 'पाककला'
];

const titles = {
  classical: ['ज्ञानेश्वरी', 'अमृतानुभव', 'तुकाराम गाथा', 'दासबोध', 'एकनाथी भागवत'],
  modern: ['ययाति', 'मृत्युंजय', 'छावा', 'कोसला', 'श्यामची आई', 'बटाट्याची चाळ', 'स्वामी', 'युगान्त', 'बनगरवाडी'],
  abstractPrefix: ['अनंत', 'अजर', 'अमर', 'अद्भुत', 'सुगंधी', 'सावळे', 'आभाळी', 'उजळ'],
  abstractSuffix: ['कथा', 'प्रवास', 'संवाद', 'वार्ता', 'संग्रह', 'गाथा', 'यात्रा', 'स्वर']
};

function slugify(value) {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function createTitle(index) {
  const roll = Math.random();
  if (roll < 0.25) {
    return `${titles.classical[index % titles.classical.length]} ${Math.floor(index / titles.classical.length) + 1}`;
  }
  if (roll < 0.6) {
    return `${titles.modern[index % titles.modern.length]} ${Math.floor(index / titles.modern.length) + 1}`;
  }
  return `${titles.abstractPrefix[index % titles.abstractPrefix.length]} ${titles.abstractSuffix[(index * 3) % titles.abstractSuffix.length]} ${index + 1}`;
}

function generateBooks(count) {
  const startYear = 1850;
  const currentYear = new Date().getFullYear();
  const publishers = [
    'कॉन्टिनेन्टल प्रकाशन',
    'मेहता पब्लिशिंग हाऊस',
    'राजहंस प्रकाशन',
    'साकेत प्रकाशन',
    'अनंत प्रकाशन',
    'शब्द प्रकाशन',
    'साहित्य प्रकाशन'
  ];
  const books = [];

  for (let i = 0; i < count; i += 1) {
    const author = authors[i % authors.length];
    const title = createTitle(i);
    const genreCount = (i % 3) + 1;
    const bookGenres = Array.from(
      new Set(Array.from({ length: genreCount }, (_, offset) => genres[(i + offset * 7) % genres.length]))
    );
    const publishYear = startYear + (i % (currentYear - startYear + 1));
    const pages = 80 + (i % 720);
    const rating = Number((3.5 + ((i % 16) / 10)).toFixed(1));
    const identifier = `${slugify(title)}-${i + 1}`;
    const hasPdf = i % 10 < 7;

    books.push({
      title,
      author,
      authorId: slugify(author),
      description: `${title} हे ${author} यांचे ${bookGenres.join(', ')} प्रकारातील सिंथेटिक डेमो पुस्तक नोंद आहे.`,
      longDescription: `${title} हे ग्रंथमित्रसाठी मोठा डेमो कॅटलॉग तयार करण्यासाठी निर्माण केलेले कृत्रिम पुस्तक नोंद आहे. यात ${bookGenres.join(', ')} या शैलींचा समावेश आहे.`,
      coverImage: `https://placehold.co/400x600?text=${encodeURIComponent(title)}`,
      genre: bookGenres,
      language: 'मराठी',
      publishYear,
      publisher: publishers[i % publishers.length],
      pages,
      isbn: `978-81-${String(1000 + (i % 9000))}-${String(100 + (i % 900))}-${i % 10}`,
      isbn10: `81-${String(1000 + (i % 9000))}-${String(100 + (i % 900))}`,
      edition: `${(i % 10) + 1}वी आवृत्ती`,
      rating,
      totalRatings: 10 + (i % 5000),
      views: 100 + (i * 13),
      status: i % 5 === 0 ? 'pending' : 'published',
      tags: [...bookGenres.map((genre) => genre.replace(/\s+/g, '')), author.replace(/\s+/g, '')],
      pdfUrl: hasPdf ? `https://example.invalid/books/${identifier}.pdf` : null,
      pdfLocalPath: hasPdf ? `/books/${identifier}.pdf` : null,
      downloadCount: hasPdf ? (i * 7) % 5000 : 0,
      source: hasPdf ? 'synthetic-demo' : null,
      license: hasPdf ? 'Demo Only' : null,
      format: ['Hardcover', 'Paperback', 'eBook'][i % 3],
      formats: ['Hardcover', 'Paperback', 'eBook'].slice(0, (i % 3) + 1),
      price: {
        paperback: 150 + (i % 450),
        hardcover: 300 + (i % 700),
        ebook: 50 + (i % 200)
      },
      awards: i % 20 === 0 ? ['डेमो साहित्य पुरस्कार'] : [],
      availability: hasPdf ? 'In Stock' : 'Limited Stock'
    });
  }

  return books;
}

async function generateAndSaveBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granthmitra');
    console.log('Connected to MongoDB');

    const existingCount = await Book.countDocuments();
    if (existingCount >= 10000) {
      console.log(`Already have ${existingCount} books`);
      return;
    }

    const needed = 10000 - existingCount;
    const books = generateBooks(needed);
    const batchSize = 250;

    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize);
      await Book.insertMany(batch, { ordered: false });
      console.log(`Saved ${Math.min(i + batch.length, books.length)} / ${books.length}`);
    }

    console.log(`Finished. Total books: ${await Book.countDocuments()}`);
  } catch (error) {
    console.error(`Generator failed: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
}

generateAndSaveBooks();
