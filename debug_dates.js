// Quick debug script to test date parsing
const testDate = "2025-01-02T05:30:00-05:00";

console.log("Original date string:", testDate);
console.log("new Date(testDate):", new Date(testDate));
console.log("Is valid:", !isNaN(new Date(testDate).getTime()));
console.log("getTime():", new Date(testDate).getTime());

// Test the manual parsing logic
const formats = [
  /(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/, // ISO format
  /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
];

const match = testDate.match(formats[0]);
console.log("Regex match:", match);

if (match) {
  const manualDate = new Date(match[1], match[2] - 1, match[3]);
  console.log("Manual parsing result:", manualDate);
  console.log("Manual parsing valid:", !isNaN(manualDate.getTime()));
}