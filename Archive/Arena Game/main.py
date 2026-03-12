from hero import Hero
from monster import Monster
from arena import Arena
import random

def create_random_character(used_names):
    names = ["Rycerz", "Łucznik", "Czarodziej", "Wiedźmin", "Smok", "Ork", "Goblin", "Topielec"]
    available_names = [name for name in names if name not in used_names]
    if not available_names:
        raise ValueError("Brak dostępnych imion!")
    name = random.choice(available_names)
    used_names.add(name)
    return random.choice([Hero, Monster])(name, random.randint(50, 100),
                                        random.randint(10, 20), random.randint(5, 10), random.randint(5, 10))

characters = []
used_names = set()
while True:
    print("\n1. Stwórz bohatera\n2. Wygeneruj listę postaci\n3. Rozpocznij turniej\n4. Wyświetl historię walk\n5. Zakończ grę")
    choice = input("Wybierz opcję: ")
    if choice == "1":
        name = input("Podaj imię bohatera: ")
        characters.append(Hero(name, 100, 15, 10, 8))
    elif choice == "2":
        characters += [create_random_character(used_names) for _ in range(7)]
        print("Wygenerowano postacie:", *["\n"+str(c) for c in characters])
    elif choice == "3":
        if len(characters) < 2:
            print("Za mało postaci!")
        else:
            arena = Arena(characters)
            arena.run_tournament()
    elif choice == "4":
        if not characters or not arena.history:
            print("Brak historii walk!")
        else:
            for match in arena.history:
                print(match)
    elif choice == "5":
        break