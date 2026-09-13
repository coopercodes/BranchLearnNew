

export const mapDB = {
    "pythagorean-marshes": {
        category: "pythagorean-marshes",
        type: 'encounter',
        title: 'Training For Triangulon',
        description:
            'An introduction to the combat system behind Branch. Including abilities, enemy types, and more. By the end you will be a Branch combat master!',
        locations: [
            { label: 'Defeat the training dummy.', type: "", id: "camp-varnia" },
        ]
    }
};

// ZONES
// REGIONS
// LOCATIONS

/*
---------------------
Branch Atlas - SAT Mathematics ZONES VIEW

 The Greenwoods            The Northern Forests
  
           Pythagria                                 >
                                                     >
    Equatia          The Eastern Port                >
                                                     >
                                    Triangulon s.    >
        The Shallow Lands

    Parlelia                 

---------------------

overarching idea. Zones should have a customizable world view but they should not be limited to just one screen.

is it possible to make a generic renderer, where rendering of zones and locations is isolated from cordinates logic?


Where is the rendering decision made?

At the top level.

Region: When regions are clicked, they then open up into a new area.
Locations: When locations are clicked, then are then .

Region examples with location examples:
    The World Of Branch - REGION
        #1 Greenwood - REGION
            The Fields Of blah
                The Archery Range () - LOCATION
                The Caves Of Triangulus - REGION
                    The Cave Entrance - 2 quests


        The Shallow Lands - REGION
            Dungeons Of Dragur - 12 quests
                The Sunken Library - 4 quests
                    The Curse Of The Library

                    The Runic Secret - ENCOUNTER
                        desc: Help the librarian look through the books etc. etc.
                        0 / 1 Find the bookshelf
                        0 / 10 Defeat Sunken Triangles
                        0 / 1 Find the key to the hidden book

                The Altar Of Inisght - 5 quests
                    
                The Coffin Of Varduné - 3 quests
            City Of Thaurwood


    philosophy: produce data until patterns present themselves

    the above structure is expandable, but the renderer has a high amount of responsibility
    each path could have a unique renderer ID? possible idea.


*/


/*
    Structure the data?

    Zones should be rendered manually in some type of ZonesView?
    From there, rendering should be just nested in some type of object structure?
    Region nodes.

    There are two types of region nodes.

    Region Node {
        id: "region-id-here",
        zones: {
            "0,0": {

                name: "The Camp Of The Tree",
                type: "",
                // data related to the zone itself goes here
                locations: {

                }
                "0,0": {
                    zones: {
                        "the-fallen-camp",

                    }
                }
            },
            "0,1": {

            },
            "0,2": {

            },
            "0,3": {

            }
        }
    }
*/

type LocationNode = {

}

type RegionNode = {
    id: string;
    title: string; // The Region Of Triangulon
    description: string; // desc desc desc
    accent: string; // #1A1A1A
    zones: {
        
    }
}


// campRenderer could use the ID?
// default fallback, and override
// 

const satMathematics = {
    id: "sat-math",
    title: "SAT Mathematics",
    description: "",
    accent: "#1A1A1A",
    // Zones keys need to use the X,Y formatting
    // even if the reigon shows just ONE key idea
    zones: {
        "0,0": {
            map: {
                // inside of the zone MAP is where the rendering logic is stored
                // for an early iteration this can just be an actual 100x50 array
                // but for future logic a basic compression algorithim can be built
                
            },
            // nodes are the things within a given panel
            // such as 
            nodes: {
                "the-greenwoods": {
                    id: "the-greenwoods",
                    type: "region",
                    title: "The Greenwoods",
                    description: "greenwoods desc",
                    accent: "", // Subtle green color similar to Leaf
                    zones: {
                        "0,0": {
                            map: {


                            },
                            nodes: {
                                "archery-range": {
                                    id: "archery-range",
                                    type: "location",
                                    // Maybe some thinking on long term usage of this. It's possible just treating it
                                    // as a unique tile on the map is a more effective path moving forward
                                    coordinates: {
                                        x: 4,
                                        y: 3
                                    },
                                    title: "Archery Range",
                                    description: "Archery desc",
                                    accent: "",
                                    nodes: {}
                                    // location nodes do not have nodes
                                    // they are the end of the line.
                                },
                                "the-greenwood-caves": {
                                    id: "the-greenwood-caves",
                                    type: "region",
                                    title: "The Caves Of Greenwood",
                                    description: "A ruptured cave system has been discovered throughout the underground of The Greenwoods. Folklore tells of the great military leader Triangulus, who dissapeared into the caves to never be seen again.",
                                    accent: "",
                                    zones: {
                                        "0,0": {
                                            map: {
                                                nodes: [
                                                    
                                                ]
                                            },
                                            nodes: {

                                            }
                                        },
                                        "0,1": {

                                        }
                                    }
                                }
                            }
                        },
                        // To The East Of The Greenwoods is the deep forest
                        // East of The Greenwoods?
                        // Maybe just East to reduce complexity?
                        // Some type of chevron system to reduce complexity is possible.
                        "0, 1": {
                            map: {},
                            nodes: {}
                        }
                    }
                }
            }
           
        },
        "1,0": {

        }
    }
}

// Renderer should have maps saved for each unique REGION path
// can create a simple unit test to make sure each unique region path has a corresponding id

// HOW TO HANDLE multi screen IDs?

// Generate cords from map?
export const MapCordsDB = {
    "0,0": "the-greenwoods",
    "0,1": "pythagorean-marshes"
};




// The Equations, The Triangles, The Lines, The Graphs. Everything seems to blur since the great war of Triangulon.
// They destroyed much of the lands of Branch, and burned down almost every single tree in The Greenwoods.
// But one tree stood. Ignorantly forgotten. Burnt, nearly broken, except for one Branch.
// One Branch stood in the greenwood forests, and from that Branch was one single Leaf.
// With Leaf as your ally, you must overtake the lands of Branch.
// etc. type story