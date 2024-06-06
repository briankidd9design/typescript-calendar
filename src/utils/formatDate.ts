export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  // Depending on where you live, the current locale is used to render out the date
  // We are using a brand new formatter that is using the current locale and whatever options we pass in
  // This options property, we can actually get from the date/time formatter
  // we want to make options optional because sometimes the default formatter is sufficient enough for our use case.
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
