import React, { useState } from 'react';
import { Plus, Calculator, Trash2 } from 'lucide-react';

const RAI_TO_SQ_WAH = 400; // 1 rai = 400 square wah
const NGAN_TO_SQ_WAH = 100; // 1 ngan = 100 square wah

const Countservice: React.FC = () => {
  const [plots, setPlots] = useState<Array<{ rai: number, ngan: number, sqWah: number }>>([
    { rai: 0, ngan: 0, sqWah: 0 }
  ]);
  const [totalArea, setTotalArea] = useState<{ rai: number, ngan: number, sqWah: number }>({ rai: 0, ngan: 0, sqWah: 0 });
  const [showResult, setShowResult] = useState(false);

  const handleAddPlot = () => {
    setPlots([...plots, { rai: 0, ngan: 0, sqWah: 0 }]);
  };

  const handleRemovePlot = (index: number) => {
    if (plots.length > 1) {
      const updatedPlots = plots.filter((_, i) => i !== index);
      setPlots(updatedPlots);
    }
  };

  const handleCalculate = () => {
    let totalSqWah = 0;
    plots.forEach(plot => {
      const plotAreaInSqWah = plot.rai * RAI_TO_SQ_WAH + plot.ngan * NGAN_TO_SQ_WAH + plot.sqWah;
      totalSqWah += plotAreaInSqWah;
    });

    const rai = Math.floor(totalSqWah / RAI_TO_SQ_WAH);
    const remainingSqWahAfterRai = totalSqWah % RAI_TO_SQ_WAH;
    const ngan = Math.floor(remainingSqWahAfterRai / NGAN_TO_SQ_WAH);
    const sqWah = remainingSqWahAfterRai % NGAN_TO_SQ_WAH;

    setTotalArea({ rai, ngan, sqWah });
    setShowResult(true);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedPlots = [...plots];
    updatedPlots[index] = { ...updatedPlots[index], [field]: numValue };
    setPlots(updatedPlots);
  };

  const clearAll = () => {
    setPlots([{ rai: 0, ngan: 0, sqWah: 0 }]);
    setTotalArea({ rai: 0, ngan: 0, sqWah: 0 });
    setShowResult(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', padding: '1rem' }}>
      <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '0.5rem' }}>
            โปรแกรมรวมเนื้อที่
          </h1>
          <p style={{ color: '#4b5563' }}>คำนวณเนื้อที่รวมจากหลายแปลงที่ดิน</p>
        </div>

        {/* Main Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            {plots.map((plot, index) => (
              <div key={index} style={{ backgroundColor: '#f9fafb', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#4b5563' }}>แปลงที่ {index + 1}</h3>
                  {plots.length > 1 && (
                    <button
                      onClick={() => handleRemovePlot(index)}
                      style={{
                        color: '#ef4444',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#fef2f2',
                        transition: 'all 0.3s',
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>ไร่</label>
                    <input
                      type="number"
                      value={plot.rai || ''}
                      onChange={(e) => handleInputChange(index, 'rai', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border 0.2s',
                      }}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>งาน</label>
                    <input
                      type="number"
                      value={plot.ngan || ''}
                      onChange={(e) => handleInputChange(index, 'ngan', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border 0.2s',
                      }}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>ตารางวา</label>
                    <input
                      type="number"
                      value={plot.sqWah || ''}
                      onChange={(e) => handleInputChange(index, 'sqWah', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border 0.2s',
                      }}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleAddPlot}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: '#fef9c3',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              <Plus size={20} />
              เพิ่มแปลงที่ดิน
            </button>
            
            <button
              onClick={handleCalculate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: '#fecaca',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              <Calculator size={20} />
              คำนวณรวมเนื้อที่
            </button>
            
            <button
              onClick={clearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: '#bfdbfe',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              ล้างข้อมูล
            </button>
          </div>
        </div>

        {/* Result Card */}
        {showResult && (
          <div style={{ backgroundColor: 'blue', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>ผลการคำนวณ</h2>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {totalArea.rai} ไร่ {totalArea.ngan} งาน {totalArea.sqWah} ตารางวา
                </p>
                <p style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.9 }}>
                  เนื้อที่รวมทั้งหมด
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div style={{ marginTop: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '1rem', padding: '1rem', border: '1px solid #bfdbfe' }}>
          <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>ข้อมูลการแปลงหน่วย</h4>
          <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: '1.5' }}>
            <p>• 1 ไร่ = 400 ตารางวา</p>
            <p>• 1 งาน = 100 ตารางวา</p>
            <p>• 1 ไร่ = 4 งาน</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countservice;
