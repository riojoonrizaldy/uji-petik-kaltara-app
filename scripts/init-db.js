require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDB() {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'uji_petik_db';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);

  try {
    // 1. Connect without database first to ensure database exists
    const rootConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`✅ Connected to MySQL server successfully.`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database \`${database}\` ready.`);
    await rootConn.end();

    // 2. Connect to the target database and create table
    const dbConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS uji_petik (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp VARCHAR(100) NOT NULL,
        pekerjaan ENUM('PSB', 'GANGGUAN') NOT NULL,
        nomor_wo VARCHAR(100) NOT NULL,
        data_odp VARCHAR(100) DEFAULT '',
        nama_pelanggan VARCHAR(255) NOT NULL,
        nama_teknisi VARCHAR(255) NOT NULL,
        panjang_kabel VARCHAR(100) NOT NULL,
        panjang_kabel_real VARCHAR(100) DEFAULT '',
        
        -- Checklist item: status (Sesuai/Tidak Sesuai), foto (path / base64), catatan
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

    await dbConn.query(createTableQuery);
    console.log(`✅ Table \`uji_petik\` ready.`);

    const createMasterWOTableQuery = `
      CREATE TABLE IF NOT EXISTS master_workorder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor_wo VARCHAR(100) NOT NULL UNIQUE,
        data_odp VARCHAR(100) DEFAULT '',
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

    await dbConn.query(createMasterWOTableQuery);
    console.log(`✅ Table \`master_workorder\` ready.`);

    await dbConn.end();
    console.log(`\n🎉 Inisialisasi Database MySQL Selesai!`);
  } catch (error) {
    console.error(`❌ Gagal inisialisasi database MySQL:`, error.message);
    console.log(`\nTips: Pastikan MySQL aktif dan password di .env.local sudah sesuai.`);
    process.exit(1);
  }
}

initDB();
