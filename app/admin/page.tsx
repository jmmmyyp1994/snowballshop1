'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  email: string;
  twitter_account: string;
  total_amount: number;
  status: string;
  tracking_number: string | null;
  shipping_address: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '⏳ รอชำระเงิน', color: 'bg-amber-100 text-amber-800' },
  paid: { label: '💳 ชำระเงินแล้ว / รอสั่ง', color: 'bg-blue-100 text-blue-800' },
  ordered_kr: { label: '🇰🇷 สั่งซื้อแล้ว / อยู่เกาหลี', color: 'bg-purple-100 text-purple-800' },
  shipping_to_th: { label: '✈️ กำลังส่งมาไทย', color: 'bg-indigo-100 text-indigo-800' },
  arrived_th_pending_addr: { label: '🇹🇭 สินค้าถึงไทย (รอที่อยู่)', color: 'bg-pink-100 text-pink-800' },
  shipped: { label: '📦 จัดส่งแล้ว', color: 'bg-emerald-100 text-emerald-800' },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  // ดึงรายการ Order ทั้งหมดพร้อมสินค้าในออเดอร์
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // อัปเดตสถานะสินค้า
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + error.message);
    } else {
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // บันทึกเลขพัสดุ
  const saveTrackingNumber = async (orderId: number) => {
    if (!trackingInput) return;
    const { error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingInput,
        status: 'shipped' 
      })
      .eq('id', orderId);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      alert('บันทึกเลขพัสดุเรียบร้อย!');
      setTrackingInput('');
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">⚙️ หลังบ้านแอดมิน (Admin Dashboard)</h1>
            <p className="text-sm text-slate-500">จัดการคำสั่งซื้อ สรุปยอด และเปลี่ยนสถานะสินค้า</p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            🔄 รีเฟรชข้อมูล
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ตารางออเดอร์ทั้งหมด (Left Column) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">รายการคำสั่งซื้อทั้งหมด ({orders.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-medium pb-2">
                      <th className="py-3 px-2">ออเดอร์</th>
                      <th className="py-3 px-2">ลูกค้า / X</th>
                      <th className="py-3 px-2">ยอดรวม</th>
                      <th className="py-3 px-2">สถานะ</th>
                      <th className="py-3 px-2">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => {
                      const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100' };
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-2 font-bold text-slate-800">#{order.id}</td>
                          <td className="py-3 px-2">
                            <p className="font-medium text-slate-800">{order.customer_name}</p>
                            <p className="text-xs text-pink-600 font-semibold">{order.twitter_account}</p>
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-900">฿{order.total_amount.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* รายละเอียดออเดอร์ที่เลือก (Right Column) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">รายละเอียดคำสั่งซื้อ</h2>

              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                    <p><span className="text-slate-500">หมายเลขออเดอร์:</span> <strong>#{selectedOrder.id}</strong></p>
                    <p><span className="text-slate-500">ชื่อลูกค้า:</span> {selectedOrder.customer_name}</p>
                    <p><span className="text-slate-500">อีเมล:</span> {selectedOrder.email}</p>
                    <p><span className="text-slate-500">บัญชี X:</span> <strong className="text-pink-600">{selectedOrder.twitter_account}</strong></p>
                    <p><span className="text-slate-500">ที่อยู่จัดส่ง:</span> {selectedOrder.shipping_address || 'ยังไม่ได้ระบุ'}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">รายการสินค้าที่สั่ง</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedOrder.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-xs py-1 border-b">
                          <span>{item.product_name} (x{item.quantity})</span>
                          <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 mt-2 text-sm">
                      <span>ยอดรวมทั้งสิ้น:</span>
                      <span className="text-pink-600">฿{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Change Status */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">เปลี่ยนสถานะสินค้า</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-sm bg-white font-medium focus:outline-pink-500"
                    >
                      <option value="pending_payment">⏳ รอชำระเงิน</option>
                      <option value="paid">💳 ชำระเงินแล้ว / รอสั่งซื้อ</option>
                      <option value="ordered_kr">🇰🇷 สั่งซื้อแล้ว / อยู่อยู่เกาหลี</option>
                      <option value="shipping_to_th">✈️ กำลังส่งมาไทย</option>
                      <option value="arrived_th_pending_addr">🇹🇭 สินค้าถึงไทยแล้ว (รอคอนเฟิร์มที่อยู่)</option>
                      <option value="shipped">📦 จัดส่งแล้ว</option>
                    </select>
                  </div>

                  {/* Tracking Number */}
                  <div className="space-y-2 pt-2 border-t">
                    <label className="block text-xs font-bold text-slate-500 uppercase">กรอกเลขพัสดุ (เมื่อส่งแล้ว)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="เช่น TH123456789"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-xl text-sm"
                      />
                      <button
                        onClick={() => saveTrackingNumber(selectedOrder.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-medium"
                      >
                        บันทึก
                      </button>
                    </div>
                    {selectedOrder.tracking_number && (
                      <p className="text-xs text-emerald-600 font-medium">เลขพัสดุปัจจุบัน: {selectedOrder.tracking_number}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-12">คลิกที่ "ดูรายละเอียด" ของรายการทางซ้ายมือ เพื่อดูและจัดการออเดอร์</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}