import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { bulkInsertMasterWO } from '@/lib/db';

function normalizeKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const defaultPekerjaan = formData.get('default_pekerjaan') || 'PSB';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Tidak ada berkas yang diunggah' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse spreadsheet using xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ success: false, error: 'Berkas spreadsheet kosong' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada baris data ditemukan di dalam berkas' }, { status: 400 });
    }

    // Auto-map columns
    const mappedRecords = [];

    for (const row of rawRows) {
      const normalizedRow = {};
      for (const [k, v] of Object.entries(row)) {
        normalizedRow[normalizeKey(k)] = v;
      }

      // Find WO
      const nomor_wo =
        normalizedRow['nomorwo'] ||
        normalizedRow['nowo'] ||
        normalizedRow['wo'] ||
        normalizedRow['workorder'] ||
        normalizedRow['nomortiket'] ||
        normalizedRow['notiket'] ||
        normalizedRow['tiket'] ||
        normalizedRow['orderid'] ||
        '';

      if (!nomor_wo) continue;

      // Find Pekerjaan
      let pekerjaan =
        normalizedRow['pekerjaan'] ||
        normalizedRow['jenispekerjaan'] ||
        normalizedRow['jenis'] ||
        normalizedRow['tipe'] ||
        defaultPekerjaan;

      pekerjaan = String(pekerjaan).toUpperCase().includes('GANGGUAN') ? 'GANGGUAN' : 'PSB';

      // Find Pelanggan
      const nama_pelanggan =
        normalizedRow['namapelanggan'] ||
        normalizedRow['pelanggan'] ||
        normalizedRow['customer'] ||
        normalizedRow['customername'] ||
        normalizedRow['nama'] ||
        '';

      // Find Nomor Telepon
      const nomor_telepon =
        normalizedRow['nomortelepon'] ||
        normalizedRow['notelepon'] ||
        normalizedRow['notelp'] ||
        normalizedRow['nohp'] ||
        normalizedRow['telepon'] ||
        normalizedRow['hp'] ||
        normalizedRow['whatsapp'] ||
        normalizedRow['wa'] ||
        '';

      // Find Teknisi
      const nama_teknisi =
        normalizedRow['namateknisi'] ||
        normalizedRow['teknisi'] ||
        normalizedRow['tim'] ||
        normalizedRow['petugas'] ||
        normalizedRow['mitra'] ||
        '';

      // Find Panjang Kabel
      const panjang_kabel =
        normalizedRow['panjangkabel'] ||
        normalizedRow['tarikan'] ||
        normalizedRow['panjangtarikan'] ||
        normalizedRow['panjang'] ||
        normalizedRow['meter'] ||
        '';

      // Find Alamat
      const alamat =
        normalizedRow['alamat'] ||
        normalizedRow['address'] ||
        normalizedRow['lokasi'] ||
        '';

      mappedRecords.push({
        nomor_wo: String(nomor_wo).trim(),
        pekerjaan,
        nama_pelanggan: String(nama_pelanggan).trim(),
        nomor_telepon: String(nomor_telepon).trim(),
        nama_teknisi: String(nama_teknisi).trim(),
        panjang_kabel: String(panjang_kabel).trim(),
        alamat: String(alamat).trim(),
      });
    }

    if (mappedRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format kolom tidak dikenali. Pastikan terdapat kolom "Nomor WO" atau "No WO".',
        },
        { status: 400 }
      );
    }

    const result = await bulkInsertMasterWO(mappedRecords);

    return NextResponse.json({
      success: true,
      count: result.count,
      source: result.source,
      message: `Berhasil mengimpor ${result.count} data Master WO (${defaultPekerjaan})!`,
    });
  } catch (error) {
    console.error('Upload spreadsheet error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses berkas spreadsheet' },
      { status: 500 }
    );
  }
}
