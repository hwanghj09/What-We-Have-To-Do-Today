import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import type { User } from 'firebase/auth';
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
          setDisplayName(data.displayName || user.displayName || ''); // Firestore > Auth > ''
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
    // Firestore, Auth 둘 다 업데이트
    const userDocRef = doc(db, "users", user.uid);

    // displayName 변경 시 Auth와 Firestore 동기화
    if (displayName !== (user.displayName || '')) {
      await updateProfile(user, { displayName }); // Auth 업데이트
      await setDoc(userDocRef, { displayName }, { merge: true }); // Firestore 업데이트
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
        // Re-authenticate user if necessary (Firebase requires recent login for sensitive operations)
        // For simplicity, we're skipping explicit re-authentication here, but in a real app,
        // you might prompt the user to re-enter their password or re-authenticate with a provider.

        // Delete user document from Firestore first
        const userDocRef = doc(db, "users", user.uid);
        await deleteDoc(userDocRef);

        // Delete user from Firebase Authentication
        await user.delete();

        alert('계정이 성공적으로 삭제되었습니다.');
        navigate('/login');
      } catch (err: any) {
        console.error("Error deleting account:", err);
        // Handle specific errors, e.g., 'auth/requires-recent-login'
        if (err.code === 'auth/requires-recent-login') {
          alert('보안을 위해 최근에 다시 로그인해야 계정을 삭제할 수 있습니다. 다시 로그인한 후 시도해주세요.');
          navigate('/login'); // Redirect to login to re-authenticate
        } else {
          setError(err.message);
          alert(`계정 삭제 실패: ${err.message}`);
        }
      }
    }
  };

  if (loading || firestoreLoading) {
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
        <button type="button" onClick={handleDeleteAccount} style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '10px' }}>
          계정 삭제
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        비밀번호 변경은 별도의 절차가 필요합니다.
      </p>
    </div>
  );
}

export default Setting;

