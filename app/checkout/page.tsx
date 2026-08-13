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

  const handleUploadAndSubmit = async (orderId: string) => {
    if (!file) return null

    setUploading(true)
    // 1. ตั้งชื่อไฟล์รูปสลิปไม่ให้ซ้ำกัน
    const fileExt = file.name.split('.').pop()
    const fileName = `${orderId}-${Date.now()}.${fileExt}`
    const filePath = `order-slips/${fileName}`

    // 2. อัปโหลดรูปขึ้น Supabase Storage (Bucket: slips)
    const { error: uploadError } = await supabase.storage
      .from('slips')
      .upload(filePath, file)

    if (uploadError) {
      alert('อัปโหลดสลิปไม่สำเร็จ: ' + uploadError.message)
      setUploading(false)
      return null
    }

    // 3. ดึง Public URL ของรูปภาพ
    const { data } = supabase.storage.from('slips').getPublicUrl(filePath)
    const slipUrl = data.publicUrl

    // 4. บันทึก slipUrl ลงในตาราง orders
    await supabase
      .from('orders')
      .update({ slip_url: slipUrl })
      .eq('id', orderId)

    setUploading(false)
    return slipUrl
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">💳 ชำระเงินผ่าน PromptPay</h2>
      
      {/* ส่วนแสดง QR Code พร้อมเพย์ */}
      <div className="flex flex-col items-center mb-6">
        <img 
          src="https://promptpay.io/0812345678.png"  // ⚠️ เปลี่ยนเป็นเบอร์พร้อมเพย์/เลขบัตรประชาชนของคุณ
          alt="PromptPay QR" 
          className="w-48 h-48 border rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-2">สแกน QR Code เพื่อโอนเงิน</p>
      </div>

      {/* ส่วนแนบสลิป */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">แนบหลักฐานการโอนเงิน (สลิป):</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm border p-2 rounded-lg"
        />
      </div>

      {/* ปุ่มยืนยัน */}
      <button 
        disabled={uploading || !file}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-300"
      >
        {uploading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการแจ้งโอนเงิน'}
      </button>
    </div>
  )
}