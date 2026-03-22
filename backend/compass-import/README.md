These files are ready to import with MongoDB Compass into the local `granthmitra` database.

Collections:
- `quotes` -> `quotes.marathi.json`
- `readinggoals` -> `readinggoals.json`
- `readingprogresses` -> `readingprogresses.json`

Referenced records already used in these files:
- User: `reader@granthmitra.com` -> `69bebfdf660b5cc2033f2b6e`
- Book `युगान्त` -> `69beeec9b277ab5c982c8ed9`
- Book `श्यामची आई` -> `69beeec9b277ab5c982c8edc`
- Book `मृत्युंजय` -> `69beeec9b277ab5c982c8edf`

Compass import steps:
1. Open MongoDB Compass and connect to `mongodb://127.0.0.1:27017`.
2. Open database `granthmitra`.
3. Create or open the collection named above.
4. Click `Add Data` -> `Import JSON or CSV file`.
5. Choose the matching file from this folder.
6. Keep the file type as JSON and start the import.

Files:
- `backend/compass-import/quotes.marathi.json`
- `backend/compass-import/readinggoals.json`
- `backend/compass-import/readingprogresses.json`
