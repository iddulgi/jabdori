import { useState, useRef, useEffect } from 'react';
import { INITIAL_STEPS, JABDORI_MESSAGES, SCENARIO_RESPONSES } from './data/messages';
import type { Step } from './data/messages';

type ViewMode = 'INTRO' | 'CHAT' | 'ALL_MESSAGES';

interface ChatEntry {
  type: 'BOT' | 'USER';
  text: string;
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('INTRO');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentStep]);

  // 시나리오 시작 (활기찬 하루 / 멘탈 강화)
  const startScenario = (type: string, label: string) => {
    setViewMode('CHAT');
    // 사용자가 누른 버튼을 먼저 말풍선으로 추가
    setHistory([{ type: 'USER', text: label }]);
    // 0.5초 뒤에 봇의 첫 질문이 나타나도록 설정 (선택 사항이나 자연스러움 위해)
    setTimeout(() => {
      setCurrentStep(INITIAL_STEPS[type]);
    }, 300);
  };

  // 답변 선택 핸들러
  const handleOptionClick = (label: string, isFinal?: boolean) => {
    // 1. 현재 질문을 대화 기록(history)에 먼저 추가하여 고정시킵니다.
    if (currentStep) {
      setHistory(prev => [...prev, { type: 'BOT', text: currentStep.question }]);
    }

    // 2. 유저의 답변 말풍선을 추가합니다.
    setHistory(prev => [...prev, { type: 'USER', text: label }]);

    // 3. 현재 단계(버튼들)를 정리합니다.
    setCurrentStep(null);

    if (isFinal) {
      setTimeout(() => {
        const responses = SCENARIO_RESPONSES[label] || JABDORI_MESSAGES;

        // 로컬 스토리지에서 현재 라벨에 대한 인덱스 가져오기 (없으면 0)
        const storageKey = `jabdori_msg_idx_${label}`;
        const currentIdx = parseInt(localStorage.getItem(storageKey) || '0', 10);

        // 순서대로 메시지 선택
        const selectedMsg = responses[currentIdx % responses.length];

        // 다음 인덱스 저장 (무한 루프)
        localStorage.setItem(storageKey, (currentIdx + 1).toString());

        setHistory(prev => [...prev, { type: 'BOT', text: selectedMsg }]);
      }, 600);
    }
  };

  const resetToHome = () => {
    setViewMode('INTRO');
    setHistory([]);
    setCurrentStep(null);
  };

  return (
    <div id="root">
      <div className="app-container" ref={scrollRef}>
        {/* 공통 타이틀: 인트로일 때 크고 중앙, 대화 중일 때 작고 상단 */}
        <h1 className={viewMode !== 'INTRO' ? 'shrink' : ''}>
          안녕하세요, 제로{"\n"}무엇을 도와드릴까요?
        </h1>

        {/* 인트로 메인 화면 */}
        {viewMode === 'INTRO' && (
          <div className="intro-buttons">
            <button className="action-pill" onClick={() => startScenario('energetic', '활기찬 하루 만들기')}>
              활기찬 하루 만들기
            </button>
            <button className="action-pill" onClick={() => startScenario('mental', '멘탈 강화 훈련하기')}>
              멘탈 강화 훈련하기
            </button>
            <button className="action-pill" onClick={() => setViewMode('ALL_MESSAGES')}>
              전체보기
            </button>
          </div>
        )}

        {/* 챗봇 대화 영역 */}
        {viewMode === 'CHAT' && (
          <div className="chat-window">
            {/* 지나간 대화 기록 */}
            {history.map((chat, index) => (
              <div key={index} className={chat.type === 'USER' ? 'bubble user-bubble' : 'bot-message'}>
                {chat.type === 'USER' ? (
                  chat.text
                ) : (
                  <div className="bot-text">{chat.text}</div>
                )}
              </div>
            ))}

            {/* 현재 대기 중인 봇의 질문과 답변지 */}
            {currentStep && (
              <div className="bot-message">
                <div className="bot-text">{currentStep.question}</div>
                <div className="option-group">
                  {currentStep.options.map((opt, idx) => (
                    <button
                      key={idx}
                      className="action-pill"
                      onClick={() => handleOptionClick(opt.label, opt.isFinal)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 전체보기 영역 */}
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

      {/* 처음으로 돌아가기 버튼 (하단 고정) */}
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
