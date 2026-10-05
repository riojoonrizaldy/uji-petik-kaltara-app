import { NextResponse } from 'next/server';
import { getUjiPetikById, deleteUjiPetik } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await getUjiPetikById(id);

    if (!result.data) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.data, source: result.source });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteUjiPetik(id);
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
