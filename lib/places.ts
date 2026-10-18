export type PlaceType = "Village" | "Town" | "City";

export type Place = {
  name: string;
  summary: string;
  county: string;
  region: string;
  type: string;
  score: number;
};

export function placeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const places: Place[] = [
  {
    name: "Alnmouth",
    summary: "Pastel houses on a dune-backed estuary, under huge skies.",
    county: "Northumberland",
    region: "North East",
    type: "Village",
    score: 4.6,
  },
  {
    name: "Ambleside",
    summary: "A lake-town kit of boots, boats and somewhere to dry out.",
    county: "Cumbria",
    region: "North West",
    type: "Town",
    score: 4.3,
  },
  {
    name: "Bakewell",
    summary: "The pudding town that is also a proper Peak District base.",
    county: "Derbyshire",
    region: "East Midlands",
    type: "Town",
    score: 4.1,
  },
  {
    name: "Bath",
    summary: "Georgian crescents, Roman baths and one sensible way to see them.",
    county: "Somerset",
    region: "South West",
    type: "City",
    score: 4.5,
  },
  {
    name: "Bibury",
    summary: "Arlington Row and the Coln: prettiest is not the same as quiet.",
    county: "Gloucestershire",
    region: "South West",
    type: "Village",
    score: 4.0,
  },
  {
    name: "Brighton",
    summary: "The pier, the lanes, and a seafront that refuses to be sensible.",
    county: "East Sussex",
    region: "South East",
    type: "City",
    score: 4.2,
  },
  {
    name: "Cambridge",
    summary: "Colleges, punts and a river that does most of the sightseeing.",
    county: "Cambridgeshire",
    region: "East of England",
    type: "City",
    score: 4.6,
  },
  {
    name: "Castleton",
    summary: "Caves, a castle and the Great Ridge on your doorstep.",
    county: "Derbyshire",
    region: "East Midlands",
    type: "Village",
    score: 4.4,
  },
  {
    name: "Dartmouth",
    summary: "A deep-water harbour and a town stacked up the hill behind it.",
    county: "Devon",
    region: "South West",
    type: "Town",
    score: 4.3,
  },
  {
    name: "Durham",
    summary: "A cathedral and castle on a river-wrapped rock.",
    county: "County Durham",
    region: "North East",
    type: "City",
    score: 4.7,
  },
  {
    name: "Ely",
    summary: "A cathedral that still looks too large for the town around it.",
    county: "Cambridgeshire",
    region: "East of England",
    type: "City",
    score: 4.2,
  },
  {
    name: "Frome",
    summary: "Independent shops on a hill, and a river at the bottom of it.",
    county: "Somerset",
    region: "South West",
    type: "Town",
    score: 4.0,
  },
  {
    name: "Haworth",
    summary: "Brontë weather, cobbles, and a moor that starts at the last house.",
    county: "West Yorkshire",
    region: "Yorkshire",
    type: "Village",
    score: 4.5,
  },
  {
    name: "Helmsley",
    summary: "A market square, a ruined castle, and the moors just beyond.",
    county: "North Yorkshire",
    region: "Yorkshire",
    type: "Town",
    score: 4.1,
  },
  {
    name: "Ludlow",
    summary: "A food town with a castle, set on a bend of the Teme.",
    county: "Shropshire",
    region: "West Midlands",
    type: "Town",
    score: 4.4,
  },
  {
    name: "Rye",
    summary: "A cobbled hilltop town with a smuggling past and a tea-room problem.",
    county: "East Sussex",
    region: "South East",
    type: "Town",
    score: 4.5,
  },
  {
    name: "Stamford",
    summary: "Honey-coloured stone and hardly a bad building in sight.",
    county: "Lincolnshire",
    region: "East Midlands",
    type: "Town",
    score: 4.7,
  },
  {
    name: "Wells",
    summary: "England's smallest city, with a cathedral that outguns the town.",
    county: "Somerset",
    region: "South West",
    type: "City",
    score: 4.6,
  },
  {
    name: "Whitby",
    summary: "Abbey ruins, smoked fish and a very steep staircase.",
    county: "North Yorkshire",
    region: "Yorkshire and the Humber",
    type: "Town",
    score: 4.6,
  },
  {
    name: "York",
    summary: "Walls, snickelways and a Minster that dwarfs everything.",
    county: "North Yorkshire",
    region: "Yorkshire and the Humber",
    type: "City",
    score: 4.7,
  },
];
