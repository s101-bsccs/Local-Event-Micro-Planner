import csv
import random
from datetime import datetime, timedelta


BOOK_AUTHORS = [
    "ज्ञानेश्वर महाराज", "एकनाथ महाराज", "तुकाराम महाराज", "समर्थ रामदास स्वामी",
    "वि. स. खांडेकर", "शिवाजी सावंत", "पु. ल. देशपांडे", "साने गुरुजी",
    "व्यंकटेश माडगूळकर", "कुसुमाग्रज", "इरावती कर्वे", "रणजित देसाई",
    "भालचंद्र नेमाडे", "अरुण साधू", "विश्वास पाटील", "द. मा. मिरासदार"
]

GENRES = [
    "कादंबरी", "ऐतिहासिक", "कविता", "नाटक", "ललित", "चरित्र", "प्रवासवर्णन",
    "विज्ञान", "धार्मिक", "शैक्षणिक", "बालसाहित्य", "विनोदी", "अनुवादित",
    "अभंग", "लघुकथा", "थ्रिलर", "रहस्य", "तत्त्वज्ञान", "इतिहास"
]

PUBLISHERS = [
    "कॉन्टिनेन्टल प्रकाशन", "मेहता प्रकाशन", "राजहंस प्रकाशन", "साहित्य प्रकाशन", "मौज प्रकाशन"
]

USER_FIRST_NAMES = [
    "राजेश", "स्नेहा", "अमोल", "प्रिया", "मनोहर", "सुनील", "अनुराधा", "विश्वास",
    "मिलिंद", "श्रीकांत", "संदीप", "माधुरी", "निलेश", "अर्चना", "हेमंत",
    "वैशाली", "प्रसाद", "सुप्रिया", "गणेश", "रोहिणी"
]

USER_LAST_NAMES = [
    "पाटील", "जोशी", "देशमुख", "शिंदे", "कुलकर्णी", "गावडे", "सोनवणे", "पवार",
    "मोरे", "चौधरी", "शेटे", "भोसले", "माळी", "जाधव", "चव्हाण", "निकम"
]

CITIES = ["पुणे", "मुंबई", "नागपूर", "कोल्हापूर", "औरंगाबाद", "नाशिक", "सांगली", "सोलापूर"]


def generate_books_csv(filename, count=10000):
    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            "book_id", "title", "title_marathi", "author", "author_id", "description",
            "genre", "language", "publish_year", "publisher", "pages", "isbn", "rating",
            "total_ratings", "views", "status", "pdf_url", "cover_image", "tags",
            "download_count", "license", "price_paperback", "price_hardcover",
            "price_ebook", "format"
        ])

        for index in range(1, count + 1):
            author = random.choice(BOOK_AUTHORS)
            author_id = author.replace(" ", "_")
            selected_genres = random.sample(GENRES, random.randint(1, 3))
            rating = round(random.uniform(3.5, 5.0), 1)

            writer.writerow([
                index,
                f"पुस्तक {index}",
                f"Book {index}",
                author,
                author_id,
                f"मराठी साहित्यातील महत्त्वपूर्ण पुस्तक. {author} यांनी लिहिलेले हे पुस्तक वाचकांना आवडेल.",
                "|".join(selected_genres),
                "मराठी",
                random.randint(1850, datetime.now().year),
                random.choice(PUBLISHERS),
                random.randint(80, 900),
                f"978-81-{random.randint(10000, 99999)}-{random.randint(100, 999)}-{random.randint(1, 9)}",
                rating,
                random.randint(10, 50000),
                random.randint(100, 100000),
                "published" if random.random() > 0.2 else "pending",
                f"https://granthmitra-books.s3.amazonaws.com/book_{index}.pdf" if random.random() > 0.3 else "",
                f"assets/books/book_{(index % 100) + 1}.jpg",
                "|".join(selected_genres),
                random.randint(0, 5000),
                random.choice(["CC BY-SA 4.0", "Public Domain", "Copyright"]),
                random.randint(150, 500),
                random.randint(300, 800),
                random.randint(50, 200),
                "|".join(random.sample(["Paperback", "Hardcover", "eBook"], random.randint(1, 3)))
            ])

            if index % 1000 == 0:
                print(f"Generated {index} books...")


def generate_authors_csv(filename, count=5000):
    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            "author_id", "name", "name_marathi", "birth_year", "death_year", "birthplace",
            "books_count", "bio", "famous_works", "awards", "status", "image_url"
        ])

        for index in range(1, count + 1):
            name = f"{random.choice(USER_FIRST_NAMES)} {random.choice(USER_LAST_NAMES)}"
            books_count = random.randint(1, 40)
            birth_year = random.randint(1850, 1995)
            death_year = birth_year + random.randint(50, 85) if random.random() > 0.7 else ""

            writer.writerow([
                name.replace(" ", "_"),
                name,
                name,
                birth_year,
                death_year,
                random.choice(CITIES),
                books_count,
                f"{name} हे मराठी साहित्यातील महत्त्वाचे लेखक आहेत.",
                "|".join(random.sample(["युगान्त", "मृत्युंजय", "श्यामची आई", "कोसला"], random.randint(1, 3))),
                "|".join(random.sample(["साहित्य अकादमी पुरस्कार", "महाराष्ट्र राज्य पुरस्कार", "पद्मभूषण"], random.randint(0, 2))),
                "approved" if random.random() > 0.1 else "pending",
                f"assets/authors/{name.replace(' ', '-').lower()}.jpg"
            ])

            if index % 1000 == 0:
                print(f"Generated {index} authors...")


def generate_genres_csv(filename):
    rows = [
        (1, "Fiction", "कादंबरी", "Novel", 3250, "दीर्घ काल्पनिक कथा"),
        (2, "Fiction", "ऐतिहासिक", "Historical", 1240, "इतिहासावर आधारित कथा"),
        (3, "Poetry", "कविता", "Poetry", 980, "काव्यरचना"),
        (4, "Fiction", "नाटक", "Drama", 450, "रंगभूमीवर सादर होणारी रचना"),
        (5, "Fiction", "ललित", "Lalit", 320, "वैचारिक साहित्य"),
        (6, "Fiction", "चरित्र", "Biography", 540, "व्यक्तीचे जीवनचरित्र"),
        (7, "Fiction", "प्रवासवर्णन", "Travelogue", 210, "प्रवासवर्णन"),
        (8, "Science", "विज्ञान", "Science", 360, "वैज्ञानिक माहिती"),
        (9, "Religion", "धार्मिक", "Religious", 890, "धर्माशी संबंधित"),
        (10, "Education", "शैक्षणिक", "Educational", 430, "शिक्षणासाठी उपयुक्त"),
        (11, "Children", "बालसाहित्य", "Children Literature", 560, "मुलांसाठी साहित्य"),
        (12, "Fiction", "विनोदी", "Humorous", 280, "विनोदी रचना"),
        (13, "Translation", "अनुवादित", "Translated", 120, "इतर भाषांतून अनुवादित"),
        (14, "Poetry", "अभंग", "Abhang", 320, "संतांनी रचलेले अभंग"),
        (15, "Poetry", "ओवी", "Ovi", 180, "स्त्रियांनी रचलेली ओवी"),
        (16, "Fiction", "लघुकथा", "Short Story", 980, "लघुकथा संग्रह"),
        (17, "Fiction", "थ्रिलर", "Thriller", 250, "रोमांचक कथा"),
        (18, "Fiction", "रहस्य", "Mystery", 180, "गूढ कथा"),
        (19, "Philosophy", "तत्त्वज्ञान", "Philosophy", 340, "तत्त्वज्ञानविषयक"),
        (20, "History", "इतिहास", "History", 560, "ऐतिहासिक माहिती")
    ]

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["genre_id", "category", "name_marathi", "name_english", "book_count", "description"])
        writer.writerows(rows)


def generate_users_csv(filename, count=50000):
    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            "user_id", "name", "email", "role", "join_date", "books_read", "pages_read",
            "reading_streak", "favorite_genres", "location", "age"
        ])

        for index in range(1, count + 1):
            name = f"{random.choice(USER_FIRST_NAMES)} {random.choice(USER_LAST_NAMES)}"
            books_read = random.randint(0, 500)

            writer.writerow([
                index,
                name,
                f"user{index}@example.com",
                random.choice(["user", "user", "user", "moderator"]),
                (datetime.now() - timedelta(days=random.randint(0, 1460))).strftime("%Y-%m-%d"),
                books_read,
                books_read * random.randint(50, 500),
                random.randint(0, 365),
                "|".join(random.sample(GENRES[:8], random.randint(1, 3))),
                random.choice(CITIES),
                random.randint(18, 70)
            ])

            if index % 5000 == 0:
                print(f"Generated {index} users...")


if __name__ == "__main__":
    print("Starting CSV generation for GranthMitra...")
    generate_books_csv("granthmitra_books_complete.csv", 10000)
    generate_authors_csv("granthmitra_authors_complete.csv", 5000)
    generate_genres_csv("granthmitra_genres_complete.csv")
    generate_users_csv("granthmitra_users_sample.csv", 50000)
    print("All CSV files generated successfully.")
