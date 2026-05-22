'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Brain, Clock, ChevronRight, CheckCircle, AlertTriangle, Play, HelpCircle, Award } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  questionText: string;
  baseSvg?: string;
  sequenceSvgs?: string[];
  spatialOptions?: Array<{ id: string; rotation: number; mirrored: boolean }>;
  abstractOptions?: Array<{ id: string; svg: string }>;
  options?: Array<{ id: string; text: string }>;
}

const SECTION_DETAILS: Record<string, { title: string; desc: string; time: number; rules: string }> = {
  verbal: {
    title: 'Razonamiento Verbal',
    desc: 'Medición de comprensión léxica e identificación de sinónimos.',
    time: 300, // 5 minutos
    rules: 'Se presentará una palabra en mayúsculas. Debes seleccionar la palabra de las opciones que tenga el significado más similar (sinónimo).'
  },
  espacial: {
    title: 'Razonamiento Espacial',
    desc: 'Evaluación de capacidad de visualización y rotación mental de figuras.',
    time: 300, // 5 minutos
    rules: 'Verás una figura modelo en la izquierda. Debes elegir cuál de las cuatro opciones de la derecha es la misma figura, pero que ha sido rotada. Ten cuidado: tres de las opciones están reflejadas (espejo) y son incorrectas.'
  },
  logico: {
    title: 'Razonamiento Lógico',
    desc: 'Medición de la aptitud para descubrir secuencias y patrones de números o letras.',
    time: 360, // 6 minutos
    rules: 'Se presentará una serie de números o letras. Identifica la regla lógica de la secuencia y elige la opción que debería ocupar el lugar del signo de interrogación (?).'
  },
  numerico: {
    title: 'Razonamiento Numérico',
    desc: 'Prueba de agilidad en operaciones aritméticas básicas y problemas matemáticos de la vida real.',
    time: 300, // 5 minutos
    rules: 'Resuelve los problemas matemáticos y lógicos planteados. Puedes usar papel y lápiz para realizar anotaciones. Selecciona la respuesta correcta.'
  },
  abstracto: {
    title: 'Razonamiento Abstracto',
    desc: 'Análisis de secuencias y matrices lógicas con figuras complejas.',
    time: 1200, // 20 minutos
    rules: 'Observa la secuencia lógica de tres figuras geométricas en la parte superior y deduce cuál es la cuarta figura que continúa el patrón de entre las cuatro opciones dadas.'
  },
  ethics: {
    title: 'Evaluación de Ética y Cumplimiento',
    desc: 'Estudio de dilemas éticos y toma de decisiones profesionales en base a valores corporativos.',
    time: 0, // Sin límite
    rules: 'Lee atentamente cada uno de los dilemas éticos presentados en el ambiente de trabajo. Selecciona el curso de acción que consideres más íntegro, responsable y apegado a las políticas corporativas. No hay límite de tiempo.'
  },
  kudert: {
    title: 'Perfil de Comportamiento (Kudert/DISC)',
    desc: 'Diagnóstico de tendencias conductuales, emocionales y estilo de trabajo preferido.',
    time: 0, // Sin límite
    rules: 'Para cada afirmación, indica qué tan identificado te sientes utilizando la escala del 1 al 5 (1: Totalmente en desacuerdo, 5: Totalmente de acuerdo). Responde con honestidad y de acuerdo a tu forma natural de ser en el trabajo.'
  }
};

export default function CandidatePsychometricPortal() {
  const params = useParams();
  const candidateId = params.candidateId as string;
  const router = useRouter();

  // Estados generales de carga y datos
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados del sub-test activo
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [checkboxAccepted, setCheckboxAccepted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submittingSection, setSubmittingSection] = useState(false);

  // 1. Cargar datos del test
  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/psychometric?candidateId=${candidateId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No se pudo cargar la evaluación.');
        return;
      }

      setCandidate(data.candidate);
      setTest(data.test);
    } catch (e) {
      setErrorMsg('Error de comunicación con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchTestDetails();
    }
  }, [candidateId]);

  // 2. Temporizador para test activo
  useEffect(() => {
    if (!activeSection || showInstructions) return;
    const limit = SECTION_DETAILS[activeSection].time;
    if (limit === 0) return; // Sin límite

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Se acabó el tiempo: enviar respuestas automáticamente
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSection, showInstructions]);

  // 3. Manejo de inicio de sección
  const handleStartSectionClick = (secKey: string) => {
    setActiveSection(secKey);
    setShowInstructions(true);
    setCheckboxAccepted(false);
    setAnswers({});
  };

  const handleBeginTest = () => {
    if (!activeSection) return;
    setShowInstructions(false);
    setTimeLeft(SECTION_DETAILS[activeSection].time);
  };

  // 4. Seleccionar respuesta
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // 5. Enviar respuestas
  const handleAutoSubmit = () => {
    submitAnswers(true);
  };

  const submitAnswers = async (isAuto = false) => {
    if (!activeSection) return;
    try {
      setSubmittingSection(true);
      const res = await fetch('/api/psychometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          section: activeSection,
          answers
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Error al guardar las respuestas. Intente de nuevo.');
        return;
      }

      // Actualizar el estado del test local
      setTest(data.test);
      
      // Mostrar alerta si se envió por tiempo
      if (isAuto) {
        alert('El tiempo asignado para esta sección ha finalizado. Tus respuestas guardadas han sido enviadas.');
      }

      // Regresar al menú principal
      setActiveSection(null);
    } catch (e) {
      alert('Error de conexión al enviar las respuestas.');
    } finally {
      setSubmittingSection(false);
    }
  };

  // Formato MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8' }}>Cargando portal de evaluación...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', border: '1px solid #ef4444', padding: '32px', borderRadius: '16px', maxWidth: '450px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px' }}>Acceso Restringido</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>{errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reintentar</button>
        </div>
      </div>
    );
  }

  // 1. Vista de instrucciones de sección
  if (activeSection && showInstructions) {
    const detail = SECTION_DETAILS[activeSection];
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', width: '100%', maxWidth: '650px', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', borderBottom: '1px solid #334155' }}>
            <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Instrucciones</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: 800 }}>{detail.title}</h2>
          </div>
          <div style={{ padding: '24px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px' }}>{detail.rules}</p>
            
            <div style={{ display: 'flex', gap: '16px', background: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #1e293b' }}>
              <Clock size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Tiempo asignado:</p>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                  {detail.time > 0 ? `${detail.time / 60} minutos de cuenta regresiva continua.` : 'Sin límite de tiempo para esta sección.'}
                </p>
              </div>
            </div>

            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid #475569', marginBottom: '28px' }}>
              <input type="checkbox" checked={checkboxAccepted} onChange={e => setCheckboxAccepted(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', color: '#e2e8f0', userSelect: 'none' }}>He comprendido las reglas y estoy listo para comenzar la prueba.</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveSection(null)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Volver al menú</button>
              <button 
                onClick={handleBeginTest} 
                disabled={!checkboxAccepted}
                style={{ 
                  background: checkboxAccepted ? '#3b82f6' : '#1e293b', 
                  color: checkboxAccepted ? 'white' : '#64748b', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  cursor: checkboxAccepted ? 'pointer' : 'not-allowed', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Play size={16} /> Comenzar Sección
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Vista de test activo
  if (activeSection) {
    const detail = SECTION_DETAILS[activeSection];
    const questions: Question[] = test.generated_questions[activeSection] || [];
    const isTimerWarning = detail.time > 0 && timeLeft < 60;

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        {/* Cabecera persistente del test con temporizador */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'rgba(15, 23, 42, 0.9)', 
          backdropFilter: 'blur(8px)', 
          borderBottom: '1px solid #1e293b', 
          padding: '16px 20px', 
          zIndex: 50,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{detail.title}</h3>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11px' }}>Candidato: {candidate.sender_name}</p>
          </div>
          
          {detail.time > 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: isTimerWarning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              border: `1px solid ${isTimerWarning ? '#ef4444' : '#3b82f6'}`
            }}>
              <Clock size={16} className={isTimerWarning ? 'animate-pulse' : ''} color={isTimerWarning ? '#ef4444' : '#3b82f6'} />
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '18px', color: isTimerWarning ? '#f87171' : '#60a5fa' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', background: '#334155', padding: '6px 12px', borderRadius: '12px', color: '#cbd5e1' }}>Sin Límite</span>
          )}
        </div>

        {/* Cuerpo de preguntas */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px 100px' }}>
          <div style={{ display: 'grid', gap: '28px' }}>
            {questions.map((q, idx) => {
              const selectedValue = answers[q.id];

              return (
                <div key={q.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ background: '#334155', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9', lineHeight: '1.5' }}>
                      {q.questionText}
                    </p>
                  </div>

                  {/* Renderizar sección espacial (rotación de figura modelo) */}
                  {q.type === 'espacial' && q.baseSvg && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', margin: '20px 0' }}>
                      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Modelo Original</p>
                        <svg width="100" height="100" viewBox="0 0 100 100" style={{ color: 'white' }} dangerouslySetInnerHTML={{ __html: q.baseSvg }} />
                      </div>
                      
                      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '10px' }}>
                        {q.spatialOptions?.map(opt => {
                          const isSelected = selectedValue === opt.id;
                          return (
                            <button 
                              key={opt.id}
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              style={{ 
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#0f172a', 
                                border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`, 
                                borderRadius: '12px', 
                                padding: '16px 8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#60a5fa' : '#94a3b8' }}>Opción {opt.id}</span>
                              <div style={{ 
                                transform: `rotate(${opt.rotation}deg) scaleX(${opt.mirrored ? -1 : 1})`,
                                transition: 'transform 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <svg width="70" height="70" viewBox="0 0 100 100" style={{ color: 'white' }} dangerouslySetInnerHTML={{ __html: q.baseSvg || '' }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Renderizar sección abstracto (secuencia geométrica) */}
                  {q.type === 'abstracto' && q.sequenceSvgs && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                        {q.sequenceSvgs.map((svgContent, seqIdx) => (
                          <React.Fragment key={seqIdx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>Paso {seqIdx + 1}</span>
                              <svg width="80" height="80" viewBox="0 0 100 100" style={{ color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '4px', background: '#1e293b' }} dangerouslySetInnerHTML={{ __html: svgContent }} />
                            </div>
                            {seqIdx < 2 && <ChevronRight size={18} color="#475569" />}
                          </React.Fragment>
                        ))}
                        <ChevronRight size={18} color="#475569" />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#3b82f6', marginBottom: '4px', fontWeight: 'bold' }}>Paso 4</span>
                          <div style={{ width: '80px', height: '80px', border: '2px dashed #3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.05)' }}>
                            <HelpCircle size={28} color="#3b82f6" />
                          </div>
                        </div>
                      </div>

                      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                        {q.abstractOptions?.map(opt => {
                          const isSelected = selectedValue === opt.id;
                          return (
                            <button 
                              key={opt.id}
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              style={{ 
                                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#0f172a', 
                                border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`, 
                                borderRadius: '12px', 
                                padding: '16px 8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#60a5fa' : '#94a3b8' }}>Opción {opt.id}</span>
                              <svg width="70" height="70" viewBox="0 0 100 100" style={{ color: 'white' }} dangerouslySetInnerHTML={{ __html: opt.svg }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Renderizar opciones genéricas (Verbal, Lógico, Numérico, Ética) */}
                  {q.type !== 'espacial' && q.type !== 'abstracto' && q.type !== 'kudert' && q.options && (
                    <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                      {q.options.map(opt => {
                        const isSelected = selectedValue === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            style={{
                              background: isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                              border: `1px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                              borderRadius: '10px',
                              padding: '14px 18px',
                              textAlign: 'left',
                              color: isSelected ? 'white' : '#cbd5e1',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: isSelected ? '#3b82f6' : '#334155',
                              color: isSelected ? 'white' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              flexShrink: 0
                            }}>
                              {opt.id}
                            </span>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Renderizar escala Likert para Kudert (DISC) */}
                  {q.type === 'kudert' && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(val => {
                          const isSelected = parseInt(selectedValue) === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleSelectOption(q.id, val.toString())}
                              style={{
                                background: isSelected ? '#3b82f6' : '#0f172a',
                                border: `2px solid ${isSelected ? '#60a5fa' : '#334155'}`,
                                borderRadius: '10px',
                                padding: '12px 6px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                color: isSelected ? 'white' : '#cbd5e1',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span style={{ fontSize: '18px', fontWeight: 800 }}>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#94a3b8', padding: '0 4px' }}>
                        <span>Total desacuerdo</span>
                        <span>Neutro</span>
                        <span>Total acuerdo</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón de envío fijo en el footer */}
          <div style={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            width: '100%', 
            background: '#0f172a', 
            borderTop: '1px solid #1e293b', 
            padding: '16px 20px', 
            zIndex: 40,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => submitAnswers(false)}
              disabled={submittingSection}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: submittingSection ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
            >
              {submittingSection ? 'Enviando Respuestas...' : 'Finalizar Sección y Guardar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Vista de examen completado totalmente
  if (test && test.status === 'COMPLETADO') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', border: '1px solid #10b981', padding: '40px 32px', borderRadius: '24px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Award size={48} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px', color: '#10b981' }}>¡Evaluación Completada!</h2>
          <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '15px', margin: '0 0 8px' }}>Muchas gracias, {candidate.sender_name}.</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>Has finalizado con éxito todas las pruebas psicométricas del proceso de selección para la vacante de <strong>{candidate.position}</strong>. Tus resultados han sido enviados automáticamente al departamento de selección corporativa.</p>
          <span style={{ fontSize: '12px', background: '#334155', padding: '8px 16px', borderRadius: '16px', color: '#cbd5e1' }}>Puedes cerrar esta ventana de forma segura.</span>
        </div>
      </div>
    );
  }

  // 4. Vista menú principal (Home de Evaluaciones)
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      {/* Header corporativo */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', borderBottom: '1px solid #1e293b', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Brain size={24} color="#3b82f6" />
            </div>
            <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', color: '#60a5fa' }}>Portal del Candidato</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Evaluación Psicológica y Psicométrica</h1>
          <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '15px' }}>
            Hola, <strong>{candidate.sender_name}</strong>. Has ingresado a la fase de pruebas para la vacante de <strong>{candidate.position}</strong>.
          </p>
        </div>
      </div>

      {/* Lista de sub-tests */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px 80px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
          ℹ️ <strong>Información general:</strong> Debes completar las 7 evaluaciones listadas a continuación. Puedes tomarlas en el orden que prefieras, pero una vez que inicies un test, no podrás pausarlo. Al finalizar el último test, tus resultados se sincronizarán con el reclutador automáticamente.
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exámenes Disponibles</h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {Object.entries(SECTION_DETAILS).map(([key, detail]) => {
            const status = test.sections_status?.[key] || 'PENDIENTE';
            const isCompleted = status === 'COMPLETADO';
            
            return (
              <div 
                key={key} 
                style={{ 
                  background: isCompleted ? 'rgba(30, 41, 59, 0.5)' : '#1e293b', 
                  border: `1px solid ${isCompleted ? '#1e293b' : '#334155'}`, 
                  borderRadius: '16px', 
                  padding: '20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '16px',
                  opacity: isCompleted ? 0.75 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: isCompleted ? '#94a3b8' : 'white' }}>{detail.title}</h4>
                    {detail.time > 0 && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', background: '#334155', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {detail.time / 60} min
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>{detail.desc}</p>
                </div>

                <div>
                  {isCompleted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>
                      <CheckCircle size={14} /> Completado
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartSectionClick(key)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      Iniciar <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
