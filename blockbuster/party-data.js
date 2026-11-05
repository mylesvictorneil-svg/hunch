/* Hunch Party: answer list.
   Every answer a player can give lives here, with the facts used to check criteria.
   People:    name | job | born in (country) | birth year | alive in 2026 (1/0) | sport | aliases (; separated)
   Countries: name | continent(s) | has coastline (1/0) | population in millions | aliases
   Cities:    name | country | national capital (1/0) | aliases
   Landmarks: name | country (or countries, comma separated) | natural (1/0) | aliases
   Animals:   name | class | legs (- if unclear) | can fly (1/0) | lives in the ocean (1/0) | aliases
   Foods:     name | type (dish, dessert, fruit, vegetable) | country of origin (- if disputed) | aliases
   Brands:    name | country | industry | year founded (- if disputed) | aliases
*/
const PARTY_RAW = {
people: `
Taylor Swift|musician|USA|1989|1||
Beyoncé|musician|USA|1981|1||beyonce
Drake|musician|Canada|1986|1||
Rihanna|musician|Barbados|1988|1||
Ed Sheeran|musician|UK|1991|1||
Adele|musician|UK|1988|1||
Billie Eilish|musician|USA|2001|1||
Harry Styles|musician|UK|1994|1||
Justin Bieber|musician|Canada|1994|1||
Ariana Grande|musician|USA|1993|1||
Kendrick Lamar|musician|USA|1987|1||
Bruno Mars|musician|USA|1985|1||
The Weeknd|musician|Canada|1990|1||weeknd
Dua Lipa|musician|UK|1995|1||
Shakira|musician|Colombia|1977|1||
Lady Gaga|musician|USA|1986|1||
Eminem|musician|USA|1972|1||
Snoop Dogg|musician|USA|1971|1||
Olivia Rodrigo|musician|USA|2003|1||
SZA|musician|USA|1989|1||
Travis Scott|musician|USA|1991|1||
Kanye West|musician|USA|1977|1||ye;kanye
Jay-Z|musician|USA|1969|1||jay z;jayz
Selena Gomez|musician|USA|1992|1||
Miley Cyrus|musician|USA|1992|1||
Post Malone|musician|USA|1995|1||
Doja Cat|musician|USA|1995|1||
Sabrina Carpenter|musician|USA|1999|1||
Elvis Presley|musician|USA|1935|0||elvis
Michael Jackson|musician|USA|1958|0||
John Lennon|musician|UK|1940|0||
Bob Marley|musician|Jamaica|1945|0||
Wolfgang Amadeus Mozart|musician|Austria|1756|0||mozart
Ludwig van Beethoven|musician|Germany|1770|0||beethoven
Prince|musician|USA|1958|0||
Whitney Houston|musician|USA|1963|0||
Tupac Shakur|musician|USA|1971|0||tupac;2pac
Frank Sinatra|musician|USA|1915|0||
LeBron James|athlete|USA|1984|1|basketball|lebron
Michael Jordan|athlete|USA|1963|1|basketball|
Stephen Curry|athlete|USA|1988|1|basketball|steph curry
Kobe Bryant|athlete|USA|1978|0|basketball|kobe
Caitlin Clark|athlete|USA|2002|1|basketball|
Victor Wembanyama|athlete|France|2004|1|basketball|wemby
Serena Williams|athlete|USA|1981|1|tennis|
Roger Federer|athlete|Switzerland|1981|1|tennis|
Rafael Nadal|athlete|Spain|1986|1|tennis|
Novak Djokovic|athlete|Serbia|1987|1|tennis|
Naomi Osaka|athlete|Japan|1997|1|tennis|
Lionel Messi|athlete|Argentina|1987|1|soccer|messi
Cristiano Ronaldo|athlete|Portugal|1985|1|soccer|ronaldo
Kylian Mbappé|athlete|France|1998|1|soccer|mbappe
Neymar|athlete|Brazil|1992|1|soccer|
Pelé|athlete|Brazil|1940|0|soccer|pele
Erling Haaland|athlete|Norway|2000|1|soccer|haaland
Usain Bolt|athlete|Jamaica|1986|1|track and field|
Simone Biles|athlete|USA|1997|1|gymnastics|
Michael Phelps|athlete|USA|1985|1|swimming|
Tom Brady|athlete|USA|1977|1|football|
Patrick Mahomes|athlete|USA|1995|1|football|
Tiger Woods|athlete|USA|1975|1|golf|
Muhammad Ali|athlete|USA|1942|0|boxing|
Lewis Hamilton|athlete|UK|1985|1|racing|
Max Verstappen|athlete|Belgium|1997|1|racing|
Shohei Ohtani|athlete|Japan|1994|1|baseball|ohtani
Babe Ruth|athlete|USA|1895|0|baseball|
Wayne Gretzky|athlete|Canada|1961|1|hockey|
Tom Hanks|actor|USA|1956|1||
Leonardo DiCaprio|actor|USA|1974|1||leo dicaprio
Zendaya|actor|USA|1996|1||
Tom Holland|actor|UK|1996|1||
Dwayne Johnson|actor|USA|1972|1||the rock
Will Smith|actor|USA|1968|1||
Denzel Washington|actor|USA|1954|1||
Meryl Streep|actor|USA|1949|1||
Scarlett Johansson|actor|USA|1984|1||
Margot Robbie|actor|Australia|1990|1||
Timothée Chalamet|actor|USA|1995|1||timothee chalamet
Ryan Reynolds|actor|Canada|1976|1||
Chris Hemsworth|actor|Australia|1983|1||
Daniel Radcliffe|actor|UK|1989|1||
Robert Downey Jr.|actor|USA|1965|1||robert downey jr;rdj
Jennifer Lawrence|actor|USA|1990|1||
Pedro Pascal|actor|Chile|1975|1||
Florence Pugh|actor|UK|1996|1||
Sydney Sweeney|actor|USA|1997|1||
Marilyn Monroe|actor|USA|1926|0||
Charlie Chaplin|actor|UK|1889|0||
Abraham Lincoln|leader|USA|1809|0||lincoln
George Washington|leader|USA|1732|0||
Barack Obama|leader|USA|1961|1||obama
Nelson Mandela|leader|South Africa|1918|0||
Mahatma Gandhi|leader|India|1869|0||gandhi
Napoleon Bonaparte|leader|France|1769|0||napoleon
Cleopatra|leader|Egypt|-69|0||
Queen Elizabeth II|leader|UK|1926|0||elizabeth ii;queen elizabeth
Winston Churchill|leader|UK|1874|0||churchill
Martin Luther King Jr.|leader|USA|1929|0||martin luther king;mlk
John F. Kennedy|leader|USA|1917|0||jfk;john f kennedy
Genghis Khan|leader|Mongolia|1162|0||
Joan of Arc|leader|France|1412|0||
Albert Einstein|scientist|Germany|1879|0||einstein
Isaac Newton|scientist|UK|1643|0||newton
Marie Curie|scientist|Poland|1867|0||
Charles Darwin|scientist|UK|1809|0||darwin
Thomas Edison|scientist|USA|1847|0||edison
Galileo Galilei|scientist|Italy|1564|0||galileo
Stephen Hawking|scientist|UK|1942|0||
Ada Lovelace|scientist|UK|1815|0||
Elon Musk|business|South Africa|1971|1||
Steve Jobs|business|USA|1955|0||
Bill Gates|business|USA|1955|1||
Jeff Bezos|business|USA|1964|1||
Mark Zuckerberg|business|USA|1984|1||zuckerberg
Walt Disney|business|USA|1901|0||
Oprah Winfrey|host|USA|1954|1||oprah
MrBeast|creator|USA|1998|1||mr beast;jimmy donaldson
Leonardo da Vinci|artist|Italy|1452|0||da vinci
Pablo Picasso|artist|Spain|1881|0||picasso
Vincent van Gogh|artist|Netherlands|1853|0||van gogh
Frida Kahlo|artist|Mexico|1907|0||
William Shakespeare|writer|UK|1564|0||shakespeare
J.K. Rowling|writer|UK|1965|1||jk rowling
Dr. Seuss|writer|USA|1904|0||dr seuss
Mark Twain|writer|USA|1835|0||
Steven Spielberg|director|USA|1946|1||spielberg
Christopher Nolan|director|UK|1970|1||
Quentin Tarantino|director|USA|1963|1||tarantino
`,
countries: `
USA|North America|1|340|united states;united states of america;america;us
Canada|North America|1|41|
Mexico|North America|1|130|
Jamaica|North America|1|2.8|
Cuba|North America|1|11|
Brazil|South America|1|212|
Argentina|South America|1|46|
Chile|South America|1|20|
Peru|South America|1|34|
Colombia|South America|1|53|
Bolivia|South America|0|12|
Paraguay|South America|0|6.9|
UK|Europe|1|69|united kingdom;great britain;britain;england
France|Europe|1|68|
Germany|Europe|1|84|
Italy|Europe|1|59|
Spain|Europe|1|48|
Portugal|Europe|1|10.4|
Greece|Europe|1|10.3|
Netherlands|Europe|1|18|holland
Switzerland|Europe|0|9|
Austria|Europe|0|9.1|
Norway|Europe|1|5.5|
Sweden|Europe|1|10.5|
Poland|Europe|1|37|
Ireland|Europe|1|5.3|
Iceland|Europe|1|0.4|
Russia|Europe,Asia|1|144|
China|Asia|1|1410|
Japan|Asia|1|124|
India|Asia|1|1450|
South Korea|Asia|1|52|korea
Indonesia|Asia|1|280|
Thailand|Asia|1|70|
Vietnam|Asia|1|101|
Philippines|Asia|1|115|
Nepal|Asia|0|30|
Mongolia|Asia|0|3.5|
Saudi Arabia|Asia|1|34|
Egypt|Africa|1|115|
Nigeria|Africa|1|230|
Kenya|Africa|1|56|
South Africa|Africa|1|63|
Morocco|Africa|1|38|
Ethiopia|Africa|0|130|
Australia|Oceania|1|27|
New Zealand|Oceania|1|5.3|
`,
cities: `
New York City|USA|0|new york;nyc
Los Angeles|USA|0|la
Chicago|USA|0|
Miami|USA|0|
Las Vegas|USA|0|vegas
San Francisco|USA|0|
Washington, D.C.|USA|1|washington dc;dc
Toronto|Canada|0|
Vancouver|Canada|0|
Mexico City|Mexico|1|
Rio de Janeiro|Brazil|0|rio
Buenos Aires|Argentina|1|
London|UK|1|
Paris|France|1|
Rome|Italy|1|
Venice|Italy|0|
Berlin|Germany|1|
Madrid|Spain|1|
Barcelona|Spain|0|
Amsterdam|Netherlands|1|
Athens|Greece|1|
Lisbon|Portugal|1|
Dublin|Ireland|1|
Moscow|Russia|1|
Dubai|UAE|0|
Tokyo|Japan|1|
Kyoto|Japan|0|
Seoul|South Korea|1|
Beijing|China|1|
Shanghai|China|0|
Mumbai|India|0|bombay
Bangkok|Thailand|1|
Singapore|Singapore|1|
Sydney|Australia|0|
Melbourne|Australia|0|
Cairo|Egypt|1|
Nairobi|Kenya|1|
Lagos|Nigeria|0|
`,
landmarks: `
Eiffel Tower|France|0|
Statue of Liberty|USA|0|
Great Wall of China|China|0|great wall
Colosseum|Italy|0|coliseum
Taj Mahal|India|0|
Machu Picchu|Peru|0|
Big Ben|UK|0|
Golden Gate Bridge|USA|0|
Mount Everest|Nepal,China|1|everest
Grand Canyon|USA|1|
Niagara Falls|USA,Canada|1|
Pyramids of Giza|Egypt|0|pyramids;great pyramid
Stonehenge|UK|0|
Sydney Opera House|Australia|0|
Christ the Redeemer|Brazil|0|
Mount Fuji|Japan|1|fuji
Leaning Tower of Pisa|Italy|0|tower of pisa
Burj Khalifa|UAE|0|
Times Square|USA|0|
Great Barrier Reef|Australia|1|
`,
animals: `
Dog|mammal|4|0|0|
Cat|mammal|4|0|0|
Horse|mammal|4|0|0|
Cow|mammal|4|0|0|
Pig|mammal|4|0|0|
Sheep|mammal|4|0|0|
Elephant|mammal|4|0|0|
Giraffe|mammal|4|0|0|
Lion|mammal|4|0|0|
Tiger|mammal|4|0|0|
Bear|mammal|4|0|0|
Wolf|mammal|4|0|0|
Fox|mammal|4|0|0|
Rabbit|mammal|4|0|0|bunny
Zebra|mammal|4|0|0|
Panda|mammal|4|0|0|giant panda
Koala|mammal|4|0|0|
Rhinoceros|mammal|4|0|0|rhino
Hippopotamus|mammal|4|0|0|hippo
Camel|mammal|4|0|0|
Kangaroo|mammal|-|0|0|
Gorilla|mammal|-|0|0|
Monkey|mammal|-|0|0|
Bat|mammal|-|1|0|
Dolphin|mammal|0|0|1|
Whale|mammal|0|0|1|
Eagle|bird|2|1|0|
Owl|bird|2|1|0|
Parrot|bird|2|1|0|
Flamingo|bird|2|1|0|
Hummingbird|bird|2|1|0|
Penguin|bird|2|0|0|
Ostrich|bird|2|0|0|
Snake|reptile|0|0|0|
Crocodile|reptile|4|0|0|
Turtle|reptile|4|0|0|
Chameleon|reptile|4|0|0|
Frog|amphibian|4|0|0|
Shark|fish|0|0|1|
Goldfish|fish|0|0|0|
Octopus|mollusk|-|0|1|
Jellyfish|other|0|0|1|
Bee|insect|6|1|0|honeybee
Butterfly|insect|6|1|0|
Ant|insect|6|0|0|
Ladybug|insect|6|1|0|ladybird
Spider|arachnid|8|0|0|
`,
foods: `
Pizza|dish|Italy|
Spaghetti|dish|Italy|
Lasagna|dish|Italy|lasagne
Sushi|dish|Japan|
Ramen|dish|-|
Tacos|dish|Mexico|taco
Paella|dish|Spain|
Pad Thai|dish|Thailand|
Pho|dish|Vietnam|
Kimchi|dish|South Korea|
Hamburger|dish|-|burger
Hot dog|dish|-|hotdog
French fries|dish|-|fries
Fried chicken|dish|-|
Ice cream|dessert|-|
Cake|dessert|-|
Donut|dessert|-|doughnut
Cookie|dessert|-|
Brownie|dessert|-|
Cheesecake|dessert|-|
Apple pie|dessert|-|
Cupcake|dessert|-|
Apple|fruit|-|
Banana|fruit|-|
Strawberry|fruit|-|
Watermelon|fruit|-|
Pineapple|fruit|-|
Orange|fruit|-|
Mango|fruit|-|
Lemon|fruit|-|
Grape|fruit|-|grapes
Cherry|fruit|-|cherries
Peach|fruit|-|
Blueberry|fruit|-|blueberries
Carrot|vegetable|-|
Broccoli|vegetable|-|
Potato|vegetable|-|
Onion|vegetable|-|
Lettuce|vegetable|-|
Spinach|vegetable|-|
`,
brands: `
Apple Inc.|USA|tech|1976|apple inc;apple company
Google|USA|tech|1998|
Microsoft|USA|tech|1975|
Amazon|USA|tech|1994|
Netflix|USA|entertainment|1997|
YouTube|USA|tech|2005|
Tesla|USA|cars|2003|
Ford|USA|cars|1903|
Coca-Cola|USA|drinks|1886|coke;coca cola
Pepsi|USA|drinks|-|
Starbucks|USA|food|1971|
McDonald's|USA|food|1940|mcdonalds
Nike|USA|clothing|1964|
Disney|USA|entertainment|1923|
Toyota|Japan|cars|1937|
Sony|Japan|tech|1946|
Nintendo|Japan|games|1889|
Samsung|South Korea|tech|1938|
Adidas|Germany|clothing|1949|
BMW|Germany|cars|1916|
Porsche|Germany|cars|1931|
Ferrari|Italy|cars|1939|
Lamborghini|Italy|cars|1963|
Gucci|Italy|clothing|1921|
Chanel|France|clothing|1910|
Louis Vuitton|France|clothing|1854|
Lego|Denmark|games|1932|
IKEA|Sweden|furniture|1943|
Spotify|Sweden|tech|2006|
Red Bull|Austria|drinks|1987|
Nestlé|Switzerland|food|1866|nestle
Heineken|Netherlands|drinks|1864|
TikTok|China|tech|2016|tik tok
`
};

const CONTINENT = {USA:"North America",Canada:"North America",Mexico:"North America",Jamaica:"North America",Cuba:"North America",Barbados:"North America",
  Brazil:"South America",Argentina:"South America",Chile:"South America",Peru:"South America",Colombia:"South America",Bolivia:"South America",Paraguay:"South America",
  UK:"Europe",France:"Europe",Germany:"Europe",Italy:"Europe",Spain:"Europe",Portugal:"Europe",Greece:"Europe",Netherlands:"Europe",Belgium:"Europe",Switzerland:"Europe",Austria:"Europe",
  Norway:"Europe",Sweden:"Europe",Denmark:"Europe",Poland:"Europe",Ireland:"Europe",Iceland:"Europe",Serbia:"Europe",Russia:"Europe",
  China:"Asia",Japan:"Asia","South Korea":"Asia",India:"Asia",Indonesia:"Asia",Thailand:"Asia",Vietnam:"Asia",Philippines:"Asia",Nepal:"Asia",Mongolia:"Asia","Saudi Arabia":"Asia",UAE:"Asia",Singapore:"Asia",
  Egypt:"Africa",Nigeria:"Africa",Kenya:"Africa","South Africa":"Africa",Morocco:"Africa",Ethiopia:"Africa",
  Australia:"Oceania","New Zealand":"Oceania"};

// Final clues for answers that can be the Jackpot. Only these are ever picked as the Jackpot.
const PARTY_HINTS = {
  "Taylor Swift":"Broke records with a tour built around her musical 'eras'.",
  "Beyoncé":"Former Destiny's Child singer whose fans call themselves the Beyhive.",
  "Drake":"Toronto rapper who calls his hometown 'the 6'.",
  "Billie Eilish":"Wrote a Bond theme and won Oscars with her brother Finneas.",
  "Michael Jackson":"Known as the King of Pop, famous for the moonwalk.",
  "LeBron James":"Nicknamed 'King James'; became the NBA's all-time leading scorer.",
  "Michael Jordan":"Won six NBA titles with the Chicago Bulls.",
  "Serena Williams":"Won 23 Grand Slam singles titles.",
  "Lionel Messi":"Finally won the World Cup in 2022 after years of trying.",
  "Cristiano Ronaldo":"Famous for his 'Siuuu' goal celebration.",
  "Usain Bolt":"The fastest person ever timed over 100 meters.",
  "Simone Biles":"The most decorated gymnast in history.",
  "Zendaya":"Played MJ in the recent Spider-Man movies and Rue in Euphoria.",
  "Dwayne Johnson":"A wrestler-turned-movie-star known as The Rock.",
  "Tom Hanks":"Played Forrest Gump and voiced Woody in Toy Story.",
  "Abraham Lincoln":"Gave the Gettysburg Address.",
  "Barack Obama":"The first Black president of the United States.",
  "Cleopatra":"The last active ruler of ancient Egypt's Ptolemaic kingdom.",
  "Napoleon Bonaparte":"A French emperor who met his final defeat at Waterloo.",
  "Albert Einstein":"His most famous equation is E = mc².",
  "Marie Curie":"The first person to win two Nobel Prizes.",
  "Isaac Newton":"Said to have been inspired by a falling apple.",
  "Elon Musk":"Runs Tesla and SpaceX.",
  "Steve Jobs":"Co-founded Apple and introduced the iPhone.",
  "MrBeast":"YouTuber famous for huge challenge videos and giveaways.",
  "Leonardo da Vinci":"Painted the Mona Lisa.",
  "William Shakespeare":"Wrote Romeo and Juliet.",
  "Japan":"Home of sushi, Mount Fuji and the bullet train.",
  "Brazil":"The largest country in South America.",
  "Italy":"Shaped like a boot.",
  "Egypt":"Home of the Pyramids of Giza.",
  "Canada":"Has a maple leaf on its flag.",
  "Australia":"Home of kangaroos and koalas.",
  "Iceland":"A land of volcanoes, glaciers and geysers.",
  "Paris":"Known as the City of Light.",
  "New York City":"Nicknamed the Big Apple.",
  "Tokyo":"Hosted the Summer Olympics in 2021.",
  "London":"Home of Buckingham Palace.",
  "Las Vegas":"Nicknamed Sin City, famous for its casinos.",
  "Eiffel Tower":"An iron tower built for the 1889 World's Fair.",
  "Statue of Liberty":"A gift from France that stands in New York Harbor.",
  "Mount Everest":"The tallest mountain on Earth.",
  "Grand Canyon":"Carved over millions of years by the Colorado River.",
  "Elephant":"The largest land animal, with a trunk.",
  "Giraffe":"The tallest animal on Earth.",
  "Penguin":"A bird that can't fly but is an excellent swimmer.",
  "Shark":"The star of the movie Jaws.",
  "Dolphin":"A very smart ocean mammal that uses echolocation.",
  "Kangaroo":"Carries its baby in a pouch.",
  "Bee":"Makes honey.",
  "Spider":"Spins webs.",
  "Pizza":"Margherita is a classic version of it.",
  "Sushi":"Often made with raw fish and rice.",
  "Ice cream":"Often served in a cone.",
  "Banana":"A yellow fruit you peel.",
  "Apple Inc.":"Makes the iPhone.",
  "Lego":"Famous for colorful plastic building bricks.",
  "Nintendo":"Created Mario and Zelda.",
  "Netflix":"Started out mailing DVDs to people's homes.",
  "Coca-Cola":"Its secret formula is famously guarded."
};
