import { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface ScanParams {
  id: string;
  siteId: string;
  classLessonId: string;
}

export default function QrScanner() {
  const [params, setParams] = useState<ScanParams | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端环境
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };
    setIsMobile(checkMobile());
  }, []);

  // 处理摄像头权限
  const handleCameraAccess = async () => {
    try {
        const permissionStatus = await navigator.permissions.query({ name: "camera" });

        if (permissionStatus.state === "granted") {
          setHasCameraPermission(true);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
    } catch (err) {
        setHasCameraPermission(false);
    }
  };

  // 首次自动请求权限（仅桌面端）
  useEffect(() => {
    if (!isMobile) {
      handleCameraAccess();
    }
  }, [isMobile]);

  // 获取存储的参数
  useEffect(() => {
    fetch('http://localhost:3001/api/params')
      .then(res => res.json())
      .then(data => data.id && setParams(data));
  }, []);

  // 时间更新逻辑
  useEffect(() => {
    if (!params) return;
    
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString();
      const [date, time] = iso.split('T');
      const [hms, ms] = time.split('.');
      setCurrentTime(`${date}T${hms}.${ms.slice(0,2)}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 5000);
    return () => clearInterval(timer);
  }, [params]);

  // 处理扫描
  const handleScan = (text: string) => {
    try {
      const paramsPart = text.split('|')[1];
      const searchParams = new URLSearchParams(paramsPart);
      
      const newParams = {
        id: searchParams.get('id')!,
        siteId: searchParams.get('siteId')!,
        classLessonId: searchParams.get('classLessonId')!
      };

      fetch('http://localhost:3001/api/params', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParams)
      }).then(() => {
        setParams(newParams);
        setHasCameraPermission(false);
      });
    } catch (error) {
      alert('无效的二维码格式');
    }
  };

  // 权限处理界面
  if (hasCameraPermission === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            需要摄像头权限
          </h2>
          <button
            onClick={handleCameraAccess}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            启用摄像头
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>如果权限请求失败，请：</p>
            <p>1. 点击浏览器地址栏左侧的摄像头图标</p>
            <p>2. 选择"始终允许"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {!params ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
            扫描教室二维码
          </h2>
          
          {isMobile && hasCameraPermission === null && (
            <div className="text-center mb-4">
              <button
                onClick={handleCameraAccess}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                开始扫描
              </button>
            </div>
          )}

          {hasCameraPermission && (
            /*<QrReader
              onResult={(result) => result && handleScan(result.getText())}
              constraints={{ 
                facingMode: "environment",
                aspectRatio: isMobile ? 1 : undefined
              }}
              scanDelay={300}
              videoContainerStyle={{
                position: 'relative',
                paddingTop: isMobile ? '100%' : '60%'
              }}
              videoStyle={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // iOS 必要属性
                playsInline: true,
                webkitPlaysInline: 1
              }}
            />*/
            <QrReader
              onResult={(result, error) => {
                if (result) {
                  console.log("扫描结果:", result.getText()); // 调试输出
                  handleScan(result.getText());
                }
                if (error) {
                  console.warn("扫描失败:", error); // 调试错误
                }
              }}
              constraints={{ 
                facingMode: "environment",
                aspectRatio: isMobile ? 1 : undefined
              }}
              scanDelay={300}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <QRCode
            value={`checkwork|id=${params.id}&siteId=${params.siteId}&createTime=${currentTime}&classLessonId=${params.classLessonId}`}
            size={256}
            level="H"
            fgColor="#1f2937"
          />
        </div>
      )}
    </div>
  );
}
