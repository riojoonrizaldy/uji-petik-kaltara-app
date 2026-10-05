import { NextResponse } from 'next/server';
import { 
  getAllMasterWO, 
  getMasterWOByNumber, 
  bulkInsertMasterWO, 
  clearAllMasterWO,
  getAllUjiPetik
} from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchWO = searchParams.get('wo');
    const pekerjaan = searchParams.get('pekerjaan');

    // If searching specific WO
    if (searchWO) {
      const result = await getMasterWOByNumber(searchWO);
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
      });
    }

    const result = await getAllMasterWO();
    let data = result.data || [];

    // Filter by pekerjaan if provided
    if (pekerjaan && pekerjaan !== 'ALL') {
      data = data.filter((item) => item.pekerjaan === pekerjaan);
    }

    // Attach status whether this WO has already been audited
    const audits = await getAllUjiPetik();
    const auditedWOMap = new Set(
      (audits.data || []).map((a) => (a.nomor_wo || '').trim().toUpperCase())
    );

    const enriched = data.map((item) => ({
      ...item,
      is_audited: auditedWOMap.has((item.nomor_wo || '').trim().toUpperCase()),
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      source: result.source,
      total: enriched.length,
    });
  } catch (error) {
    console.error('Error fetching master WO:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const result = await bulkInsertMasterWO(body);
      return NextResponse.json({
        success: true,
        count: result.count,
        source: result.source,
        message: `${result.count} data Master WO berhasil disimpan!`,
      });
    } else {
      if (!body.nomor_wo) {
        return NextResponse.json(
          { success: false, error: 'Nomor Workorder wajib diisi' },
          { status: 400 }
        );
      }
      const result = await bulkInsertMasterWO([body]);
      return NextResponse.json({
        success: true,
        count: 1,
        source: result.source,
        message: `Data WO ${body.nomor_wo} berhasil disimpan!`,
      });
    }
  } catch (error) {
    console.error('Error creating master WO:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pekerjaan = searchParams.get('pekerjaan');
    await clearAllMasterWO(pekerjaan);
    return NextResponse.json({
      success: true,
      message: pekerjaan ? `Data ${pekerjaan} berhasil dikosongkan` : 'Seluruh Master Data WO berhasil dikosongkan',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
