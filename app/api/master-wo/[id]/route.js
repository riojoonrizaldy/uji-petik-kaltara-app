import { NextResponse } from 'next/server';
import { deleteMasterWO } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteMasterWO(id);
    return NextResponse.json({ success: true, message: 'Data Master WO berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
