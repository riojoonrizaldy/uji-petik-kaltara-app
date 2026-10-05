import { NextResponse } from 'next/server';
import { getAllUjiPetik, createUjiPetik, getDbStatus } from '@/lib/db';

export async function GET() {
  try {
    const result = await getAllUjiPetik();
    const dbStatus = await getDbStatus();
    return NextResponse.json({
      success: true,
      data: result.data,
      source: result.source,
      dbStatus,
    });
  } catch (error) {
    console.error('Error fetching uji petik:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();

    // Basic validation
    if (!payload.nomor_wo || !payload.nama_pelanggan || !payload.nama_teknisi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor Workorder, Nama Pelanggan, dan Nama Teknisi wajib diisi.',
        },
        { status: 400 }
      );
    }

    const result = await createUjiPetik(payload);
    return NextResponse.json({
      success: true,
      id: result.id,
      data: result.data,
      source: result.source,
      message: 'Data Uji Petik berhasil disimpan!',
    });
  } catch (error) {
    console.error('Error creating uji petik:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
