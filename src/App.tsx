import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Setting from './pages/Setting';
import CreateClass from './pages/CreateClass';
import JoinClass from './pages/JoinClass';
import ClassSetting from './pages/ClassSetting';
import { useRegisterSW } from 'virtual:pwa-register/react';


function App() {
  const {
    offlineReady: [offlineReady, setOfflineReady], // 오프라인 준비 완료 상태
    needRefresh: [needRefresh, setNeedRefresh], // 새 버전이 필요함 상태
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/create-class" element={<CreateClass />} />
        <Route path="/join-class" element={<JoinClass />} />
        <Route path="/class-setting/:classId" element={<ClassSetting />} />
      </Routes>

      {(offlineReady || needRefresh) && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#333',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {offlineReady ? (
            <span>앱을 오프라인에서 사용할 준비가 되었습니다.</span>
          ) : (
            <span>새로운 버전이 있습니다. 업데이트하려면 새로고침하세요.</span>
          )}
          {needRefresh && (
            <button onClick={() => updateServiceWorker(true)} style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}>
              새로고침
            </button>
          )}
          <button onClick={close} style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer'
          }}>
            &times;
          </button>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App
