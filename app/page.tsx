'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

interface CartItem extends Product {
  quantity: number;
}

// สินค้าเริ่มต้นสำหรับแสดงผลทันที
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'NCT Official Lightstick Vol.2', price: 1550, category: 'lightstick', image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' },
  { id: 2, name: 'AESPA Mini Album Vol.1', price: 690, category: 'album', image_url: 'https://images.unsplash.com/photo-1535615615570-3b839f9ac947?w=500' },
  { id: 3, name: 'RIIZE Random Trading Card Set', price: 280, category: 'photocard', image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
  { id: 4, name: 'K-POP Custom Hoodie', price: 1290, category: 'merch', image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500' },
];

export default function ShopHome() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // ฟอร์มข้อมูลลูกค้า
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [twitterAccount, setTwitterAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // ดึงรายการสินค้าจาก Supabase (ถ้ามีข้อมูลถึงจะทับ)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.log('Using default products');
    }
  };

  // กรองสินค้าตามหมวดหมู่
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // บันทึกการสั่งซื้อลง Supabase
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twitterAccount.startsWith('@')) {
      alert('กรุณาระบุบัญชี X ให้ขึ้นต้นด้วย @ (เช่น @username)');
      return;
    }

    setLoading(true);

    try {
      // 1. สร้าง Order ในตาราง orders
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: customerName,
            email: email,
            twitter_account: twitterAccount,
            total_amount: totalAmount,
            status: 'pending_payment',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. บันทึกรายการสินค้าใน order_items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderSuccess(`🎉 สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อของคุณคือ #${order.id}`);
      setCart([]);
      setIsCheckoutOpen(false);
      setCustomerName('');
      setEmail('');
      setTwitterAccount('');
    } catch (err: any) {
      console.error('Checkout Error:', err);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (err.message || 'เน็ตเวิร์กมีปัญหา'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🛍️ K-POP Pre-Order Store</h1>
            <p className="text-sm text-slate-500">ร้านพรีออเดอร์สินค้า K-Pop Official</p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition relative"
          >
            🛒 ตะกร้าสินค้า ({cart.reduce((a, b) => a + b.quantity, 0)})
          </button>
        </header>

        {/* แจ้งเตือนสั่งซื้อสำเร็จ */}
        {orderSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex justify-between items-center font-medium">
            <span>{orderSuccess}</span>
            <button onClick={() => setOrderSuccess(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* หมวดหมู่สินค้า Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', name: 'ทั้งหมด' },
            { id: 'album', name: '💿 Album' },
            { id: 'lightstick', name: '🔦 Lightstick' },
            { id: 'photocard', name: '🃏 Photocard' },
            { id: 'merch', name: '👕 Merch' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* รายการสินค้า Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">{product.category}</span>
                <h3 className="font-semibold text-slate-800 mt-1">{product.name}</h3>
                <p className="text-lg font-bold text-slate-900 mt-2">฿{product.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-sm font-medium transition"
              >
                + เพิ่มลงตะกร้า
              </button>
            </div>
          ))}
        </div>

        {/* Modal ตะกร้าสินค้า / สั่งซื้อ */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">🛒 ตะกร้าสินค้า</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-8">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">x{item.quantity}</p>
                        </div>
                        <p className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span className="text-pink-600">฿{totalAmount.toLocaleString()}</span>
                  </div>

                  <hr />

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase">ข้อมูลผู้สั่งซื้อ</p>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล *"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-pink-500"
                    />
                    <input
                      type="email"
                      placeholder="อีเมล (สำหรับรับใบสรุปยอด) *"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="บัญชี X / Twitter (เช่น @username) *"
                      required
                      value={twitterAccount}
                      onChange={e => setTwitterAccount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-pink-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition shadow-sm disabled:bg-slate-300"
                  >
                    {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันสั่งซื้อสินค้า'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}