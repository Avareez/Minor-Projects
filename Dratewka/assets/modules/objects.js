import { Location } from './classes.js';
import { Item } from './classes.js';

export const game = {
    x: 0,
    y: 0,
    locations: [],
    currentLocation: null,
    items: [],
    hand: null,
    init() {
        fetch('./assets/modules/locations.json')
            .then(response => response.json())
            .then(locationsData => {
                // Tworzenie obiektów klasą Location
                locationsData.forEach(locationData => {
                    const location = new Location(locationData.XY, locationData.name, locationData.img, locationData.color, locationData.dir, locationData.items);
                    game.locations.push(location);
                });
                // Tworzenie Items
                fetch('./assets/modules/items.json')
                    .then(response => response.json())
                    .then(itemsData => {
                        // Rozmieszczenie przedmiotów w odpowiednich lokalizacjach
                        itemsData.forEach(itemData => {
                            const item = new Item(itemData.id, itemData.name, itemData.flag, itemData.codename, itemData.location);
                            game.items.push(item);
                            if (item.location !== "00") {
                                const location = game.locations.find(loc => loc.xy === item.location);
                                if (location) {
                                    location.items.push(item);
                                } else {
                                    console.error(`Location ${item.location} for item ${item.name} not found.`);
                                }
                            }
                        });

                        console.log(game.locations);
                        console.log(game.items);

                        // Ustawienie początkowej lokalizacji
                        this.x = 4;
                        this.y = 7;
                        this.changePlace();

                        // Wyświetlenie elementów gry
                        const gameboard = document.getElementById("gameboard");
                        const gameDiv = document.getElementById("game")
                        const gossipsDiv = document.getElementById("gossips");
                        const vocabDiv = document.getElementById("vocab");
                        const header = document.getElementById("header");
                        const audio = document.getElementById("hejnal");
                        let audioPlayed = false;
                        const start1 = document.getElementById("start1");
                        const start2 = document.getElementById("start2");
                        const start3 = document.getElementById("start3");
                        const movementInput = document.getElementById("movement");
                        gameboard.style.display = "none";
                        vocabDiv.style.display = "none";
                        gossipsDiv.style.display = "none";
                        header.style.display = "none";
                        start1.style.display = "block";
                        start2.style.display = "none";
                        start3.style.display = "none";

                        // Start hejnału
                        window.addEventListener('click', () => {
                            if (!audioPlayed) {
                                audio.play();
                                audioPlayed = true;
                            }
                        });

                        // Przemijanie grafik początkowych
                        let startCounter = 0;
                        document.addEventListener('keyup', event => {
                            if (event.code === 'Space') {
                                startCounter++;

                                switch (startCounter) {
                                    case 1:
                                        fadeOut(start1, () => {
                                            fadeIn(start2);
                                        });
                                        break;
                                    case 2:
                                        fadeOut(start2, () => {
                                            fadeIn(start3);
                                        });
                                        break;
                                    case 3:
                                        fadeOut(start3, () => {
                                            gameboard.style.display = "block";
                                            gameDiv.style.display = "block";
                                            header.style.display = "block";
                                            audio.pause();
                                            movementInput.focus();
                                        });
                                        break;
                                }
                            }
                        });
                        // Funkcje przechodzenia grafik
                        function fadeOut(element, callback) {
                            let opacity = 1;
                            const timer = setInterval(() => {
                                if (opacity <= 0) {
                                    clearInterval(timer);
                                    element.style.display = "none";
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }
                                element.style.opacity = opacity;
                                opacity -= 0.1;
                            }, 50);
                        }
                        function fadeIn(element, callback) {
                            let opacity = 0;
                            element.style.opacity = opacity;
                            element.style.display = "block";
                            const timer = setInterval(() => {
                                if (opacity >= 1) {
                                    clearInterval(timer);
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }
                                element.style.opacity = opacity;
                                opacity += 0.1;
                            }, 50);
                        }

                        movementInput.style.textTransform = "uppercase";

                        // Event listener inputa
                        movementInput.addEventListener('keyup', async event => {
                            if (event.code === 'Enter') {
                                const movementInputValue = movementInput.value.trim().toUpperCase();
                                const firstWord = movementInputValue.split(' ')[0];
                                switch (firstWord) {
                                    case "E":
                                    case "EAST":
                                        if (this.currentLocation.dir.includes('E')) {
                                            this.y++;
                                            await this.Message("You are going east...")
                                            this.changePlace();
                                        } else {
                                            await this.Message("You cannot go east from here.");
                                        }
                                        break;
                                    case "W":
                                    case "WEST":
                                        if (this.currentLocation.dir.includes('W')) {
                                            this.y--;
                                            if (this.x === 4 && this.y === 2) {
                                                await this.Message("You can't go that way...");
                                                await this.Message("The dragon sleeps in a cave!");
                                                this.y++;
                                            } else {
                                                await this.Message("You are going west...")
                                                this.changePlace();
                                            }
                                        } else {
                                            await this.Message("You cannot go west from here.");
                                        }
                                        break;
                                    case "N":
                                    case "NORTH":
                                        if (this.currentLocation.dir.includes('N')) {
                                            this.x--;
                                            await this.Message("You are going north...")
                                            this.changePlace();
                                        } else {
                                            await this.Message("You cannot go north from here.");
                                        }
                                        break;
                                    case "S":
                                    case "SOUTH":
                                        if (this.currentLocation.dir.includes('S')) {
                                            this.x++;
                                            await this.Message("You are going south...")
                                            this.changePlace();
                                        } else {
                                            await this.Message("You cannot go south from here.");
                                        }
                                        break;
                                    case "G":
                                    case "GOSSIPS":
                                        this.Gossips();
                                        console.log("Ploteczki")
                                        break;
                                    case "V":
                                    case "VOCABULARY":
                                        this.Vocabulary();
                                        console.log("Słownik")
                                        break;
                                    case "T":
                                    case "TAKE":
                                        const takeName = movementInputValue.substring(firstWord.length).trim();
                                        this.Take(takeName);
                                        console.log("Podnoszenie");
                                        break;
                                    case "D":
                                    case "DROP":
                                        const dropName = movementInputValue.substring(firstWord.length).trim();
                                        this.Drop(dropName);
                                        console.log("Upuszczanie");
                                        break;
                                    case "U":
                                    case "USE":
                                        const useName = movementInputValue.substring(firstWord.length).trim();
                                        this.Use(useName);
                                        console.log("Uzywanie")
                                        break;
                                    default:
                                        this.Message("Try another word or V for vocabulary.");
                                }
                                movementInput.value = '';
                            }
                        });

                        // Focus inputa
                        movementInput.addEventListener("blur", function () {
                            movementInput.focus();
                        });
                    })
                    .catch(error => {
                        console.error('Error connected to items.JSON:', error);
                    });
            })
            .catch(error => {
                console.error('Error connected to locations.JSON:', error);
            });
    },
    changePlace() {
        // Znalezienie lokalizacji
        let combinedXY = `${this.x}${this.y}`;
        this.currentLocation = this.locations.find(location => location.xy === combinedXY);

        // Zmiana gameboard
        if (this.currentLocation) {
            const name = document.getElementById("name");
            name.innerText = this.currentLocation.name;

            const locationImg = document.getElementById('location');
            locationImg.src = this.currentLocation.src;
            locationImg.style.backgroundColor = this.currentLocation.color;

            const direction = document.getElementById('direction');
            const fullDirectionNames = {
                N: "NORTH",
                S: "SOUTH",
                W: "WEST",
                E: "EAST"
            };
            const fullDirectionText = this.currentLocation.dir.map(dir => fullDirectionNames[dir]).join(', ');
            direction.innerText = fullDirectionText;

            // Kompas
            ['N', 'E', 'S', 'W'].forEach(direction => {
                const div = document.getElementById(direction);
                if (this.currentLocation.dir.includes(direction)) {
                    div.style.display = 'none';
                } else {
                    div.style.display = 'block';
                }
            });

            const ground = document.getElementById('ground');
            ground.innerText = this.currentLocation.items.length > 0 ? this.currentLocation.items.map(item => item.name).join(', ') : "Nothing";

            const handItem = document.getElementById('hand');
            handItem.innerText = this.hand ? this.hand.name : "Nothing";

        } else {
            console.error("Could not find location for x:", this.x, " and y:", this.y);
        }
    },
    Gossips() {
        const gossipsDiv = document.getElementById("gossips");
        const gameDiv = document.getElementById("game")
        const movementInput = document.getElementById("movement");
        gameDiv.style.display = "none";
        gossipsDiv.style.display = "block";

        document.addEventListener('keydown', () => {
            gossipsDiv.style.display = "none";
            gameDiv.style.display = "block";
            movementInput.focus();
        });
    },
    Vocabulary() {
        const vocabDiv = document.getElementById("vocab");
        const gameDiv = document.getElementById("game")
        const movementInput = document.getElementById("movement");
        gameDiv.style.display = "none";
        vocabDiv.style.display = "block";

        document.addEventListener('keydown', () => {
            vocabDiv.style.display = "none";
            gameDiv.style.display = "block";
            movementInput.focus();
        });
    },
    Take(itemName) {
        const item = this.currentLocation.items.find(item => item.codename === itemName);
        console.log(item)
        if (!item) {
            this.Message("There isn't anything like that here.");
        } else if (item.flag == 0) {
            this.Message("You can't carry it.");
        } else if (this.hand) {
            this.Message("You are already carrying something.");
        } else {
            this.hand = item;
            const index = this.currentLocation.items.indexOf(item);
            this.currentLocation.items.splice(index, 1);
            this.Message(`You are taking ${item.name}`);
            this.changePlace();
        }
    },
    Drop(itemName) {
        console.log(itemName, this.hand.name)
        if (!this.hand) {
            this.Message("You are not carrying anything.");
        } else if (this.currentLocation.items.filter(item => item.flag == 1).length >= 3 && this.hand.flag == 1) {
            this.Message("You can't store more items here.");
        } else if (this.currentLocation.xy == 43) {
            this.Message("You can't store this item here.");
        } else if (itemName != this.hand.codename) {
            this.Message("You are not carrying it.");
        }
        else {
            this.currentLocation.items.push(this.hand);
            this.hand = null;
            this.Message(`You are about to drop ${itemName}.`);
            console.log(this.currentLocation);
            this.changePlace();
        }
    },
    Dependencies(itemId) {
        // Zależności
        const useDeps = [
            { itemId: 10, location: '56', result: { newItemID: '11', message: "You opened a tool shed and took an axe" } },
            { itemId: 11, location: '67', result: { newItemID: '12', message: "You cut sticks for sheeplegs" } },
            { itemId: 12, location: '43', result: { newItemID: '13', message: "You prepared legs for your fake sheep", message2: "Milestone completed!" } },
            { itemId: 14, location: '34', result: { newItemID: '15', message: "The tavern owner paid you money" } },
            { itemId: 15, location: '37', result: { newItemID: '16', message: "The cooper sold you a new barrel" } },
            { itemId: 16, location: '43', result: { newItemID: '17', message: "You made a nice sheeptrunk", message2: "Milestone completed!" } },
            { itemId: 18, location: '36', result: { newItemID: '19', message: "The butcher gave you wool" } },
            { itemId: 19, location: '43', result: { newItemID: '20', message: "You prepared skin for your fake sheep", message2: "Milestone completed!" } },
            { itemId: 21, location: '57', result: { newItemID: '22', message: "You used your tools to make a rag" } },
            { itemId: 22, location: '43', result: { newItemID: '23', message: "You made a fake sheephead", message2: "Milestone completed!" } },
            { itemId: 24, location: '11', result: { newItemID: '25', message: "You are digging...", message2: "and digging...", message3: "That's enough sulphur for you" } },
            { itemId: 25, location: '43', result: { newItemID: '26', message: "You prepared a solid poison", message2: "Milestone completed!" } },
            { itemId: 27, location: '21', result: { newItemID: '28', message: "You got a bucket full of tar" } },
            { itemId: 28, location: '43', result: { newItemID: '29', message: "You prepared a liquid poison", message2: "Milestone completed!" } },
        ]

        const useDependency = useDeps.find(dep => dep.itemId == itemId && dep.location == this.currentLocation.xy);
        console.log(useDependency);
        // Zwrot wyniku
        if (useDependency) {
            return useDependency.result;
        }

        // Jeśli nie istnieje dana zależność
        return null;

        // --- Reszta do zrobienia --- (1.5p) - oprogramowanie wszystkich zależności (przedmioty) doprowadzających do ukończenia gry, możliwość ukończenia gry (bez "oszustw") - cała logika działa
        //gdy zebrane wszystkie przedmioty(6 * OK), 43, 37, Your fake sheep is full of poison and ready to be eaten by the dragon
        //37, 43, 30(L), The dragon noticed your gift... (timeout) The dragon ate your sheep and died! - podmiana grafiki na lokacji (martwy smok) !
        //33, 43 + zabity smok, 34, You cut a piece of dragon's skin
        //34, 57, 35, You used your tools to make shoes
        //35, 41, 36, The King is impressed by your shoes
        //36 -> koniec gry - załadowanie odpowiedniej grafiki


    },
    async Use(itemName) {
        if (!this.hand) {
            this.Message("You aren't carrying anything.");
        } else {
            const itemInHand = this.hand;
            if (itemInHand.codename !== itemName) {
                this.Message("You aren't carrying anything like that.");
                return;
            }

            // Sprawdzanie zależności
            const useResult = this.Dependencies(itemInHand.id);
            if (!useResult) {
                this.Message("Nothing happened.");
                return;
            }

            // Komunikaty
            if (useResult.message) {
                await this.Message(useResult.message);
            }
            if (useResult.message2) {
                await this.Message(useResult.message2);
            }
            if (useResult.message3) {
                await this.Message(useResult.message3);
            }

            // Czyszczenie ręki
            this.hand = null;

            // Powstanie nowego przedmiotu
            if (useResult.newItemID) {
                const newItemID = useResult.newItemID;
                const newItem = this.items.find(item => item.id === newItemID);
                if (newItem) {
                    if (newItem.flag == 1) {
                        this.hand = newItem;
                        this.Message(`You acquired a new item: ${newItem.name}`);
                        this.changePlace();
                    } else {
                        this.currentLocation.items.push(newItem);
                        this.Message(`You acquired a new item: ${newItem.name}`);
                        this.changePlace();
                    }
                } else {
                    console.error(`New item with ID ${newItemID} not found.`);
                }
            }
        }
    },
    Message(INFO) {
        return new Promise(resolve => {
            const movementDiv = document.getElementById('movementDiv');
            const movementInput = document.getElementById("movement");
            movementDiv.style.display = "none";
            const msgDiv = document.getElementById('msgDiv');
            msgDiv.innerText = INFO;
            msgDiv.style.display = "block";
            setTimeout(() => {
                msgDiv.style.display = "none";
                movementDiv.style.display = "block";
                movementInput.focus();
                resolve();
            }, 1000);
        });
    }
};