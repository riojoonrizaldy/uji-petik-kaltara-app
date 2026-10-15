import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

export async function GET(request, { params }) {
  const { filename } = params;
  const headers = { 'Cache-Control': 'no-store' };

  if (!filename || filename === '.' || filename === '..' || /[/\\\x00]/.test(filename)) {
    return NextResponse.json({ error: 'Nama file tidak valid' }, { status: 400, headers });
  }

  try {
    const buffer = await readFile(path.join(process.cwd(), 'public', 'uploads', filename));
    return new Response(buffer, {
      headers: {
        ...headers,
        'Content-Type': contentTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404, headers });
    }
    console.error('Read upload error:', err);
    return NextResponse.json({ error: 'Gagal membaca foto' }, { status: 500, headers });
  }
}
