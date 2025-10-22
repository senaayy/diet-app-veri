// src/pages/Login.jsx - Danışan Girişi API'ye Göre Güncellenmiş Hali

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, User, Lock, UserCircle, Stethoscope } from 'lucide-react';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('client'); 
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'dietitian') {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        onLogin({ role: 'dietitian', username: formData.username });
        navigate('/dietitian/dashboard');
      } else {
        setError('Geçersiz kullanıcı adı veya şifre!');
      }
    } else {
      try {
        // Frontend'de de aynı normalizasyonu yapıyoruz
        const normalizedUsername = formData.username.toLowerCase().replace(/\s+/g, ''); // <-- BURAYI GÜNCELLEDİK!
        
        const response = await fetch(`http://localhost:3001/api/clients/by-name/${normalizedUsername}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Danışan bulunamadı. Lütfen adı kontrol edin.');
          } else {
            throw new Error(`API hatası! Durum: ${response.status}`);
          }
          return;
        }

        const matchedClient = await response.json();
        
        if (matchedClient && formData.password === '123456') { 
          onLogin({ 
            role: 'client', 
            username: matchedClient.name, 
            clientId: matchedClient.id,
            clientData: matchedClient 
          });
          navigate(`/client/${matchedClient.id}/menu`);
        } else {
          setError('Geçersiz danışan şifresi!');
        }
      } catch (err) {
        console.error('Danışan girişi hatası:', err);
        setError('Bağlantı hatası veya sunucu hatası! Backend sunucusunun çalıştığından emin olun.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-tertiary flex items-center justify-center p-4">
      <div className="bg-background-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
            <ChefHat size={48} className="text-text-dark" />
          </div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Diyet Takip Sistemi</h1>
          <p className="text-text-medium">Hoş geldiniz! Lütfen giriş yapın.</p>
        </div>

        {/* Rol Seçimi */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('client')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'client'
                ? 'bg-primary border-primary text-text-dark shadow-md'
                : 'bg-background-light border-divider text-text-medium hover:bg-divider'
            }`}
          >
            <UserCircle size={32} className="mx-auto mb-2" />
            <div className="font-semibold">Danışan</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('dietitian')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'dietitian'
                ? 'bg-tertiary border-tertiary text-text-dark shadow-md'
                : 'bg-background-light border-divider text-text-medium hover:bg-divider'
            }`}
          >
            <Stethoscope size={32} className="mx-auto mb-2" />
            <div className="font-semibold">Diyetisyen</div>
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-error/10 border border-error/50 text-error rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Giriş Formu */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {selectedRole === 'client' ? 'Danışan Adı' : 'Kullanıcı Adı'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-medium" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={selectedRole === 'client' ? 'Örn: Ayşe Yılmaz' : 'admin'}
                required
                className="w-full pl-10 pr-4 py-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-medium" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin"
                required
                className="w-full pl-10 pr-4 py-3 border border-divider rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-dark"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-text-dark transition-all shadow-md hover:shadow-lg ${
              selectedRole === 'client'
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-tertiary hover:bg-tertiary/90'
            }`}
          >
            Giriş Yap
          </button>
        </form>

        {/* Bilgi Mesajı */}
        <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
          <p className="text-xs text-text-dark">
            <strong className="block mb-1">Demo Giriş Bilgileri:</strong>
            <span className="block">👨‍⚕️ Diyetisyen: admin / admin123</span>
            <span className="block">👤 Danışan: Kayıtlı danışan adı / 123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;