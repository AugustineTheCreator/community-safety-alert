import IncidentForm from "./components/IncidentForm";
import IncidentList from "./components/IncidentList";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-700">
        Community Safety Alert 🚨
      </h1>
      <IncidentForm onSubmit={() => {}} /> 
      <IncidentList />
    </div>
  );
}

export default App;
