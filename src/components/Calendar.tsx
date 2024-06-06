import { FormEvent, useMemo, useState, useId, useRef, Fragment } from "react";
// import fomatDate from "./utils/formaDate.ts"
import {
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  endOfDay,
  isToday,
  subMonths,
  addMonths,
  isSameDay,
  parse,
} from "date-fns";

import { formatDate } from "../utils/formatDate";
import { cc } from "../utils/cc";
import { UnionOmit } from "../utils/types";
import { useEvents, EVENT_COLORS } from "../context/useEvents";
import { Modal, ModalProps } from "./Modal";
import { Event } from "../context/Events";
import { OverflowContainer } from "./OverflowContainer";

export function Calendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  // This is similar to the Date Picker project
  const calendarDays = useMemo(() => {
    // We only want to run this code every time the selected month changes
    // we can can this happen by wrapping the code in a useMemo
    // Using datfns
    const firstWeekStart = startOfWeek(startOfMonth(selectedMonth));
    const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth));
    return eachDayOfInterval({
      start: firstWeekStart,
      end: lastWeekEnd,
    });
  }, [selectedMonth]);
  const { events } = useEvents();
  return (
    <>
      {" "}
      <div className="calendar">
        <div className="header">
          <button
            className="btn"
            onClick={() => {
              setSelectedMonth(new Date());
            }}
          >
            Today
          </button>
          <div>
            <button
              className="month-change-btn"
              onClick={() => {
                // Click months backwards
                setSelectedMonth((m) => subMonths(m, 1));
              }}
            >
              &lt;
            </button>
            <button
              className="month-change-btn"
              onClick={() => {
                // click months forwards
                setSelectedMonth((m) => addMonths(m, 1));
              }}
            >
              &gt;
            </button>
          </div>
          {/* <span className="month-title">May 2024</span> */}
          <span className="month-title">
            {formatDate(selectedMonth, { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="days">
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={day.getTime()}
              day={day}
              // The event must be the same day as the day we are looping through.
              // isSameDay is a DateFNS property
              // the event date must be the same day as the date we are working on
              events={events.filter((event) => isSameDay(day, event.date))}
              // only show weekday for the first seven days on the actual calendar
              showWeekName={index < 7}
              selectedMonth={selectedMonth}
              // isSameMonth={isSameMonth}
            />
          ))}
        </div>
      </div>
    </>
  );
}
// Generally the type for the props should be named the same as the component function with the word "Props" at the end
type CalendarDayProps = {
  day: Date;
  showWeekName: boolean;
  selectedMonth: Date;
  events: Event[];
  // isSameMonth: Boolean;
};

function CalendarDay({
  day,
  showWeekName,
  selectedMonth,
  events,
}: CalendarDayProps) {
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isViewMoreEventModalOpen, setIsViewMoreEventModalOpen] =
    useState(false);

  const { addEvent } = useEvents();

  // If our events change, then we can recall this function
  const sortedEvents = useMemo(() => {
    // convert the actual time of the event to a number so that we can do a time comparison between them.
    const timeToNumber = (time: string) => parseFloat(time.replace(":", "."));

    return [...events].sort((a, b) => {
      if (a.allDay && b.allDay) {
        // we return 0 because we are saying that they are both exactly the same
        return 0;
        // since a is an all day event and b is not, a should be before b
      } else if (a.allDay) {
        return -1;
        // since b is an all day event and a is not, a should be before a and b should show up after a
      } else if (b.allDay) {
        return 1;
      } else {
        // if both of the events are all day, then show what event happens first
        return timeToNumber(a.startTime) - timeToNumber(b.startTime);
      }
    });
  }, [events]);

  return (
    // <div className={cc("day non-month-day old-month-day">
    <div
      // adding classes with the conditonal or custom classes helper function
      className={cc(
        "day",
        // all the days that are not in the same month are more opaque
        !isSameMonth(day, selectedMonth) && "non-month-day",
        // All the days before the current days are grayed out
        isBefore(endOfDay(day), new Date()) && "old-month-day"
      )}
    >
      <div className="day-header">
        {showWeekName && (
          <div className="week-name">
            {formatDate(day, { weekday: "short" })}
          </div>
        )}
        <div className={cc("day-number", isToday(day) && "today")}>
          {formatDate(day, { day: "numeric" })}
        </div>
        {/* <div className="day-number">{formatDate(day, { day: "2-digit" })}</div> */}
        {/* Plus button should create a modal that allows us to add a brand new event */}
        <button
          className="add-event-btn"
          onClick={() => setIsNewEventModalOpen(true)}
        >
          +
        </button>
      </div>
      {sortedEvents.length > 0 && (
        <OverflowContainer
          className="events"
          items={sortedEvents}
          getKey={(event) => event.id}
          renderItem={(event) => <CalendarEvent event={event} />}
          renderOverflow={(amount) => (
            <>
              <button
                onClick={() => setIsViewMoreEventModalOpen(true)}
                className="events-view-more-btn"
              >
                +{amount} More
              </button>
              <ViewMoreCalendarEventsModal
                events={sortedEvents}
                isOpen={isViewMoreEventModalOpen}
                onClose={() => setIsViewMoreEventModalOpen(false)}
              />
            </>
          )}
        />
        // <div className="events">
        //   {sortedEvents.map((event) => {
        //     return <CalendarEvent key={event.id} event={event} />;
        //   })}
        //   {/* <button className="all-day-event blue event">
        //     <div className="event-name">Short</div>
        //   </button>
        //   <button className="all-day-event green event">
        //     <div className="event-name">
        //       Long Event Name That Just Keeps Going
        //     </div>
        //   </button>
        //   <button className="event">
        //     <div className="color-dot blue"></div>
        //     <div className="event-time">7am</div>
        //     <div className="event-name">Event Name</div>
        //   </button> */}
        // </div>
      )}

      <EventFormModal
        date={day}
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSubmit={addEvent}
      />
    </div>
  );
}

type ViewMoreCalendarEventsModalProps = {
  events: Event[];
} & Omit<ModalProps, "children">;

function ViewMoreCalendarEventsModal({
  events,
  ...modalProps
}: ViewMoreCalendarEventsModalProps) {
  if (events.length === 0) return null;
  return (
    <Modal {...modalProps}>
      <div className="modal-title">
        <small>{formatDate(events[0]?.date, { dateStyle: "short" })}</small>
        <button onClick={modalProps.onClose} className="close-btn">
          &times;
        </button>
      </div>
      <div className="events">
        {events.map((event) => (
          <CalendarEvent event={event} key={event.id} />
        ))}
      </div>
    </Modal>
  );
}

function CalendarEvent({ event }: { event: Event }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateEvent, deleteEvent } = useEvents();

  return (
    // <button className="all-day-event blue event">
    <>
      <button
        onClick={() => setIsEditModalOpen(true)}
        className={cc("event", event.color, event.allDay && "all-day-event")}
      >
        {event.allDay ? (
          <div className="evente-name">{event.name}</div>
        ) : (
          <>
            <div className={`color-dot ${event.color}`}></div>
            <div className="event-time">
              {/* We take the time that is a string and parse it into a date using the
            HH:mm format */}
              {formatDate(parse(event.startTime, "HH:mm", event.date), {
                timeStyle: "short",
              })}
            </div>
            <div className="event-name">{event.name}</div>
          </>
        )}
      </button>
      <EventFormModal
        event={event}
        // date={day}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(e) => updateEvent(event.id, e)}
        onDelete={() => deleteEvent(event.id)}
      />
    </>
  );
}

type EventFormModalProps = {
  onSubmit: (event: UnionOmit<Event, "id">) => void;
} & ( // This is for an existing event // Take on an onDelete and event // this is for an existing event // one that just takes in a date // one that takes in an onDelete and an event // we have two different types:
  | { onDelete: () => void; event: Event; date?: never }
  // This is for a new event
  // event is never going to exist but date is going to exist
  // only takes in a date
  | { onDelete?: never; event?: never; date: Date }
) &
  Omit<ModalProps, "children">;

// event: Event;
// date: Date;

function EventFormModal({
  onSubmit,
  onDelete,
  event,
  date,
  ...modalProps
}: EventFormModalProps) {
  const isNew = event == null;
  const formId = useId();
  const [selectedColor, setSelectedColor] = useState(
    event?.color || EVENT_COLORS[0]
  );
  const [isAllDayChecked, setIsAllDayChecked] = useState(
    event?.allDay || false
  );
  const [startTime, setStartTime] = useState(event?.startTime || " ");
  const endTimeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const name = nameRef.current?.value;
    const endTime = endTimeRef.current?.value;
    // Make sure the name is defined
    // If it is defined make sure we use all the common properties for events
    // Then create a new event that is either an all-day event
    // If it is not an all day event, make sure our start and stop times are defined
    // and if so, create a new event that is not an all day event
    // then call the onsubmit function that is passed in

    if (
      name == null ||
      name === ""
      // startTime and endTime can be null as long as the all day is set to true
      // startTime == null ||
      // startTime === " " ||
      // endTime == null ||
      // endTime === ""
    ) {
      return;
    }
    // Every single event has these props no matter what.
    const commonProps = {
      name,
      date: date || event?.date,
      color: selectedColor,
    };
    let newEvent: UnionOmit<Event, "id">;
    if (isAllDayChecked) {
      newEvent = {
        ...commonProps,
        allDay: true,
      };
    } else {
      if (
        startTime == null ||
        startTime === "" ||
        endTime == null ||
        endTime === ""
      ) {
        return;
      }
      newEvent = {
        ...commonProps,
        allDay: false,
        startTime,
        endTime,
      };
    }
    modalProps.onClose();
    onSubmit(newEvent);
  }

  return (
    <Modal {...modalProps}>
      <div className="modal-title">
        <div>{isNew ? "Add" : "Edit"}</div>
        <small>{formatDate(date || event.date, { dateStyle: "short" })}</small>
        <button onClick={modalProps.onClose} className="close-btn">
          &times;
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`${formId}-name`}>Name</label>
          <input
            defaultValue={event?.name}
            ref={nameRef}
            required
            type="text"
            name="name"
            id={`${formId}-name`}
          />
        </div>
        <div className="form-group checkbox">
          <input
            checked={isAllDayChecked}
            onChange={(e) => setIsAllDayChecked(e.target.checked)}
            type="checkbox"
            id="all-day"
          />
          <label htmlFor={`${formId}-all-day`}>All Day?</label>
        </div>
        <div className="row">
          <div className="form-group">
            <label htmlFor={`${formId}-start-time`}>Start Time</label>
            <input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required={!isAllDayChecked}
              disabled={isAllDayChecked}
              type="time"
              id={`${formId}-start-time`}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${formId}-end-time`}>End Time</label>
            <input
              ref={endTimeRef}
              defaultValue={event?.endTime}
              min={startTime}
              required={!isAllDayChecked}
              disabled={isAllDayChecked}
              type="time"
              id={`${formId}-end-time`}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="row left">
            {EVENT_COLORS.map((color) => (
              <Fragment key={color}>
                <input
                  type="radio"
                  name="color"
                  value={color}
                  id={`${formId}-${color}`}
                  checked={selectedColor === color}
                  onChange={() => setSelectedColor(color)}
                  className="color-radio"
                />
                <label htmlFor={`${formId}-${color}`}>
                  <span className="sr-only">{color}</span>
                </label>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="row">
          <button className="btn btn-success" type="submit">
            {isNew ? "Add" : "Edit"}
          </button>
          {onDelete != null && (
            <button onClick={onDelete} className="btn btn-delete" type="button">
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
