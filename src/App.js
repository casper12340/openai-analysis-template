import { useState } from "react";
import Papa from "papaparse";
import ReactMarkdown from "react-markdown";
import './App.css'; // Ensure to import the CSS file

function App() {
  const [oldData, setOldData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentNames, setAgentNames] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  
  // Function to parse CSV
  const handleFileUpload = (event, period) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        if (period === "old") {
          setOldData(result.data);
        } else {
          setNewData(result.data);
        }
        
        // Update available agent names after each file upload
        updateAgentNames(period === "old" ? result.data : oldData, period === "new" ? result.data : newData);
      },
    });
  };
  
  // Function to update agent names from both datasets
  const updateAgentNames = (oldDataset, newDataset) => {
    if (!oldDataset.length && !newDataset.length) return;
    
    const names = new Set();
    
    // Extract names from old data
    oldDataset.forEach(row => {
      if (row["Name"]) names.add(row["Name"]);
    });
    
    // Extract names from new data
    newDataset.forEach(row => {
      if (row["Name"]) names.add(row["Name"]);
    });
    
    const nameArray = Array.from(names).sort();
    setAgentNames(nameArray);
    
    // Select all agents by default
    setSelectedAgents(nameArray);
  };
  
  // Handle agent selection toggle
  const handleAgentToggle = (name) => {
    setSelectedAgents(prev => {
      if (prev.includes(name)) {
        return prev.filter(agent => agent !== name);
      } else {
        return [...prev, name];
      }
    });
  };
  
  // Handle "Select All" toggle
  const handleSelectAllAgents = () => {
    if (selectedAgents.length === agentNames.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents([...agentNames]);
    }
  };
  
  const processPeriodicData = (data) => {
    const metrics = {};
    data.forEach((row) => {
      const name = row["Name"];
      
      // Skip if this agent is not selected
      if (!selectedAgents.includes(name)) return;
      
      if (!metrics[name]) {
        metrics[name] = {
          "Messages Sent": 0,
          "Unique Conversations Messaged": 0,
          "Conversations Marked Done": 0,
          "Unique Customers Messaged": new Set(),
          "Avg Conversation Handle Time (s)": [],
          "Avg Sent Messages Per Conversation": [],
          "Avg Sent Messages Per Customer": [],
          "First Contact Resolution Rate": [],
          "Avg Message Response Times (ms)": [],
          "Avg First Response Time (ms)": [],
          "Median First Response Time (ms)": [],
          "Avg Time to First Resolution (ms)": [],
          "Median Time to First Resolution (ms)": [],
          "Total Time Logged In (ms)": 0,
          "Messages Sent With Shortcuts": 0,
          "Percent of Messages Sent With Shortcuts": [],
        };
      }
      // Aggregate numerical data
      metrics[name]["Messages Sent"] += row["Messages Sent"] || 0;
      metrics[name]["Unique Conversations Messaged"] += row["Unique Conversations Messaged"] || 0;
      metrics[name]["Conversations Marked Done"] += row["Conversations Marked Done"] || 0;
      metrics[name]["Unique Customers Messaged"].add(row["Unique Customers Messaged"]);
      metrics[name]["Total Time Logged In (ms)"] += row["Total Time Logged In (ms)"] || 0;
      metrics[name]["Messages Sent With Shortcuts"] += row["Messages Sent With Shortcuts"] || 0;
      // Push values for averaging later
      [
        "Avg Conversation Handle Time (s)",
        "Avg Sent Messages Per Conversation",
        "Avg Sent Messages Per Customer",
        "First Contact Resolution Rate",
        "Avg Message Response Times (ms)",
        "Avg First Response Time (ms)",
        "Median First Response Time (ms)",
        "Avg Time to First Resolution (ms)",
        "Median Time to First Resolution (ms)",
        "Percent of Messages Sent With Shortcuts",
      ].forEach((key) => {
        if (row[key] !== undefined) {
          metrics[name][key].push(row[key]);
        }
      });
    });
    // Compute averages and finalize data
    Object.keys(metrics).forEach((name) => {
      Object.keys(metrics[name]).forEach((key) => {
        if (Array.isArray(metrics[name][key])) {
          const values = metrics[name][key].filter((v) => v !== undefined);
          metrics[name][key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
      });
      metrics[name]["Unique Customers Messaged"] = metrics[name]["Unique Customers Messaged"].size;
    });
    return Object.fromEntries(Object.entries(metrics).filter(([_, data]) => data["Messages Sent"] >= 10));
  };
  
  const getPerformanceAnalysis = async () => {
    if (selectedAgents.length === 0) {
      alert("Selecteer tenminste één medewerker voor analyse.");
      return;
    }
    
    setLoading(true);
    const oldMetrics = processPeriodicData(oldData);
    const newMetrics = processPeriodicData(newData);
    const comparisonData = Object.keys({ ...oldMetrics, ...newMetrics }).map((name) => ({
      Name: name,
      "Oude Data": oldMetrics[name] || null,
      "Nieuwe Data": newMetrics[name] || null,
    }));
    
    const prompt = `
      Vergelijk de medewerker prestaties voor de volgende periodes:
      ${JSON.stringify(comparisonData, null, 2)}
      Identificeer prestatietrends, verbeteringen en gebieden die verbetering behoeven.
    `;
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.REACT_APP_OPENAI_API_TOKEN,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
        }),
      });
      const result = await response.json();
      setAnalysis(result.choices[0].message.content);
    } catch (error) {
      console.error("OpenAI API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h1 className="title" style={{'textAlign': 'center', 'marginTop': '0px'}}>Prestaties Vergelijken</h1>
      <p className="description" style={{'textAlign': 'center'}}>Upload hier de CSV files van de periodes die je wil vergelijken.</p>
      
      {/* File Upload Inputs */}
      <div className="file-upload">
        <div className="file-upload-group">
          <p style={{'fontWeight': 'bold', 'marginBottom': '10px'}}>Oude Data</p>
          <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, "old")} />
        </div>
        <div className="file-upload-group">
          <p style={{'fontWeight': 'bold', 'marginBottom': '10px'}}>Nieuwe Data</p>
          <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, "new")} />
        </div>
      </div>
      
      {/* Agent Selection Section - Only show when data is loaded */}
      {agentNames.length > 0 && (
        <div className="agent-selection">
          <h2 style={{'textAlign': 'center', 'marginTop': '20px'}}>Selecteer Medewerkers</h2>
          
          {/* Select All Option */}
          <div className="select-all-container" style={{'textAlign': 'center', 'marginBottom': '10px'}}>
            <button 
              onClick={handleSelectAllAgents}
              className="select-all-button"
            >
              {selectedAgents.length === agentNames.length ? "Deselecteer Alles" : "Selecteer Alles"}
            </button>
          </div>
          
          <div className="agent-checkboxes" style={{'display': 'flex', 'flexWrap': 'wrap', 'justifyContent': 'center', 'gap': '10px', 'marginBottom': '20px'}}>
            {agentNames.map(name => (
              <div key={name} className="agent-checkbox" style={{'margin': '5px', 'minWidth': '150px'}}>
                <label style={{'display': 'flex', 'alignItems': 'center', 'cursor': 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(name)}
                    onChange={() => handleAgentToggle(name)}
                    style={{'marginRight': '8px'}}
                  />
                  {name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Analyze Button */}
      <div style={{'textAlign': 'center'}}>
        <button
          onClick={getPerformanceAnalysis}
          className="analyze-button"
          disabled={loading || selectedAgents.length === 0} 
        >
          {loading ? "Analyseren..." : "Prestaties Analyseren"}
        </button>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
      </div>
      
      {/* Display Structured Analysis */}
      {analysis && (
        <div className="analysis-container">
          <h2 className="analysis-title">Prestaties Inzichten:</h2>
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;