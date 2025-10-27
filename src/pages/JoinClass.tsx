import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

function JoinClass() {
  const [code, setCode] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const joinClassWithCode = async () => {
    if (!code) return alert('초대코드를 입력해주세요');
    if (!user) return;

    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('inviteCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return alert('잘못된 초대코드입니다.');

      const classDoc = querySnapshot.docs[0];
      await updateDoc(classDoc.ref, {
        students: arrayUnion(user.uid),
      });

      alert(`클래스 참여 완료! 클래스 이름: ${classDoc.data().classname}`);
      navigate('/');
    } catch (err: any) {
      alert(`클래스 참여 실패: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>클래스 참여</h1>
      <input
        type="text"
        placeholder="초대코드 입력"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
      />
      <button onClick={joinClassWithCode} style={{ padding: '10px 15px', cursor: 'pointer' }}>
        참여하기
      </button>
    </div>
  );
}

export default JoinClass;
