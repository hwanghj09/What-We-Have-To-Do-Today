import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function CreateClass() {
  const navigate = useNavigate();
  const [_user, setUser] = useState<User | null>(null);
  const [userUID, setUserUID] = useState('');
  const [classname, setClassName] = useState('');

  // 로그인 유저 정보 가져오기
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserUID(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const createClass = async () => {
    if (!classname.trim()) {
      alert('클래스 이름을 입력해주세요.');
      return;
    }

    const classid = crypto.randomUUID();
    const inviteCode = crypto.randomUUID().slice(0, 6);

    try {
      await setDoc(doc(db, 'classes', classid), {
        classname,
        managerId: userUID,
        inviteCode,
        students: [],
        createdAt: new Date(),
      });

      alert(`✅ 클래스 생성 완료!\n초대코드: ${inviteCode}`);
      navigate('/');
    } catch (err: any) {
      alert(`❌ 클래스 생성 실패: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center border-b border-gray-200 pb-3">
          🏫 클래스 생성
        </h1>

        <label
          htmlFor="classname"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          클래스 이름
        </label>
        <input
          id="classname"
          type="text"
          placeholder="예: 수학 A반, 영어 독해반 등"
          value={classname}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all mb-6"
        />

        <button
          onClick={createClass}
          className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 hover:shadow-md active:scale-[0.98] transition-all"
        >
          ➕ 클래스 생성
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg mt-3 hover:bg-gray-300 active:scale-[0.98] transition-all"
        >
          ← 홈으로 돌아가기
        </button>

        <p className="text-xs text-gray-500 mt-6 text-center">
          생성한 클래스는 언제든지 설정 페이지에서 수정하거나 삭제할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default CreateClass;
