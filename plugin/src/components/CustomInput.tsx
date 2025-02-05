import React, { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";

interface CustomInputProps {
  value: any;
  onChange: (value: any) => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({ value, onChange }) => {
  const [input, setInput] = useState(value || "");
  const [data, setData] = useState<any>({});
  const [initialInput, setInitialInput] = useState("");
  const [hasUserProvidedInitialInput, setHasUserProvidedInitialInput] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer?: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading,setLoading]=useState(false);
  const questions:any[] = [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [answers]);

  const handleSend = () => {
    if (input.trim() !== "") {
      if (!hasUserProvidedInitialInput) {
        // Add initial input as part of the conversation
        setInitialInput(input);
        setAnswers((prev) => [
          { question: "what is your Query", answer: input }, // Add initial input to conversation history
          ...prev,
        ]);
        setHasUserProvidedInitialInput(true);
      } else {
        setAnswers((prev) => [
          ...prev,
          { question: questions[currentQuestionIndex].question, answer: input }
        ]);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to next question
      }
      setInput(""); // Clear input field
    }
  };

  const handleSkip = () => {
    setAnswers((prev) => [
      ...prev,
      { question: questions[currentQuestionIndex].question, answer: undefined }
    ]);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to next question
    setInput(""); // Clear input field in case of skip
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

    const callGenerateDashboardAPI = async (payload: Record<string, string>) => {
        try {
          // Make the API call with correct headers and payload
          const response = await fetch(`${process.env.BACKEND_URL}/generate-dashboard`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // Set content type to JSON
            },
            body: JSON.stringify(payload), // Stringify the payload
          });
      
          // Check if the response is OK (status 200-299)
          if (!response.ok) {
            throw new Error(`Failed to generate dashboard: ${response.statusText}`);
          }
      
          // Parse the JSON response
          const result = await response.json();
      
          return result; // Return the result from the API
      
        } catch (error) {
          console.error("Error:", error);
          throw error; // Propagate the error
        }
    };
    
    const getDashboardData = async (uid: string) => {
        try {
            if (!uid) {
                throw new Error('UID not found please provide uid');
            }
            const response = await fetch(`${process.env.BACKEND_URL}/dashboard/${uid}`, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Failed to generate dashboard: ${response.statusText}`);
            }
            const result = await response.json();
            return result; 
        } catch (error) {
            console.error("Error:", error);
            throw error; 
        }
    }
    
    const callImportDashboardAPI = async (grafanaPayload: any) => {
        const myHeaders = new Headers();
        
        myHeaders.append("accept", "application/json, text/plain, */*");
        myHeaders.append("content-type", "application/json");
      
        const raw = JSON.stringify({
          dashboard: grafanaPayload,
          overwrite: true,
        });
      
        const requestOptions: RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow" as RequestRedirect
        };
      
        try {
          const response = await fetch(`${window.location.origin}/api/dashboards/db`, requestOptions);

          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to import dashboard: ${errorMessage}`);
          }   
      
          return response.json();
        } catch (error: any) {
          console.error("Error:", error.message);
          throw error;
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const url = window.location.href;
            const match = url.match(/\/d\/([^/]+)\//);
            const UID = match ? match[1] : '';
            
            if (UID && UID !== "new") {
                try {
                    const data = await getDashboardData(UID);
                    setData(data);
                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                }
            }
        };
        fetchDashboardData(); 
    }, []);

  
    const handleSubmit = async () => {
        setLoading(true);
        const payload: Record<string, string> = {};

        // Prepare initial payload
        if (initialInput) {
            payload.prompt = initialInput;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const panelId = urlParams.get("editPanel");

        if (answers[0]?.answer) {
            
            const additionalData = data
                ? `\n also here is json: ${JSON.stringify(data)} \n\n You provided the previous input containing UID and ID. Please use these IDs to create/modify the dashboard! ${panelId && `\n please update only panel which has id: ${panelId}`}`
                : "\n";
            payload.prompt = answers[0].answer + additionalData;
        }

        try {
            const result = await callGenerateDashboardAPI(payload);
            const importResult = await callImportDashboardAPI(result.grafanaPayload.dashboard);
            
            console.log("import result", importResult)
            onChange(importResult)
            
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const fullUrl = importResult.url.startsWith("http") ? importResult.url : `${baseUrl}${importResult.url}`;
        
            console.log("Import successful. Navigating to:", fullUrl);
            window.location.href = fullUrl;
        } catch (error: any) {
            console.error("Error:", error.message);
        } finally {
            resetState();
            
        }
    };
  
  // State Reset
  const resetState = () => {
    setLoading(false);
    setInput("");
    setInitialInput("");
    setHasUserProvidedInitialInput(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };
  
  

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{
        backgroundColor: '#181B1F',
        border: '1px solid rgba(163, 163, 163, 0.12)',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Chat Window */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '5px',
          color: '#D1D5DB',
        }}>
          <div style={{ spaceY: '8px' }}>
            {answers.map((item, index) => (
              <div key={index} style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#3e3e3e',
                marginTop:'2px',
              }}>
                <p style={{ fontSize: '14px', color: '#E5E7EB' }}>
                  <strong>Q:</strong> {item.question}
                </p>
                <p style={{ fontSize: '14px', color: '#D1D5DB' }}>
                  <strong>A:</strong> {item.answer}
                </p>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>
      
        {/* Input Section */}
        <div style={{ padding: '8px' }}>
          {!hasUserProvidedInitialInput ? (
            <div style={{ spaceY: '16px' }}>
              <p style={{ color: '#D1D5DB', fontSize: '16px' }}>How May I assist You:</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your initial input..."
                  style={{
                    flex: 1,
                    padding: '8px',
                    width: '100%',
                    borderRadius: '3px',
                    backgroundColor: '#111217',
                    color: '#D1D5DB',
                    placeholderColor: '#6B7280',
                    border: 'none',
                    outline: 'none',
                  }}
                />
              <button
                onClick={handleSend}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: loading ? '#1f49a4' : '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '5px',
                  marginTop: '5px',
                  border: 'solid 1px #ffffff20',
                  cursor: 'pointer',
                  disabledOpacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={loading}
              >
                Send <FiSend />
              </button>
              </div>
            </div>
          ) : currentQuestionIndex < questions.length ? (
            <div style={{ spaceY: '16px' }}>
              <p style={{ color: '#D1D5DB', fontSize: '18px' }}>{currentQuestion.question}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '3px',
                    backgroundColor: '#333',
                    color: '#D1D5DB',
                    placeholderColor: '#6B7280',
                    border: 'none',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSend}
                  style={{
                    padding: '5px',
                    backgroundColor: '#4B5563',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    disabledOpacity: 0.5,
                  }}
                  disabled={!input.trim()}
                >
                  <FiSend />
                </button>
                <button
                  onClick={handleSkip}
                  style={{
                    padding: '5px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div style={{ spaceY: '16px' }}>
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: loading ? '#1f49a4' : '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  disabledOpacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={loading}
              >
                {loading ? <div className="loader" />: "Submit"}
              </button>
            </div>
          )}
        </div>
      </div>
      
  
    );

};
