import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Navigate to home page on successful login
    } catch (error: any) {
      alert(`로그인 실패: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/'); // Navigate to home page on successful Google login
    } catch (error: any) {
      alert(`Google 로그인 실패: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>로그인</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
          로그인
        </button>
      </form>
      <button onClick={handleGoogleLogin} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#db4437', color: 'white', cursor: 'pointer', marginTop: '10px' }}>
        Google로 로그인
      </button>
      <p style={{ marginTop: '20px' }}>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

export default Login