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

  const nicknames = [
    '용감한사자', '빠른토끼', '영리한여우', '강한곰', '멋쟁이토마토',
    '행복한고래', '빛나는별', '푸른하늘', '산뜻한바람', '따뜻한햇살'
  ];
  const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
  const displayName = randomNickname;

  const navigate = useNavigate();

  const createUserProfile = async (userUid: string, userEmail: string) => {
    await setDoc(doc(db, 'users', userUid), {
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
      navigate('/login');
    } catch (error: any) {
      alert(`회원가입 실패: ${error.message}`);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await createUserProfile(userCredential.user.uid, userCredential.user.email || '');
      alert('Google 회원가입 성공!');
      navigate('/');
    } catch (error: any) {
      alert(`Google 회원가입 실패: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">회원가입</h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
          />

          <div className="flex justify-center gap-6 text-gray-700 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="student"
                checked={accountType === 'student'}
                onChange={(e) => setAccountType(e.target.value)}
                className="accent-gray-700"
              />
              학생
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="teacher"
                checked={accountType === 'teacher'}
                onChange={(e) => setAccountType(e.target.value)}
                className="accent-gray-700"
              />
              선생님
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 hover:shadow-md active:scale-[0.98] transition-all mt-2"
          >
            회원가입
          </button>
        </form>

        <button
          onClick={handleGoogleSignup}
          className="w-full mt-3 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 hover:shadow-md active:scale-[0.98] transition-all"
        >
          Google로 회원가입
        </button>

        <p className="text-sm text-gray-600 text-center mt-6">
          이미 계정이 있으신가요?{' '}
          <Link
            to="/login"
            className="text-gray-800 font-medium hover:underline hover:text-gray-900"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
