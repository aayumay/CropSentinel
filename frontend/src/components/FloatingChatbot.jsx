import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles } from 'lucide-react';
import { useCropSentinel } from '../state/AppContext';
import { useI18n } from '../I18nContext';
import { formatINR } from '../utils/currency';

export default function FloatingChatbot() {
  const { state } = useCropSentinel();
  const { language } = useI18n();
  const isHindi = language === 'hi';
  const isGujarati = language === 'gu';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Update welcome message dynamically if language changes
  useEffect(() => {
    setMessages([{ 
      id: 1, 
      type: 'bot', 
      text: isGujarati 
        ? 'નમસ્તે! હું તમારો ક્રોપસેન્ટીનલ સલાહકાર છું. હું તમને કેવી રીતે મદદ કરી શકું?'
        : isHindi 
          ? 'नमस्ते! मैं आपका क्रॉपसेंटिनल सलाहकार हूँ। मैं आपकी कैसे मदद कर सकता हूँ?' 
          : 'Hi! I am your CropSentinel AI Assistant. How can I help you today?' 
    }]);
  }, [isHindi, isGujarati]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate AI response
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        const analysis = state.activeAnalysis;
        const activeFarm = state.farms?.find(f => String(f.id) === String(state.activeFarmId));
        const farmName = activeFarm?.farm_name || 'your farm';

        if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('नमस्ते') || lowerText.includes('નમસ્તે')) {
          const greeting = isGujarati
            ? `નમસ્તે! હું તમારો ખેતી સલાહકાર છું. આજે આપણે ${farmName} માટે શું જોવું જોઈએ?`
            : isHindi 
              ? `नमस्ते! मैं आपका सलाहकार हूँ। आज हम ${farmName} के लिए क्या देख सकते हैं?`
              : `Hello! I am your practical farming advisor. What should we look at for ${farmName} today?`;
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: greeting }]);
          return;
        }

        if (lowerText.includes('water') || lowerText.includes('irrigate') || lowerText.includes('सिंचाई') || lowerText.includes('સિંચાઈ') || lowerText.includes('પાણી')) {
          let naturalResponse = '';
          const rainProb = analysis?.weather?.forecast?.[0]?.rain_probability || 0;
          const humidity = analysis?.weather?.current?.humidity || 0;
          const isDry = analysis?.satellite?.moisture === 'LOW' || analysis?.risk?.risk_level === 'HIGH';

          if (rainProb > 50 || humidity > 70) {
            naturalResponse = isGujarati
              ? `${farmName} પર આગામી દિવસોમાં વરસાદની સંભાવના છે. અત્યારે સિંચાઈ ટાળો.`
              : isHindi
                ? `${farmName} पर आने वाले दिनों में बारिश की संभावना है। अभी सिंचाई करने से बचें।`
                : `There is a high chance of rain for ${farmName} in the coming days. Delay irrigation for now.`;
          } else if (isDry) {
            naturalResponse = isGujarati
              ? `${farmName} સૂકું છે. આગામી 48 કલાકમાં 1-1.5 ઇંચ પાણી આપો.`
              : isHindi
                ? `${farmName} सूखा है। अगले 48 घंटों में 1-1.5 इंच पानी दें।`
                : `${farmName} is dry. Provide 1-1.5 inches of water within the next 48 hours.`;
          } else {
            naturalResponse = isGujarati
              ? `${farmName} માં ભેજનું સ્તર સારું છે. હમણાં સિંચાઈની જરૂર નથી.`
              : isHindi
                ? `${farmName} में नमी का स्तर अच्छा है। अभी सिंचाई की आवश्यकता नहीं है।`
                : `Moisture levels for ${farmName} are optimal. No irrigation needed at this time.`;
          }
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: naturalResponse }]);
          
        } else if (lowerText.includes('risk') || lowerText.includes('danger') || lowerText.includes('health') || lowerText.includes('खतरा') || lowerText.includes('જોખમ') || lowerText.includes('स्वास्थ्य') || lowerText.includes('સ્વાસ્થ્ય') || lowerText.includes('स्थिति') || lowerText.includes('status')) {
          let naturalResponse = '';
          const score = analysis?.satellite?.farm_health_score || 0;

          if (score <= 50) {
            naturalResponse = isGujarati
              ? `${farmName} માં ગંભીર જોખમ છે. કૃપા કરીને તાત્કાલિક નિરીક્ષણ કરો.`
              : isHindi
                ? `${farmName} में गंभीर खतरा है। कृपया खेत का तुरंत निरीक्षण करें।`
                : `There is a high risk in ${farmName}. Please conduct an immediate physical inspection.`;
          } else {
            naturalResponse = isGujarati
              ? 'પાક સ્વસ્થ છે. વર્તમાન ખેતી પદ્ધતિઓ ચાલુ રાખો.'
              : isHindi
                ? 'फसल स्वस्थ है। वर्तमान कृषि प्रथाओं को जारी रखें।'
                : 'The crop is healthy. Continue your current farming practices.';
          }
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: naturalResponse }]);
          
        } else if (lowerText.includes('details') || lowerText.includes('technical') || lowerText.includes('तकनीकी') || lowerText.includes('વિગતો') || lowerText.includes('તકનીકી')) {
          const ndvi = analysis?.satellite?.ndvi ?? 'N/A';
          const riskScore = analysis?.risk?.risk_score ?? 'N/A';
          const action = analysis?.intervention?.action || 'N/A';
          
          const naturalResponse = isGujarati
            ? `**તકનીકી વિગતો:**\n• NDVI: ${ndvi}\n• જોખમ સ્કોર: ${riskScore}\n• સૂચન: ${action}`
            : isHindi
              ? `**तकनीकी विवरण:**\n• NDVI: ${ndvi}\n• जोखिम स्कोर: ${riskScore}\n• सुझाव: ${action}`
              : `**Technical Details:**\n• NDVI: ${ndvi}\n• Risk Score: ${riskScore}\n• Raw Action: ${action}`;
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: naturalResponse }]);
          
        } else {
          // Fallback parsing action but masking it behind friendly language
          const hasIssue = analysis?.risk?.risk_level === 'CRITICAL' || analysis?.risk?.risk_level === 'HIGH';
          let naturalResponse = '';
          
          if (hasIssue) {
             naturalResponse = isGujarati
               ? 'એક સમસ્યા મળી છે. કૃપા કરીને વધુ સલાહ માટે "જોખમ" અથવા "સિંચાઈ" પર ટેપ કરો.'
               : isHindi
                 ? 'एक समस्या मिली है। कृपया अधिक सलाह के लिए "खतरा" या "सिंचाई" पर टैप करें।'
                 : 'An issue was detected. Please tap on "Risk" or "Irrigation" for specific advice.';
          } else {
             naturalResponse = isGujarati
               ? 'ખેતરની સ્થિતિ સામાન્ય છે. વધુ જાણવા માટે ઉપરના વિકલ્પોમાંથી પસંદ કરો.'
               : isHindi
                 ? 'खेत सामान्य है। अधिक जानने के लिए ऊपर दिए गए विकल्पों में से चुनें।'
                 : 'Farm conditions are normal. Select an option above to know more.';
          }
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: naturalResponse }]);
        }
      }, 800);
    };

  // Context-aware suggestions
  const isHealthy = state.activeAnalysis?.risk?.risk_level !== 'CRITICAL' && state.activeAnalysis?.risk?.risk_level !== 'HIGH';
  
  const SUGGESTIONS = isGujarati 
    ? (isHealthy 
      ? ["🌱 પાકની સ્થિતિ", "🌦 હવામાન આગાહી", "📈 બજાર ભાવ"] 
      : ["💧 સિંચાઈ સલાહ", "🐛 જીવાત જોખમ", "⚠️ તાત્કાલિક પગલાં"])
    : isHindi 
      ? (isHealthy 
        ? ["🌱 फसल की स्थिति", "🌦 मौसम पूर्वानुमान", "📈 बाजार भाव"] 
        : ["💧 सिंचाई सलाह", "🐛 रोग जोखिम", "⚠️ तत्काल कार्रवाई"])
      : (isHealthy 
        ? ["🌱 Crop Status", "🌦 Weather Forecast", "📈 Market Prices"] 
        : ["💧 Irrigation Advice", "🐛 Pest Risk", "⚠️ Immediate Action"]);

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 80, // Above bottom nav
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--cs-accent)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(74,124,89,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'scale(0)' : 'scale(1)',
        }}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        width: 320,
        height: 480,
        background: 'var(--cs-card)',
        borderRadius: 24,
        boxShadow: '0 8px 32px var(--cs-shadow-md)',
        border: '1px solid var(--cs-border-soft)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 1001,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'bottom right',
        transform: isOpen ? 'scale(1)' : 'scale(0)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--cs-accent)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                {isGujarati ? 'ખેતી સલાહકાર' : isHindi ? 'कृषि सलाहकार' : 'AI Assistant'}
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                {isGujarati ? 'CropSentinel દ્વારા સંચાલિત' : isHindi ? 'CropSentinel द्वारा संचालित' : 'Powered by CropSentinel'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--cs-bg)', boxSizing: 'border-box' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: msg.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.type === 'user' ? 'var(--cs-accent-light)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {msg.type === 'user' ? <User size={14} color="var(--cs-accent)" /> : <Bot size={14} color="#64748B" />}
              </div>
              <div style={{
                background: msg.type === 'user' ? 'var(--cs-accent)' : 'var(--cs-card)',
                color: msg.type === 'user' ? '#fff' : 'var(--cs-text)',
                padding: '12px 16px',
                borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                fontSize: 13,
                lineHeight: 1.5,
                maxWidth: '75%',
                boxShadow: '0 2px 8px var(--cs-shadow)',
                border: msg.type === 'user' ? 'none' : '1px solid var(--cs-border-soft)',
                boxSizing: 'border-box',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips Area */}
        <div style={{ 
          display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', 
          background: 'var(--cs-bg)', borderTop: '1px solid var(--cs-border-soft)',
          scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
          {SUGGESTIONS.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              style={{
                background: 'var(--cs-card)', border: '1px solid var(--cs-border)', 
                color: 'var(--cs-text)', padding: '6px 12px', borderRadius: 16, 
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                boxShadow: '0 1px 3px var(--cs-shadow)', flexShrink: 0
              }}
            >
              {chip}
            </button>
          ))}
        </div>
        <style>{`
          div::-webkit-scrollbar { display: none; } /* Hide scrollbar for chips */
        `}</style>

        {/* Input Area */}
        <div style={{ padding: 16, background: 'var(--cs-card)', borderTop: '1px solid var(--cs-border-soft)', display: 'flex', gap: 10, alignItems: 'center', boxSizing: 'border-box' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={isGujarati ? 'કંઈપણ પૂછો...' : isHindi ? 'कुछ पूछें...' : 'Ask anything...'}
            style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', background: 'var(--cs-bg)', border: '1px solid var(--cs-border)', borderRadius: 20, padding: '12px 16px', fontSize: 14, outline: 'none', color: 'var(--cs-text)' }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() ? 'var(--cs-accent)' : 'var(--cs-border)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s', flexShrink: 0 }}
          >
            <Send size={16} style={{ marginLeft: 2 }} />
          </button>
        </div>
      </div>
    </>
  );
}
