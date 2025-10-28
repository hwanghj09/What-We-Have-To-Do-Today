import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

function Setting() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(true);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const fetchFirestoreData = async () => {
        setFirestoreLoading(true);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setAccountType(data.accountType || 'student');
            setDisplayName(data.displayName || user.displayName || '');
          } else {
            const initialDisplayName = user.displayName || ''; 
            await setDoc(userDocRef, {
              email: user.email,
              accountType: 'student',
              displayName: initialDisplayName,
              createdAt: new Date(),
            });
            setAccountType('student');
            setDisplayName(initialDisplayName);
          }
        } catch (firestoreError: any) {
          console.error("Error fetching or creating user document:", firestoreError);
          setError(`데이터 로드 중 오류 발생: ${firestoreError.message}`);
        } finally {
          setFirestoreLoading(false);
        }
      };
      fetchFirestoreData();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      if (displayName !== (user.displayName || '')) {
        await updateProfile(user, { displayName });
        await setDoc(userDocRef, { displayName }, { merge: true });
      }

      if (email !== (user.email || '')) {
        await updateEmail(user, email);
      }

      await setDoc(userDocRef, { accountType }, { merge: true });

      alert('정보가 성공적으로 업데이트되었습니다!');
    } catch (err: any) {
      setError(err.message);
      alert(`정보 업데이트 실패: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await deleteDoc(userDocRef);
        await user.delete();
        alert('계정이 성공적으로 삭제되었습니다.');
        navigate('/login');
      } catch (err: any) {
        console.error("Error deleting account:", err);
        if (err.code === 'auth/requires-recent-login') {
          alert('보안을 위해 최근에 다시 로그인해야 계정을 삭제할 수 있습니다.');
          navigate('/login');
        } else {
          setError(err.message);
          alert(`계정 삭제 실패: ${err.message}`);
        }
      }
    }
  };

  if (loading || firestoreLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-6 border-b border-gray-200 pb-3">⚙ 설정</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1 text-gray-700">
              표시 이름
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 outline-none transition-all"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">계정 유형</label>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="radio"
                  value="student"
                  checked={accountType === 'student'}
                  onChange={() => setAccountType('student')}
                  className="accent-gray-700"
                />
                학생
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="radio"
                  value="teacher"
                  checked={accountType === 'teacher'}
                  onChange={() => setAccountType('teacher')}
                  className="accent-gray-700"
                />
                선생님
              </label>
            </div>
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 hover:shadow-md active:scale-[0.98] transition-all"
          >
            💾 정보 업데이트
          </button>

          {/* Delete Account */}
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 hover:shadow-md active:scale-[0.98] transition-all"
          >
            🗑 계정 삭제
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 border-t border-gray-100 pt-4 leading-relaxed">
          🔒 비밀번호 변경은 보안을 위해 이메일 인증 절차를 통해 진행됩니다.
        </p>
      </div>
    </div>
  );
}

export default Setting;
