/**
 * ═══════════════════════════════════════════════════════
 * SMK Negeri 1 Maluku Tengah — Sistem Manajemen Nilai
 * Code.gs — Google Apps Script API Backend
 * ═══════════════════════════════════════════════════════
 *
 * CARA SETUP:
 * 1. Buka https://script.google.com → Buat Project Baru
 * 2. Hapus semua isi Code.gs, paste kode ini
 * 3. Klik Deploy → New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Klik Deploy → Copy URL deployment
 * 5. Paste URL tersebut ke variabel GAS_URL di file index.html
 *
 * URL deployment format:
 * https://script.google.com/macros/s/AKfycbyw7JfePtoYo-ezS-vPNVumY1irmvTWGJmDzCKhq4PbgDAwQqQekr_ojOXSjFL6U5dF/exec *
 * API ini menerima request GET dan POST dari GitHub Pages.
 */

var SS_ID = '1qsLi1eDNHky0OLqG5PMLrfNNrjhpDTZcs8Wnfq65dig';
var SHEET_NAME = 'DATA NILAI';

var CLASS_RANGES = {
  'AKL':  { s: 2,   e: 20  },
  'PMS':  { s: 21,  e: 38  },
  'MPLB': { s: 39,  e: 62  },
  'TJKT': { s: 63,  e: 90  },
  'TK':   { s: 91,  e: 122 },
  'ULP':  { s: 123, e: 141 }
};

var SUBJECT_COLS = {
  'pendAgama': 6, 'pendPancasila': 7, 'bhsIndonesia': 8,
  'pjok': 9, 'sejarah': 10, 'seniBudaya': 11,
  'muatanLokal': 12, 'matematika': 13, 'bhsInggris': 14,
  'informatika': 15, 'projekIPAS': 16, 'dpk': 17,
  'kk': 18, 'pkk': 19, 'mapelPilihan': 20
};

/* ═══════════════════════════════════════
   doGet — BACA DATA (dipanggil via GET)
   Parameter: ?action=xxx&classCode=xxx&subject=xxx
   ═══════════════════════════════════════ */
function doGet(e) {
  try {
    var p = e.parameter || {};
    var action = String(p.action || '').trim();

    var result;

    if (action === 'getStudents') {
      result = getStudentsByClass(
        String(p.classCode || '').trim(),
        String(p.subject || '').trim()
      );
    } else if (action === 'getAllScores') {
      result = getAllScoresByClass(
        String(p.classCode || '').trim()
      );
    } else if (action === 'getClasses') {
      result = {
        'AKL': 'Akuntansi Keuangan Lembaga',
        'PMS': 'Pemasaran',
        'MPLB': 'Manajemen Perkantoran & Layanan Bisnis',
        'TJKT': 'Teknik Jaringan Komputer & Telekomunikasi',
        'TK': 'Teknik Ketenagalistrikan',
        'ULP': 'Usaha Layanan Pariwisata'
      };
    } else {
      result = { info: 'SMK Negeri 1 Maluku Tengah API. Actions: getClasses, getStudents, getAllScores' };
    }

    return jsonResponse({ ok: true, data: result });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

/* ═══════════════════════════════════════
   doPost — SIMPAN DATA (dipanggil via POST)
   Body JSON: { action, classCode, subject, scores }
   ═══════════════════════════════════════ */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = String(body.action || '').trim();

    if (action === 'saveScores') {
      var classCode = String(body.classCode || '').trim();
      var subject = String(body.subject || '').trim();
      var scores = body.scores || [];

      saveScores(classCode, subject, scores);
      return jsonResponse({ ok: true, message: 'Nilai berhasil disimpan' });
    }

    return jsonResponse({ ok: false, error: 'Action tidak dikenal: ' + action });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

/* ═══════════════════════════════════════
   HELPER — JSON response dengan CORS
   ═══════════════════════════════════════ */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ═══════════════════════════════════════
   DATA FUNCTIONS
   ═══════════════════════════════════════ */

function getStudentsByClass(classCode, subject) {
  var ss = SpreadsheetApp.openById(SS_ID);
  var ws = ss.getSheetByName(SHEET_NAME);
  if (!ws) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan!');

  var range = CLASS_RANGES[classCode];
  if (!range) throw new Error('Kelas tidak valid: "' + classCode + '"');

  var col = SUBJECT_COLS[subject];
  if (!col) throw new Error('Mapel tidak valid: "' + subject + '"');

  var colLetter = columnToLetter(col);
  var data = ws.getRange('A' + range.s + ':E' + range.e).getValues();
  var scores = ws.getRange(colLetter + range.s + ':' + colLetter + range.e).getValues();

  var students = [];
  var scoreList = [];
  for (var i = 0; i < data.length; i++) {
    students.push({
      nama: data[i][0] || '',
      tempatTanggalLahir: data[i][1] || '',
      nis: String(data[i][2] || ''),
      nisn: String(data[i][3] || ''),
      programKeahlian: data[i][4] || ''
    });
    var sv = scores[i] ? scores[i][0] : '';
    scoreList.push(sv === '' || sv === null || sv === undefined ? '' : String(sv));
  }

  return { students: students, scores: scoreList };
}

function saveScores(classCode, subject, scores) {
  var ss = SpreadsheetApp.openById(SS_ID);
  var ws = ss.getSheetByName(SHEET_NAME);
  if (!ws) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan!');

  var range = CLASS_RANGES[classCode];
  if (!range) throw new Error('Kelas tidak valid: "' + classCode + '"');

  var col = SUBJECT_COLS[subject];
  if (!col) throw new Error('Mapel tidak valid: "' + subject + '"');

  var numRows = range.e - range.s + 1;
  var values = [];
  for (var i = 0; i < numRows; i++) {
    var val = (scores && scores[i]) ? scores[i].score : '';
    if (val === '' || val === null || val === undefined) {
      values.push(['']);
    } else {
      values.push([Number(val)]);
    }
  }

  ws.getRange(range.s, col, numRows, 1).setValues(values);
}

function getAllScoresByClass(classCode) {
  var ss = SpreadsheetApp.openById(SS_ID);
  var ws = ss.getSheetByName(SHEET_NAME);
  if (!ws) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan!');

  var range = CLASS_RANGES[classCode];
  if (!range) throw new Error('Kelas tidak valid: "' + classCode + '"');

  var data = ws.getRange('A' + range.s + ':T' + range.e).getValues();
  return data.map(function(row) {
    return row.map(function(cell) {
      return cell === '' || cell === null ? '' : String(cell);
    });
  });
}

function columnToLetter(col) {
  var s = '';
  while (col > 0) {
    col--;
    s = String.fromCharCode(65 + (col % 26)) + s;
    col = Math.floor(col / 26);
  }
  return s;
}
