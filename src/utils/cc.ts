// concatenate strings
// take in an unknown amount of parameters for the array
// use the spread operator
export function cc(...classes: unknown[]) {
  // if the class has a type of string, then keep it. Otherwise, remove it.
  return classes.filter((c) => typeof c === "string").join(" ");
}
// The class day is going to be applied automatically. THen we have a bunch of conditionals that are either going to return false, if this is not the false day or a string that is going to render out the actual class
// Take this class and remove anything that is not a string
// cc("day", isFirstDay && "first-day");
// without this function we would have ot do the following
// `day ${isFirstDay ? "first-day" : undefined}`
