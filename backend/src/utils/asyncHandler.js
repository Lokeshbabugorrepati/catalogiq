// Express 4 does not automatically catch rejected promises inside async route handlers.
// Without this wrapper, any error thrown inside an async controller (a bad AI call,
// a malformed response, a DB hiccup) becomes an unhandled rejection and crashes the
// whole Node process - killing every other user's request too. This wraps every
// async handler so errors are passed to the central error middleware in app.js instead.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
