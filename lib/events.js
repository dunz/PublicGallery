import EventEmitter3 from 'eventemitter3';

const events = new EventEmitter3();

export const addListener = (...params) => {
  events.addListener(...params);
  return events.removeListener.bind(events, ...params);
};

export default events;
