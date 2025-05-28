// characterData.js

export const characters = [
  {
    id: 0,
    name: 'Joao',
    sprite: 'assets/player/joao.png'
  },
  {
    id: 1,
    name: 'Magic',
    sprite: 'assets/player/magic.png'
  },
  {
    id: 2,
    name: 'Nugget',
    sprite: 'assets/player/bear.png'
  },
  {
    id: 3,
    name: 'Wus', // Robot
    sprite: 'assets/player/robot.png'
  },
  {
  
    id: 4,
    name: 'Joana', // Example: New character name, if using joao.png as a base for a new char.
                  // Or, if this was an error, this entry might be removed or given a unique sprite.
    sprite: 'assets/player/joao.png' // Using joao.png for this example.
                                     // Ideally, 'Joana' would have 'assets/player/joana.png'
  },
  // Example for adding a new character:
  // {
  //   id: 5, // Ensure unique ID
  //   name: 'Nova',
  //   sprite: 'assets/player/nova.png' // Ensure this asset exists
  // }
];

// Developer sanity check for unique IDs (runs once on module load)
const idSet = new Set();
characters.forEach(char => { //
  if (idSet.has(char.id)) { //
    console.error(`CRITICAL: Duplicate character ID ${char.id} for character "${char.name}" in characterData.js. IDs must be unique.`); //
  }
  idSet.add(char.id); //
});
if (characters.length !== idSet.size) { //
    // This secondary check is redundant if the loop above catches specifics, but good for a general count mismatch.
    console.error("CRITICAL: Total character count does not match unique ID count. Review characterData.js for duplicate IDs.");
}