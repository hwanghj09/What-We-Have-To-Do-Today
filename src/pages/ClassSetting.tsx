import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

function ClassSetting() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<{ uid: string; email: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      if (classId) {
        await fetchClassData(classId);
      }
    });
    return () => unsubscribe();
  }, [classId, navigate]);

  const fetchClassData = async (classId: string) => {
    try {
      const classDocRef = doc(db, 'classes', classId);
      const classSnap = await getDoc(classDocRef);
      if (!classSnap.exists()) {
        alert('클래스를 찾을 수 없습니다.');
        navigate('/');
        return;
      }
      const data = classSnap.data();
      setClassName(data?.classname || '');
      setStudents(data?.students || []);
    } catch (err: any) {
      console.error(err);
      alert('클래스 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleUpdateName = async () => {
    if (!classId) return;
    try {
      await updateDoc(doc(db, 'classes', classId), { classname: className });
      alert('클래스 이름이 변경되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('클래스 이름 변경 실패');
    }
  };

  const handleDeleteClass = async () => {
    if (!classId) return;
    if (!window.confirm('정말로 클래스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
      alert('클래스가 삭제되었습니다.');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert('클래스 삭제 실패');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>클래스 설정</h1>
      <Link to="/">홈으로 돌아가기</Link>

      <div style={{ marginTop: '20px' }}>
        <h2>클래스 이름 변경</h2>
        <input
          type="text"
          value={className}
          onChange={e => setClassName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleUpdateName}>변경</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>학생 목록</h2>
        {students.length === 0 ? <p>등록된 학생이 없습니다.</p> :
          <ul>
            {students.map(stu => (
              <li key={stu.uid}>{stu.email}</li>
            ))}
          </ul>
        }
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleDeleteClass}
          style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}
        >
          클래스 삭제
        </button>
      </div>
    </div>
  );
}

export default ClassSetting;
