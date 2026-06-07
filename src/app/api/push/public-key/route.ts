import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BInYF-kUe_r6J9Gv_CqYv_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_Kq_Y6W_K' 
  });
}
