import QrScanner from './components/QrScanner';

function App() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        课堂动态签到系统
      </h1>
      <QrScanner />
    </div>
  );
}

export default App;