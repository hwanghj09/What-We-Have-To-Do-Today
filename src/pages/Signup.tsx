import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('회원가입 성공!');
      navigate('/login'); // Navigate to login page on successful signup
    } catch (error: any) {
      alert(`회원가입 실패: ${error.message}`);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Google 회원가입 성공!');
      navigate('/'); // Navigate to home page on successful Google signup
    } catch (error: any) {
      alert(`Google 회원가입 실패: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>회원가입</h1>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>
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
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>
          회원가입
        </button>
      </form>
      <button onClick={handleGoogleSignup} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#db4437', color: 'white', cursor: 'pointer', marginTop: '10px' }}>
        Google로 회원가입
      </button>
      <p style={{ marginTop: '20px' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

export default Signup