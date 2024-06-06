import { Calendar } from "./components/Calendar";
import { EventsProvider } from "./context/Events";

function App() {
  return (
    // this way our calendar will have access to all of our different event information
    <EventsProvider>
      <Calendar />;
    </EventsProvider>
  );
}

export default App;
