const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('prisma/uniformes.db');
db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  for (const r of rows) {
    console.log('=== ' + r.name);
    console.log(r.sql);
    console.log();
  }
  db.close();
});
