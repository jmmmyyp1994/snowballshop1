'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image_url: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*')
      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto border-b border-[#F0EBE1]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EFE9DC] flex items-center justify-center font-bold text-lg">
            🌸
          </div>
          <span className="font-bold text-xl tracking-tight">Snowball Shop</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm bg-white border border-[#EFE9DC] rounded-xl hover:bg-gray-50">
            ติดต่อร้าน
          </button>
          <a
            href="/checkout"
            className="px-4 py-2 text-sm bg-[#5C4D42] text-white rounded-xl font-medium shadow-sm"
          >
            ตะกร้า / แจ้งโอนเงิน
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex gap-8">
        <aside className="w-48 flex-shrink-0 flex flex-col gap-2 text-sm font-medium pt-2">
          <button className="text-left py-2 px-3 bg-[#5C4D42] text-white rounded-xl shadow-sm">
            #ตลาดนัดGMMTV
          </button>
          <button className="text-left py-2 px-3 text-[#786C62] hover:bg-[#F3EFE6] rounded-xl transition">
            #ตลาดนัดDMD
          </button>
          <button className="text-left py-2 px-3 text-[#786C62] hover:bg-[#F3EFE6] rounded-xl transition">
            ติดตามพัสดุ
          </button>
        </aside>

        <main className="flex-1">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-1 text-[#8C6D58]">
            ★ สินค้าทั้งหมด
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm">กำลังโหลดรายการสินค้า...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 border border-[#F0EBE1] shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/300'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-2">
                    <p className="text-base font-bold text-[#A65D37]">
                      ฿{item.price}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      เหลือ {item.stock} ชิ้น
                    </p>
                    <button className="w-full mt-3 py-1.5 bg-[#5C4D42] hover:bg-[#43372F] text-white text-xs font-semibold rounded-lg transition">
                      ใส่ตะกร้า
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}