import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Setting() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');

        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setAccountType(userDocSnap.data().accountType || 'student');
          } else {
            // If user document doesn't exist, create it with default values
            await setDoc(userDocRef, {
              email: currentUser.email,
              accountType: 'student',
              createdAt: new Date(),
            });
            setAccountType('student');
          }
        } catch (firestoreError: any) {
          console.error("Error fetching or creating user document:", firestoreError);
          setError(`데이터 로드 중 오류 발생: ${firestoreError.message}`);
          // Even if Firestore fails, we should still stop loading
        }
      } else {
        navigate('/login');
      }
      setLoading(false); // Ensure loading is always set to false
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    try {
      // Update display name
      if (displayName !== (user.displayName || '')) {
        await updateProfile(user, { displayName });
        alert('프로필 이름이 업데이트되었습니다.');
      }

      // Update email
      if (email !== (user.email || '')) {
        await updateEmail(user, email);
        alert('이메일이 업데이트되었습니다. 확인 메일을 확인해주세요.');
      }

      // Update account type in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { accountType }, { merge: true });
      alert('계정 유형이 업데이트되었습니다.');

      alert('정보가 성공적으로 업데이트되었습니다!');
    } catch (err: any) {
      setError(err.message);
      alert(`정보 업데이트 실패: ${err.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>설정</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '15px' }}>
        <div>
          <label htmlFor="displayName" style={{ display: 'block', marginBottom: '5px' }}>표시 이름:</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>이메일:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>계정 유형:</label>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              value="student"
              checked={accountType === 'student'}
              onChange={() => setAccountType('student')}
            /> 학생
          </label>
          <label>
            <input
              type="radio"
              value="teacher"
              checked={accountType === 'teacher'}
              onChange={() => setAccountType('teacher')}
            /> 선생님
          </label>
        </div>
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
          정보 업데이트
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        비밀번호 변경은 별도의 절차가 필요합니다.
      </p>
    </div>
  );
}

export default Setting;
