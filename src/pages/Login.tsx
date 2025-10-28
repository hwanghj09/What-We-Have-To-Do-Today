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
      navigate('/');
    } catch (error: any) {
      alert(`로그인 실패: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error: any) {
      alert(`Google 로그인 실패: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">로그인</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 hover:shadow-md active:scale-[0.98] transition-all"
          >
            로그인
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 hover:shadow-md active:scale-[0.98] transition-all"
        >
          Google로 로그인
        </button>

        <p className="text-sm text-gray-600 text-center mt-6">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="text-gray-800 font-medium hover:underline hover:text-gray-900"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
