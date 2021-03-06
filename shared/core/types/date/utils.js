// Parses an RFC 3339 compliant time-string into a Date.
// It does this by combining the current date with the time-string
// to create a new Date instance.
//
// Example:
// Suppose the current date is 2016-01-01, then
// parseTime('11:00:12Z') parses to a Date corresponding to
// 2016-01-01T11:00:12Z.
const parseTime = (time) => {
  const currentDateString = new Date().toISOString();
  return new Date(currentDateString.substr(0, currentDateString.indexOf('T') + 1) + time);
};

// Serializes a Date into an RFC 3339 compliant time-string in the
// format hh:mm:ss.sssZ.
const serializeTime = (date) => {
  const dateTimeString = date.toISOString();
  return dateTimeString.substr(dateTimeString.indexOf('T') + 1);
};

// Serializes an RFC 3339 compliant time-string by shifting
// it to UTC.
const serializeTimeString = (time) => {
  // If already formatted to UTC then return the time string
  if (time.indexOf('Z') !== -1) {
    return time;
  }

  // These are time-strings with timezone information,
  // these need to be shifted to UTC.

  // Convert to UTC time string in
  // format hh:mm:ss.sssZ.
  const date = parseTime(time);
  let timeUTC = serializeTime(date);

  // Regex to look for fractional second part in time string
  // such as 00:00:00.345+01:00
  const regexFracSec = /\.\d{1,}/;

  // Retrieve the fractional second part of the time
  // string if it exists.
  const fractionalPart = time.match(regexFracSec);
  if (fractionalPart == null) {
    // These are time-strings without the fractional
    // seconds. So we remove them from the UTC time-string.
    timeUTC = timeUTC.replace(regexFracSec, '');
    return timeUTC;
  }

  // These are time-string with fractional seconds.
  // Make sure that we inject the fractional
  // second part back in. The `timeUTC` variable
  // has millisecond precision, we may want more or less
  // depending on the string that was passed.
  timeUTC = timeUTC.replace(regexFracSec, fractionalPart[0]);
  return timeUTC;
};

// Parses an RFC 3339 compliant date-string into a Date.
//
// Example:
// parseDate('2016-01-01') parses to a Date corresponding to
// 2016-01-01T00:00:00.000Z.
const parseDate = (date) => {
  return new Date(date);
};

// Serializes a Date into a RFC 3339 compliant date-string
// in the format YYYY-MM-DD.
const serializeDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Parses an RFC 3339 compliant date-time-string into a Date.
const parseDateTime = (dateTime) => {
  return new Date(dateTime);
};

// Serializes a Date into an RFC 3339 compliant date-time-string
// in the format YYYY-MM-DDThh:mm:ss.sssZ.
const serializeDateTime = (dateTime) => {
  return dateTime.toISOString();
};

// Serializes an RFC 3339 compliant date-time-string by shifting
// it to UTC.
const serializeDateTimeString = (dateTime) => {
  // If already formatted to UTC then return the time string
  if (dateTime.indexOf('Z') !== -1) {
    return dateTime;
  }

  // These are time-strings with timezone information,
  // these need to be shifted to UTC.
  // Convert to UTC time string in
  // format YYYY-MM-DDThh:mm:ss.sssZ.
  let dateTimeUTC = (new Date(dateTime)).toISOString();

  // Regex to look for fractional second part in date-time string
  const regexFracSec = /\.\d{1,}/;

  // Retrieve the fractional second part of the time
  // string if it exists.
  const fractionalPart = dateTime.match(regexFracSec);

  if (fractionalPart == null) {
    // The date-time-string has no fractional part,
    // so we remove it from the dateTimeUTC variable.
    dateTimeUTC = dateTimeUTC.replace(regexFracSec, '');
    return dateTimeUTC;
  }

  // These are datetime-string with fractional seconds.
  // Make sure that we inject the fractional
  // second part back in. The `dateTimeUTC` variable
  // has millisecond precision, we may want more or less
  // depending on the string that was passed.
  dateTimeUTC = dateTimeUTC.replace(regexFracSec, fractionalPart[0])
  return dateTimeUTC
};

// Serializes a Unix timestamp to an RFC 3339 compliant date-time-string
// in the format YYYY-MM-DDThh:mm:ss.sssZ
const serializeUnixTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toISOString();
};

// Check whether a certain year is a leap year.
//
// Every year that is exactly divisible by four
// is a leap year, except for years that are exactly
// divisible by 100, but these centurial years are
// leap years if they are exactly divisible by 400.
// For example, the years 1700, 1800, and 1900 are not leap years,
// but the years 1600 and 2000 are.
//
const leapYear = (year) => {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
};

// Function that checks whether a time-string is RFC 3339 compliant.
//
// It checks whether the time-string is structured in one of the
// following formats:
//
// - hh:mm:ssZ
// - hh:mm:ss±hh:mm
// - hh:mm:ss.*sZ
// - hh:mm:ss.*s±hh:mm
//
// Where *s is a fraction of seconds with at least 1 digit.
//
// Note, this validator assumes that all minutes have
// 59 seconds. This assumption does not follow RFC 3339
// which includes leap seconds (in which case it is possible that
// there are 60 seconds in a minute).
//
// Leap seconds are ignored because it adds complexity in
// the following areas:
// - The native Javascript Date ignores them; i.e. Date.parse('1972-12-31T23:59:60Z')
//   equals NaN.
// - Leap seconds cannot be known in advance.
//
const validateTime = (time) => {
  const TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  return TIME_REGEX.test(time);
};

// Function that checks whether a date-string is RFC 3339 compliant.
//
// It checks whether the date-string is a valid date in the YYYY-MM-DD.
//
// Note, the number of days in each date are determined according to the
// following lookup table:
//
// Month Number  Month/Year           Maximum value of date-mday
// ------------  ----------           --------------------------
// 01            January              31
// 02            February, normal     28
// 02            February, leap year  29
// 03            March                31
// 04            April                30
// 05            May                  31
// 06            June                 30
// 07            July                 31
// 08            August               31
// 09            September            30
// 10            October              31
// 11            November             30
// 12            December             31
//
const validateDate = (datestring) => {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;

  if (!RFC_3339_REGEX.test(datestring)) {
    return false;
  }

  // Verify the correct number of days for
  // the month contained in the date-string.
  const year = Number(datestring.substr(0, 4));
  const month = Number(datestring.substr(5, 2));
  const day = Number(datestring.substr(8, 2));

  switch (month) {
    case 2: // February
      if (leapYear(year) && day > 29) {
        return false;
      } else if (!leapYear(year) && day > 28) {
        return false;
      }
      return true;
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      if (day > 30) {
        return false;
      }
      break;
  }

  return true;
};

// Function that checks whether a date-time-string is RFC 3339 compliant.
//
// It checks whether the time-string is structured in one of the
//
// - YYYY-MM-DDThh:mm:ssZ
// - YYYY-MM-DDThh:mm:ss±hh:mm
// - YYYY-MM-DDThh:mm:ss.*sZ
// - YYYY-MM-DDThh:mm:ss.*s±hh:mm
//
// Where *s is a fraction of seconds with at least 1 digit.
//
const validateDateTime = (dateTimeString) => {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/

  // Validate the structure of the date-string
  if (!RFC_3339_REGEX.test(dateTimeString)) {
    return false;
  }

  // Check if it is a correct date using the javascript Date parse() method.
  const time = Date.parse(dateTimeString);
  if (time !== time) { // eslint-disable-line
    return false
  }

  // Split the date-time-string up into the string-date and time-string part.
  // and check whether these parts are RFC 3339 compliant.
  const index = dateTimeString.indexOf('T');
  const dateString = dateTimeString.substr(0, index);
  const timeString = dateTimeString.substr(index + 1);
  return (validateDate(dateString) && validateTime(timeString));
};

// Function that checks whether a given number is a valid
// Unix timestamp.
//
// Unix timestamps are signed 32-bit integers. They are interpreted
// as the number of seconds since 00:00:00 UTC on 1 January 1970.
//
const validateUnixTimestamp = (timestamp) => {
  const MAX_INT = 2147483647;
  const MIN_INT = -2147483648;
  return (timestamp === timestamp && timestamp <= MAX_INT && timestamp >= MIN_INT) // eslint-disable-line
};

// Function that checks whether a javascript Date instance
// is valid.
//
const validateJSDate = (date) => {
  const time = date.getTime();
  return time === time // eslint-disable-line
};

module.exports = {
  parseTime,
  serializeTime,
  serializeTimeString,
  parseDate,
  serializeDate,
  parseDateTime,
  serializeDateTime,
  serializeDateTimeString,
  serializeUnixTimestamp,
  validateDate,
  validateDateTime,
  validateUnixTimestamp,
  validateJSDate
};
