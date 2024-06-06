import { createContext, useState, useEffect } from "react";
import { UnionOmit } from "../utils/types";
import { EVENT_COLORS } from "./useEvents";
// This is the context pattern to make the default value null with a union type
// Enum
// export const EVENT_COLORS = ["red", "green", "blue"] as const;
export type Event = {
  id: string;
  name: string;
  //   color: "red" | "green" | "blue";
  color: (typeof EVENT_COLORS)[number];
  date: Date;
} & ( // if allDay is false, then we can have a start and stop time
  | { allDay: false; startTime: string; endTime: string }
  // If we define all day as true, we cannot define a start time or end time
  | { allDay: true; startTime?: never; endTime?: never }
);
// omits do not work well with unions so we have to make our own omit
type EventsContext = {
  events: Event[];
  // The event will require all the properties except for the id
  //   addEvent: (event: Omit<Event, "id">) => void;
  addEvent: (event: UnionOmit<Event, "id">) => void;
  updateEvent: (id: string, event: UnionOmit<Event, "id">) => void;
  deleteEvent: (id: string) => void;
};
// the default value is null an dwe are creating the same pattern here
export const Context = createContext<EventsContext | null>(null);
// const e: Event = {
//   allDay: true,
//   name: "string",
//   id: "string",
//   date: new Date(),
//   color: "red",
//   startTime: "sdfsd",
// };
type EventsProviderProps = {
  children: React.ReactNode;
};
export function EventsProvider({ children }: EventsProviderProps) {
  // const [events, setEvents] = useLocalStorage();
  //   const [events, setEvents] = useState<Event[]>([]);
  //   const [events, setEvents] = useLocalStorage<Event[]>([]);
  const [events, setEvents] = useLocalStorage("EVENTS", []);

  // We need to create a hook that allows us to consume this event
  function addEvent(eventDetails: UnionOmit<Event, "id">) {
    setEvents((e) => [...e, { ...eventDetails, id: crypto.randomUUID() }]);
  }
  // Event will require all the Event properties except for an id
  function updateEvent(id: string, eventDetails: UnionOmit<Event, "id">) {
    setEvents((e) => {
      // Is this a current event. If it is take all the event details and replace them with the new event details
      // Otherwise just keep the event exactly as it was before
      return e.map((event) => {
        return event.id === id ? { id, ...eventDetails } : event;
      });
    });
  }
  //   return <Context.Provider value={null}>{children}</Context.Provider>;
  function deleteEvent(id: string) {
    setEvents((e) => e.filter((event) => event.id !== id));
  }
  return (
    <Context.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </Context.Provider>
  );
}

function useLocalStorage(key: string, initialValue: Event[]) {
  const [value, setValue] = useState<Event[]>(() => {
    const jsonValue = localStorage.getItem(key);
    // if we don't have anything in local storage, then return the default value
    if (jsonValue == null) return initialValue;
    // otherwise parse the JSON, make sure everything converts properly, put all of the dates back into date format.
    return (JSON.parse(jsonValue) as Event[]).map((event) => {
      if (event.date instanceof Date) return event;
      return { ...event, date: new Date(event.date) };
    });
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    // local storage will be updated anytime a value or a key is changed
  }, [value, key]);

  return [value, setValue] as const;
}
// custom hook
// export function useEvents() {
//   const value = useContext(Context);
//   if (value == null) {
//     throw new Error("useEvents must be used within an EventsProvider");
//   }
//   return value;
// }
