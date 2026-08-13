import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    // Đã bổ sung thêm soDienThoai, email, diaChi vào state
    const [formData, setFormData] = useState({ 
        maNhaCungCap: '', 
        tenNhaCungCap: '', 
        moTa: '',
        soDienThoai: '',
        email: '',
        diaChi: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('http://18.232.139.209:5000/api/NhaCungCap', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = isEditing 
            ? `http://18.232.139.209:5000/api/NhaCungCap/${formData.maNhaCungCap}` 
            : 'http://18.232.139.209:5000/api/NhaCungCap';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert(isEditing ? "Cập nhật thành công!" : "Thêm thành công!");
                setFormData({ maNhaCungCap: '', tenNhaCungCap: '', moTa: '', soDienThoai: '', email: '', diaChi: '' });
                setIsEditing(false);
                fetchSuppliers();
            } else {
                alert("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi lưu dữ liệu", error);
        }
    };

    const handleEdit = (ncc) => {
        setFormData(ncc);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
        try {
            const res = await fetch(`http://18.232.139.209:5000/api/NhaCungCap/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                alert("Xóa thành công!");
                fetchSuppliers();
            }
        } catch (error) {
            console.error("Lỗi xóa dữ liệu", error);
        }
    };

    return (
        <div style={{ padding: '25px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quản lý Nhà cung cấp</h2>
            
            {/* FORM THÊM/SỬA - Đã bổ sung lưới nhập liệu đầy đủ */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', alignItems: 'end' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Mã NCC *</label>
                        <input type="text" value={formData.maNhaCungCap} onChange={e => setFormData({...formData, maNhaCungCap: e.target.value})} disabled={isEditing} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Tên Nhà cung cấp *</label>
                        <input type="text" value={formData.tenNhaCungCap} onChange={e => setFormData({...formData, tenNhaCungCap: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Số điện thoại</label>
                        <input type="tel" value={formData.soDienThoai || ''} onChange={e => setFormData({...formData, soDienThoai: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                        <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Địa chỉ kho/Văn phòng</label>
                        <input type="text" value={formData.diaChi || ''} onChange={e => setFormData({...formData, diaChi: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: isEditing ? '#f39c12' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isEditing ? <FaEdit /> : <FaPlus />} {isEditing ? 'Lưu cập nhật' : 'Thêm Nhà cung cấp'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({ maNhaCungCap: '', tenNhaCungCap: '', moTa: '', soDienThoai: '', email: '', diaChi: '' }) }} style={{ padding: '9px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Hủy bỏ
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BẢNG DANH SÁCH - Hiển thị chi tiết liên hệ */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '12px' }}>Mã NCC</th>
                            <th style={{ padding: '12px' }}>Tên đối tác</th>
                            <th style={{ padding: '12px' }}>Thông tin liên hệ</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.length > 0 ? suppliers.map(ncc => (
                            <tr key={ncc.maNhaCungCap} style={{ borderBottom: '1px solid #f2f2f2' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{ncc.maNhaCungCap}</td>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{ncc.tenNhaCungCap}</td>
                                <td style={{ padding: '12px', fontSize: '13px', color: '#555' }}>
                                    {ncc.soDienThoai && <div style={{ marginBottom: '4px' }}><FaPhone color="#7f8c8d" /> {ncc.soDienThoai}</div>}
                                    {ncc.email && <div style={{ marginBottom: '4px' }}><FaEnvelope color="#7f8c8d" /> {ncc.email}</div>}
                                    {ncc.diaChi && <div><FaMapMarkerAlt color="#7f8c8d" /> {ncc.diaChi}</div>}
                                    {(!ncc.soDienThoai && !ncc.email && !ncc.diaChi) && <span style={{ color: '#aaa', fontStyle: 'italic' }}>Chưa cập nhật thông tin</span>}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <button onClick={() => handleEdit(ncc)} title="Sửa" style={{ margin: '0 5px', padding: '6px 10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaEdit /></button>
                                    <button onClick={() => handleDelete(ncc.maNhaCungCap)} title="Xóa" style={{ margin: '0 5px', padding: '6px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaTrash /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Chưa có dữ liệu nhà cung cấp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}