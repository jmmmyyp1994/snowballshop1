'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CheckoutPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)

    try {
      // 1. ตั้งชื่อไฟล์สลิปไม่ให้ซ้ำกัน
      const fileName = `${Date.now()}-${file.name}`
      
      // 2. อัปโหลดลง Supabase Storage (Bucket: slips)
      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      alert('แจ้งโอนเงินสำเร็จเรียบร้อยแล้ว!')
      setFile(null)
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-gray-800">
      <h2 className="text-xl font-bold text-center mb-6">📄 แจ้งชำระเงิน / แนบสลิป</h2>

      {/* ส่วนแนบไฟล์สลิป */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">อัปโหลดหลักฐานการโอนเงิน (สลิป):</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* ปุ่มยืนยัน */}
      <button 
        onClick={handleSubmit}
        disabled={uploading || !file}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-300"
      >
        {uploading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งโอนเงิน'}
      </button>
    </div>
  )
}