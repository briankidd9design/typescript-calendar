export type UnionOmit<T, K extends string | number | symbol> = T extends unknown
  ? Omit<T, K>
  : never;
// We take in a generic T which is the thing we want to get rid of, so this is an event in our case
// we are taking our union and calling our funciton on each portion of our union
// when T is unknown it is going to do one thing and when it is not unknown it is going to do something else.
// with T extends unknown, what this means is that if you have a union, it is going to distribute this across all the unions
// This will take our unknown and split it into all of its different parts
// We are distributing T extends unknown across all the unions
// We are going to take our union, split it into all of its different parts and then run whatever code comes after the question mark for each part of our union
// We are omitting our T with K or doing nothing at all
// We are taking our union and calling omit on each portion of the union
