// This is a sample JavaScript file to test enhanced syntax highlighting

/**
 * A simple class with methods for testing
 */
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, my name is ${this.name} and I'm ${this.age} years old.`;
  }

  static fromJSON(json) {
    try {
      const data = JSON.parse(json);
      return new Person(data.name, data.age);
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  }
}

// Constants and variables
const MAX_AGE = 120;
let people = [];

// Add some people to our collection
function addPerson(person) {
  if (person.age > MAX_AGE) {
    throw new Error(`Age ${person.age} exceeds maximum age of ${MAX_AGE}`);
  }
  people.push(person);
  return people.length;
}

// Arrow function with template literals
const formatPerson = (person) => {
  const { name, age } = person;
  return `${name.toUpperCase()} (${age})`;
};

// Async function example
async function loadPeopleFromAPI() {
  try {
    const response = await fetch('https://api.example.com/people');
    const data = await response.json();
    return data.map(item => new Person(item.name, item.age));
  } catch (error) {
    console.error('Failed to load people:', error);
    return [];
  }
}

// Object with method shorthand syntax
const personUtils = {
  sortByAge(personArray) {
    return [...personArray].sort((a, b) => a.age - b.age);
  },
  
  getAverageAge(personArray) {
    if (personArray.length === 0) return 0;
    const sum = personArray.reduce((total, person) => total + person.age, 0);
    return sum / personArray.length;
  }
};

// Regular expressions
const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
const isValidName = (name) => namePattern.test(name);

// Create some instances
const john = new Person('John Doe', 30);
const jane = new Person('Jane Smith', 25);

people = [john, jane];
console.log(personUtils.getAverageAge(people)); // Should output 27.5
