import { useState, useRef, useEffect } from 'react';
import { INITIAL_STEPS, JABDORI_MESSAGES, SCENARIO_RESPONSES } from './data/messages';
import type { Step } from './data/messages';
import Typewriter from './components/Typewriter';

type ViewMode = 'INTRO' | 'CHAT' | 'ALL_MESSAGES';

interface ChatEntry {
  type: 'BOT' | 'USER';
  text: string;
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('INTRO');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [isTyping, setIsTyping] = useState(false); // 타이핑 상태 추가
  const [isIntroTyping, setIsIntroTyping] = useState(true); // 인트로 타이핑 상태

  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentStep, isTyping]); // isTyping 변경 시에도 스크롤 (옵션 등장 등)

  // 시나리오 시작 (활기찬 하루 / 멘탈 강화)
  const startScenario = (type: string, label: string) => {
    setViewMode('CHAT');
    setHistory([{ type: 'USER', text: label }]);
    setTimeout(() => {
      setCurrentStep(INITIAL_STEPS[type]);
      setIsTyping(true); // 타이핑 시작
    }, 800);
  };

  // 답변 선택 핸들러
  const handleOptionClick = (label: string, isFinal?: boolean) => {
    if (currentStep) {
      setHistory(prev => [...prev, { type: 'BOT', text: currentStep.question }]);
    }
    setHistory(prev => [...prev, { type: 'USER', text: label }]);
    setCurrentStep(null);
    setIsTyping(false); // 리셋

    if (isFinal) {
      setTimeout(() => {
        const responses = SCENARIO_RESPONSES[label] || JABDORI_MESSAGES;
        const storageKey = `jabdori_msg_idx_${label}`;
        const currentIdx = parseInt(localStorage.getItem(storageKey) || '0', 10);
        const selectedMsg = responses[currentIdx % responses.length];
        localStorage.setItem(storageKey, (currentIdx + 1).toString());

        setHistory(prev => [...prev, { type: 'BOT', text: selectedMsg }]);
      }, 600);
    }
  };

  const resetToHome = () => {
    setViewMode('INTRO');
    setHistory([]);
    setCurrentStep(null);
    setIsTyping(false);
    setIsIntroTyping(true);
  };

  return (
    <div id="root">
      <div className="app-container" ref={scrollRef}>
        <h1 className={viewMode !== 'INTRO' ? 'shrink' : ''}>
          {viewMode === 'INTRO' ? (
            <Typewriter
              text={`안녕하세요, 제로\n무엇을 도와드릴까요?`}
              speed={30}
              onComplete={() => setIsIntroTyping(false)}
            />
          ) : (
            `안녕하세요, 제로\n무엇을 도와드릴까요?`
          )}
        </h1>

        {viewMode === 'INTRO' && (
          <div className="intro-buttons">
            {!isIntroTyping && (
              <>
                <button
                  className="action-pill fade-in-stagger"
                  style={{ animationDelay: '0s' }}
                  onClick={() => startScenario('energetic', '활기찬 하루 만들기')}
                >
                  활기찬 하루 만들기
                </button>
                <button
                  className="action-pill fade-in-stagger"
                  style={{ animationDelay: '0.1s' }}
                  onClick={() => startScenario('mental', '멘탈 강화 훈련하기')}
                >
                  멘탈 강화 훈련하기
                </button>
                <button
                  className="action-pill fade-in-stagger"
                  style={{ animationDelay: '0.2s' }}
                  onClick={() => setViewMode('ALL_MESSAGES')}
                >
                  전체보기
                </button>
              </>
            )}
          </div>
        )}

        {viewMode === 'CHAT' && (
          <div className="chat-window">
            {history.map((chat, index) => (
              <div key={index} className={chat.type === 'USER' ? 'bubble user-bubble' : 'bot-message'}>
                {chat.type === 'USER' ? (
                  chat.text
                ) : (
                  <div className="bot-text">
                    {/* 마지막 메시지이고 봇이면 타이핑 효과, 아니면 그냥 텍스트 */}
                    {index === history.length - 1 ? (
                      <Typewriter text={chat.text} speed={30} />
                    ) : (
                      chat.text
                    )}
                  </div>
                )}
              </div>
            ))}

            {currentStep && (
              <div className="bot-message">
                <div className="bot-text">
                  <Typewriter
                    text={currentStep.question}
                    speed={30}
                    onComplete={() => setIsTyping(false)}
                  />
                </div>
                {/* 타이핑이 끝나야 옵션 노출 (!isTyping) */}
                {!isTyping && (
                  <div className="option-group">
                    {currentStep.options.map((opt, idx) => (
                      <button
                        key={idx}
                        className="action-pill fade-in-stagger"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        onClick={() => handleOptionClick(opt.label, opt.isFinal)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'ALL_MESSAGES' && (
          <div className="chat-window">
            <div className="bubble user-bubble">잡도리 전체 보기</div>
            <div className="option-group" style={{ alignItems: 'flex-start', marginTop: 0, width: '100%', gap: '32px' }}>
              {JABDORI_MESSAGES.map((msg, idx) => (
                <div key={idx} className="bot-text" style={{ fontSize: '18px', animationDelay: `${idx * 0.1}s` }}>
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode !== 'INTRO' && (
        <div className="footer-nav">
          <button className="return-pill" onClick={resetToHome}>
            일하러 가기
          </button>
        </div>
      )}
    </div>
  );
}
