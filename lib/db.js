import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DB_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || '';
const DB_NAME = process.env.MYSQL_DATABASE || 'uji_petik_db';

let pool = null;
let isMySQLReady = false;
let mySQLErrorMessage = null;

// JSON fallback file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const JSON_FILE = path.join(DATA_DIR, 'uji_petik.json');
const MASTER_WO_FILE = path.join(DATA_DIR, 'master_workorder.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(MASTER_WO_FILE)) {
    fs.writeFileSync(MASTER_WO_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

async function initMySQL() {
  if (pool && isMySQLReady) return pool;

  try {
    // Check if database exists or create it
    const tempConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 3000,
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // Create pool
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
    });

    // Ensure uji_petik table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS uji_petik (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp VARCHAR(100) NOT NULL,
        pekerjaan ENUM('PSB', 'GANGGUAN') NOT NULL,
        nomor_wo VARCHAR(100) NOT NULL,
        nama_pelanggan VARCHAR(255) NOT NULL,
        nama_teknisi VARCHAR(255) NOT NULL,
        panjang_kabel VARCHAR(100) NOT NULL,
        
        odp_status VARCHAR(50) DEFAULT 'Sesuai',
        odp_foto LONGTEXT,
        
        label_dc_status VARCHAR(50) DEFAULT 'Sesuai',
        label_dc_foto LONGTEXT,
        
        sclamp_status VARCHAR(50) DEFAULT 'Sesuai',
        sclamp_foto LONGTEXT,
        
        stoper_status VARCHAR(50) DEFAULT 'Sesuai',
        stoper_foto LONGTEXT,
        
        clamp_pelanggan_status VARCHAR(50) DEFAULT 'Sesuai',
        clamp_pelanggan_foto LONGTEXT,
        
        ikr_status VARCHAR(50) DEFAULT 'Sesuai',
        ikr_foto LONGTEXT,
        
        dropcore_baru_status VARCHAR(50) DEFAULT 'Sesuai',
        dropcore_baru_foto LONGTEXT,
        
        catatan TEXT,
        hasil_audit VARCHAR(50) DEFAULT 'Lolos',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createTableQuery);

    // Ensure master_workorder table exists
    const createMasterWOTableQuery = `
      CREATE TABLE IF NOT EXISTS master_workorder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor_wo VARCHAR(100) NOT NULL UNIQUE,
        pekerjaan ENUM('PSB', 'GANGGUAN') NOT NULL,
        nama_pelanggan VARCHAR(255) NOT NULL,
        nomor_telepon VARCHAR(50) DEFAULT '',
        nama_teknisi VARCHAR(255) NOT NULL,
        panjang_kabel VARCHAR(50) DEFAULT '',
        alamat TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createMasterWOTableQuery);

    isMySQLReady = true;
    mySQLErrorMessage = null;
    return pool;
  } catch (err) {
    isMySQLReady = false;
    mySQLErrorMessage = err.message || 'Gagal koneksi ke MySQL server';
    console.warn(`[Database Notice] MySQL tidak dapat dihubungi (${mySQLErrorMessage}). Mengaktifkan mode penyimpanan cadangan lokal.`);
    return null;
  }
}

// Local JSON helpers for uji_petik
function readLocalData() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(JSON_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalData(data) {
  ensureDataDir();
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Local JSON helpers for master_workorder
function readLocalMasterWO() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(MASTER_WO_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalMasterWO(data) {
  ensureDataDir();
  fs.writeFileSync(MASTER_WO_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getDbStatus() {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      return {
        type: 'mysql',
        connected: true,
        database: DB_NAME,
        host: DB_HOST,
        message: `Terhubung ke MySQL (${DB_HOST}/${DB_NAME})`,
      };
    }
  } catch (err) {
    // fallback
  }

  return {
    type: 'local_fallback',
    connected: false,
    message: mySQLErrorMessage || 'MySQL offline / password belum dikonfigurasi di .env.local. Menggunakan penyimpanan data lokal.',
  };
}

// =======================
// UJI PETIK OPERATIONS
// =======================

export async function getAllUjiPetik() {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      const [rows] = await mysqlPool.query(`SELECT * FROM uji_petik ORDER BY id DESC`);
      return {
        data: rows,
        source: 'mysql',
      };
    }
  } catch (err) {
    console.error('MySQL query error, using local fallback:', err.message);
  }

  const local = readLocalData();
  local.sort((a, b) => b.id - a.id);
  return {
    data: local,
    source: 'local_fallback',
  };
}

export async function getUjiPetikById(id) {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      const [rows] = await mysqlPool.query(`SELECT * FROM uji_petik WHERE id = ?`, [id]);
      if (rows.length > 0) return { data: rows[0], source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL query error, using local fallback:', err.message);
  }

  const local = readLocalData();
  const item = local.find((x) => String(x.id) === String(id));
  return { data: item || null, source: 'local_fallback' };
}

export async function createUjiPetik(payload) {
  const record = {
    timestamp: payload.timestamp || new Date().toLocaleString('id-ID'),
    pekerjaan: payload.pekerjaan || 'PSB',
    nomor_wo: payload.nomor_wo || '',
    nama_pelanggan: payload.nama_pelanggan || '',
    nama_teknisi: payload.nama_teknisi || '',
    panjang_kabel: payload.panjang_kabel || '0',
    odp_status: payload.odp_status || 'Sesuai',
    odp_foto: payload.odp_foto || '',
    label_dc_status: payload.label_dc_status || 'Sesuai',
    label_dc_foto: payload.label_dc_foto || '',
    sclamp_status: payload.sclamp_status || 'Sesuai',
    sclamp_foto: payload.sclamp_foto || '',
    stoper_status: payload.stoper_status || 'Sesuai',
    stoper_foto: payload.stoper_foto || '',
    clamp_pelanggan_status: payload.clamp_pelanggan_status || 'Sesuai',
    clamp_pelanggan_foto: payload.clamp_pelanggan_foto || '',
    ikr_status: payload.ikr_status || 'Sesuai',
    ikr_foto: payload.ikr_foto || '',
    dropcore_baru_status: payload.dropcore_baru_status || 'Sesuai',
    dropcore_baru_foto: payload.dropcore_baru_foto || '',
    catatan: payload.catatan || '',
    hasil_audit: payload.hasil_audit || 'Lolos',
  };

  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      const [result] = await mysqlPool.query(
        `INSERT INTO uji_petik SET ?`,
        record
      );
      record.id = result.insertId;
      record.created_at = new Date().toISOString();
      return { success: true, id: record.id, data: record, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL insert error, using local fallback:', err.message);
  }

  // Local fallback
  const local = readLocalData();
  const newId = local.length > 0 ? Math.max(...local.map((item) => Number(item.id) || 0)) + 1 : 1;
  record.id = newId;
  record.created_at = new Date().toISOString();
  local.unshift(record);
  writeLocalData(local);

  return { success: true, id: newId, data: record, source: 'local_fallback' };
}

export async function deleteUjiPetik(id) {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      await mysqlPool.query(`DELETE FROM uji_petik WHERE id = ?`, [id]);
      return { success: true, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL delete error:', err.message);
  }

  const local = readLocalData();
  const updated = local.filter((x) => String(x.id) !== String(id));
  writeLocalData(updated);
  return { success: true, source: 'local_fallback' };
}

// =============================
// MASTER WORKORDER OPERATIONS
// =============================

export async function getAllMasterWO() {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      const [rows] = await mysqlPool.query(`SELECT * FROM master_workorder ORDER BY id DESC`);
      return { data: rows, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL master_workorder query error:', err.message);
  }

  const local = readLocalMasterWO();
  local.sort((a, b) => b.id - a.id);
  return { data: local, source: 'local_fallback' };
}

export async function getMasterWOByNumber(nomor_wo) {
  const cleanWO = (nomor_wo || '').trim().toUpperCase();
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      const [rows] = await mysqlPool.query(
        `SELECT * FROM master_workorder WHERE UPPER(nomor_wo) = ? LIMIT 1`,
        [cleanWO]
      );
      if (rows.length > 0) return { data: rows[0], source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL getMasterWOByNumber error:', err.message);
  }

  const local = readLocalMasterWO();
  const found = local.find((x) => (x.nomor_wo || '').trim().toUpperCase() === cleanWO);
  return { data: found || null, source: 'local_fallback' };
}

export async function bulkInsertMasterWO(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return { success: true, count: 0 };
  }

  const cleanedRecords = records.map((r) => ({
    nomor_wo: (r.nomor_wo || '').trim().toUpperCase(),
    pekerjaan: (r.pekerjaan || 'PSB').toUpperCase() === 'GANGGUAN' ? 'GANGGUAN' : 'PSB',
    nama_pelanggan: (r.nama_pelanggan || '').trim(),
    nomor_telepon: (r.nomor_telepon || '').trim(),
    nama_teknisi: (r.nama_teknisi || '').trim(),
    panjang_kabel: String(r.panjang_kabel || '').replace(/[^\d]/g, '') || '0',
    alamat: (r.alamat || '').trim(),
  })).filter((r) => Boolean(r.nomor_wo));

  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      for (const rec of cleanedRecords) {
        await mysqlPool.query(
          `INSERT INTO master_workorder (nomor_wo, pekerjaan, nama_pelanggan, nomor_telepon, nama_teknisi, panjang_kabel, alamat)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             pekerjaan = VALUES(pekerjaan),
             nama_pelanggan = VALUES(nama_pelanggan),
             nomor_telepon = VALUES(nomor_telepon),
             nama_teknisi = VALUES(nama_teknisi),
             panjang_kabel = VALUES(panjang_kabel),
             alamat = VALUES(alamat)`,
          [
            rec.nomor_wo,
            rec.pekerjaan,
            rec.nama_pelanggan,
            rec.nomor_telepon,
            rec.nama_teknisi,
            rec.panjang_kabel,
            rec.alamat,
          ]
        );
      }
      return { success: true, count: cleanedRecords.length, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL bulk insert master WO error:', err.message);
  }

  // Local fallback upsert
  const local = readLocalMasterWO();
  let maxId = local.length > 0 ? Math.max(...local.map((i) => Number(i.id) || 0)) : 0;

  for (const rec of cleanedRecords) {
    const existingIndex = local.findIndex(
      (x) => (x.nomor_wo || '').trim().toUpperCase() === rec.nomor_wo
    );
    if (existingIndex >= 0) {
      local[existingIndex] = {
        ...local[existingIndex],
        ...rec,
        updated_at: new Date().toISOString(),
      };
    } else {
      maxId++;
      local.unshift({
        id: maxId,
        ...rec,
        created_at: new Date().toISOString(),
      });
    }
  }

  writeLocalMasterWO(local);
  return { success: true, count: cleanedRecords.length, source: 'local_fallback' };
}

export async function createSingleMasterWO(payload) {
  return bulkInsertMasterWO([payload]);
}

export async function deleteMasterWO(id) {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      await mysqlPool.query(`DELETE FROM master_workorder WHERE id = ?`, [id]);
      return { success: true, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL deleteMasterWO error:', err.message);
  }

  const local = readLocalMasterWO();
  const filtered = local.filter((x) => String(x.id) !== String(id));
  writeLocalMasterWO(filtered);
  return { success: true, source: 'local_fallback' };
}

export async function clearAllMasterWO(pekerjaan = null) {
  try {
    const mysqlPool = await initMySQL();
    if (mysqlPool && isMySQLReady) {
      if (pekerjaan) {
        await mysqlPool.query(`DELETE FROM master_workorder WHERE pekerjaan = ?`, [pekerjaan]);
      } else {
        await mysqlPool.query(`DELETE FROM master_workorder`);
      }
      return { success: true, source: 'mysql' };
    }
  } catch (err) {
    console.error('MySQL clearAllMasterWO error:', err.message);
  }

  let local = readLocalMasterWO();
  if (pekerjaan) {
    local = local.filter((x) => x.pekerjaan !== pekerjaan);
  } else {
    local = [];
  }
  writeLocalMasterWO(local);
  return { success: true, source: 'local_fallback' };
}
