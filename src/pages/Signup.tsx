import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('student');
  const nicknames = ['용감한사자', '빠른토끼', '영리한여우', '강한곰', "멋쟁이토마토", '행복한고래', '빛나는별', '푸른하늘', '산뜻한바람', '따뜻한햇살'];
  const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
  const displayName = randomNickname;
  const navigate = useNavigate();
  const createUserProfile = async (userUid: string, userEmail: string) => {
    await setDoc(doc(db, "users", userUid), {
      email: userEmail,
      accountType,
      displayName,
      createdAt: new Date(),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, userCredential.user.email || '');
      alert('회원가입 성공!');
      navigate('/login'); // Navigate to login page on successful signup
    } catch (error: any) {
      alert(`회원가입 실패: ${error.message}`);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      // Check if user profile already exists to avoid overwriting
      // For simplicity, we'll always create/update here. In a real app, you'd check first.
      await createUserProfile(userCredential.user.uid, userCredential.user.email || '');
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>
            <input
              type="radio"
              value="student"
              checked={accountType === 'student'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            학생
          </label>
          <label>
            <input
              type="radio"
              value="teacher"
              checked={accountType === 'teacher'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            선생님
          </label>
        </div>
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